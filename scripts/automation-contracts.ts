import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

interface CommandResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

interface ErrorPayload {
  schema_version?: unknown;
  error?: unknown;
  message?: unknown;
  code?: unknown;
  command?: unknown;
  retryable?: unknown;
  help_url?: unknown;
  remediation?: unknown;
}

const cli = path.resolve("packages/cli/dist/index.js");
const project = await mkdtemp(path.join(os.tmpdir(), "awf automation path with spaces "));
const cleanup = () => rmSync(project, { recursive: true, force: true });
process.once("exit", cleanup);
await writeFile(path.join(project, "package.json"), "{}\n");

function invoke(
  args: readonly string[],
  environment: Readonly<Record<string, string>> = {},
): CommandResult {
  const result = spawnSync(process.execPath, [cli, "--project-root", project, ...args], {
    cwd: project,
    encoding: "utf8",
    env: { ...process.env, ...environment },
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function commandFailure(args: readonly string[], result: CommandResult): Error {
  return new Error(
    `Command ${args.join(" ")} returned ${String(result.status)}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
}

function success(args: readonly string[]): CommandResult {
  const result = invoke(args);
  if (result.status !== 0 || result.stderr !== "") throw commandFailure(args, result);
  return result;
}

function jsonSuccess<T>(args: readonly string[]): T {
  const result = success(args);
  try {
    return JSON.parse(result.stdout) as T;
  } catch {
    throw new Error(`Command ${args.join(" ")} did not write one valid JSON value to stdout.`);
  }
}

function jsonFailure(
  args: readonly string[],
  expectedCommand: string,
  expectedCode?: string,
  environment: Readonly<Record<string, string>> = {},
): ErrorPayload {
  const result = invoke(args, environment);
  if (result.status === 0 || result.stdout !== "") throw commandFailure(args, result);
  const lines = result.stderr.trimEnd().split(/\r?\n/);
  if (lines.length !== 1 || result.stderr.includes("\u001b") || result.stderr.includes("\r")) {
    throw new Error(`Command ${args.join(" ")} did not write one sanitized JSON error line.`);
  }
  let payload: ErrorPayload;
  try {
    payload = JSON.parse(lines[0] ?? "") as ErrorPayload;
  } catch {
    throw new Error(`Command ${args.join(" ")} did not write a valid JSON error object.`);
  }
  if (
    payload.schema_version !== 1 ||
    typeof payload.error !== "string" ||
    typeof payload.message !== "string" ||
    typeof payload.code !== "string" ||
    payload.command !== expectedCommand ||
    typeof payload.retryable !== "boolean" ||
    typeof payload.help_url !== "string" ||
    !payload.help_url.startsWith("https://") ||
    typeof payload.remediation !== "string" ||
    payload.remediation.length === 0
  ) {
    throw new Error(
      `Command ${args.join(" ")} returned an incomplete error contract: ${JSON.stringify(payload)}.`,
    );
  }
  if (expectedCode !== undefined && payload.code !== expectedCode) {
    throw new Error(
      `Command ${args.join(" ")} returned ${String(payload.code)} instead of ${expectedCode}.`,
    );
  }
  return payload;
}

const catalog = jsonSuccess<unknown[]>(["list", "--json"]);
if (!Array.isArray(catalog) || catalog.length === 0) {
  throw new Error("Catalog automation did not receive any workflow records.");
}

const recipe = jsonSuccess<{ id?: string }>(["show", "write-release-notes", "--json"]);
if (recipe.id !== "write-release-notes") {
  throw new Error("Show automation did not receive the selected workflow.");
}

for (const shell of ["bash", "zsh", "fish", "pwsh"]) {
  const instructions = success(["completion", shell, "--install-instructions"]);
  if (!instructions.stdout.includes(`awf completion ${shell}`)) {
    throw new Error(`${shell} completion installation instructions are incomplete.`);
  }
}

const initialized = jsonSuccess<{
  schema_version?: number;
  project_context?: { source?: string };
  configuration?: { default_agent?: string; default_target?: string };
}>(["init", "--agent", "codex", "--target", "managed", "--json"]);
if (
  initialized.schema_version !== 1 ||
  initialized.project_context?.source !== "explicit" ||
  initialized.configuration?.default_agent !== "codex" ||
  initialized.configuration?.default_target !== "managed"
) {
  throw new Error("Deterministic initialization did not return its versioned configuration.");
}

const installPlan = jsonSuccess<{ plan?: { schema_version?: number; operation?: string } }>([
  "install",
  "write-release-notes",
  "--dry-run",
  "--json",
]);
if (installPlan.plan?.schema_version !== 1 || installPlan.plan.operation !== "install") {
  throw new Error("Install automation did not receive a versioned lifecycle plan.");
}

jsonSuccess(["install", "write-release-notes", "--json"]);

const status = jsonSuccess<{
  filter?: string;
  summary?: { total?: number; healthy?: number };
  installations?: unknown[];
}>(["status", "--failures-only", "--json"]);
if (
  status.filter !== "failures-only" ||
  status.summary?.total !== 1 ||
  status.summary?.healthy !== 1 ||
  status.installations?.length !== 0
) {
  throw new Error("Filtered status automation lost full health summary information.");
}

const lifecycleLock = path.join(project, "managed", ".agentic-workflows", "lifecycle.lock");
await writeFile(
  lifecycleLock,
  '{"schema_version":1,"pid":4242,"acquired_at":"2026-07-20T12:00:00.000Z","token":"automation-secret"}\n',
);
const lockedDiagnosticResult = invoke(["doctor", "--json"]);
if (
  lockedDiagnosticResult.status !== 1 ||
  lockedDiagnosticResult.stderr !== "" ||
  lockedDiagnosticResult.stdout.includes("automation-secret")
) {
  throw commandFailure(["doctor", "--json"], lockedDiagnosticResult);
}
const lockedDiagnostic = JSON.parse(lockedDiagnosticResult.stdout) as {
  checks?: Array<{
    check?: string;
    remediation?: string;
    data?: { recordValid?: boolean; owner?: { pid?: number } };
  }>;
};
const lockCheck = lockedDiagnostic.checks?.find((check) => check.check === "lifecycle-lock");
if (
  lockCheck?.data?.recordValid !== true ||
  lockCheck.data.owner?.pid !== 4242 ||
  !lockCheck.remediation?.includes("manually removing")
) {
  throw new Error("Lifecycle-lock diagnostics omitted sanitized owner recovery metadata.");
}
rmSync(lifecycleLock);

const validation = jsonSuccess<{ schema_version?: number; valid?: boolean }>([
  "validate",
  "managed",
  "--strict",
  "--json",
]);
if (validation.schema_version !== 1 || validation.valid !== true) {
  throw new Error("Validation automation did not receive a successful versioned report.");
}

const diagnostics = jsonSuccess<{
  schema_version?: number;
  filter?: string;
  summary?: { pass?: number };
  projectContext?: { source?: string; reason?: string };
}>(["doctor", "--failures-only", "--json"]);
if (
  diagnostics.schema_version !== 1 ||
  diagnostics.filter !== "failures-only" ||
  !diagnostics.summary?.pass ||
  diagnostics.projectContext?.source !== "explicit" ||
  !diagnostics.projectContext?.reason?.includes("--project-root")
) {
  throw new Error("Diagnostic automation did not receive its filtered versioned summary.");
}

jsonSuccess(["manifest", "write-release-notes", "--json"]);
jsonSuccess(["update", "write-release-notes", "--dry-run", "--json"]);
jsonSuccess(["remove", "write-release-notes", "--dry-run", "--json"]);

jsonFailure(["show", "review-pull-reques", "--json"], "show", "MISSING_FILE");
jsonFailure(["status", "review-pull-request", "--json"], "status", "NOT_FOUND");
jsonFailure(["install", "write-release-notes", "--json"], "install", "CONFLICT");
jsonFailure(
  ["install", "write-release-notes", "--target", "../outside", "--json"],
  "install",
  "INVALID_PATH",
);
jsonFailure(["install", "--json"], "install", "commander.missingArgument");

const invalidCatalog = path.join(project, "invalid-catalog.json");
await writeFile(invalidCatalog, "not JSON\n");
jsonFailure(["list", "--json"], "list", undefined, {
  AWF_GENERATED_CATALOG_PATH: invalidCatalog,
});

jsonSuccess(["remove", "write-release-notes", "--json"]);

process.stdout.write(
  "CLI automation contracts passed for success, failure, lifecycle, status, validation, diagnostics, and malformed inputs.\n",
);
cleanup();
process.removeListener("exit", cleanup);
