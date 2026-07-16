import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;

interface PackageMetadata {
  name?: unknown;
  version?: unknown;
}

export interface ReleaseIdentity {
  tag: string;
  version: string;
  sourceCommit: string;
  packages: Record<string, string>;
}

interface ArtifactRecord {
  file: string;
  bytes: number;
  media_type: string;
  sha256: string;
}

interface ReleaseManifest {
  schema_version: 1;
  release: {
    tag: string;
    version: string;
    source_commit: string;
    packages: Record<string, string>;
  };
  provenance: {
    kind: "github-artifact-attestation";
    url: string;
    subjects: string[];
  };
  artifacts: ArtifactRecord[];
}

function runGit(repository: string, args: string[]): string {
  const result = spawnSync("git", args, {
    cwd: repository,
    encoding: "utf8",
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed.\n${result.stderr}`);
  }
  return result.stdout.trim();
}

function runGitStatus(repository: string, args: string[]): void {
  const result = spawnSync("git", args, {
    cwd: repository,
    encoding: "utf8",
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed.\n${result.stderr}`);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function releaseVersionFromTag(tag: string): string {
  if (!tag.startsWith("v")) throw new Error("Release tags must start with v.");
  const version = tag.slice(1);
  if (!semverPattern.test(version)) throw new Error(`Release tag is not strict SemVer: ${tag}.`);
  return version;
}

export function changelogContainsVersion(changelog: string, version: string): boolean {
  const escaped = escapeRegExp(version);
  return new RegExp(`^##\\s+(?:\\[${escaped}\\]|${escaped})(?:\\s|$)`, "m").test(changelog);
}

async function packageIdentity(repository: string, relative: string): Promise<[string, string]> {
  const metadata = JSON.parse(
    await readFile(path.join(repository, relative), "utf8"),
  ) as PackageMetadata;
  if (typeof metadata.name !== "string" || typeof metadata.version !== "string") {
    throw new Error(`${relative} must contain string name and version fields.`);
  }
  return [metadata.name, metadata.version];
}

export async function verifyReleaseIdentity(
  repository: string,
  tag: string,
  authorizedRef = "refs/remotes/origin/main",
): Promise<ReleaseIdentity> {
  const version = releaseVersionFromTag(tag);
  const packageEntries = await Promise.all([
    packageIdentity(repository, "package.json"),
    packageIdentity(repository, "packages/core/package.json"),
    packageIdentity(repository, "packages/cli/package.json"),
  ]);
  const packages = Object.fromEntries(packageEntries);
  const mismatched = packageEntries.filter(([, packageVersion]) => packageVersion !== version);
  if (mismatched.length > 0) {
    throw new Error(
      `Release ${tag} does not match package versions: ${mismatched
        .map(([name, packageVersion]) => `${name}@${packageVersion}`)
        .join(", ")}.`,
    );
  }

  const changelog = await readFile(path.join(repository, "CHANGELOG.md"), "utf8");
  if (!changelogContainsVersion(changelog, version)) {
    throw new Error(`CHANGELOG.md has no level-two section for ${version}.`);
  }

  const tagRef = `refs/tags/${tag}`;
  if (runGit(repository, ["cat-file", "-t", tagRef]) !== "tag") {
    throw new Error(`Release tag ${tag} must be an annotated tag.`);
  }
  const sourceCommit = runGit(repository, ["rev-list", "-n", "1", tagRef]);
  const head = runGit(repository, ["rev-parse", "HEAD"]);
  if (sourceCommit !== head) {
    throw new Error(`Release tag ${tag} does not resolve to the checked-out commit.`);
  }
  runGitStatus(repository, ["merge-base", "--is-ancestor", sourceCommit, authorizedRef]);

  return { tag, version, sourceCommit, packages };
}

function archiveBaseName(identity: ReleaseIdentity): string {
  return `agentic-workflows-${identity.tag}`;
}

export async function createSourceArchives(
  repository: string,
  outputDirectory: string,
  identity: ReleaseIdentity,
): Promise<string[]> {
  const tracked = new Set(runGit(repository, ["ls-tree", "-r", "--name-only", "HEAD"]).split("\n"));
  for (const required of [
    "docs/.vitepress/config.ts",
    "packages/cli/package.json",
    "recipes/write-release-notes/workflow.md",
  ]) {
    if (!tracked.has(required))
      throw new Error(`Release source is missing tracked file ${required}.`);
  }

  await mkdir(outputDirectory, { recursive: true });
  const base = archiveBaseName(identity);
  const prefix = `${base}/`;
  const tarball = path.join(outputDirectory, `${base}.tar.gz`);
  const zip = path.join(outputDirectory, `${base}.zip`);
  runGitStatus(repository, [
    "archive",
    "--format=tar.gz",
    `--prefix=${prefix}`,
    `--output=${tarball}`,
    identity.sourceCommit,
  ]);
  runGitStatus(repository, [
    "archive",
    "--format=zip",
    `--prefix=${prefix}`,
    `--output=${zip}`,
    identity.sourceCommit,
  ]);
  return [tarball, zip];
}

function mediaType(file: string): string {
  if (file.endsWith(".tar.gz")) return "application/gzip";
  if (file.endsWith(".zip")) return "application/zip";
  if (file.endsWith(".spdx.json")) return "application/spdx+json";
  if (file.endsWith(".provenance.json")) return "application/vnd.dev.sigstore.bundle+json";
  return "application/octet-stream";
}

async function sha256(file: string): Promise<string> {
  return createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}

async function jsonArtifact(file: string, label: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
}

export async function writeReleaseManifest(
  outputDirectory: string,
  identity: ReleaseIdentity,
  provenanceUrl: string,
  provenanceBundle?: string,
): Promise<ReleaseManifest> {
  if (!/^https:\/\/github\.com\//.test(provenanceUrl)) {
    throw new Error("The provenance URL must be a GitHub HTTPS URL.");
  }
  const base = archiveBaseName(identity);
  if (provenanceBundle) {
    const parsed = await jsonArtifact(provenanceBundle, "The provenance bundle");
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("The provenance bundle must contain a JSON object.");
    }
    await copyFile(provenanceBundle, path.join(outputDirectory, `${base}.provenance.json`));
  }

  const ignored = new Set([`${base}.artifact-manifest.json`, `${base}.sha256`]);
  const files = (await readdir(outputDirectory)).filter((file) => !ignored.has(file)).sort();
  const artifacts: ArtifactRecord[] = [];
  for (const file of files) {
    const absolute = path.join(outputDirectory, file);
    const information = await stat(absolute);
    if (!information.isFile()) continue;
    artifacts.push({
      file,
      bytes: information.size,
      media_type: mediaType(file),
      sha256: await sha256(absolute),
    });
  }

  const expectedArtifacts = [
    `${base}.tar.gz`,
    `${base}.zip`,
    `${base}.sbom.spdx.json`,
    `${base}.provenance.json`,
  ];
  for (const file of expectedArtifacts) {
    if (!artifacts.some((artifact) => artifact.file === file)) {
      throw new Error(`Release output is missing required artifact ${file}.`);
    }
  }
  const sbom = (await jsonArtifact(
    path.join(outputDirectory, `${base}.sbom.spdx.json`),
    "The SBOM",
  )) as { spdxVersion?: unknown };
  if (typeof sbom.spdxVersion !== "string" || !sbom.spdxVersion.startsWith("SPDX-")) {
    throw new Error("The SBOM is not an SPDX JSON document.");
  }

  const manifest: ReleaseManifest = {
    schema_version: 1,
    release: {
      tag: identity.tag,
      version: identity.version,
      source_commit: identity.sourceCommit,
      packages: identity.packages,
    },
    provenance: {
      kind: "github-artifact-attestation",
      url: provenanceUrl,
      subjects: artifacts
        .filter((artifact) => expectedArtifacts.slice(0, 3).includes(artifact.file))
        .map((artifact) => artifact.file),
    },
    artifacts,
  };
  const manifestName = `${base}.artifact-manifest.json`;
  const manifestPath = path.join(outputDirectory, manifestName);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const checksums = [
    ...artifacts.map((artifact) => `${artifact.sha256}  ${artifact.file}`),
    `${await sha256(manifestPath)}  ${manifestName}`,
  ].sort();
  await writeFile(path.join(outputDirectory, `${base}.sha256`), `${checksums.join("\n")}\n`);
  return manifest;
}

interface Arguments {
  command: "prepare" | "finalize";
  tag: string;
  output: string;
  authorizedRef: string;
  provenanceUrl?: string;
  provenanceBundle?: string;
}

function argumentsFrom(values: string[]): Arguments {
  const command = values[0];
  if (command !== "prepare" && command !== "finalize") {
    throw new Error("Usage: release-artifacts.ts <prepare|finalize> --tag <tag> --output <dir>.");
  }
  const option = (name: string): string | undefined => {
    const index = values.indexOf(name);
    return index >= 0 ? values[index + 1] : undefined;
  };
  const tag = option("--tag");
  const output = option("--output");
  const provenanceUrl = option("--provenance-url");
  const provenanceBundle = option("--provenance-bundle");
  if (!tag || !output) throw new Error("Both --tag and --output are required.");
  return {
    command,
    tag,
    output: path.resolve(output),
    authorizedRef: option("--authorized-ref") ?? "refs/remotes/origin/main",
    ...(provenanceUrl ? { provenanceUrl } : {}),
    ...(provenanceBundle ? { provenanceBundle } : {}),
  };
}

async function main(): Promise<void> {
  const options = argumentsFrom(process.argv.slice(2));
  const repository = path.resolve(".");
  const identity = await verifyReleaseIdentity(repository, options.tag, options.authorizedRef);
  if (options.command === "prepare") {
    const files = await createSourceArchives(repository, options.output, identity);
    process.stdout.write(`Created ${files.length} source archives for ${identity.tag}.\n`);
    return;
  }
  if (!options.provenanceUrl || !options.provenanceBundle) {
    throw new Error("Finalize requires --provenance-url and --provenance-bundle.");
  }
  const manifest = await writeReleaseManifest(
    options.output,
    identity,
    options.provenanceUrl,
    options.provenanceBundle,
  );
  process.stdout.write(
    `Finalized ${manifest.artifacts.length} release artifacts for ${identity.tag}.\n`,
  );
}

const invoked = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invoked === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
