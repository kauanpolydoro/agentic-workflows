import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageNamePattern = /^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/;
const versionPattern =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const MAX_TARBALL_BYTES = 128 * 1024 * 1024;
const MAX_README_BYTES = 1024 * 1024;
const REGISTRY_ATTEMPTS = 6;
const REGISTRY_RETRY_MS = 2_000;

export interface PublishedVersion {
  version: string;
  integrity: string;
  readme: string;
  readmeFilename: string;
}

export function sha512Integrity(content: Uint8Array): string {
  return `sha512-${createHash("sha512").update(content).digest("base64")}`;
}

export function parsePublishedVersion(raw: string): PublishedVersion {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("npm view returned invalid JSON.");
  }
  if (typeof value !== "object" || value === null) {
    throw new Error("npm view returned an invalid package record.");
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.version !== "string" ||
    typeof record["dist.integrity"] !== "string" ||
    typeof record.readme !== "string" ||
    typeof record.readmeFilename !== "string"
  ) {
    throw new Error(
      "npm view omitted the published version, tarball integrity, README, or README filename.",
    );
  }
  return {
    version: record.version,
    integrity: record["dist.integrity"],
    readme: record.readme,
    readmeFilename: record.readmeFilename,
  };
}

export function assertMatchingPublication(
  expectedVersion: string,
  localIntegrity: string,
  expectedReadme: string,
  published: PublishedVersion,
): void {
  if (published.version !== expectedVersion) {
    throw new Error(
      `Registry returned version ${published.version}, expected ${expectedVersion}. Refusing to continue.`,
    );
  }
  if (published.integrity !== localIntegrity) {
    throw new Error(
      "The npm version already exists with different tarball content. Published versions are immutable.",
    );
  }
  if (published.readmeFilename !== "README.md") {
    throw new Error(
      `The npm registry selected ${published.readmeFilename} instead of the canonical README.md.`,
    );
  }
  if (published.readme !== expectedReadme) {
    throw new Error("The npm registry README differs from the README packed for this version.");
  }
}

function inspectRegistry(spec: string): PublishedVersion | null {
  const viewed = spawnSync(
    "npm",
    ["view", spec, "version", "dist.integrity", "readme", "readmeFilename", "--json"],
    {
      encoding: "utf8",
      shell: false,
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  if (viewed.error) throw viewed.error;
  if (viewed.status === 0) return parsePublishedVersion(viewed.stdout);
  if (/\bE404\b/.test(`${viewed.stdout}\n${viewed.stderr}`)) return null;
  throw new Error(
    `Could not determine whether ${spec} exists. npm view exited with ${viewed.status}.\n${viewed.stderr}`,
  );
}

async function verifyRegistryPublication(
  spec: string,
  version: string,
  integrity: string,
  readme: string,
): Promise<boolean> {
  for (let attempt = 1; attempt <= REGISTRY_ATTEMPTS; attempt += 1) {
    const published = inspectRegistry(spec);
    if (published) {
      assertMatchingPublication(version, integrity, readme, published);
      return true;
    }
    if (attempt < REGISTRY_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, REGISTRY_RETRY_MS));
    }
  }
  return false;
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`Missing required argument ${name}.`);
  return value;
}

async function publish(): Promise<void> {
  const packageName = requiredArgument("--package");
  const version = requiredArgument("--version");
  const tarball = path.resolve(requiredArgument("--tarball"));
  const readme = path.resolve(requiredArgument("--readme"));
  if (!packageNamePattern.test(packageName)) throw new Error("Invalid scoped npm package name.");
  if (!versionPattern.test(version)) throw new Error("Invalid npm package version.");
  const information = await lstat(tarball);
  if (information.isSymbolicLink() || !information.isFile() || path.extname(tarball) !== ".tgz") {
    throw new Error("The npm tarball must be a regular .tgz file without symbolic links.");
  }
  if (information.size > MAX_TARBALL_BYTES) {
    throw new Error(`The npm tarball exceeds ${MAX_TARBALL_BYTES} bytes.`);
  }
  const readmeInformation = await lstat(readme);
  if (
    readmeInformation.isSymbolicLink() ||
    !readmeInformation.isFile() ||
    readmeInformation.size > MAX_README_BYTES
  ) {
    throw new Error("The package README must be a regular file no larger than 1 MiB.");
  }
  const integrity = sha512Integrity(await readFile(tarball));
  const expectedReadme = await readFile(readme, "utf8");
  const spec = `${packageName}@${version}`;
  const existing = inspectRegistry(spec);
  if (existing) {
    assertMatchingPublication(version, integrity, expectedReadme, existing);
    process.stdout.write(
      `${spec} is already published with the exact expected tarball and README.\n`,
    );
    return;
  }

  const published = spawnSync("npm", ["publish", tarball, "--access", "public", "--provenance"], {
    encoding: "utf8",
    shell: false,
    stdio: "inherit",
  });
  if (published.error) throw published.error;
  if (published.status !== 0) {
    throw new Error(`npm publish failed for ${spec} with exit code ${published.status}.`);
  }
  if (!(await verifyRegistryPublication(spec, version, integrity, expectedReadme))) {
    throw new Error(`npm did not expose ${spec} for post-publication verification.`);
  }
  process.stdout.write(`Verified ${spec} tarball integrity and README in the npm registry.\n`);
}

const mainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (mainModule) {
  publish().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
