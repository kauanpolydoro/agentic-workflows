import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { access, mkdir, mkdtemp, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { headingAnchors } from "./check-links.js";

function quoteWindowsCommandArgument(value: string): string {
  return /[\s"&|<>^()%!]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function run(
  command: string,
  args: string[],
  cwd: string,
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const requiresCommandProcessor = process.platform === "win32" && command !== process.execPath;
  const executable = requiresCommandProcessor ? (process.env.ComSpec ?? "cmd.exe") : command;
  const executableArguments = requiresCommandProcessor
    ? ["/d", "/s", "/c", `"${[command, ...args].map(quoteWindowsCommandArgument).join(" ")}"`]
    : args;
  const result = spawnSync(executable, executableArguments, {
    cwd,
    encoding: "utf8",
    env: { ...environment, NO_COLOR: "1" },
    shell: false,
    windowsVerbatimArguments: requiresCommandProcessor,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with ${result.status}.\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result.stdout;
}

function runCli(entrypoint: string, args: string[], cwd: string): string {
  const result = spawnSync(process.execPath, [entrypoint, "--project-root", cwd, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(
      `${process.execPath} ${entrypoint} ${args.join(" ")} failed with ${result.status}.\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result.stdout;
}

function runCliFailure(
  entrypoint: string,
  args: string[],
  cwd: string,
): { stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [entrypoint, "--project-root", cwd, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    shell: false,
  });
  if (result.status === 0) {
    throw new Error(
      `${process.execPath} ${entrypoint} ${args.join(" ")} unexpectedly succeeded.\n${result.stdout}`,
    );
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

function globalBinary(prefix: string, name: string): string {
  return process.platform === "win32"
    ? path.join(prefix, `${name}.cmd`)
    : path.join(prefix, "bin", name);
}

interface MachineFailure {
  schema_version?: unknown;
  code?: unknown;
  command?: unknown;
  retryable?: unknown;
  help_url?: unknown;
  remediation?: unknown;
  details?: Readonly<Record<string, unknown>>;
}

function failureCode(
  result: { stdout: string; stderr: string },
  expected: string,
  command: string,
): MachineFailure {
  let value: MachineFailure;
  try {
    value = JSON.parse(result.stderr) as typeof value;
  } catch {
    throw new Error(`Expected a JSON error with code ${expected}, received: ${result.stderr}`);
  }
  if (
    result.stdout !== "" ||
    value.schema_version !== 1 ||
    value.code !== expected ||
    value.command !== command ||
    typeof value.retryable !== "boolean" ||
    typeof value.help_url !== "string" ||
    typeof value.details?.help_command !== "string" ||
    typeof value.remediation !== "string"
  ) {
    throw new Error(`Expected error code ${expected}, received: ${String(value.code)}.`);
  }
  return value;
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

async function recursiveFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await recursiveFiles(candidate)));
    } else if (entry.isFile()) {
      files.push(candidate);
    }
  }
  return files;
}

async function assertPackagedMarkdownLinks(
  packageRoot: string,
  relativeFiles: readonly string[],
): Promise<void> {
  for (const relativeFile of relativeFiles) {
    const markdownPath = path.join(packageRoot, relativeFile);
    const markdown = await readFile(markdownPath, "utf8");
    for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1]?.trim();
      if (!href || /^[a-z][a-z+.-]*:/i.test(href)) {
        continue;
      }
      const [pathAndQuery = "", encodedFragment] = href.split("#", 2);
      const [encodedPath = ""] = pathAndQuery.split("?", 1);
      let linkPath: string;
      let fragment: string | undefined;
      try {
        linkPath = decodeURIComponent(encodedPath);
        fragment = encodedFragment === undefined ? undefined : decodeURIComponent(encodedFragment);
      } catch {
        throw new Error(
          `Packaged Markdown link has malformed encoding in ${relativeFile}: ${href}.`,
        );
      }
      const destination = linkPath
        ? path.resolve(path.dirname(markdownPath), linkPath)
        : markdownPath;
      const relativeDestination = path.relative(packageRoot, destination);
      if (
        relativeDestination === ".." ||
        relativeDestination.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativeDestination)
      ) {
        throw new Error(
          `Packaged Markdown link escapes the CLI package in ${relativeFile}: ${href}.`,
        );
      }
      await access(destination);
      if (fragment && destination.endsWith(".md")) {
        const anchors = headingAnchors(await readFile(destination, "utf8"));
        if (!anchors.has(fragment)) {
          throw new Error(
            `Packaged Markdown link has a missing anchor in ${relativeFile}: ${href}.`,
          );
        }
      }
    }
  }
}

function assertCatalogOutput(label: string, value: string, expectedRecipes: number): void {
  let catalog: unknown;
  try {
    catalog = JSON.parse(value);
  } catch {
    throw new Error(`${label} did not return a JSON catalog.`);
  }
  if (!Array.isArray(catalog) || catalog.length !== expectedRecipes) {
    throw new Error(`${label} returned an incomplete catalog.`);
  }
}

async function assertPackageContents(
  packageRoot: string,
  requiredRuntimeFiles: readonly string[],
): Promise<void> {
  const dist = path.join(packageRoot, "dist");
  const testArtifacts = (await recursiveFiles(dist))
    .map((file) => path.relative(dist, file))
    .filter((file) => /\.(?:test|integration\.test|fixture)\./.test(file));
  if (testArtifacts.length > 0) {
    throw new Error(`Package contains test-only build artifacts: ${testArtifacts.join(", ")}.`);
  }
  for (const runtimeFile of requiredRuntimeFiles) await access(path.join(dist, runtimeFile));
}

interface PackReport {
  files: Array<{ path: string }>;
}

function assertPackedContents(
  report: PackReport,
  allowedTopLevel: readonly string[],
  requiredRuntimeFiles: readonly string[],
): void {
  const paths = report.files.map((file) => file.path);
  const unexpected = paths.filter(
    (file) => !allowedTopLevel.includes(file.split(path.posix.sep)[0] ?? ""),
  );
  if (unexpected.length > 0) {
    throw new Error(`Tarball contains unexpected entries: ${unexpected.join(", ")}.`);
  }
  const testArtifacts = paths.filter((file) => /\.(?:test|integration\.test|fixture)\./.test(file));
  if (testArtifacts.length > 0) {
    throw new Error(`Tarball contains test-only build artifacts: ${testArtifacts.join(", ")}.`);
  }
  for (const runtimeFile of requiredRuntimeFiles) {
    if (!paths.includes(`dist/${runtimeFile}`)) {
      throw new Error(`Tarball omitted required runtime file dist/${runtimeFile}.`);
    }
  }
}

interface InstalledPackageMetadata {
  bugs?: { url?: unknown };
  engines?: { node?: unknown };
  homepage?: unknown;
  license?: unknown;
  name?: unknown;
  publishConfig?: { access?: unknown };
  repository?: { directory?: unknown; type?: unknown; url?: unknown };
  version?: unknown;
}

function assertPackageMetadata(
  name: string,
  metadata: InstalledPackageMetadata,
  version: string,
  directory: string,
): void {
  if (metadata.name !== name) throw new Error(`${name} has an inconsistent package name.`);
  if (metadata.version !== version) throw new Error(`${name} has an inconsistent version.`);
  if (metadata.license !== "MIT") throw new Error(`${name} has no MIT license declaration.`);
  if (metadata.engines?.node !== ">=22") throw new Error(`${name} has no Node.js 22 engine floor.`);
  if (metadata.publishConfig?.access !== "public") {
    throw new Error(`${name} is not configured as a public npm package.`);
  }
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
const workspace = await realpath(
  await mkdtemp(path.join(os.tmpdir(), "awf package smoke with spaces ")),
);
const artifacts = await realpath(await mkdtemp(path.join(os.tmpdir(), "awf-package-artifacts-")));
const cleanup = () => {
  rmSync(workspace, { recursive: true, force: true });
  rmSync(artifacts, { recursive: true, force: true });
};
process.once("exit", cleanup);
// A synthetic ancestor marker makes project-root assumptions deterministic on every runner.
// Consumer commands must remain scoped by their explicit root instead of ambient temp state.
await mkdir(path.join(workspace, ".git"));
const consumer = path.join(workspace, "consumer project");
await mkdir(consumer);

const corePack = JSON.parse(
  run(
    "pnpm",
    [
      "--filter",
      "@kauanpolydoro/agentic-workflows-core",
      "pack",
      "--pack-destination",
      artifacts,
      "--json",
    ],
    repository,
  ),
) as PackReport;
const cliPack = JSON.parse(
  run(
    "pnpm",
    [
      "--filter",
      "@kauanpolydoro/agentic-workflows",
      "pack",
      "--pack-destination",
      artifacts,
      "--json",
    ],
    repository,
  ),
) as PackReport;
assertPackedContents(
  corePack,
  ["LICENSE", "README.md", "dist", "package.json"],
  ["adapter-registry.js", "index.js"],
);
assertPackedContents(
  cliPack,
  ["LICENSE", "README.md", "catalog", "catalog.json", "dist", "docs", "package.json"],
  [
    "completion.js",
    "context.js",
    "error-contract.js",
    "index.js",
    "install.js",
    "io.js",
    "output-contract.js",
    "platform.js",
    "status.js",
    "version.js",
    "wizard.js",
  ],
);
const tarballs = (await readdir(artifacts)).filter((file) => file.endsWith(".tgz"));
const core = tarballs.find((file) => file.includes("agentic-workflows-core-"));
const cli = tarballs.find(
  (file) => file.includes("agentic-workflows-") && !file.includes("agentic-workflows-core-"),
);
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
        "@kauanpolydoro/agentic-workflows-core": `file:${path.join(artifacts, core)}`,
        "@kauanpolydoro/agentic-workflows": `file:${path.join(artifacts, cli)}`,
      },
    },
    null,
    2,
  )}\n`,
);
run("pnpm", ["install", "--ignore-scripts"], consumer);
const outputContractProbe = run(
  process.execPath,
  [
    "--input-type=module",
    "--eval",
    "import { cliOutputSchemas, normalizeProjectContext, parseCliOutput } from '@kauanpolydoro/agentic-workflows/output-contract'; const value = parseCliOutput('documentation_open', { schema_version: 1, target: 'https://example.invalid', opened: false }); const context = normalizeProjectContext('context', { schema_version: 1, project_root: '/project', selection_source: 'explicit', project_root_fallback: false, reason: 'Selected explicitly.' }); const complete = ['catalog_list', 'recipe', 'manifest'].every((contract) => contract in cliOutputSchemas); process.stdout.write(String(!value.opened && context.project_root === '/project' && complete));",
  ],
  consumer,
).trim();
if (outputContractProbe !== "true") {
  throw new Error("The packaged executable output-contract registry is incomplete.");
}
const entrypoint = path.join(
  consumer,
  "node_modules",
  "@kauanpolydoro",
  "agentic-workflows",
  "dist",
  "index.js",
);
for (const alias of ["awf", "agentic-workflows"]) {
  const executable = binary(consumer, alias);
  await access(executable);
  const reportedVersion = run(executable, ["--version"], consumer).trim();
  if (reportedVersion !== rootPackage.version) {
    throw new Error(`${alias} reported ${reportedVersion}, expected ${rootPackage.version}.`);
  }
}
const firstRunHelp = run(binary(consumer, "awf"), [], consumer);
if (!firstRunHelp.includes("awf init --agent codex") || !firstRunHelp.includes("awf list")) {
  throw new Error("The packaged awf alias did not provide actionable first-run help.");
}
const npxVersion = run("npx", ["--no-install", "agentic-workflows", "--version"], consumer).trim();
if (npxVersion !== rootPackage.version) {
  throw new Error(`npx reported ${npxVersion}, expected ${rootPackage.version}.`);
}
const scopedPackage = `@kauanpolydoro/agentic-workflows@${rootPackage.version}`;
const packageRunnerCache = path.join(workspace, "empty package runner cache");
await mkdir(packageRunnerCache);
// The consumer contains only the local tarballs. An empty cache and unreachable registry make
// accidental cache or registry resolution fail while still exercising each package runner.
const packageRunnerEnvironment = { ...process.env };
for (const key of Object.keys(packageRunnerEnvironment)) {
  if (["npm_config_cache", "npm_config_registry"].includes(key.toLowerCase())) {
    delete packageRunnerEnvironment[key];
  }
}
packageRunnerEnvironment.NPM_CONFIG_CACHE = packageRunnerCache;
packageRunnerEnvironment.NPM_CONFIG_REGISTRY = "http://127.0.0.1:9";
assertCatalogOutput(
  "npx execution from the locally installed tarball",
  run("npx", ["--no-install", scopedPackage, "list", "--json"], consumer, packageRunnerEnvironment),
  20,
);
assertCatalogOutput(
  "npm exec selection from the locally installed tarball",
  run(
    "npm",
    ["exec", "--offline", `--package=${scopedPackage}`, "--", "awf", "list", "--json"],
    consumer,
    packageRunnerEnvironment,
  ),
  20,
);
const testedPackageRunners = ["npx", "npm exec"];
if (process.env.AWF_TEST_BUNX === "1") {
  assertCatalogOutput(
    "bunx execution from the locally installed tarball",
    run(
      "bunx",
      ["--no-install", "@kauanpolydoro/agentic-workflows", "list", "--json"],
      consumer,
      packageRunnerEnvironment,
    ),
    20,
  );
  testedPackageRunners.push("bunx");
}

const globalPrefix = path.join(workspace, "global npm prefix");
await mkdir(globalPrefix);
run(
  "npm",
  [
    "install",
    "--global",
    "--prefix",
    globalPrefix,
    "--ignore-scripts",
    path.join(artifacts, core),
    path.join(artifacts, cli),
  ],
  workspace,
);
for (const alias of ["awf", "agentic-workflows"]) {
  const executable = globalBinary(globalPrefix, alias);
  await access(executable);
  const reportedVersion = run(executable, ["--version"], workspace).trim();
  if (reportedVersion !== rootPackage.version) {
    throw new Error(
      `Globally installed ${alias} reported ${reportedVersion}, expected ${rootPackage.version}.`,
    );
  }
}
const globalAwf = globalBinary(globalPrefix, "awf");
const globalHelp = run(globalAwf, [], workspace);
if (!globalHelp.includes("awf init --agent codex") || !globalHelp.includes("awf list")) {
  throw new Error("The globally installed awf command omitted actionable first-run help.");
}
const globalCompletion = run(globalAwf, ["completion", "bash"], workspace);
if (
  !globalCompletion.includes("review-pull-request") ||
  !globalCompletion.includes("agentic-workflows")
) {
  throw new Error("The globally installed awf command returned incomplete Bash completion.");
}
const globalCompletionInstructions = run(
  globalAwf,
  ["completion", "zsh", "--install-instructions"],
  workspace,
);
if (!globalCompletionInstructions.includes("~/.zshrc")) {
  throw new Error("The globally installed awf command omitted Zsh installation instructions.");
}
const globalCatalog = JSON.parse(run(globalAwf, ["list", "--json"], workspace)) as unknown[];
if (globalCatalog.length !== 20) {
  throw new Error(`Globally installed awf returned ${globalCatalog.length} recipes.`);
}
const globalContext = JSON.parse(
  run(globalAwf, ["--project-root", workspace, "context", "--json"], workspace),
) as {
  selection_source?: string;
  project_root_fallback?: boolean;
};
if (
  globalContext.selection_source !== "explicit" ||
  globalContext.project_root_fallback !== false
) {
  throw new Error("The globally installed awf command did not honor its explicit project root.");
}
const listed = JSON.parse(runCli(entrypoint, ["list", "--json"], consumer)) as unknown[];
if (listed.length !== 20) throw new Error(`Packaged catalog returned ${listed.length} recipes.`);
const shown = JSON.parse(
  runCli(entrypoint, ["show", "write-release-notes", "--json"], consumer),
) as {
  id?: string;
};
if (shown.id !== "write-release-notes") throw new Error("Packaged recipe lookup failed.");
const packagedContext = JSON.parse(runCli(entrypoint, ["context", "--json"], consumer)) as {
  selection_source?: string;
  project_root_fallback?: boolean;
};
if (
  packagedContext.selection_source !== "explicit" ||
  packagedContext.project_root_fallback !== false
) {
  throw new Error("The packaged CLI did not explain its explicit project root.");
}
const documentationLocation = runCli(
  entrypoint,
  ["show", "write-release-notes", "--location"],
  consumer,
).trim();
if (
  documentationLocation.startsWith("http") ||
  !documentationLocation.endsWith(path.join("docs", "catalog", "write-release-notes.md"))
) {
  throw new Error(`Packaged documentation location was not local: ${documentationLocation}.`);
}
await access(documentationLocation);
const globalDocumentationLocation = run(
  globalAwf,
  ["show", "write-release-notes", "--location"],
  workspace,
).trim();
if (
  globalDocumentationLocation.startsWith("http") ||
  !globalDocumentationLocation.endsWith(path.join("docs", "catalog", "write-release-notes.md"))
) {
  throw new Error(
    `Globally installed documentation location was not local: ${globalDocumentationLocation}.`,
  );
}
await access(globalDocumentationLocation);
for (const shell of ["bash", "zsh", "fish", "pwsh"]) {
  const completion = runCli(entrypoint, ["completion", shell], consumer);
  if (!completion.includes("review-pull-request") || !completion.includes("agentic-workflows")) {
    throw new Error(`Packaged ${shell} completion is incomplete.`);
  }
  const instructions = runCli(
    entrypoint,
    ["completion", shell, "--install-instructions"],
    consumer,
  );
  if (
    !instructions.includes("will not edit") ||
    !instructions.includes(`awf completion ${shell}`)
  ) {
    throw new Error(`Packaged ${shell} completion installation instructions are incomplete.`);
  }
}

const installationTarget = "installed bundle with spaces";
const initialization = JSON.parse(
  runCli(
    entrypoint,
    ["init", "--agent", "codex", "--target", installationTarget, "--json"],
    consumer,
  ),
) as {
  schema_version?: number;
  project_context?: { source?: string };
  configuration?: { default_agent?: string; default_target?: string };
};
if (
  initialization.schema_version !== 1 ||
  initialization.project_context?.source !== "explicit" ||
  initialization.configuration?.default_agent !== "codex" ||
  initialization.configuration?.default_target !== installationTarget
) {
  throw new Error("Packaged init omitted its versioned context or selected defaults.");
}
const invalidInitialization = failureCode(
  runCliFailure(
    entrypoint,
    ["init", "--force", "--agent", "claude-code", "--target", "../outside", "--json"],
    consumer,
  ),
  "INVALID_PATH",
  "init",
);
if (invalidInitialization.retryable !== false) {
  throw new Error("Packaged init reported unsafe project traversal as retryable.");
}
failureCode(
  runCliFailure(
    entrypoint,
    ["init", "--force", "--agent", "claude", "--target", installationTarget, "--json"],
    consumer,
  ),
  "commander.invalidArgument",
  "init",
);
const dryRun = JSON.parse(
  runCli(entrypoint, ["install", "write-release-notes", "--dry-run", "--json"], consumer),
) as { files?: Array<{ role?: string }> };
if (!dryRun.files?.some((file) => file.role === "policy")) {
  throw new Error("Packaged Codex bundle omitted its invocation policy.");
}

const installed = JSON.parse(
  runCli(entrypoint, ["install", "write-release-notes", "--json"], consumer),
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
const installationStatus = JSON.parse(
  runCli(entrypoint, ["status", "--target", installationTarget, "--json"], consumer),
) as {
  project_context?: {
    project_root?: string;
    selection_source?: string;
    project_root_fallback?: boolean;
  };
  installations?: Array<{ id?: string; status?: string }>;
};
if (
  installationStatus.project_context?.project_root !== consumer ||
  installationStatus.project_context.selection_source !== "explicit" ||
  installationStatus.project_context.project_root_fallback !== false ||
  !installationStatus.installations?.some(
    (installation) =>
      installation.id === "write-release-notes" && installation.status === "healthy",
  )
) {
  throw new Error("The packaged CLI did not report its healthy installation.");
}
const filteredInstallationStatus = JSON.parse(
  runCli(
    entrypoint,
    ["status", "--target", installationTarget, "--failures-only", "--json"],
    consumer,
  ),
) as {
  filter?: string;
  summary?: { total?: number; healthy?: number };
  installations?: unknown[];
};
if (
  filteredInstallationStatus.filter !== "failures-only" ||
  filteredInstallationStatus.summary?.total !== 1 ||
  filteredInstallationStatus.summary?.healthy !== 1 ||
  filteredInstallationStatus.installations?.length !== 0
) {
  throw new Error("The packaged CLI lost summary data while filtering healthy installations.");
}
const packagedDiagnostics = JSON.parse(
  runCli(entrypoint, ["doctor", "--failures-only", "--json"], consumer),
) as {
  projectContext?: { source?: string; reason?: string };
  summary?: { pass?: number };
  status?: string;
  exit_code?: number;
  checks?: Array<{
    schema_version?: number;
    status?: string;
    remediation?: unknown;
    data?: unknown;
  }>;
};
if (
  packagedDiagnostics.projectContext?.source !== "explicit" ||
  !packagedDiagnostics.projectContext?.reason?.includes("--project-root") ||
  !packagedDiagnostics.summary?.pass ||
  packagedDiagnostics.status !== "pass" ||
  packagedDiagnostics.exit_code !== 0 ||
  !packagedDiagnostics.checks?.every(
    (check) => check.schema_version === 1 && "remediation" in check && "data" in check,
  )
) {
  throw new Error("The packaged CLI omitted project-root provenance from diagnostics.");
}
const lifecycleLock = path.join(targetRoot, ".agentic-workflows", "lifecycle.lock");
await writeFile(
  lifecycleLock,
  '{"schema_version":1,"pid":5150,"acquired_at":"2026-07-20T12:00:00.000Z","token":"package-secret"}\n',
);
const lockConflict = failureCode(
  runCliFailure(
    entrypoint,
    ["update", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
  "CONFLICT",
  "update",
);
if (
  lockConflict.retryable !== true ||
  lockConflict.details?.pid !== 5150 ||
  JSON.stringify(lockConflict).includes("package-secret")
) {
  throw new Error("The packaged CLI omitted safe lifecycle-lock conflict metadata.");
}
const humanLockConflict = runCliFailure(
  entrypoint,
  ["update", "write-release-notes", "--target", installationTarget],
  consumer,
);
if (
  humanLockConflict.stdout !== "" ||
  !humanLockConflict.stderr.includes("Owner: PID 5150, acquired at 2026-07-20T12:00:00.000Z") ||
  !humanLockConflict.stderr.includes("Next: Confirm that PID 5150 is no longer active") ||
  !humanLockConflict.stderr.includes("manually removing the lifecycle lock") ||
  humanLockConflict.stderr.includes("package-secret") ||
  humanLockConflict.stderr.includes("\u001b")
) {
  throw new Error("The packaged CLI omitted actionable human lifecycle-lock recovery.");
}
rmSync(lifecycleLock);
const abandonedTransaction = path.join(
  targetRoot,
  ".agentic-workflows",
  "transactions",
  "abandoned-package-transaction",
);
await mkdir(abandonedTransaction, { recursive: true });
await writeFile(path.join(abandonedTransaction, "0.staged"), "retained package recovery state\n");
const transactionDiagnostics = runCliFailure(entrypoint, ["doctor", "--json"], consumer);
if (transactionDiagnostics.stderr !== "") {
  throw new Error("Unhealthy packaged diagnostics wrote outside their JSON stdout contract.");
}
const transactionReport = JSON.parse(transactionDiagnostics.stdout) as {
  status?: string;
  checks?: Array<{
    check?: string;
    status?: string;
    data?: { count?: number; entries?: string[] };
  }>;
};
const transactionCheck = transactionReport.checks?.find(
  (check) => check.check === "lifecycle-transactions",
);
if (
  transactionReport.status !== "fail" ||
  transactionCheck?.status !== "fail" ||
  transactionCheck.data?.count !== 1 ||
  !transactionCheck.data.entries?.includes("abandoned-package-transaction") ||
  !(await readFile(path.join(abandonedTransaction, "0.staged"), "utf8")).includes(
    "retained package recovery state",
  )
) {
  throw new Error("The packaged CLI did not retain and diagnose abandoned transaction state.");
}
rmSync(path.dirname(abandonedTransaction), { recursive: true });
const recoveredDiagnostics = JSON.parse(runCli(entrypoint, ["doctor", "--json"], consumer)) as {
  status?: string;
};
if (recoveredDiagnostics.status !== "pass") {
  throw new Error("Packaged diagnostics did not recover after exact transaction cleanup.");
}
failureCode(
  runCliFailure(entrypoint, ["status", "review-pull-request", "--json"], consumer),
  "NOT_FOUND",
  "status",
);

failureCode(
  runCliFailure(
    entrypoint,
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
  "install",
);
failureCode(
  runCliFailure(
    entrypoint,
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
  "install",
);

const originalEntrypoint = await readFile(installedEntrypoint, "utf8");
await writeFile(
  installedEntrypoint,
  `${originalEntrypoint}\nLocal edit used by the package contract test.\n`,
);
failureCode(
  runCliFailure(
    entrypoint,
    ["update", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
  "MODIFIED_FILE",
  "update",
);
const removePlan = JSON.parse(
  runCli(
    entrypoint,
    ["remove", "write-release-notes", "--target", installationTarget, "--dry-run", "--json"],
    consumer,
  ),
) as {
  requiresForce?: boolean;
  changes?: { modifiedManagedFiles?: string[] };
  plan?: { schema_version?: number; operation?: string };
};
if (
  removePlan.requiresForce !== true ||
  !removePlan.changes?.modifiedManagedFiles?.includes(installed.entrypoint) ||
  removePlan.plan?.schema_version !== 1 ||
  removePlan.plan?.operation !== "remove"
) {
  throw new Error("The packaged remove dry-run omitted its modified-file force requirement.");
}
failureCode(
  runCliFailure(
    entrypoint,
    ["remove", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
  "MODIFIED_FILE",
  "remove",
);
await writeFile(installedEntrypoint, originalEntrypoint);

const updated = JSON.parse(
  runCli(
    entrypoint,
    ["update", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
) as { recipe?: string };
if (updated.recipe !== "write-release-notes") throw new Error("Tarball update failed.");
const inspectedManifest = JSON.parse(
  runCli(
    entrypoint,
    ["manifest", "write-release-notes", "--target", installationTarget, "--json"],
    consumer,
  ),
) as { recipe?: string };
if (inspectedManifest.recipe !== "write-release-notes") {
  throw new Error("The packaged CLI could not inspect its installed manifest.");
}
const installationValidation = JSON.parse(
  runCli(entrypoint, ["validate", installationTarget, "--strict", "--json"], consumer),
) as { schema_version?: number; installations?: number };
if (installationValidation.schema_version !== 1 || installationValidation.installations !== 1) {
  throw new Error("The packaged lifecycle did not pass strict installation validation.");
}
const catalog = path.join(
  consumer,
  "node_modules",
  "@kauanpolydoro",
  "agentic-workflows",
  "catalog",
);
const validated = JSON.parse(
  runCli(entrypoint, ["validate", catalog, "--strict", "--json"], consumer),
) as { schema_version?: number; recipes?: number };
if (validated.schema_version !== 1 || validated.recipes !== 20) {
  throw new Error("Packaged catalog strict validation failed.");
}
const packageRoot = path.dirname(catalog);
const packagedReadme = await readFile(path.join(packageRoot, "README.md"), "utf8");
const documentedCommands = [
  "context",
  "list",
  "show",
  "install",
  "update",
  "remove",
  "status",
  "validate",
  "doctor",
  "init",
  "manifest",
  "completion",
] as const;
for (const command of documentedCommands) {
  if (!packagedReadme.includes(`awf ${command}`)) {
    throw new Error(`The package README omitted the public awf ${command} command.`);
  }
  const help = runCli(entrypoint, [command, "--help"], consumer);
  if (!help.includes(`Usage: awf ${command}`)) {
    throw new Error(`The packed CLI help drifted from the documented awf ${command} command.`);
  }
}
const initHelp = runCli(entrypoint, ["init", "--help"], consumer);
if (!initHelp.includes("--wizard") || !packagedReadme.includes("awf init --wizard")) {
  throw new Error("The explicit init wizard is missing from packed help or package documentation.");
}
await assertPackagedMarkdownLinks(packageRoot, [
  "README.md",
  "docs/guide/installation.md",
  "docs/guide/cli-reference.md",
  "docs/guide/output-contracts.md",
  ...(await readdir(path.join(packageRoot, "docs", "catalog"))).map(
    (page) => `docs/catalog/${page}`,
  ),
  ...(await readdir(catalog)).map((recipe) => `catalog/${recipe}/README.md`),
]);
const cliPackage = JSON.parse(
  await readFile(
    path.join(consumer, "node_modules", "@kauanpolydoro", "agentic-workflows", "package.json"),
    "utf8",
  ),
) as InstalledPackageMetadata & { dependencies?: Record<string, string> };
if (cliPackage.dependencies?.["@kauanpolydoro/agentic-workflows-core"]?.startsWith("workspace:")) {
  throw new Error("Packed CLI retained an unresolved workspace dependency.");
}
const corePackage = JSON.parse(
  await readFile(
    path.join(consumer, "node_modules", "@kauanpolydoro", "agentic-workflows-core", "package.json"),
    "utf8",
  ),
) as InstalledPackageMetadata;
const installedScope = path.join(consumer, "node_modules", "@kauanpolydoro");
await assertPackageContents(path.join(installedScope, "agentic-workflows"), [
  "completion.js",
  "context.js",
  "error-contract.js",
  "index.js",
  "install.js",
  "io.js",
  "platform.js",
  "status.js",
  "version.js",
  "wizard.js",
]);
await assertPackageContents(path.join(installedScope, "agentic-workflows-core"), [
  "adapter-registry.js",
  "index.js",
]);
assertPackageMetadata(
  "@kauanpolydoro/agentic-workflows",
  cliPackage,
  rootPackage.version,
  "packages/cli",
);
assertPackageMetadata(
  "@kauanpolydoro/agentic-workflows-core",
  corePackage,
  rootPackage.version,
  "packages/core",
);
for (const packagedFile of [
  "agentic-workflows/README.md",
  "agentic-workflows/LICENSE",
  "agentic-workflows/catalog.json",
  "agentic-workflows/docs/guide/installation.md",
  "agentic-workflows/docs/guide/cli-reference.md",
  "agentic-workflows/docs/guide/output-contracts.md",
  "agentic-workflows/docs/catalog/write-release-notes.md",
  "agentic-workflows-core/README.md",
  "agentic-workflows-core/LICENSE",
]) {
  await access(path.join(consumer, "node_modules", "@kauanpolydoro", packagedFile));
}
const packagedCatalog = JSON.parse(
  await readFile(
    path.join(consumer, "node_modules", "@kauanpolydoro", "agentic-workflows", "catalog.json"),
    "utf8",
  ),
) as unknown[];
if (packagedCatalog.length !== listed.length) {
  throw new Error("The packaged catalog index and bundled recipe directory disagree.");
}

const removed = JSON.parse(
  runCli(
    entrypoint,
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
  `Package smoke test passed for ${listed.length} bundled recipes, local-tarball execution through ${testedPackageRunners.join(", ")}, shell completion, and the install lifecycle.\n`,
);
cleanup();
process.removeListener("exit", cleanup);
