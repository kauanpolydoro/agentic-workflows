import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

interface Result {
  status: number | null;
  stdout: string;
  stderr: string;
}

const cli = path.resolve("packages/cli/dist/index.js");
const project = await mkdtemp(path.join(os.tmpdir(), "awf acceptance path with spaces "));
await writeFile(path.join(project, "package.json"), "{}\n");

function invoke(args: string[], noColor = false): Result {
  const result = spawnSync(process.execPath, [cli, ...args], {
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
    const payload = JSON.parse(result.stderr) as { code?: string };
    if (payload.code !== code) {
      throw new Error(`Expected ${code}, received ${payload.code ?? "no error code"}.`);
    }
  }
  return result;
}

const firstRun = success([]);
if (
  !firstRun.stdout.includes("Usage: awf [options] [command]") ||
  !firstRun.stdout.includes("awf init --agent codex") ||
  firstRun.stderr !== ""
) {
  throw new Error("Empty invocation did not return clean, actionable first-run help.");
}
const recipes = JSON.parse(success(["list", "--json"]).stdout) as unknown[];
if (recipes.length !== 20) throw new Error(`Expected 20 recipes, received ${recipes.length}.`);
success(["validate", path.resolve("packages/cli/catalog"), "--strict", "--json"]);
success(["init", "--agent", "codex", "--target", "managed files"]);
await import("node:fs/promises").then(({ mkdir }) =>
  mkdir(path.join(project, "managed files"), { recursive: true }),
);
const manifest = JSON.parse(success(["install", "write-release-notes", "--json"]).stdout) as {
  files: Array<{ path: string; role: string }>;
};
if (!manifest.files.some((file) => file.role === "policy")) {
  throw new Error("Codex acceptance bundle omitted the invocation policy.");
}
failure(["install", "write-release-notes", "--json"], "CONFLICT");
const checklist = manifest.files.find((file) => file.role === "checklist");
if (!checklist) throw new Error("Acceptance bundle omitted its checklist.");
const checklistPath = path.join(project, "managed files", checklist.path);
await writeFile(checklistPath, `${await readFile(checklistPath, "utf8")}local edit\n`);
const updatePlan = JSON.parse(
  success(["update", "write-release-notes", "--dry-run", "--json"]).stdout,
) as { requiresForce?: boolean; changes?: { modifiedManagedFiles?: string[] } };
if (
  updatePlan.requiresForce !== true ||
  !updatePlan.changes?.modifiedManagedFiles?.includes(checklist.path)
) {
  throw new Error("Update dry-run did not report the modified managed file and force requirement.");
}
failure(["update", "write-release-notes", "--json"], "MODIFIED_FILE");
failure(["remove", "write-release-notes", "--json"], "MODIFIED_FILE");
success(["update", "write-release-notes", "--force", "--json"]);
success(["validate", path.join(project, "managed files"), "--strict", "--json"]);
success(["remove", "write-release-notes", "--json"]);
failure(["install", "write-release-notes", "--target", "../outside", "--json"], "INVALID_PATH");
const human = success(["list", "--category", "release"], true);
if (human.stdout.includes("\u001b")) {
  throw new Error("NO_COLOR human output contains terminal escapes.");
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

process.stdout.write(
  "CLI acceptance passed for onboarding, JSON, NO_COLOR, spaced paths, and lifecycle safety.\n",
);
