import {
  type ChildProcessWithoutNullStreams,
  type SpawnSyncReturns,
  spawn,
  spawnSync,
} from "node:child_process";
import { rmSync } from "node:fs";
import { access, chmod, mkdir, mkdtemp, readFile, realpath, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseCliOutput } from "../packages/cli/src/output-contract.js";

interface Result {
  status: number | null;
  stdout: string;
  stderr: string;
}

const cli = path.resolve("packages/cli/dist/index.js");
const expectedRecipeCount = (
  JSON.parse(await readFile(path.resolve("generated/catalog.json"), "utf8")) as unknown[]
).length;
const project = await realpath(
  await mkdtemp(path.join(os.tmpdir(), "awf acceptance path with spaces ")),
);
const cleanup = () => rmSync(project, { recursive: true, force: true });
process.once("exit", cleanup);
await writeFile(path.join(project, "package.json"), "{}\n");

function invoke(args: string[], noColor = false): Result {
  const result = spawnSync(process.execPath, [cli, "--project-root", project, ...args], {
    cwd: project,
    encoding: "utf8",
    env: { ...process.env, ...(noColor ? { NO_COLOR: "1" } : {}) },
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function success(args: string[], noColor = false): Result {
  const result = invoke(args, noColor);
  if (result.status !== 0) {
    throw new Error(
      `Expected success for ${args.join(" ")}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return result;
}

function failure(args: string[], code?: string): Result {
  const result = invoke(args);
  if (result.status === 0) throw new Error(`Expected failure for ${args.join(" ")}.`);
  if (code) {
    if (result.stdout.trim() !== "") {
      throw new Error(`Expected JSON failure stdout to stay empty, received: ${result.stdout}`);
    }
    const payload = JSON.parse(result.stderr) as { schema_version?: number; code?: string };
    parseCliOutput("error", payload);
    const contract = payload as typeof payload & {
      command?: unknown;
      retryable?: unknown;
      help_url?: unknown;
      remediation?: unknown;
      details?: { help_command?: unknown };
    };
    if (
      payload.schema_version !== 1 ||
      payload.code !== code ||
      contract.command !== args[0] ||
      typeof contract.retryable !== "boolean" ||
      typeof contract.help_url !== "string" ||
      typeof contract.details?.help_command !== "string" ||
      typeof contract.remediation !== "string"
    ) {
      throw new Error(`Expected ${code}, received ${payload.code ?? "no error code"}.`);
    }
  }
  return result;
}

async function waitForFile(file: string): Promise<void> {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    try {
      await access(file);
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Timed out waiting for subprocess readiness marker ${file}.`);
}

async function pathExists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function waitForChild(
  child: ChildProcessWithoutNullStreams,
  label: string,
): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Timed out waiting for ${label}.`));
    }, 15_000);
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("close", (code, signal) => {
      clearTimeout(timeout);
      resolve({ code, signal });
    });
  });
}

async function verifyInterruption(
  signal: "SIGINT" | "SIGTERM",
  expectedExitCode: 130 | 143,
  json: boolean,
): Promise<void> {
  if (process.platform === "win32") return;
  const mode = json ? "json" : "human";
  const bin = path.join(project, `signal-${signal.toLowerCase()}-${mode}`);
  const ready = path.join(bin, "ready");
  await mkdir(bin);
  const opener = path.join(bin, process.platform === "darwin" ? "open" : "xdg-open");
  await writeFile(opener, '#!/bin/sh\n: > "$AWF_SIGNAL_READY"\nexec /bin/sleep 30\n');
  await chmod(opener, 0o755);

  const child = spawn(
    process.execPath,
    [
      cli,
      "--project-root",
      project,
      "show",
      "write-release-notes",
      "--open",
      ...(json ? ["--json"] : []),
    ],
    {
      cwd: project,
      env: { ...process.env, PATH: bin, AWF_SIGNAL_READY: ready },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  let childStdout = "";
  let childStderr = "";
  child.stdout.on("data", (chunk: string) => {
    childStdout += chunk;
  });
  child.stderr.on("data", (chunk: string) => {
    childStderr += chunk;
  });
  const closed = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
    (resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code, closeSignal) => resolve({ code, signal: closeSignal }));
    },
  );
  await waitForFile(ready);
  if (!child.kill(signal)) throw new Error(`Could not deliver ${signal} to the CLI subprocess.`);
  const result = await closed;
  if (result.code !== expectedExitCode || result.signal !== null || childStdout !== "") {
    throw new Error(
      `${signal} returned code=${String(result.code)} signal=${String(result.signal)} stdout=${JSON.stringify(childStdout)} stderr=${JSON.stringify(childStderr)}.`,
    );
  }
  if (json) {
    const payload = JSON.parse(childStderr) as {
      schema_version?: unknown;
      code?: unknown;
      command?: unknown;
      message?: unknown;
      retryable?: unknown;
      remediation?: unknown;
      details?: { signal?: unknown };
    };
    parseCliOutput("error", payload);
    if (
      payload.schema_version !== 1 ||
      payload.code !== "INTERRUPTED" ||
      payload.command !== "show" ||
      payload.message !== `The operation was interrupted by ${signal}.` ||
      payload.retryable !== false ||
      typeof payload.remediation !== "string" ||
      payload.details?.signal !== signal
    ) {
      throw new Error(`${signal} did not preserve the JSON error contract.`);
    }
  } else if (
    !childStderr.includes("Error [INTERRUPTED]") ||
    !childStderr.includes(signal) ||
    !childStderr.includes("awf doctor")
  ) {
    throw new Error(`${signal} did not print the documented human recovery guidance.`);
  }
}

async function verifyInteractiveWizardInPty(): Promise<void> {
  if (process.platform === "win32") return;
  const ptyProject = path.join(project, "interactive pty project");
  await mkdir(ptyProject);
  await writeFile(path.join(ptyProject, "package.json"), "{}\n");
  const command = '"$AWF_PTY_NODE" "$AWF_PTY_CLI" --project-root "$AWF_PTY_PROJECT" init';
  let result: SpawnSyncReturns<string>;
  if (process.platform === "darwin") {
    const expectScript = path.join(ptyProject, "wizard.expect");
    await writeFile(
      expectScript,
      `set timeout 15
set node [lindex $argv 0]
set cli [lindex $argv 1]
set project [lindex $argv 2]
spawn $node $cli --project-root $project init
expect -glob "Choose a number or agent ID *"
send -- "unknown-agent\\r"
expect -glob "Choose one of: *"
expect -glob "Choose a number or agent ID *"
send -- "3\\r"
expect -glob "Project-relative installation target *"
send -- "../outside\\r"
expect -glob "Use a relative path that stays inside the project root.*"
expect -glob "Project-relative installation target *"
send -- "pty target\\r"
expect eof
set child [wait]
exit [lindex $child 3]
`,
    );
    result = spawnSync("expect", [expectScript, process.execPath, cli, ptyProject], {
      cwd: ptyProject,
      encoding: "utf8",
      env: process.env,
    });
  } else {
    result = spawnSync("script", ["-qec", command, "/dev/null"], {
      cwd: ptyProject,
      encoding: "utf8",
      env: {
        ...process.env,
        AWF_PTY_NODE: process.execPath,
        AWF_PTY_CLI: cli,
        AWF_PTY_PROJECT: ptyProject,
      },
      input: "unknown-agent\n3\n../outside\npty target\n",
    });
  }
  if (
    result.status !== 0 ||
    !result.stdout.includes("Configure Agentic Workflows for this project") ||
    !result.stdout.includes("Choose one of: generic, claude-code, codex") ||
    !result.stdout.includes("Use a relative path that stays inside the project root") ||
    !result.stdout.includes("Default agent: codex")
  ) {
    throw new Error(
      `Interactive PTY wizard failed with ${String(result.status)}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  const configuration = await readFile(
    path.join(ptyProject, ".agentic-workflows", "config.yml"),
    "utf8",
  );
  if (!configuration.includes("default_agent: codex") || !configuration.includes("pty target")) {
    throw new Error("Interactive PTY wizard did not retain the selected defaults.");
  }
}

async function verifyExplicitWizardWithRedirectedInput(): Promise<void> {
  const redirectedProject = path.join(project, "redirected wizard project");
  await mkdir(redirectedProject);
  await writeFile(path.join(redirectedProject, "package.json"), "{}\n");
  const child = spawn(
    process.execPath,
    [cli, "--project-root", redirectedProject, "init", "--wizard"],
    {
      cwd: redirectedProject,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  let stdout = "";
  let stderr = "";
  let promptCursor = 0;
  let responseIndex = 0;
  const interactions = [
    { prompt: "Choose a number or agent ID [generic]: ", response: "unknown-agent\n" },
    { prompt: "Choose a number or agent ID [generic]: ", response: "3\n" },
    { prompt: "Project-relative installation target [.]: ", response: "../outside\n" },
    { prompt: "Project-relative installation target [.]: ", response: "redirected target\n" },
  ] as const;
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
    while (responseIndex < interactions.length) {
      const interaction = interactions[responseIndex];
      if (!interaction) break;
      const prompt = stdout.indexOf(interaction.prompt, promptCursor);
      if (prompt < 0) break;
      promptCursor = prompt + interaction.prompt.length;
      child.stdin.write(interaction.response);
      responseIndex += 1;
      if (responseIndex === interactions.length) child.stdin.end();
    }
  });
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });
  const result = await waitForChild(child, "the redirected init wizard");
  if (
    result.code !== 0 ||
    result.signal !== null ||
    responseIndex !== interactions.length ||
    stderr !== "" ||
    !stdout.includes("Configure Agentic Workflows for this project") ||
    !stdout.includes("Choose one of: generic, claude-code, codex") ||
    !stdout.includes("Use a relative path that stays inside the project root") ||
    !stdout.includes("Default agent: codex")
  ) {
    throw new Error(
      `Explicit redirected wizard failed with code=${String(result.code)} signal=${String(result.signal)} responses=${responseIndex}.\nstdout:\n${stdout}\nstderr:\n${stderr}`,
    );
  }
  const configuration = await readFile(
    path.join(redirectedProject, ".agentic-workflows", "config.yml"),
    "utf8",
  );
  if (
    !configuration.includes("default_agent: codex") ||
    !configuration.includes("redirected target")
  ) {
    throw new Error("The explicit redirected wizard did not retain the selected defaults.");
  }
}

async function verifyForcedWizardTerminationOnWindows(): Promise<void> {
  if (process.platform !== "win32") return;
  const interruptedProject = path.join(project, "interrupted windows wizard project");
  await mkdir(interruptedProject);
  await writeFile(path.join(interruptedProject, "package.json"), "{}\n");
  const child = spawn(
    process.execPath,
    [cli, "--project-root", interruptedProject, "init", "--wizard"],
    {
      cwd: interruptedProject,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  let stdout = "";
  let terminated = false;
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
    if (!terminated && stdout.includes("Choose a number or agent ID [generic]: ")) {
      terminated = child.kill();
    }
  });
  const result = await waitForChild(child, "the forced Windows wizard termination");
  if (!terminated || result.code === 0) {
    throw new Error(
      `Forced Windows wizard termination was not observed: code=${String(result.code)} signal=${String(result.signal)} stdout=${JSON.stringify(stdout)}.`,
    );
  }
  if (await pathExists(path.join(interruptedProject, ".agentic-workflows", "config.yml"))) {
    throw new Error("Forced Windows wizard termination left a partial configuration file.");
  }
}

async function verifyNestedProjectRootPrecedence(): Promise<void> {
  const monorepo = path.join(project, "root precedence monorepo");
  const nestedProject = path.join(monorepo, "packages", "nested project");
  const nestedSource = path.join(nestedProject, "src");
  await mkdir(path.join(monorepo, ".git"), { recursive: true });
  await mkdir(path.join(nestedProject, ".agentic-workflows"), { recursive: true });
  await mkdir(nestedSource);
  await writeFile(
    path.join(nestedProject, ".agentic-workflows", "config.yml"),
    "schema_version: 1\ndefault_agent: generic\ndefault_target: .\n",
  );

  const discovered = spawnSync(process.execPath, [cli, "context", "--json"], {
    cwd: nestedSource,
    encoding: "utf8",
    env: process.env,
  });
  if (discovered.status !== 0 || discovered.stderr !== "") {
    throw new Error(
      `Nested project-root discovery failed.\nstdout:\n${discovered.stdout}\nstderr:\n${discovered.stderr}`,
    );
  }
  const discoveredContext = JSON.parse(discovered.stdout) as {
    project_root?: string;
    selection_source?: string;
  };
  parseCliOutput("context", discoveredContext);
  if (
    discoveredContext.project_root !== (await realpath(nestedProject)) ||
    discoveredContext.selection_source !== "config"
  ) {
    throw new Error("A nested initialized AWF project did not win over its enclosing Git root.");
  }

  const explicit = spawnSync(
    process.execPath,
    [cli, "--project-root", monorepo, "context", "--json"],
    {
      cwd: nestedSource,
      encoding: "utf8",
      env: process.env,
    },
  );
  if (explicit.status !== 0 || explicit.stderr !== "") {
    throw new Error(
      `Explicit project-root override failed.\nstdout:\n${explicit.stdout}\nstderr:\n${explicit.stderr}`,
    );
  }
  const explicitContext = JSON.parse(explicit.stdout) as {
    project_root?: string;
    selection_source?: string;
  };
  parseCliOutput("context", explicitContext);
  if (
    explicitContext.project_root !== (await realpath(monorepo)) ||
    explicitContext.selection_source !== "explicit"
  ) {
    throw new Error("An explicit project root did not override nested auto-detection.");
  }
}

const firstRun = success([]);
if (
  !firstRun.stdout.includes("Usage: awf [options] [command]") ||
  !firstRun.stdout.includes("awf init --agent codex") ||
  firstRun.stderr !== ""
) {
  throw new Error("Empty invocation did not return clean, actionable first-run help.");
}
await verifyInteractiveWizardInPty();
await verifyExplicitWizardWithRedirectedInput();
await verifyForcedWizardTerminationOnWindows();
await verifyNestedProjectRootPrecedence();
const context = JSON.parse(success(["context", "--json"]).stdout) as {
  schema_version?: number;
  selection_source?: string;
  project_root_fallback?: boolean;
};
parseCliOutput("context", context);
if (
  context.schema_version !== 1 ||
  context.selection_source !== "explicit" ||
  context.project_root_fallback !== false
) {
  throw new Error("Project context did not explain the explicit root used by acceptance.");
}
const recipes = JSON.parse(success(["list", "--json"]).stdout) as unknown[];
parseCliOutput("catalog_list", recipes);
if (recipes.length !== expectedRecipeCount) {
  throw new Error(`Expected ${expectedRecipeCount} recipes, received ${recipes.length}.`);
}
const documentationLocation = success(["show", "review-pull-request", "--location"]).stdout.trim();
if (
  documentationLocation.startsWith("http") ||
  !documentationLocation.endsWith(path.join("docs", "catalog", "review-pull-request.md"))
) {
  throw new Error(`Documentation location output was not local: ${documentationLocation}.`);
}
await access(documentationLocation);
for (const shell of ["bash", "zsh", "fish", "pwsh"]) {
  const completion = success(["completion", shell]).stdout;
  if (!completion.includes("review-pull-request") || !completion.includes("agentic-workflows")) {
    throw new Error(`${shell} completion omitted a workflow or executable alias.`);
  }
  const instructions = success(["completion", shell, "--install-instructions"]).stdout;
  if (
    !instructions.includes("will not edit") ||
    !instructions.includes(`awf completion ${shell}`)
  ) {
    throw new Error(`${shell} completion installation instructions are incomplete.`);
  }
}
const validation = JSON.parse(
  success(["validate", path.resolve("packages/cli/catalog"), "--strict", "--json"]).stdout,
) as { schema_version?: number };
parseCliOutput("validation", validation);
if (validation.schema_version !== 1) throw new Error("Validation output is not versioned.");
const initialization = JSON.parse(
  success(["init", "--agent", "codex", "--target", "managed files", "--json"]).stdout,
) as {
  schema_version?: number;
  project_context?: { source?: string };
  configuration?: { default_agent?: string; default_target?: string };
};
parseCliOutput("init", initialization);
if (
  initialization.schema_version !== 1 ||
  initialization.project_context?.source !== "explicit" ||
  initialization.configuration?.default_agent !== "codex" ||
  initialization.configuration?.default_target !== "managed files"
) {
  throw new Error("Versioned initialization output omitted its selected context or defaults.");
}
await mkdir(path.join(project, "managed files"), { recursive: true });
const installPlan = JSON.parse(
  success(["install", "write-release-notes", "--dry-run", "--show-content", "--json"]).stdout,
) as { plan?: { operation?: string; proposed_files?: Array<{ content?: string }> } };
parseCliOutput("lifecycle_plan", installPlan.plan);
if (
  installPlan.plan?.operation !== "install" ||
  !installPlan.plan.proposed_files?.every((file) => Boolean(file.content))
) {
  throw new Error("Install dry-run omitted its operation or proposed generated content.");
}
const manifest = JSON.parse(success(["install", "write-release-notes", "--json"]).stdout) as {
  files: Array<{ path: string; role: string }>;
};
if (!manifest.files.some((file) => file.role === "policy")) {
  throw new Error("Codex acceptance bundle omitted the invocation policy.");
}
const status = JSON.parse(success(["status", "--json"]).stdout) as {
  installations?: Array<{ id?: string; status?: string }>;
};
parseCliOutput("status", status);
if (
  !status.installations?.some(
    (installation) =>
      installation.id === "write-release-notes" && installation.status === "healthy",
  )
) {
  throw new Error("Installation status did not report the healthy installed workflow.");
}
const filteredStatus = JSON.parse(success(["status", "--failures-only", "--json"]).stdout) as {
  filter?: string;
  summary?: { total?: number; healthy?: number };
  installations?: unknown[];
};
if (
  filteredStatus.filter !== "failures-only" ||
  filteredStatus.summary?.total !== 1 ||
  filteredStatus.summary?.healthy !== 1 ||
  filteredStatus.installations?.length !== 0
) {
  throw new Error("Filtered status output omitted its summary or retained healthy records.");
}
const diagnostics = JSON.parse(success(["doctor", "--failures-only", "--json"]).stdout) as {
  filter?: string;
  summary?: { pass?: number };
  checks?: Array<{
    schema_version?: number;
    status?: string;
    remediation?: unknown;
    data?: unknown;
  }>;
  projectContext?: { source?: string };
  status?: string;
  exit_code?: number;
};
parseCliOutput("doctor", diagnostics);
if (
  diagnostics.filter !== "failures-only" ||
  !diagnostics.summary?.pass ||
  diagnostics.projectContext?.source !== "explicit" ||
  diagnostics.status !== "pass" ||
  diagnostics.exit_code !== 0 ||
  !diagnostics.checks?.every(
    (check) =>
      check.status !== "pass" &&
      check.schema_version === 1 &&
      "remediation" in check &&
      "data" in check,
  )
) {
  throw new Error("Filtered doctor output omitted its summary or retained passing checks.");
}
failure(["status", "review-pull-request", "--json"], "NOT_FOUND");
failure(["install", "write-release-notes", "--json"], "CONFLICT");
const checklist = manifest.files.find((file) => file.role === "checklist");
if (!checklist) throw new Error("Acceptance bundle omitted its checklist.");
const checklistPath = path.join(project, "managed files", checklist.path);
await writeFile(checklistPath, `${await readFile(checklistPath, "utf8")}local edit\n`);
const updatePlan = JSON.parse(
  success(["update", "write-release-notes", "--dry-run", "--json"]).stdout,
) as {
  requiresForce?: boolean;
  changes?: { modifiedManagedFiles?: string[] };
  plan?: { schema_version?: number; operation?: string };
};
if (
  updatePlan.requiresForce !== true ||
  !updatePlan.changes?.modifiedManagedFiles?.includes(checklist.path) ||
  updatePlan.plan?.schema_version !== 1 ||
  updatePlan.plan?.operation !== "update"
) {
  throw new Error("Update dry-run did not report the modified managed file and force requirement.");
}
failure(["update", "write-release-notes", "--json"], "MODIFIED_FILE");
const removePlan = JSON.parse(
  success(["remove", "write-release-notes", "--dry-run", "--json"]).stdout,
) as {
  requiresForce?: boolean;
  changes?: { modifiedManagedFiles?: string[] };
  plan?: { schema_version?: number; operation?: string };
};
if (
  removePlan.requiresForce !== true ||
  !removePlan.changes?.modifiedManagedFiles?.includes(checklist.path) ||
  removePlan.plan?.schema_version !== 1 ||
  removePlan.plan?.operation !== "remove"
) {
  throw new Error("Remove dry-run did not report the modified file and force requirement.");
}
failure(["remove", "write-release-notes", "--json"], "MODIFIED_FILE");
success(["update", "write-release-notes", "--force", "--json"]);
success(["validate", path.join(project, "managed files"), "--strict", "--json"]);
success(["remove", "write-release-notes", "--json"]);
failure(["install", "write-release-notes", "--target", "../outside", "--json"], "INVALID_PATH");
const human = success(["list", "--category", "release"], true);
if (human.stdout.includes("\u001b")) {
  throw new Error("NO_COLOR human output contains terminal escapes.");
}
const autonomous = success(
  ["list", "--category", "maintenance", "--execution-mode", "autonomous"],
  true,
);
if (!autonomous.stdout.includes("resolve-github-issues")) {
  throw new Error("Autonomous catalog filtering omitted resolve-github-issues.");
}
const empty = success(["list", "--category", "does-not-exist"], true);
if (!empty.stdout.includes("No workflows match the selected filters")) {
  throw new Error("Human catalog filtering did not provide an actionable empty state.");
}
const suggestion = failure(["show", "review-pull-reques", "--json"], "MISSING_FILE");
const suggestionPayload = JSON.parse(suggestion.stderr) as {
  details?: { suggestions?: string[] };
};
if (!suggestionPayload.details?.suggestions?.includes("review-pull-request")) {
  throw new Error("Missing workflow diagnostics did not include the nearest workflow ID.");
}
const parserFailure = failure([`--unknown\u001b[2J\rrewritten`]);
if (parserFailure.stderr.includes("\u001b") || parserFailure.stderr.includes("\r")) {
  throw new Error("Commander parser output contains terminal control sequences.");
}
await verifyInterruption("SIGINT", 130, false);
await verifyInterruption("SIGINT", 130, true);
await verifyInterruption("SIGTERM", 143, false);
await verifyInterruption("SIGTERM", 143, true);

process.stdout.write(
  "CLI acceptance passed for guided onboarding, completion, versioned JSON, platform interruption safety, NO_COLOR, spaced paths, and lifecycle safety.\n",
);
cleanup();
process.removeListener("exit", cleanup);
