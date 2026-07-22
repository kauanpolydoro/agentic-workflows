import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { access, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Manifest } from "@kauanpolydoro/agentic-workflows-core";
import { parse, stringify } from "yaml";

interface UpgradeFixture {
  migration_pair: string;
  source_tag: string;
  source_commit: string;
  target_package_version: string;
  manifest: Manifest;
  files: Array<{ path: string; content: string; role: string }>;
}

interface CommandResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

interface ErrorPayload {
  code?: unknown;
  command?: unknown;
  schema_version?: unknown;
}

const repository = path.resolve(import.meta.dirname, "..");
const sourceCommit = "8de51cb34e4494fd0b6478292027a153ea43293b";
const cli = path.join(repository, "packages/cli/dist/index.js");
const fixture = JSON.parse(
  await readFile(
    path.join(
      repository,
      "packages/cli/test-fixtures/v0.2.2-to-v0.3.0-write-release-notes-generic.json",
    ),
    "utf8",
  ),
) as UpgradeFixture;
const currentRecipeMetadata = parse(
  await readFile(path.join(repository, "recipes/write-release-notes/recipe.yml"), "utf8"),
) as { version?: unknown };
if (typeof currentRecipeMetadata.version !== "string") {
  throw new Error("The current write-release-notes recipe does not declare a version.");
}
const currentRecipeVersion = currentRecipeMetadata.version;
const root = await mkdtemp(path.join(os.tmpdir(), "awf v0.2.2 upgrade smoke "));
const cleanup = () => rmSync(root, { recursive: true, force: true });
process.once("exit", cleanup);

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function invoke(project: string, args: readonly string[]): CommandResult {
  const result = spawnSync(process.execPath, [cli, "--project-root", project, ...args], {
    cwd: project,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    shell: false,
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function jsonOutput<T>(project: string, args: readonly string[], expectedStatus: number): T {
  const result = invoke(project, args);
  if (result.status !== expectedStatus || result.stderr !== "") {
    throw new Error(
      `${args.join(" ")} failed with ${String(result.status)}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return JSON.parse(result.stdout) as T;
}

function jsonSuccess<T>(project: string, args: readonly string[]): T {
  return jsonOutput<T>(project, args, 0);
}

function jsonFailure(
  project: string,
  args: readonly string[],
  expectedCommand: string,
  expectedCode: string,
): ErrorPayload {
  const result = invoke(project, args);
  const lines = result.stderr.trimEnd().split(/\r?\n/u);
  if (
    result.status === 0 ||
    result.stdout !== "" ||
    lines.length !== 1 ||
    result.stderr.includes("\u001b")
  ) {
    throw new Error(
      `${args.join(" ")} did not return one sanitized JSON failure.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  const payload = JSON.parse(lines[0] ?? "") as ErrorPayload;
  if (
    payload.schema_version !== 1 ||
    payload.command !== expectedCommand ||
    payload.code !== expectedCode
  ) {
    throw new Error(`Unexpected JSON failure for ${args.join(" ")}: ${result.stderr}`);
  }
  return payload;
}

async function hydrate(name: string): Promise<string> {
  const project = path.join(root, name);
  await mkdir(project, { recursive: true });
  await writeFile(path.join(project, "package.json"), "{}\n");
  const hashes = new Map(fixture.manifest.files.map((file) => [file.path, file.hash]));
  for (const file of fixture.files) {
    const expected = hashes.get(file.path);
    if (expected === undefined || sha256(file.content) !== expected) {
      throw new Error(`Retained v0.2.2 fixture hash mismatch for ${file.path}.`);
    }
    const destination = path.resolve(project, file.path);
    if (!destination.startsWith(`${project}${path.sep}`)) {
      throw new Error(`Unsafe retained fixture path ${file.path}.`);
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.content);
  }
  const manifest = path.join(project, ".agentic-workflows/installations/write-release-notes.yml");
  await mkdir(path.dirname(manifest), { recursive: true });
  await writeFile(manifest, stringify(fixture.manifest));
  return project;
}

async function snapshot(project: string): Promise<string> {
  const members = await Promise.all(
    fixture.files.map(
      async (file) =>
        `${file.path}:${sha256(await readFile(path.join(project, file.path), "utf8"))}`,
    ),
  );
  const manifest = await readFile(
    path.join(project, ".agentic-workflows/installations/write-release-notes.yml"),
    "utf8",
  );
  return JSON.stringify({ members: members.sort(), manifest });
}

if (
  fixture.migration_pair !== "v0.2.2-to-v0.3.0" ||
  fixture.source_tag !== "v0.2.2" ||
  fixture.source_commit !== sourceCommit ||
  fixture.target_package_version !== "0.3.0" ||
  fixture.manifest.cli_version !== "0.2.2"
) {
  throw new Error("Upgrade fixture does not identify the published v0.2.2 source.");
}

const updateProject = await hydrate("update path with spaces");
const status = jsonSuccess<{
  summary?: { healthy?: number; invalid?: number };
  installations?: Array<{ id?: string; recipeVersion?: string; status?: string }>;
}>(updateProject, ["status", "--json"]);
if (
  status.summary?.healthy !== 1 ||
  status.summary.invalid !== 0 ||
  status.installations?.[0]?.id !== "write-release-notes" ||
  status.installations[0].recipeVersion !== fixture.manifest.recipe_version ||
  status.installations[0].status !== "healthy"
) {
  throw new Error(`v0.2.2 installation status is not healthy: ${JSON.stringify(status)}.`);
}

const retainedManifest = jsonSuccess<Manifest>(updateProject, [
  "manifest",
  "write-release-notes",
  "--json",
]);
if (retainedManifest.recipe_version !== fixture.manifest.recipe_version) {
  throw new Error("Manifest inspection did not preserve the v0.2.2 recipe version.");
}

const beforeUpdatePlan = await snapshot(updateProject);
const updatePlan = jsonSuccess<{
  manifest?: { recipe_version?: string };
  plan?: { operation?: string; dry_run?: boolean; requires_force?: boolean };
}>(updateProject, ["update", "write-release-notes", "--dry-run", "--json"]);
if (
  updatePlan.manifest?.recipe_version !== currentRecipeVersion ||
  updatePlan.plan?.operation !== "update" ||
  updatePlan.plan.dry_run !== true ||
  updatePlan.plan.requires_force !== false ||
  (await snapshot(updateProject)) !== beforeUpdatePlan
) {
  throw new Error(`v0.2.2 update plan violated its contract: ${JSON.stringify(updatePlan)}.`);
}

const updated = jsonSuccess<Manifest>(updateProject, ["update", "write-release-notes", "--json"]);
if (
  updated.recipe_version !== currentRecipeVersion ||
  updated.migration?.from_schema_version !== 2 ||
  updated.migration.from_recipe_version !== fixture.manifest.recipe_version ||
  updated.migration.from_adapter.id !== "generic" ||
  updated.migration.from_adapter.version !== fixture.manifest.adapter.version
) {
  throw new Error(`v0.2.2 update did not retain migration provenance: ${JSON.stringify(updated)}.`);
}
const updatedStatus = jsonSuccess<{
  summary?: { healthy?: number };
  installations?: Array<{ recipeVersion?: string; status?: string }>;
}>(updateProject, ["status", "--json"]);
if (
  updatedStatus.summary?.healthy !== 1 ||
  updatedStatus.installations?.[0]?.recipeVersion !== currentRecipeVersion ||
  updatedStatus.installations[0].status !== "healthy"
) {
  throw new Error(`Updated installation is not healthy: ${JSON.stringify(updatedStatus)}.`);
}

const tamperedManifestProject = await hydrate("tampered manifest path");
const tamperedManifest = structuredClone(fixture.manifest);
tamperedManifest.invocation.command = "forged invocation";
await writeFile(
  path.join(tamperedManifestProject, ".agentic-workflows/installations/write-release-notes.yml"),
  stringify(tamperedManifest),
);
const beforeTamperedUpdate = await snapshot(tamperedManifestProject);
jsonFailure(
  tamperedManifestProject,
  ["update", "write-release-notes", "--force", "--json"],
  "update",
  "INVALID_MANIFEST",
);
if ((await snapshot(tamperedManifestProject)) !== beforeTamperedUpdate) {
  throw new Error("A rejected tampered v0.2.2 manifest changed the installation.");
}

const driftProject = await hydrate("managed file drift path");
const checklist = fixture.files.find((file) => file.role === "checklist");
if (!checklist) throw new Error("The retained v0.2.2 fixture has no checklist.");
const checklistPath = path.join(driftProject, checklist.path);
await writeFile(checklistPath, `${await readFile(checklistPath, "utf8")}local edit\n`);
const driftStatus = jsonOutput<{
  summary?: { drifted?: number; invalid?: number };
  installations?: Array<{ status?: string }>;
}>(driftProject, ["status", "--json"], 1);
if (
  driftStatus.summary?.drifted !== 1 ||
  driftStatus.summary.invalid !== 0 ||
  driftStatus.installations?.[0]?.status !== "drifted"
) {
  throw new Error(`Managed v0.2.2 drift was not reported: ${JSON.stringify(driftStatus)}.`);
}
const beforeRejectedDriftUpdate = await snapshot(driftProject);
jsonFailure(driftProject, ["update", "write-release-notes", "--json"], "update", "MODIFIED_FILE");
if ((await snapshot(driftProject)) !== beforeRejectedDriftUpdate) {
  throw new Error("A rejected drifted v0.2.2 update changed the installation.");
}
jsonSuccess<Manifest>(driftProject, ["update", "write-release-notes", "--force", "--json"]);
const recoveredStatus = jsonSuccess<{ summary?: { healthy?: number } }>(driftProject, [
  "status",
  "--json",
]);
if (recoveredStatus.summary?.healthy !== 1) {
  throw new Error(`Forced drift recovery was not healthy: ${JSON.stringify(recoveredStatus)}.`);
}

const removeProject = await hydrate("remove path with spaces");
const beforeRemovePlan = await snapshot(removeProject);
const removePlan = jsonSuccess<{
  plan?: { operation?: string; dry_run?: boolean; requires_force?: boolean };
}>(removeProject, ["remove", "write-release-notes", "--dry-run", "--json"]);
if (
  removePlan.plan?.operation !== "remove" ||
  removePlan.plan.dry_run !== true ||
  removePlan.plan.requires_force !== false ||
  (await snapshot(removeProject)) !== beforeRemovePlan
) {
  throw new Error(`v0.2.2 remove plan violated its contract: ${JSON.stringify(removePlan)}.`);
}
const removed = jsonSuccess<Manifest>(removeProject, ["remove", "write-release-notes", "--json"]);
if (removed.recipe_version !== fixture.manifest.recipe_version) {
  throw new Error("Removal did not return the retained v0.2.2 manifest.");
}
for (const file of fixture.files) {
  await access(path.join(removeProject, file.path)).then(
    () => {
      throw new Error(`Removal retained managed file ${file.path}.`);
    },
    (error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    },
  );
}
await access(
  path.join(removeProject, ".agentic-workflows/installations/write-release-notes.yml"),
).then(
  () => {
    throw new Error("Removal retained the v0.2.2 installation manifest.");
  },
  (error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  },
);

console.log(
  "v0.2.2 upgrade smoke passed for status, manifest, exact migration, drift recovery, tamper rejection, and direct removal.",
);
