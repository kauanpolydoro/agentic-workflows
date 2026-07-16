import { spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function run(command: string, args: string[], cwd: string): string {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with ${result.status}.\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result.stdout;
}

function runFailure(
  command: string,
  args: string[],
  cwd: string,
): { stdout: string; stderr: string } {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    shell: process.platform === "win32",
  });
  if (result.status === 0) {
    throw new Error(`${command} ${args.join(" ")} unexpectedly succeeded.\n${result.stdout}`);
  }
  return { stdout: result.stdout, stderr: result.stderr };
}

function binary(consumer: string, name: string): string {
  return path.join(
    consumer,
    "node_modules",
    ".bin",
    process.platform === "win32" ? `${name}.cmd` : name,
  );
}

function failureCode(result: { stderr: string }, expected: string): void {
  let value: { code?: unknown };
  try {
    value = JSON.parse(result.stderr) as { code?: unknown };
  } catch {
    throw new Error(`Expected a JSON error with code ${expected}, received: ${result.stderr}`);
  }
  if (value.code !== expected) {
    throw new Error(`Expected error code ${expected}, received: ${String(value.code)}.`);
  }
}

async function assertMissing(file: string): Promise<void> {
  try {
    await access(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  throw new Error(`Expected removal of ${file}.`);
}

interface InstalledPackageMetadata {
  bugs?: { url?: unknown };
  engines?: { node?: unknown };
  homepage?: unknown;
  license?: unknown;
  repository?: { directory?: unknown; type?: unknown; url?: unknown };
  version?: unknown;
}

function assertPackageMetadata(
  name: string,
  metadata: InstalledPackageMetadata,
  version: string,
  directory: string,
): void {
  if (metadata.version !== version) throw new Error(`${name} has an inconsistent version.`);
  if (metadata.license !== "MIT") throw new Error(`${name} has no MIT license declaration.`);
  if (metadata.engines?.node !== ">=22") throw new Error(`${name} has no Node.js 22 engine floor.`);
  if (metadata.repository?.type !== "git" || metadata.repository.directory !== directory) {
    throw new Error(`${name} has incomplete repository metadata.`);
  }
  if (
    typeof metadata.repository.url !== "string" ||
    !metadata.repository.url.startsWith("git+https://") ||
    typeof metadata.homepage !== "string" ||
    !metadata.homepage.startsWith("https://") ||
    typeof metadata.bugs?.url !== "string" ||
    !metadata.bugs.url.startsWith("https://")
  ) {
    throw new Error(`${name} has incomplete HTTPS project links.`);
  }
}

const repository = path.resolve(".");
const rootPackage = JSON.parse(await readFile(path.join(repository, "package.json"), "utf8")) as {
  version?: unknown;
};
if (typeof rootPackage.version !== "string") throw new Error("The root package has no version.");
const workspace = await mkdtemp(path.join(os.tmpdir(), "awf package smoke with spaces "));
const artifacts = path.join(workspace, "artifacts");
const consumer = path.join(workspace, "consumer project");
await Promise.all([mkdir(artifacts), mkdir(consumer)]);

run(
  "pnpm",
  ["--filter", "@agentic-workflows/core", "pack", "--pack-destination", artifacts],
  repository,
);
run(
  "pnpm",
  ["--filter", "@agentic-workflows/cli", "pack", "--pack-destination", artifacts],
  repository,
);
const tarballs = (await readdir(artifacts)).filter((file) => file.endsWith(".tgz"));
const core = tarballs.find((file) => file.includes("core"));
const cli = tarballs.find((file) => file.includes("cli"));
if (!core || !cli)
  throw new Error(`Expected core and CLI tarballs, found: ${tarballs.join(", ")}.`);

await writeFile(
  path.join(consumer, "package.json"),
  `${JSON.stringify(
    {
      name: "awf-package-smoke",
      private: true,
      type: "module",
      dependencies: {
        "@agentic-workflows/core": `file:${path.join(artifacts, core)}`,
        "@agentic-workflows/cli": `file:${path.join(artifacts, cli)}`,
      },
      pnpm: {
        overrides: {
          "@agentic-workflows/core": `file:${path.join(artifacts, core)}`,
        },
      },
    },
    null,
    2,
  )}\n`,
);
run("pnpm", ["install", "--ignore-scripts"], consumer);
const executable = binary(consumer, "awf");
for (const alias of ["awf", "agentic-workflows"]) {
  const reportedVersion = run(binary(consumer, alias), ["--version"], consumer).trim();
  if (reportedVersion !== rootPackage.version) {
    throw new Error(`${alias} reported ${reportedVersion}, expected ${rootPackage.version}.`);
  }
}
const listed = JSON.parse(run(executable, ["list", "--json"], consumer)) as unknown[];
if (listed.length !== 20) throw new Error(`Packaged catalog returned ${listed.length} recipes.`);
const shown = JSON.parse(run(executable, ["show", "write-release-notes", "--json"], consumer)) as {
  id?: string;
};
if (shown.id !== "write-release-notes") throw new Error("Packaged recipe lookup failed.");
const dryRun = JSON.parse(
  run(
    executable,
    ["install", "write-release-notes", "--agent", "codex", "--dry-run", "--json"],
    consumer,
  ),
) as { files?: Array<{ role?: string }> };
if (!dryRun.files?.some((file) => file.role === "policy")) {
  throw new Error("Packaged Codex bundle omitted its invocation policy.");
}

const installationTarget = "installed bundle with spaces";
const installed = JSON.parse(
  run(
    executable,
    [
      "install",
      "write-release-notes",
      "--agent",
      "codex",
      "--target",
      installationTarget,
      "--json",
    ],
    consumer,
  ),
) as {
  adapter?: { id?: string };
  entrypoint?: string;
  files?: Array<{ path?: string }>;
  recipe?: string;
};
if (
  installed.recipe !== "write-release-notes" ||
  installed.adapter?.id !== "codex" ||
  !installed.entrypoint ||
  !installed.files?.some((file) => file.path === installed.entrypoint)
) {
  throw new Error("The tarball installation returned an incomplete Codex manifest.");
}
const targetRoot = path.join(consumer, installationTarget);
const installedEntrypoint = path.join(targetRoot, installed.entrypoint);
await access(installedEntrypoint);

failureCode(
  runFailure(
    executable,
    [
      "install",
      "write-release-notes",
      "--agent",
      "codex",
      "--target",
      installationTarget,
      "--json",
    ],
    consumer,
  ),
  "CONFLICT",
);
failureCode(
  runFailure(
    executable,
    [
      "install",
      "write-release-notes",
      "--agent",
      "codex",
      "--target",
      "../outside-consumer",
      "--json",
    ],
    consumer,
  ),
  "INVALID_PATH",
);

const originalEntrypoint = await readFile(installedEntrypoint, "utf8");
await writeFile(
  installedEntrypoint,
  `${originalEntrypoint}\nLocal edit used by the package contract test.\n`,
);
failureCode(
  runFailure(
    executable,
    ["update", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
  "MODIFIED_FILE",
);
failureCode(
  runFailure(
    executable,
    ["remove", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
  "MODIFIED_FILE",
);
await writeFile(installedEntrypoint, originalEntrypoint);

const updated = JSON.parse(
  run(
    executable,
    ["update", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
) as { recipe?: string };
if (updated.recipe !== "write-release-notes") throw new Error("Tarball update failed.");
const inspectedManifest = JSON.parse(
  run(
    executable,
    ["manifest", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
) as { recipe?: string };
if (inspectedManifest.recipe !== "write-release-notes") {
  throw new Error("The packaged CLI could not inspect its installed manifest.");
}
const installationValidation = JSON.parse(
  run(executable, ["validate", installationTarget, "--strict", "--json"], consumer),
) as { installations?: number };
if (installationValidation.installations !== 1) {
  throw new Error("The packaged lifecycle did not pass strict installation validation.");
}
const catalog = path.join(consumer, "node_modules", "@agentic-workflows", "cli", "catalog");
const validated = JSON.parse(
  run(executable, ["validate", catalog, "--strict", "--json"], consumer),
) as { recipes?: number };
if (validated.recipes !== 20) throw new Error("Packaged catalog strict validation failed.");
const packageRoot = path.dirname(catalog);
for (const recipe of await readdir(catalog)) {
  const readmePath = path.join(catalog, recipe, "README.md");
  const readme = await readFile(readmePath, "utf8");
  for (const match of readme.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = match[1];
    if (!href || href.startsWith("http://") || href.startsWith("https://")) continue;
    const [linkPath] = href.split("#", 1);
    if (!linkPath) continue;
    const destination = path.resolve(path.dirname(readmePath), linkPath);
    const relative = path.relative(packageRoot, destination);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`Packaged recipe link escapes the CLI package: ${recipe}/${href}.`);
    }
    await access(destination);
  }
}
const cliPackage = JSON.parse(
  await readFile(
    path.join(consumer, "node_modules", "@agentic-workflows", "cli", "package.json"),
    "utf8",
  ),
) as InstalledPackageMetadata & { dependencies?: Record<string, string> };
if (cliPackage.dependencies?.["@agentic-workflows/core"]?.startsWith("workspace:")) {
  throw new Error("Packed CLI retained an unresolved workspace dependency.");
}
const corePackage = JSON.parse(
  await readFile(
    path.join(consumer, "node_modules", "@agentic-workflows", "core", "package.json"),
    "utf8",
  ),
) as InstalledPackageMetadata;
assertPackageMetadata("@agentic-workflows/cli", cliPackage, rootPackage.version, "packages/cli");
assertPackageMetadata("@agentic-workflows/core", corePackage, rootPackage.version, "packages/core");
for (const packagedFile of [
  "cli/README.md",
  "cli/LICENSE",
  "cli/catalog.json",
  "core/README.md",
  "core/LICENSE",
]) {
  await access(path.join(consumer, "node_modules", "@agentic-workflows", packagedFile));
}
const packagedCatalog = JSON.parse(
  await readFile(
    path.join(consumer, "node_modules", "@agentic-workflows", "cli", "catalog.json"),
    "utf8",
  ),
) as unknown[];
if (packagedCatalog.length !== listed.length) {
  throw new Error("The packaged catalog index and bundled recipe directory disagree.");
}

const removed = JSON.parse(
  run(
    executable,
    ["remove", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
) as { recipe?: string };
if (removed.recipe !== "write-release-notes") throw new Error("Tarball removal failed.");
await assertMissing(installedEntrypoint);
await assertMissing(
  path.join(targetRoot, ".agentic-workflows", "installations", "write-release-notes.yml"),
);

process.stdout.write(
  `Package smoke test passed for ${listed.length} bundled recipes and the install lifecycle.\n`,
);
