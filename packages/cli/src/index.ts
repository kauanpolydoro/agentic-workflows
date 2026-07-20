#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { constants, realpathSync, type Dirent, type Stats } from "node:fs";
import { access, link, lstat, mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import {
  type AgentId,
  AwfError,
  adapterRegistry,
  agentIds,
  assertNoSymlink,
  deriveAdapterSupport,
  type GeneratedCatalogRecipe,
  generatedCatalogRecipeSchema,
  hashContent,
  hashNamedContent,
  loadCatalog,
  loadRecipe,
  loadRecipeSource,
  type RecipeCompatibilityStatus,
  readBoundedRegularFile,
  recipeCompatibilityStatuses,
  recipeSourceFiles,
  type SupportStatus,
  sanitizeTerminal,
  supportStatuses,
  type VerificationEvidence,
  validateCatalogContent,
  validateRecipeContent,
  verificationEvidenceSchema,
  verificationStatuses,
} from "@kauanpolydoro/agentic-workflows-core";
import { Argument, Command, CommanderError, Option } from "commander";
import { parse, stringify } from "yaml";
import { completionShells, renderCompletion, type CompletionShell } from "./completion.js";
import { catalogRoot, findProjectRoot, generatedCatalogPath } from "./context.js";
import {
  installRecipe,
  planInstallRecipe,
  planRemoveRecipe,
  planUpdateRecipe,
  readManifest,
  removeRecipe,
  updateRecipe,
  validateInstallation,
} from "./install.js";
import { fail, output } from "./io.js";
import { documentationOpenCommand } from "./platform.js";
import { inspectInstallations, type InstallationStatus } from "./status.js";
import { CLI_VERSION } from "./version.js";

interface ProjectConfig {
  schema_version: 1;
  default_agent: AgentId;
  default_target: string;
}

type VerificationStage = "installation" | "execution" | "outcome";
type VerificationStatus =
  GeneratedCatalogRecipe["agents"][AgentId]["verification"][VerificationStage]["status"];

interface CatalogListFilters {
  category?: string;
  agent?: AgentId;
  tag?: string;
  support?: SupportStatus;
  compatibility?: RecipeCompatibilityStatus;
  installation?: VerificationStatus;
  execution?: VerificationStatus;
  outcome?: VerificationStatus;
}

const defaultConfig: ProjectConfig = {
  schema_version: 1,
  default_agent: "generic",
  default_target: ".",
};
const MAX_CONFIG_BYTES = 64 * 1024;
const MAX_GENERATED_CATALOG_BYTES = 16 * 1024 * 1024;
const MAX_SITE_CONFIG_BYTES = 1024 * 1024;
const MAX_VERIFICATION_EVIDENCE_BYTES = 1024 * 1024;
const MAX_VERIFICATION_ARTIFACT_BYTES = 4 * 1024 * 1024;
const MAX_COMMITTED_RECIPE_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ARTIFACT_MANIFEST_BYTES = 1024 * 1024;
const MAX_GENERATED_ARTIFACT_BYTES = 32 * 1024 * 1024;
const generatedStructuralChecks = [
  "schema",
  "required-files",
  "content",
  "evidence-ids",
  "relative-links",
  "output-contract",
] as const;

interface ProgramOptions {
  signal?: AbortSignal;
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function inspectOptionalPath(candidate: string, scope: string): Promise<Stats | null> {
  try {
    return await lstat(candidate);
  } catch (error) {
    if (errorCode(error) === "ENOENT") return null;
    throw new AwfError("INVALID_PATH", `Cannot safely inspect ${scope}.`, {
      path: candidate,
      causeCode: errorCode(error),
    });
  }
}

async function inspectRequiredPath(candidate: string, scope: string): Promise<Stats> {
  const information = await inspectOptionalPath(candidate, scope);
  if (!information) {
    throw new AwfError("MISSING_FILE", `Cannot find ${scope}.`, { path: candidate });
  }
  return information;
}

function assertRealDirectory(information: Stats, candidate: string, scope: string): void {
  if (information.isSymbolicLink() || !information.isDirectory()) {
    throw new AwfError("INVALID_PATH", `${scope} must be a real directory.`, {
      path: candidate,
    });
  }
}

function assertRegularFile(information: Stats, candidate: string, scope: string): void {
  if (information.isSymbolicLink() || !information.isFile()) {
    throw new AwfError("INVALID_PATH", `${scope} must be a regular file without symbolic links.`, {
      path: candidate,
    });
  }
}

async function hasRegularFile(candidate: string, scope: string): Promise<boolean> {
  const information = await inspectOptionalPath(candidate, scope);
  if (!information) return false;
  assertRegularFile(information, candidate, scope);
  return true;
}

async function readDirectoryEntries(directory: string, scope: string): Promise<Dirent[]> {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch (error) {
    throw new AwfError("INVALID_PATH", `Cannot safely enumerate ${scope}.`, {
      path: directory,
      causeCode: errorCode(error),
    });
  }
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) return;
  if (signal.reason !== undefined) throw signal.reason;
  const error = new Error("The operation was interrupted.");
  error.name = "AbortError";
  throw error;
}

function isAgentId(value: unknown): value is AgentId {
  return typeof value === "string" && agentIds.some((id) => id === value);
}

function safeRelativeTarget(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) return false;
  if (path.isAbsolute(value)) return false;
  const normalized = path.normalize(value);
  return normalized !== ".." && !normalized.startsWith(`..${path.sep}`);
}

async function loadConfig(root: string): Promise<ProjectConfig> {
  const file = path.join(root, ".agentic-workflows", "config.yml");
  try {
    const raw = parse(
      (await readBoundedRegularFile(file, MAX_CONFIG_BYTES, root)).toString("utf8"),
      {
        maxAliasCount: 0,
        uniqueKeys: true,
      },
    ) as Record<string, unknown>;
    const keys = Object.keys(raw).sort();
    if (
      raw.schema_version !== 1 ||
      !isAgentId(raw.default_agent) ||
      !safeRelativeTarget(raw.default_target) ||
      keys.some((key) => !["default_agent", "default_target", "schema_version"].includes(key))
    ) {
      throw new AwfError("INVALID_RECIPE", "The local AWF configuration is invalid.");
    }
    return {
      schema_version: 1,
      default_agent: raw.default_agent,
      default_target: raw.default_target,
    };
  } catch (error) {
    if (
      error instanceof AwfError &&
      error.code === "MISSING_FILE" &&
      error.details.causeCode === "ENOENT"
    ) {
      return defaultConfig;
    }
    if (error instanceof AwfError) throw error;
    throw new AwfError("INVALID_RECIPE", "The local AWF configuration cannot be parsed.");
  }
}

async function safeTarget(root: string, candidate: string): Promise<string> {
  const target = path.resolve(root, candidate);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new AwfError("INVALID_PATH", "Target must stay inside the project root.");
  }
  await assertNoSymlink(root, target);
  return target;
}

function recipePath(id: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new AwfError("INVALID_RECIPE", "Workflow ID must use lowercase kebab-case.");
  }
  return path.join(catalogRoot(), id);
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution =
        (previous[rightIndex - 1] ?? 0) + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(
        (current[rightIndex - 1] ?? 0) + 1,
        (previous[rightIndex] ?? 0) + 1,
        substitution,
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length] ?? right.length;
}

async function resolveWorkflowPath(id: string): Promise<string> {
  const candidate = recipePath(id);
  const information = await inspectOptionalPath(candidate, "the workflow directory");
  if (information) {
    assertRealDirectory(information, candidate, "The workflow directory");
    return candidate;
  }

  let suggestions: string[] = [];
  try {
    const maximumDistance = Math.max(2, Math.floor(id.length / 3));
    suggestions = (await loadGeneratedCatalog())
      .map((recipe) => ({ id: recipe.id, distance: editDistance(id, recipe.id) }))
      .filter(({ distance }) => distance <= maximumDistance)
      .sort((left, right) => left.distance - right.distance || left.id.localeCompare(right.id))
      .slice(0, 3)
      .map(({ id: suggestion }) => suggestion);
  } catch {
    // The source-catalog error remains primary when generated metadata is unavailable too.
  }

  throw new AwfError(
    "MISSING_FILE",
    suggestions.length > 0
      ? `Workflow ${JSON.stringify(id)} was not found. Did you mean ${suggestions
          .map((suggestion) => JSON.stringify(suggestion))
          .join(", ")}?`
      : `Workflow ${JSON.stringify(id)} was not found.`,
    {
      workflowId: id,
      suggestions,
      remediation: "Run `awf list` to browse available workflow IDs.",
    },
  );
}

async function commandExists(command: string): Promise<boolean> {
  const extensions = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const directory of (process.env.PATH ?? "").split(path.delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, `${command}${extension}`);
      try {
        await access(candidate, constants.X_OK);
        if ((await stat(candidate)).isFile()) return true;
      } catch (error) {
        if (["EACCES", "ENOENT", "ENOTDIR"].includes(errorCode(error) ?? "")) continue;
        throw new AwfError("INVALID_PATH", `Cannot inspect the ${command} PATH candidate.`, {
          path: candidate,
          causeCode: errorCode(error),
        });
      }
    }
  }
  return false;
}

async function openDocumentation(
  id: string,
  signal?: AbortSignal,
): Promise<{ target: string; opened: boolean }> {
  throwIfAborted(signal);
  const localDocumentation = path.resolve(catalogRoot(), "..", "docs", "catalog", `${id}.md`);
  const documentation = (await hasRegularFile(localDocumentation, "the local documentation page"))
    ? localDocumentation
    : `https://kauanpolydoro.github.io/agentic-workflows/catalog/${id}`;
  const { command, args } = documentationOpenCommand(documentation);
  const opened = await new Promise<boolean>((resolve, reject) => {
    const child = spawn(command, args, { signal, stdio: "ignore" });
    child.once("error", (error) => {
      if (signal?.aborted) reject(signal.reason ?? error);
      else resolve(false);
    });
    child.once("close", (code, closeSignal) => {
      resolve(code === 0 && closeSignal === null);
    });
  });
  throwIfAborted(signal);
  return { target: documentation, opened };
}

async function replaceConfiguration(destination: string, temporary: string): Promise<void> {
  if (
    process.platform !== "win32" ||
    !(await hasRegularFile(destination, "the existing project configuration"))
  ) {
    await rename(temporary, destination);
    return;
  }
  const backup = `${destination}.${randomUUID()}.backup`;
  await rename(destination, backup);
  try {
    await rename(temporary, destination);
  } catch (error) {
    try {
      await rename(backup, destination);
    } catch (rollbackError) {
      throw new AwfError(
        "CONFLICT",
        "Configuration replacement failed and rollback was incomplete.",
        {
          cause: (error as Error).message,
          rollbackError: (rollbackError as Error).message,
        },
      );
    }
    throw error;
  }
  await rm(backup, { force: true });
}

async function loadGeneratedCatalogFile(
  file = generatedCatalogPath(),
): Promise<GeneratedCatalogRecipe[]> {
  let raw: unknown;
  try {
    raw = JSON.parse(
      (await readBoundedRegularFile(file, MAX_GENERATED_CATALOG_BYTES)).toString("utf8"),
    );
  } catch (error) {
    if (error instanceof AwfError) throw error;
    throw new AwfError("MISSING_FILE", "The generated catalog is missing or invalid.", {
      path: file,
      cause: (error as Error).message,
    });
  }
  const parsed = generatedCatalogRecipeSchema.array().safeParse(raw);
  if (!parsed.success) {
    throw new AwfError("INVALID_RECIPE", "The generated catalog does not match its schema.", {
      issues: parsed.error.issues,
    });
  }
  const counts = new Map<string, number>();
  for (const recipe of parsed.data) counts.set(recipe.id, (counts.get(recipe.id) ?? 0) + 1);
  const duplicateIds = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .sort();
  if (duplicateIds.length > 0) {
    throw new AwfError("INVALID_RECIPE", "The generated catalog contains duplicate recipe IDs.", {
      issues: duplicateIds.map((id) => ({
        code: "DUPLICATE_GENERATED_RECIPE_ID",
        path: `${file}#${id}`,
        severity: "error",
        remediation: `Keep exactly one generated record for ${id}.`,
      })),
    });
  }
  return parsed.data;
}

async function loadGeneratedCatalog(): Promise<GeneratedCatalogRecipe[]> {
  return loadGeneratedCatalogFile();
}

interface LocalVerificationEvidence {
  record: VerificationEvidence;
  relativePath: string;
  current: boolean;
  superseded: boolean;
}

type GeneratedAgentVerification = GeneratedCatalogRecipe["agents"][AgentId]["verification"];

function resolveLocalEvidenceSupersession(
  records: readonly LocalVerificationEvidence[],
): LocalVerificationEvidence[] {
  const byId = new Map<string, LocalVerificationEvidence>();
  for (const item of records) {
    if (byId.has(item.record.id)) {
      throw new AwfError(
        "INVALID_RECIPE",
        `Duplicate verification evidence ID: ${item.record.id}.`,
      );
    }
    byId.set(item.record.id, item);
  }
  for (const item of records) {
    const supersedes = item.record.supersedes;
    if (!supersedes) continue;
    const target = byId.get(supersedes);
    if (!target) {
      throw new AwfError(
        "INVALID_RECIPE",
        `${item.relativePath} supersedes unknown evidence record ${supersedes}.`,
      );
    }
    if (target.record.recipe !== item.record.recipe || target.record.agent !== item.record.agent) {
      throw new AwfError(
        "INVALID_RECIPE",
        `${item.relativePath} can supersede evidence only for the same recipe and agent.`,
      );
    }
  }
  for (const item of records) {
    const seen = new Set<string>();
    let cursor: LocalVerificationEvidence | undefined = item;
    while (cursor?.record.supersedes) {
      if (seen.has(cursor.record.id)) {
        throw new AwfError(
          "INVALID_RECIPE",
          `Verification evidence supersession cycle includes ${cursor.record.id}.`,
        );
      }
      seen.add(cursor.record.id);
      cursor = byId.get(cursor.record.supersedes);
    }
  }
  const supersededByCurrent = new Set(
    records
      .filter((item) => item.current && item.record.supersedes)
      .map((item) => item.record.supersedes as string),
  );
  const resolved = records.map((item) => ({
    ...item,
    superseded: item.current && supersededByCurrent.has(item.record.id),
  }));
  const activeFingerprints = new Map<string, string>();
  for (const item of resolved.filter((candidate) => candidate.current && !candidate.superseded)) {
    const fingerprint = [
      item.record.recipe,
      item.record.agent,
      item.record.installation.status,
      item.record.execution.status,
      item.record.outcome.status,
    ].join(":");
    const duplicate = activeFingerprints.get(fingerprint);
    if (duplicate) {
      throw new AwfError(
        "INVALID_RECIPE",
        `${item.relativePath} duplicates active verification claims from ${duplicate}; use supersedes to establish precedence.`,
      );
    }
    activeFingerprints.set(fingerprint, item.relativePath);
  }
  return resolved;
}

function aggregateLocalVerification(
  records: readonly LocalVerificationEvidence[],
  stage: VerificationStage,
  fallback: VerificationStatus,
): GeneratedAgentVerification[VerificationStage] {
  const current = records.filter((item) => item.current && !item.superseded);
  const statuses = current.map((item) => item.record[stage].status);
  const status = statuses.includes("failing")
    ? "failing"
    : statuses.includes("passing")
      ? "passing"
      : statuses.length > 0 && statuses.every((value) => value === "not-applicable")
        ? "not-applicable"
        : fallback;
  return {
    status,
    evidence: current
      .filter((item) => item.record[stage].status === status)
      .map((item) => item.relativePath)
      .sort(),
    stale_records: records.filter((item) => !item.current).length,
  };
}

function assertVerificationEvidenceSource(
  repository: string,
  relativePath: string,
  record: VerificationEvidence,
): void {
  const revision = record.source.repository_revision;
  const available = spawnSync("git", ["cat-file", "-e", `${revision}^{commit}`], {
    cwd: repository,
    stdio: "ignore",
    shell: false,
  });
  if (available.error || available.status !== 0) {
    throw new AwfError(
      "INVALID_RECIPE",
      `${relativePath} references an unavailable source revision.`,
      {
        path: relativePath,
        revision,
        ...(available.error ? { cause: available.error.message } : {}),
      },
    );
  }

  const reachable = spawnSync("git", ["merge-base", "--is-ancestor", revision, "HEAD"], {
    cwd: repository,
    stdio: "ignore",
    shell: false,
  });
  if (reachable.error || reachable.status !== 0) {
    throw new AwfError(
      "INVALID_RECIPE",
      `${relativePath} references a source revision outside the current history.`,
      {
        path: relativePath,
        revision,
        ...(reachable.error ? { cause: reachable.error.message } : {}),
      },
    );
  }

  const committedBundle = Object.fromEntries(
    recipeSourceFiles.map((file) => {
      const object = `recipes/${record.recipe}/${file}`;
      const content = spawnSync("git", ["show", `${revision}:${object}`], {
        cwd: repository,
        encoding: "utf8",
        shell: false,
        maxBuffer: MAX_COMMITTED_RECIPE_FILE_BYTES,
      });
      if (content.error || content.status !== 0 || typeof content.stdout !== "string") {
        throw new AwfError(
          "INVALID_RECIPE",
          `${relativePath} cites a revision that does not provide a readable ${object}.`,
          {
            path: relativePath,
            revision,
            object,
            ...(content.error ? { cause: content.error.message } : {}),
          },
        );
      }
      return [file, content.stdout] as const;
    }),
  );
  if (hashNamedContent(committedBundle) !== record.recipe_content_sha256) {
    throw new AwfError(
      "INVALID_RECIPE",
      `${relativePath} does not match recipe content at its cited commit.`,
      {
        path: relativePath,
        revision,
        recipe: record.recipe,
      },
    );
  }
}

async function loadLocalVerificationEvidence(
  repository: string,
  recipeHashes: ReadonlyMap<string, string>,
  recipeVersions: ReadonlyMap<string, string>,
): Promise<LocalVerificationEvidence[]> {
  const verificationDirectory = path.join(repository, "verification");
  assertRealDirectory(
    await inspectRequiredPath(verificationDirectory, "the verification evidence directory"),
    verificationDirectory,
    "The verification evidence directory",
  );
  const loaded: LocalVerificationEvidence[] = [];
  for (const entry of await readDirectoryEntries(
    verificationDirectory,
    "the verification evidence directory",
  )) {
    const entryPath = path.join(verificationDirectory, entry.name);
    const entryInformation = await inspectRequiredPath(entryPath, "a verification entry");
    if (entryInformation.isSymbolicLink()) {
      throw new AwfError("INVALID_PATH", "Verification entries must not be symbolic links.", {
        path: entryPath,
      });
    }
    if (!entryInformation.isDirectory()) continue;
    for (const file of await readDirectoryEntries(entryPath, "a verification evidence group")) {
      const candidate = path.join(entryPath, file.name);
      const information = await inspectRequiredPath(candidate, "a verification evidence file");
      if (information.isSymbolicLink()) {
        throw new AwfError("INVALID_PATH", "Verification files must not be symbolic links.", {
          path: candidate,
        });
      }
      if (!information.isFile() || !file.name.endsWith(".yml")) continue;
      if (loaded.length >= 2048) {
        throw new AwfError("INVALID_RECIPE", "Verification evidence exceeds 2048 records.");
      }
      let raw: unknown;
      try {
        raw = parse(
          (
            await readBoundedRegularFile(
              candidate,
              MAX_VERIFICATION_EVIDENCE_BYTES,
              verificationDirectory,
            )
          ).toString("utf8"),
          { maxAliasCount: 0, uniqueKeys: true },
        );
      } catch (error) {
        if (error instanceof AwfError) throw error;
        throw new AwfError("INVALID_RECIPE", `Cannot parse verification evidence ${candidate}.`, {
          cause: errorMessage(error),
        });
      }
      const parsed = verificationEvidenceSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AwfError("INVALID_RECIPE", `Verification evidence is invalid: ${candidate}.`, {
          issues: parsed.error.issues,
        });
      }
      const relativePath = path.relative(repository, candidate).split(path.sep).join("/");
      const recipeHash = recipeHashes.get(parsed.data.recipe);
      const recipeVersion = recipeVersions.get(parsed.data.recipe);
      if (!recipeHash || !recipeVersion) {
        throw new AwfError(
          "INVALID_RECIPE",
          `${candidate} references unknown recipe ${parsed.data.recipe}.`,
        );
      }
      assertVerificationEvidenceSource(repository, relativePath, parsed.data);
      for (const artifact of Object.values(parsed.data.evidence)) {
        if (!artifact) continue;
        if (!artifact.path.startsWith("verification/")) {
          throw new AwfError(
            "INVALID_PATH",
            `Verification artifact must stay inside the verification tree: ${artifact.path}.`,
          );
        }
        const artifactFile = path.resolve(repository, artifact.path);
        if (!artifactFile.startsWith(`${verificationDirectory}${path.sep}`)) {
          throw new AwfError(
            "INVALID_PATH",
            `Verification artifact escapes the verification tree: ${artifact.path}.`,
          );
        }
        const content = await readBoundedRegularFile(
          artifactFile,
          MAX_VERIFICATION_ARTIFACT_BYTES,
          verificationDirectory,
        );
        if (hashContent(content) !== artifact.sha256) {
          throw new AwfError(
            "INVALID_RECIPE",
            `Verification artifact does not match its retained hash: ${artifact.path}.`,
          );
        }
      }
      loaded.push({
        record: parsed.data,
        relativePath,
        current:
          parsed.data.recipe_version === recipeVersion &&
          parsed.data.adapter_version === adapterRegistry[parsed.data.agent].version &&
          parsed.data.recipe_content_sha256 === recipeHash,
        superseded: false,
      });
    }
  }
  return resolveLocalEvidenceSupersession(loaded);
}

async function expectedAgentVerification(
  repository: string,
  recipeHashes: ReadonlyMap<string, string>,
  recipeVersions: ReadonlyMap<string, string>,
): Promise<ReadonlyMap<string, Readonly<Record<AgentId, GeneratedAgentVerification>>>> {
  const evidence = await loadLocalVerificationEvidence(repository, recipeHashes, recipeVersions);
  return new Map(
    [...recipeHashes.keys()].map((recipe) => [
      recipe,
      Object.fromEntries(
        agentIds.map((agent) => {
          const relevant = evidence.filter(
            (item) => item.record.recipe === recipe && item.record.agent === agent,
          );
          const executionFallback =
            adapterRegistry[agent].executionTestStatus === "not-applicable"
              ? "not-applicable"
              : "untested";
          const outcomeFallback =
            adapterRegistry[agent].outcomeReviewStatus === "not-applicable"
              ? "not-applicable"
              : "untested";
          return [
            agent,
            {
              installation: aggregateLocalVerification(relevant, "installation", "untested"),
              execution: aggregateLocalVerification(relevant, "execution", executionFallback),
              outcome: aggregateLocalVerification(relevant, "outcome", outcomeFallback),
            },
          ];
        }),
      ) as Record<AgentId, GeneratedAgentVerification>,
    ]),
  );
}

interface GeneratedArtifactManifest {
  schema_version: 1;
  recipe_source_sha256: string;
  artifacts: Array<{ path: string; sha256: string }>;
}

function expectedGeneratedArtifactPaths(recipeIds: readonly string[]): string[] {
  return [
    ...recipeIds.map((id) => `docs/catalog/${id}.md`),
    "docs/catalog/index.md",
    "docs/compatibility.md",
    "generated/catalog.d.ts",
    "generated/catalog.json",
    "generated/catalog.schema.json",
    "generated/recipe.schema.json",
    "generated/verification.schema.json",
    "verification/schema.json",
  ].sort();
}

function parseGeneratedArtifactManifest(raw: unknown, file: string): GeneratedArtifactManifest {
  const record =
    typeof raw === "object" && raw !== null && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : null;
  const artifacts = Array.isArray(record?.artifacts) ? record.artifacts : null;
  const validTopLevel =
    record !== null &&
    Object.keys(record).sort().join(",") === "artifacts,recipe_source_sha256,schema_version" &&
    record.schema_version === 1 &&
    typeof record.recipe_source_sha256 === "string" &&
    /^[a-f0-9]{64}$/.test(record.recipe_source_sha256) &&
    artifacts !== null;
  let validArtifacts = false;
  if (artifacts !== null) {
    validArtifacts =
      artifacts.length <= 1024 &&
      artifacts.every((value) => {
        if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
        const artifact = value as Record<string, unknown>;
        return (
          Object.keys(artifact).sort().join(",") === "path,sha256" &&
          typeof artifact.path === "string" &&
          artifact.path.length > 0 &&
          artifact.path.trim() === artifact.path &&
          !artifact.path.includes("\\") &&
          !path.posix.isAbsolute(artifact.path) &&
          path.posix.normalize(artifact.path) === artifact.path &&
          !artifact.path.startsWith("../") &&
          typeof artifact.sha256 === "string" &&
          /^[a-f0-9]{64}$/.test(artifact.sha256)
        );
      });
  }
  if (!validTopLevel || !validArtifacts) {
    throw new AwfError("INVALID_RECIPE", "The generated artifact manifest is invalid.", {
      issues: [
        {
          code: "INVALID_ARTIFACT_MANIFEST",
          path: file,
          severity: "error",
          remediation:
            "Regenerate the strict schema_version 1 manifest with safe paths and SHA-256 hashes.",
        },
      ],
    });
  }
  return record as unknown as GeneratedArtifactManifest;
}

async function assertGeneratedArtifactsFresh(
  repository: string,
  recipeHashes: ReadonlyMap<string, string>,
): Promise<void> {
  const manifestFile = path.join(repository, "generated", "artifact-manifest.json");
  let raw: unknown;
  try {
    raw = JSON.parse(
      (
        await readBoundedRegularFile(manifestFile, MAX_ARTIFACT_MANIFEST_BYTES, repository)
      ).toString("utf8"),
    );
  } catch (error) {
    if (error instanceof AwfError && error.code === "MISSING_FILE") {
      throw new AwfError("INVALID_RECIPE", "The generated artifact manifest is missing.", {
        issues: [
          {
            code: "MISSING_ARTIFACT_MANIFEST",
            path: manifestFile,
            severity: "error",
            remediation: "Generate the complete artifact manifest before strict validation.",
          },
        ],
      });
    }
    if (error instanceof AwfError) throw error;
    throw new AwfError("INVALID_RECIPE", "The generated artifact manifest cannot be parsed.", {
      path: manifestFile,
      cause: errorMessage(error),
    });
  }
  const manifest = parseGeneratedArtifactManifest(raw, manifestFile);
  const issues: Array<{
    code: string;
    path: string;
    severity: "error";
    remediation: string;
  }> = [];
  const paths = manifest.artifacts.map((artifact) => artifact.path);
  const duplicatePaths = [
    ...new Set(paths.filter((value, index) => paths.indexOf(value) !== index)),
  ];
  for (const artifactPath of duplicatePaths) {
    issues.push({
      code: "DUPLICATE_GENERATED_ARTIFACT",
      path: artifactPath,
      severity: "error",
      remediation: "Keep exactly one manifest record for each generated artifact.",
    });
  }
  if (!isDeepStrictEqual(paths, [...paths].sort())) {
    issues.push({
      code: "UNSORTED_GENERATED_ARTIFACTS",
      path: "generated/artifact-manifest.json#artifacts",
      severity: "error",
      remediation: "Regenerate the manifest in deterministic path order.",
    });
  }
  const expectedPaths = expectedGeneratedArtifactPaths([...recipeHashes.keys()]);
  const actualPathSet = new Set(paths);
  const expectedPathSet = new Set(expectedPaths);
  const artifactByPath = new Map(
    manifest.artifacts.map((artifact) => [artifact.path, artifact] as const),
  );
  for (const expected of expectedPaths) {
    if (actualPathSet.has(expected)) continue;
    issues.push({
      code: "MISSING_GENERATED_ARTIFACT",
      path: expected,
      severity: "error",
      remediation: "Regenerate all artifacts so the manifest covers the complete expected set.",
    });
  }
  for (const actual of actualPathSet) {
    if (expectedPathSet.has(actual)) continue;
    issues.push({
      code: "UNEXPECTED_GENERATED_ARTIFACT",
      path: actual,
      severity: "error",
      remediation: "Regenerate all artifacts and remove stale manifest records.",
    });
  }
  const sourceDigest = hashNamedContent(
    Object.fromEntries(
      [...recipeHashes.entries()].sort(([left], [right]) => left.localeCompare(right)),
    ),
  );
  if (manifest.recipe_source_sha256 !== sourceDigest) {
    issues.push({
      code: "STALE_ARTIFACT_SOURCE_DIGEST",
      path: "generated/artifact-manifest.json#recipe_source_sha256",
      severity: "error",
      remediation: "Regenerate all artifacts from the current recipe source hashes.",
    });
  }
  for (const expectedPath of expectedPaths) {
    const artifact = artifactByPath.get(expectedPath);
    if (!artifact) continue;
    const artifactFile = path.resolve(repository, artifact.path);
    if (artifactFile !== repository && !artifactFile.startsWith(`${repository}${path.sep}`)) {
      issues.push({
        code: "UNSAFE_GENERATED_ARTIFACT_PATH",
        path: artifact.path,
        severity: "error",
        remediation: "Keep generated artifact paths inside the repository.",
      });
      continue;
    }
    try {
      const content = await readBoundedRegularFile(
        artifactFile,
        MAX_GENERATED_ARTIFACT_BYTES,
        repository,
      );
      if (hashContent(content) !== artifact.sha256) {
        issues.push({
          code: "STALE_GENERATED_ARTIFACT",
          path: artifact.path,
          severity: "error",
          remediation: "Regenerate the artifact so its content matches the retained SHA-256 hash.",
        });
      }
    } catch (error) {
      issues.push({
        code: error instanceof AwfError ? error.code : "GENERATED_ARTIFACT_READ_ERROR",
        path: artifact.path,
        severity: "error",
        remediation: errorMessage(error),
      });
    }
  }
  if (issues.length > 0) {
    throw new AwfError("INVALID_RECIPE", "Generated artifact integrity validation failed.", {
      issues,
    });
  }
}

async function assertGeneratedCatalogFresh(catalogDirectory: string): Promise<void> {
  const repository = path.dirname(path.resolve(catalogDirectory));
  if (
    !(await hasRegularFile(path.join(repository, "package.json"), "the package manifest")) ||
    !(await hasRegularFile(
      path.join(repository, "scripts", "generate.ts"),
      "the catalog generator",
    ))
  ) {
    return;
  }

  const generatedPath = path.join(repository, "generated", "catalog.json");
  const generated = await loadGeneratedCatalogFile(generatedPath);
  const generatedById = new Map(generated.map((recipe) => [recipe.id, recipe] as const));
  const sources = await loadCatalog(catalogDirectory);
  const sourceRecords: Array<{ recipe: (typeof sources)[number]; contentHash: string }> = [];
  for (const recipe of sources) {
    const source = await loadRecipeSource(path.join(catalogDirectory, recipe.id));
    sourceRecords.push({
      recipe,
      contentHash: hashNamedContent(
        Object.fromEntries(recipeSourceFiles.map((file) => [file, source.files[file]])),
      ),
    });
  }
  const recipeHashes = new Map(
    sourceRecords.map(({ recipe, contentHash }) => [recipe.id, contentHash] as const),
  );
  const recipeVersions = new Map(sources.map((recipe) => [recipe.id, recipe.version] as const));
  const expectedVerification = await expectedAgentVerification(
    repository,
    recipeHashes,
    recipeVersions,
  );
  const issues: Array<{
    code: string;
    path: string;
    severity: "error";
    remediation: string;
  }> = [];
  for (const { recipe, contentHash } of sourceRecords) {
    const record = generatedById.get(recipe.id);
    if (!record) {
      issues.push({
        code: "MISSING_GENERATED_RECIPE",
        path: `generated/catalog.json#${recipe.id}`,
        severity: "error",
        remediation: "Regenerate the catalog so the source recipe is represented.",
      });
      continue;
    }
    generatedById.delete(recipe.id);
    if (record.verification.structural.recipe_content_sha256 !== contentHash) {
      issues.push({
        code: "STALE_GENERATED_RECIPE",
        path: `generated/catalog.json#${recipe.id}`,
        severity: "error",
        remediation:
          "Regenerate artifacts after changing any file in the seven-file recipe bundle.",
      });
    }
    const { verification: _verification, agents: generatedAgents, ...generatedMetadata } = record;
    const sourceCompatibleMetadata = {
      ...generatedMetadata,
      agents: Object.fromEntries(
        agentIds.map((agent) => {
          const declaration = generatedAgents[agent];
          return [
            agent,
            {
              bundle_compatibility: declaration.bundle_compatibility,
              capability_status: declaration.capability_status,
              limitations: declaration.limitations,
            },
          ];
        }),
      ),
      verification: {
        structural: { status: "derived" },
        installation: { status: "untested" },
        execution: { status: "untested" },
        outcome: { status: "untested" },
      },
    };
    if (!isDeepStrictEqual(sourceCompatibleMetadata, recipe)) {
      issues.push({
        code: "STALE_GENERATED_METADATA",
        path: `generated/catalog.json#${recipe.id}`,
        severity: "error",
        remediation: "Regenerate artifacts so catalog metadata matches recipe.yml exactly.",
      });
    }
    if (
      !isDeepStrictEqual(
        [...record.verification.structural.checks].sort(),
        [...generatedStructuralChecks].sort(),
      )
    ) {
      issues.push({
        code: "INCOMPLETE_GENERATED_STRUCTURAL_CHECKS",
        path: `generated/catalog.json#${recipe.id}`,
        severity: "error",
        remediation: "Regenerate artifacts with the complete structural validation contract.",
      });
    }
    const recipeVerification = expectedVerification.get(recipe.id);
    for (const agent of agentIds) {
      if (
        !recipeVerification ||
        !isDeepStrictEqual(record.agents[agent].verification, recipeVerification[agent])
      ) {
        issues.push({
          code: "STALE_GENERATED_AGENT_VERIFICATION",
          path: `generated/catalog.json#${recipe.id}.agents.${agent}.verification`,
          severity: "error",
          remediation:
            "Regenerate artifacts so agent verification status, evidence, and stale-record counts match retained evidence.",
        });
      }
    }
  }
  for (const id of generatedById.keys()) {
    issues.push({
      code: "ORPHANED_GENERATED_RECIPE",
      path: `generated/catalog.json#${id}`,
      severity: "error",
      remediation: "Regenerate artifacts to remove catalog entries without a source recipe.",
    });
  }
  if (issues.length > 0) {
    throw new AwfError("INVALID_RECIPE", "Generated catalog freshness validation failed.", {
      issues,
    });
  }
  await assertGeneratedArtifactsFresh(repository, recipeHashes);
}

function matchesVerification(
  recipe: GeneratedCatalogRecipe,
  agent: AgentId,
  stage: VerificationStage,
  expected: VerificationStatus | undefined,
): boolean {
  return expected === undefined || recipe.agents[agent].verification[stage].status === expected;
}

function filterGeneratedCatalog(
  recipes: readonly GeneratedCatalogRecipe[],
  filters: CatalogListFilters,
): GeneratedCatalogRecipe[] {
  return recipes.filter((recipe) => {
    if (filters.category && recipe.category !== filters.category) return false;
    if (filters.tag && !recipe.tags.includes(filters.tag)) return false;
    if (!filters.agent) return true;

    const declaration = recipe.agents[filters.agent];
    return (
      (!filters.compatibility || declaration.bundle_compatibility === filters.compatibility) &&
      (!filters.support ||
        deriveAdapterSupport(adapterRegistry[filters.agent]) === filters.support) &&
      matchesVerification(recipe, filters.agent, "installation", filters.installation) &&
      matchesVerification(recipe, filters.agent, "execution", filters.execution) &&
      matchesVerification(recipe, filters.agent, "outcome", filters.outcome)
    );
  });
}

function assertNoContentIssues(issues: Awaited<ReturnType<typeof validateRecipeContent>>): void {
  if (issues.length > 0) {
    throw new AwfError("INVALID_RECIPE", "Strict content validation failed.", {
      issues: issues.map((issue) => ({
        code: issue.code,
        path: `${issue.recipe}/${issue.file}`,
        severity: "error",
        remediation: issue.message,
      })),
    });
  }
}

function structuredValidationError(error: unknown, candidate: string): AwfError {
  if (!(error instanceof AwfError)) {
    return new AwfError("INVALID_RECIPE", "Validation failed unexpectedly.", {
      issues: [
        {
          code: "VALIDATION_ERROR",
          path: candidate,
          severity: "error",
          remediation: errorMessage(error),
        },
      ],
    });
  }
  const retained = Array.isArray(error.details.issues) ? error.details.issues : [];
  const issues = retained.map((issue) => {
    const value = issue as Record<string, unknown>;
    const issuePath = Array.isArray(value.path)
      ? value.path.map(String).join(".")
      : typeof value.path === "string"
        ? value.path
        : candidate;
    return {
      code: typeof value.code === "string" ? value.code : error.code,
      path: issuePath || candidate,
      severity: value.severity === "warning" ? "warning" : "error",
      remediation:
        typeof value.remediation === "string"
          ? value.remediation
          : typeof value.message === "string"
            ? value.message
            : error.message,
    };
  });
  if (issues.length === 0 && Array.isArray(error.details.files)) {
    for (const entry of error.details.files as Array<{ file?: unknown; state?: unknown }>) {
      issues.push({
        code: "INSTALLATION_FILE_STATE",
        path: typeof entry.file === "string" ? entry.file : candidate,
        severity: "error",
        remediation: `Restore or explicitly replace the ${String(entry.state)} managed file.`,
      });
    }
  }
  if (issues.length === 0) {
    issues.push({
      code: error.code,
      path: candidate,
      severity: "error",
      remediation: error.message,
    });
  }
  return new AwfError(error.code, error.message, { ...error.details, issues });
}

async function validateRecipeDirectory(directory: string, strict: boolean): Promise<void> {
  await loadRecipe(directory);
  if (strict) assertNoContentIssues(await validateRecipeContent(directory));
}

async function isCatalogDirectory(directory: string, entries: readonly Dirent[]): Promise<boolean> {
  if (["catalog", "recipes"].includes(path.basename(directory))) return true;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const marker = path.join(directory, entry.name, "recipe.yml");
    const information = await inspectOptionalPath(marker, "a nested recipe marker");
    if (!information) continue;
    assertRegularFile(information, marker, "A nested recipe marker");
    return true;
  }
  if (
    entries.some((entry) => entry.isSymbolicLink()) &&
    !entries.some((entry) => [".agentic-workflows", "package.json"].includes(entry.name))
  ) {
    return true;
  }
  return false;
}

async function validateInstallationDirectory(directory: string, strict: boolean): Promise<number> {
  const isManifestDirectory =
    path.basename(directory) === "installations" &&
    path.basename(path.dirname(directory)) === ".agentic-workflows";
  const internalDirectory = isManifestDirectory
    ? path.dirname(directory)
    : path.basename(directory) === ".agentic-workflows"
      ? directory
      : path.join(directory, ".agentic-workflows");
  const internalInformation = await inspectOptionalPath(
    internalDirectory,
    "the installation metadata directory",
  );
  if (!internalInformation) return 0;
  assertRealDirectory(
    internalInformation,
    internalDirectory,
    "The installation metadata directory",
  );

  const installationDirectory = isManifestDirectory
    ? directory
    : path.join(internalDirectory, "installations");
  const installationInformation = await inspectOptionalPath(
    installationDirectory,
    "the installation manifest directory",
  );
  if (!installationInformation) return 0;
  assertRealDirectory(
    installationInformation,
    installationDirectory,
    "The installation manifest directory",
  );

  const target =
    path.basename(internalDirectory) === ".agentic-workflows"
      ? path.dirname(internalDirectory)
      : directory;
  let installations = 0;
  for (const entry of await readDirectoryEntries(
    installationDirectory,
    "the installation manifest directory",
  )) {
    if (!entry.name.endsWith(".yml")) continue;
    const manifest = path.join(installationDirectory, entry.name);
    const information = await inspectRequiredPath(manifest, "an installation manifest");
    assertRegularFile(information, manifest, "An installation manifest");
    await assertNoSymlink(target, manifest);
    const id = path.basename(entry.name, ".yml");
    if (strict) await validateInstallation(recipePath(id), target);
    else await readManifest(recipePath(id), target);
    installations += 1;
  }
  return installations;
}

async function validateCandidate(
  candidate: string,
  strict: boolean,
): Promise<{ valid: true; recipes: number; installations: number; strict: boolean }> {
  const absolute = path.resolve(candidate);
  const information = await inspectRequiredPath(absolute, "the validation target");
  if (information.isSymbolicLink()) {
    throw new AwfError("INVALID_PATH", "Validation targets must not be symbolic links.", {
      path: absolute,
    });
  }

  if (information.isFile() && path.basename(absolute) === "recipe.yml") {
    await validateRecipeDirectory(path.dirname(absolute), strict);
    return { valid: true, recipes: 1, installations: 0, strict };
  }
  if (
    information.isFile() &&
    path.extname(absolute) === ".yml" &&
    path.basename(path.dirname(absolute)) === "installations" &&
    path.basename(path.dirname(path.dirname(absolute))) === ".agentic-workflows"
  ) {
    const id = path.basename(absolute, ".yml");
    const target = path.dirname(path.dirname(path.dirname(absolute)));
    await assertNoSymlink(target, absolute);
    if (strict) await validateInstallation(recipePath(id), target);
    else await readManifest(recipePath(id), target);
    return { valid: true, recipes: 0, installations: 1, strict };
  }
  if (!information.isDirectory()) {
    throw new AwfError("INVALID_PATH", "Unsupported validation target.", { path: absolute });
  }

  const marker = path.join(absolute, "recipe.yml");
  const markerInformation = await inspectOptionalPath(marker, "the recipe marker");
  if (markerInformation) {
    assertRegularFile(markerInformation, marker, "The recipe marker");
    await validateRecipeDirectory(absolute, strict);
    return { valid: true, recipes: 1, installations: 0, strict };
  }

  const entries = await readDirectoryEntries(absolute, "the validation target");
  if (await isCatalogDirectory(absolute, entries)) {
    const recipes = (await loadCatalog(absolute)).length;
    if (strict) {
      assertNoContentIssues(await validateCatalogContent(absolute));
      await assertGeneratedCatalogFresh(absolute);
    }
    return { valid: true, recipes, installations: 0, strict };
  }

  const installations = await validateInstallationDirectory(absolute, strict);
  return { valid: true, recipes: 0, installations, strict };
}

function invocationGuidance(
  manifest: Awaited<ReturnType<typeof installRecipe>>,
  recipe: Awaited<ReturnType<typeof loadRecipe>>,
  target: string,
): string {
  const lines = [
    `Entrypoint: ${manifest.entrypoint}`,
    `Invocation policy: ${manifest.invocation.mode} (${manifest.invocation.implicit_invocation_control})`,
    "Installed files:",
    ...manifest.files.map((file) => `- ${file.path} (${file.role})`),
  ];
  if (manifest.invocation.command)
    lines.push(`Invoke explicitly with: ${manifest.invocation.command}`);
  if (manifest.invocation.warning) lines.push(`Warning: ${manifest.invocation.warning}`);
  lines.push("Required inputs:", ...recipe.inputs.required.map((input) => `- ${input}`));
  if (recipe.safety.requires_human_approval.length > 0) {
    lines.push(
      "Declared human approval gates remain advisory:",
      ...recipe.safety.requires_human_approval.map((approval) => `- ${approval}`),
    );
  }
  const effects = Object.entries(recipe.effects)
    .filter(([, enabled]) => enabled)
    .map(([effect]) => effect);
  lines.push(
    effects.length > 0
      ? `Declared workflow effects: ${effects.join(", ")}. Installing the bundle does not authorize them.`
      : "Declared workflow effects: none.",
    `Validate: awf validate ${JSON.stringify(target)} --strict`,
    `Remove: awf remove ${recipe.id} --target ${JSON.stringify(target)}`,
  );
  lines.push("Installation does not prove agent execution or workflow outcome quality.");
  return lines.join("\n");
}

function renderChangeSections(sections: Array<[string, readonly string[]]>): string[] {
  return sections.flatMap(([label, files]) => [
    `${label}:`,
    ...(files.length > 0 ? files.map((file) => `- ${file}`) : ["- none"]),
  ]);
}

function renderProposedFiles(
  files:
    | Awaited<ReturnType<typeof planInstallRecipe>>["proposedFiles"]
    | Awaited<ReturnType<typeof planUpdateRecipe>>["proposedFiles"],
): string[] {
  if (!files) return [];
  return [
    "",
    "Proposed generated content:",
    ...files.flatMap((file) => [`=== ${file.path} (${file.role}) ===`, file.content.trimEnd()]),
  ];
}

function versionedLifecyclePlan(
  operation: "install" | "update" | "remove",
  plan: {
    requiresForce: boolean;
    changes: object;
    proposedFiles?: readonly { path: string; role: string; content: string }[];
  },
) {
  return {
    schema_version: 1,
    operation,
    dry_run: true,
    requires_force: plan.requiresForce,
    changes: plan.changes,
    ...(plan.proposedFiles ? { proposed_files: plan.proposedFiles } : {}),
  };
}

function renderInstallPlan(
  id: string,
  agent: AgentId,
  plan: Awaited<ReturnType<typeof planInstallRecipe>>,
  recipe: Awaited<ReturnType<typeof loadRecipe>>,
  target: string,
): string {
  return [
    `Would install ${id} for ${agent}:`,
    ...renderChangeSections([
      ["Create", plan.changes.create],
      ["Replace", plan.changes.replace],
      ["Unchanged", plan.changes.unchanged],
      ["Retire", plan.changes.retire],
      ["Modified managed files", plan.changes.modifiedManagedFiles],
      ["Missing managed files", plan.changes.missingManagedFiles],
    ]),
    ...(plan.requiresForce
      ? ["An installation already exists. Review this plan and add --force to replace it."]
      : []),
    "No files were changed.",
    "",
    invocationGuidance(plan.manifest, recipe, target),
    ...renderProposedFiles(plan.proposedFiles),
  ].join("\n");
}

function renderUpdatePlan(id: string, plan: Awaited<ReturnType<typeof planUpdateRecipe>>): string {
  const sections: Array<[string, readonly string[]]> = [
    ["Create", plan.changes.create],
    ["Replace", plan.changes.replace],
    ["Unchanged", plan.changes.unchanged],
    ["Retire", plan.changes.retire],
    ["Modified managed files", plan.changes.modifiedManagedFiles],
    ["Missing managed files", plan.changes.missingManagedFiles],
  ];
  return [
    `Would update ${id}:`,
    ...renderChangeSections(sections),
    ...(plan.requiresForce
      ? ["This plan contains locally modified managed files and requires an explicit --force."]
      : []),
    "No files were changed.",
    ...renderProposedFiles(plan.proposedFiles),
  ].join("\n");
}

function renderRemovePlan(id: string, plan: Awaited<ReturnType<typeof planRemoveRecipe>>): string {
  return [
    `Would remove ${id}:`,
    ...renderChangeSections([
      ["Remove", plan.changes.remove],
      ["Modified managed files", plan.changes.modifiedManagedFiles],
      ["Missing managed files", plan.changes.missingManagedFiles],
    ]),
    ...(plan.requiresForce
      ? ["This plan contains locally modified managed files and requires an explicit --force."]
      : []),
    "No files were changed.",
  ].join("\n");
}

function renderWorkflowDetails(
  recipe: Awaited<ReturnType<typeof loadRecipe>>,
  selectedAgent?: AgentId,
): string {
  const effects = Object.entries(recipe.effects)
    .filter(([, enabled]) => enabled)
    .map(([effect]) => effect);
  const agents = selectedAgent ? [selectedAgent] : agentIds;
  return [
    recipe.title,
    recipe.summary,
    "",
    `ID: ${recipe.id}`,
    `Version: ${recipe.version}`,
    `Category: ${recipe.category}`,
    `Difficulty: ${recipe.difficulty}`,
    `Risk: ${recipe.risk_level}`,
    `Estimated duration: ${recipe.estimated_duration}`,
    `Tags: ${recipe.tags.join(", ")}`,
    "",
    "Required inputs:",
    ...recipe.inputs.required.map((input) => `- ${input}`),
    "Optional inputs:",
    ...(recipe.inputs.optional.length > 0
      ? recipe.inputs.optional.map((input) => `- ${input}`)
      : ["- none"]),
    "Outputs:",
    ...recipe.outputs.map((workflowOutput) => `- ${workflowOutput}`),
    "Human approval gates:",
    ...(recipe.safety.requires_human_approval.length > 0
      ? recipe.safety.requires_human_approval.map((approval) => `- ${approval}`)
      : ["- none"]),
    `Declared effects: ${effects.length > 0 ? effects.join(", ") : "none"}`,
    "",
    "Agent compatibility:",
    ...agents.flatMap((agent) => {
      const support = recipe.agents[agent];
      return [
        `- ${agent}: ${support.bundle_compatibility}; capability ${support.capability_status}`,
        ...support.limitations.map((limitation) => `  Limitation: ${limitation}`),
      ];
    }),
    "",
    `Preview: awf install ${recipe.id} --agent ${selectedAgent ?? "<agent>"} --dry-run`,
  ].join("\n");
}

function renderInstallationStatus(target: string, statuses: readonly InstallationStatus[]): string {
  if (statuses.length === 0) {
    return `No workflows are installed in ${target}. Preview one with \`awf install <workflow-id> --agent <agent> --dry-run\`.`;
  }
  return [
    `Installed workflows in ${target}:`,
    ...statuses.flatMap((status) => [
      `${status.id.padEnd(28)} ${status.status.padEnd(8)} ${status.agent ?? "unknown"} ${status.recipeVersion ?? "unknown"} ${status.files} file(s)`,
      ...(status.issue ? [`  [${status.issue.code}] ${status.issue.message}`] : []),
      ...(status.issue?.files ?? []).map((file) => `  - ${file.file}: ${file.state}`),
    ]),
  ].join("\n");
}

function requireDryRunForContentPreview(dryRun: boolean, showContent: boolean): void {
  if (!showContent || dryRun) return;
  throw new CommanderError(
    2,
    "awf.contentPreviewRequiresDryRun",
    "--show-content requires --dry-run because generated content is a preview.",
  );
}

function describeInstallationConflict(id: string, error: unknown): string {
  const code = error instanceof AwfError ? error.code : (errorCode(error) ?? "UNKNOWN_ERROR");
  const files =
    error instanceof AwfError && Array.isArray(error.details.files)
      ? (error.details.files as Array<{ file?: unknown; state?: unknown }>)
          .slice(0, 5)
          .map((entry) => `${String(entry.file)}=${String(entry.state)}`)
      : [];
  const issues =
    error instanceof AwfError && Array.isArray(error.details.issues)
      ? (error.details.issues as Array<{ path?: unknown; code?: unknown }>)
          .slice(0, 5)
          .map((issue) => `${String(issue.path)}[${String(issue.code)}]`)
      : [];
  const evidence = [...files, ...issues];
  return `${id}: [${code}] ${errorMessage(error)}${evidence.length > 0 ? ` (${evidence.join(", ")})` : ""}`;
}

const firstRunHelp = `
Examples:
  $ awf list
  $ awf show review-pull-request
  $ awf init --agent codex
  $ awf install review-pull-request --agent codex --dry-run

Next steps:
  $ awf status       Inspect installed workflow health
  $ awf doctor       Diagnose configuration and environment problems
  $ awf completion zsh  Generate completion for your shell

Start with a dry run before installing a workflow. Run awf <command> --help for command details.`;

export function createProgram(options: ProgramOptions = {}): Command {
  const { signal } = options;
  const program = new Command()
    .name("awf")
    .description("Browse, inspect, and install step-by-step workflows for coding agents.")
    .version(CLI_VERSION)
    .option("--project-root <directory>", "Use an explicit project root instead of auto-detection")
    .addHelpText("after", firstRunHelp)
    .exitOverride();
  program.configureOutput({
    writeOut: (value) => process.stdout.write(sanitizeTerminal(value)),
    writeErr: (value) => process.stderr.write(sanitizeTerminal(value)),
    outputError: () => {
      // Parsing errors are rendered once by the top-level handler so JSON mode stays machine-only.
    },
    stripColor: sanitizeTerminal,
  });
  program.hook("preAction", () => throwIfAborted(signal));
  program.hook("postAction", () => throwIfAborted(signal));
  program.action(() => output(`${program.helpInformation().trimEnd()}\n${firstRunHelp.trim()}`));
  const projectRoot = () => {
    const explicitRoot = program.opts<{ projectRoot?: string }>().projectRoot;
    return findProjectRoot(
      process.cwd(),
      explicitRoot ? { explicitRoot } : { allowPackageRoot: true },
    );
  };

  program
    .command("list")
    .description("List workflows in the catalog.")
    .option("--category <category>", "Match an exact workflow category")
    .addOption(
      new Option("--agent <agent>", "Match workflows compatible with an agent").choices(agentIds),
    )
    .option("--tag <tag>", "Match an exact workflow tag")
    .addOption(
      new Option(
        "--adapter-status <status>",
        "Match the selected agent exporter's support status",
      ).choices(supportStatuses),
    )
    .addOption(
      new Option(
        "--compatibility <compatibility>",
        "Match recipe compatibility for --agent",
      ).choices(recipeCompatibilityStatuses),
    )
    .addOption(
      new Option("--installation <status>", "Match installation evidence for --agent").choices(
        verificationStatuses,
      ),
    )
    .addOption(
      new Option("--execution <status>", "Match execution evidence for --agent").choices(
        verificationStatuses,
      ),
    )
    .addOption(
      new Option("--outcome <status>", "Match outcome-review evidence for --agent").choices(
        verificationStatuses,
      ),
    )
    .option("--json", "Print the matching catalog records as JSON")
    .action(async (options) => {
      if (
        (options.adapterStatus ||
          options.compatibility ||
          options.installation ||
          options.execution ||
          options.outcome) &&
        !options.agent
      ) {
        throw new CommanderError(
          2,
          "awf.filterRequiresAgent",
          "Adapter, compatibility, installation, execution, and outcome statuses require --agent.",
        );
      }
      const filters: CatalogListFilters = {};
      if (options.category) filters.category = options.category;
      if (options.agent) filters.agent = options.agent as AgentId;
      if (options.tag) filters.tag = options.tag;
      if (options.adapterStatus) filters.support = options.adapterStatus as SupportStatus;
      if (options.compatibility) {
        filters.compatibility = options.compatibility as RecipeCompatibilityStatus;
      } else if (options.agent) {
        filters.compatibility = "compatible";
      }
      if (options.installation) filters.installation = options.installation as VerificationStatus;
      if (options.execution) filters.execution = options.execution as VerificationStatus;
      if (options.outcome) filters.outcome = options.outcome as VerificationStatus;
      const recipes = filterGeneratedCatalog(await loadGeneratedCatalog(), filters);
      if (options.json) output(recipes, true);
      else if (recipes.length === 0) {
        output(
          "No workflows match the selected filters. Try `awf list` without filters or run `awf list --help`.",
        );
      } else {
        output(recipes.map((recipe) => `${recipe.id.padEnd(28)} ${recipe.summary}`).join("\n"));
      }
    });

  program
    .command("show <workflow-id>")
    .description("Show workflow details.")
    .addOption(
      new Option("--agent <agent>", "Focus compatibility details on one agent").choices(agentIds),
    )
    .option("--json", "Print complete structured recipe metadata")
    .option("--raw", "Print the canonical workflow Markdown")
    .option("--open", "Open the local page or public catalog page in a browser")
    .action(async (id, options) => {
      if ([options.json, options.raw, options.open].filter(Boolean).length > 1) {
        throw new CommanderError(2, "awf.conflictingOutput", "Choose one output mode.");
      }
      const source = await loadRecipeSource(await resolveWorkflowPath(id));
      const recipe = source.recipe;
      if (options.raw) return output(source.files["workflow.md"]);
      if (options.open) {
        const documentation = await openDocumentation(id, signal);
        return output(
          documentation.opened
            ? `Opened ${documentation.target}.`
            : `Could not launch a browser. Open ${documentation.target}.`,
        );
      }
      if (options.json) return output(recipe, true);
      output(renderWorkflowDetails(recipe, options.agent as AgentId | undefined));
    });

  program
    .command("install <workflow-id>")
    .description("Install a complete workflow bundle in the current project.")
    .addOption(new Option("--agent <agent>", "Select the destination format").choices(agentIds))
    .option("--target <directory>", "Target inside the project")
    .option("--dry-run", "Preview the complete installation plan without changing the target")
    .option("--show-content", "Include proposed generated content in a dry run")
    .option(
      "--force",
      "Replace this workflow's existing managed bundle, but never overwrite unmanaged files",
    )
    .option("--json", "Print the installation manifest as JSON")
    .action(async (id, options) => {
      requireDryRunForContentPreview(Boolean(options.dryRun), Boolean(options.showContent));
      const root = await projectRoot();
      const config = await loadConfig(root);
      const agent = (options.agent ?? config.default_agent) as AgentId;
      const target = await safeTarget(root, options.target ?? config.default_target);
      const workflowPath = await resolveWorkflowPath(id);
      const recipe = await loadRecipe(workflowPath);
      if (options.dryRun) {
        const plan = await planInstallRecipe(
          workflowPath,
          target,
          {
            agent,
            force: Boolean(options.force),
            dryRun: true,
            ...(signal ? { signal } : {}),
          },
          {
            includeContent: Boolean(options.showContent),
            ...(signal ? { signal } : {}),
          },
        );
        throwIfAborted(signal);
        output(
          options.json
            ? {
                ...plan.manifest,
                plan: versionedLifecyclePlan("install", plan),
              }
            : renderInstallPlan(id, agent, plan, recipe, target),
          Boolean(options.json),
        );
        return;
      }
      const manifest = await installRecipe(workflowPath, target, {
        agent,
        force: Boolean(options.force),
        dryRun: false,
        ...(signal ? { signal } : {}),
      });
      throwIfAborted(signal);
      output(
        options.json
          ? manifest
          : `Installed ${id} for ${agent}:\n${invocationGuidance(manifest, recipe, target)}`,
        Boolean(options.json),
      );
    });

  program
    .command("update <workflow-id>")
    .description("Update an installed bundle after checking every managed file.")
    .option("--target <directory>", "Target inside the project")
    .option("--dry-run", "Show the complete migration plan without changing files")
    .option("--show-content", "Include proposed generated content in a dry run")
    .option("--force", "Replace locally modified managed files after explicit review")
    .option("--json", "Print the update result or dry-run plan as JSON")
    .action(async (id, options) => {
      requireDryRunForContentPreview(Boolean(options.dryRun), Boolean(options.showContent));
      const root = await projectRoot();
      const config = await loadConfig(root);
      const target = await safeTarget(root, options.target ?? config.default_target);
      const workflowPath = await resolveWorkflowPath(id);
      if (options.dryRun) {
        throwIfAborted(signal);
        const plan = await planUpdateRecipe(workflowPath, target, Boolean(options.force), {
          includeContent: Boolean(options.showContent),
          ...(signal ? { signal } : {}),
        });
        throwIfAborted(signal);
        output(
          options.json
            ? { ...plan, plan: versionedLifecyclePlan("update", plan) }
            : renderUpdatePlan(id, plan),
          Boolean(options.json),
        );
        return;
      }
      const result = await updateRecipe(
        workflowPath,
        target,
        Boolean(options.force),
        undefined,
        signal ? { signal } : {},
      );
      const recipe = await loadRecipe(workflowPath);
      throwIfAborted(signal);
      output(
        options.json ? result : `Updated ${id}.\n${invocationGuidance(result, recipe, target)}`,
        Boolean(options.json),
      );
    });

  program
    .command("remove <workflow-id>")
    .description("Remove only the exact managed bundle after integrity checks.")
    .option("--target <directory>", "Target inside the project")
    .option("--dry-run", "Show every managed file that would be removed without changing files")
    .option("--force", "Remove locally modified managed files after explicit review")
    .option("--json", "Print the removed installation manifest as JSON")
    .action(async (id, options) => {
      const root = await projectRoot();
      const config = await loadConfig(root);
      const workflowPath = await resolveWorkflowPath(id);
      const target = await safeTarget(root, options.target ?? config.default_target);
      if (options.dryRun) {
        const plan = await planRemoveRecipe(
          workflowPath,
          target,
          Boolean(options.force),
          signal ? { signal } : {},
        );
        throwIfAborted(signal);
        output(
          options.json
            ? { ...plan, plan: versionedLifecyclePlan("remove", plan) }
            : renderRemovePlan(id, plan),
          Boolean(options.json),
        );
        return;
      }
      const result = await removeRecipe(
        workflowPath,
        target,
        Boolean(options.force),
        undefined,
        signal ? { signal } : {},
      );
      throwIfAborted(signal);
      output(options.json ? result : `Removed ${id}.`, Boolean(options.json));
    });

  program
    .command("status [workflow-id]")
    .description("Inspect locally installed workflows and report managed-file drift.")
    .option("--target <directory>", "Target inside the project")
    .option("--json", "Print a versioned installation status report as JSON")
    .action(async (id, options) => {
      if (id !== undefined) recipePath(id);
      const root = await projectRoot();
      const config = await loadConfig(root);
      const target = await safeTarget(root, options.target ?? config.default_target);
      const statuses = await inspectInstallations(catalogRoot(), target, id);
      throwIfAborted(signal);
      if (id !== undefined && statuses.length === 0) {
        throw new AwfError("NOT_FOUND", `Workflow ${JSON.stringify(id)} is not installed.`, {
          workflow: id,
          target,
          remediation: `Preview it with \`awf install ${id} --dry-run\` or run \`awf status\` to inspect every installation.`,
        });
      }
      output(
        options.json
          ? {
              schema_version: 1,
              target,
              installations: statuses,
            }
          : renderInstallationStatus(target, statuses),
        Boolean(options.json),
      );
      if (statuses.some((status) => status.status !== "healthy")) process.exitCode = 1;
    });

  program
    .command("validate [path]")
    .description("Validate a catalog, recipe, or installation.")
    .option("--json", "Print a structured validation result or error")
    .option("--strict", "Include content contracts or installed-file integrity checks")
    .action(async (candidate = catalogRoot(), options) => {
      let result: Awaited<ReturnType<typeof validateCandidate>>;
      try {
        result = await validateCandidate(candidate, Boolean(options.strict));
      } catch (error) {
        throw structuredValidationError(error, path.resolve(candidate));
      }
      output(
        options.json
          ? { schema_version: 1, ...result }
          : `Valid: ${result.recipes} recipe(s), ${result.installations} installation(s); strict=${result.strict}.`,
        Boolean(options.json),
      );
    });

  program
    .command("doctor")
    .description("Diagnose catalog, configuration, project, installation, and agent availability.")
    .option("--json", "Print structured health checks as JSON")
    .option("--maintainer", "Require source-development tools such as Corepack and pnpm")
    .action(async (options) => {
      const root = await projectRoot();
      const checks: Array<{ check: string; status: "pass" | "warn" | "fail"; detail: string }> = [];
      checks.push({ check: "project-root", status: "pass", detail: root });
      const major = Number(process.versions.node.split(".")[0]);
      checks.push({
        check: "node",
        status: major >= 22 ? "pass" : "fail",
        detail: `${process.versions.node}; Node 22 or newer is required by the package engines and CI baseline`,
      });
      for (const command of ["corepack", "pnpm"]) {
        throwIfAborted(signal);
        try {
          const detected = await commandExists(command);
          checks.push({
            check: command,
            status: detected ? "pass" : options.maintainer ? "fail" : "warn",
            detail: detected
              ? `${command} is executable from PATH`
              : options.maintainer
                ? `${command} is required for source development but is not executable from PATH`
                : `${command} is not executable from PATH; it is optional for npm package consumers`,
          });
        } catch (error) {
          checks.push({ check: command, status: "fail", detail: errorMessage(error) });
        }
      }
      let config: ProjectConfig | null = null;
      let configuredTarget: string | null = null;
      let configuredTargetInformation: Stats | null = null;
      try {
        config = await loadConfig(root);
        checks.push({ check: "config", status: "pass", detail: JSON.stringify(config) });
      } catch (error) {
        checks.push({ check: "config", status: "fail", detail: errorMessage(error) });
      }
      if (config) {
        try {
          configuredTarget = await safeTarget(root, config.default_target);
          configuredTargetInformation = await inspectOptionalPath(
            configuredTarget,
            "the configured default target",
          );
          if (!configuredTargetInformation) {
            checks.push({
              check: "default-target",
              status: "warn",
              detail: `Configured default target does not exist yet: ${configuredTarget}`,
            });
          } else {
            assertRealDirectory(
              configuredTargetInformation,
              configuredTarget,
              "The configured default target",
            );
            checks.push({
              check: "default-target",
              status: "pass",
              detail: configuredTarget,
            });
          }
        } catch (error) {
          configuredTarget = null;
          configuredTargetInformation = null;
          checks.push({ check: "default-target", status: "fail", detail: errorMessage(error) });
        }
      } else {
        checks.push({
          check: "default-target",
          status: "fail",
          detail: "Cannot resolve the default target until the project configuration is valid.",
        });
      }
      try {
        const catalog = await loadCatalog(catalogRoot());
        const contentIssues = await validateCatalogContent(catalogRoot());
        checks.push({
          check: "catalog",
          status: contentIssues.length === 0 ? "pass" : "fail",
          detail: `${catalog.length} recipes; ${contentIssues.length} content issue(s)`,
        });
      } catch (error) {
        checks.push({ check: "catalog", status: "fail", detail: (error as Error).message });
      }
      try {
        const generated = await loadGeneratedCatalog();
        checks.push({
          check: "generated-catalog",
          status: "pass",
          detail: `${generated.length} generated recipe records passed schema validation`,
        });
      } catch (error) {
        checks.push({
          check: "generated-catalog",
          status: "fail",
          detail: (error as Error).message,
        });
      }
      try {
        await assertGeneratedCatalogFresh(catalogRoot());
        checks.push({
          check: "generated-artifacts",
          status: "pass",
          detail:
            "Generated catalog records, verification projections, and manifest-tracked artifacts match current sources when repository freshness applies",
        });
      } catch (error) {
        checks.push({
          check: "generated-artifacts",
          status: "fail",
          detail: (error as Error).message,
        });
      }
      checks.push({
        check: "adapter-registry",
        status: Object.keys(adapterRegistry).length === agentIds.length ? "pass" : "fail",
        detail: `${Object.keys(adapterRegistry).length} adapters registered for ${agentIds.length} agent IDs`,
      });
      const siteConfig = path.join(root, "docs", ".vitepress", "config.ts");
      const siteUrlHelper = path.join(root, "scripts", "docs-site.ts");
      try {
        if (
          (await hasRegularFile(siteConfig, "the documentation site configuration")) &&
          (await hasRegularFile(siteUrlHelper, "the documentation URL helper"))
        ) {
          const content = (
            await readBoundedRegularFile(siteConfig, MAX_SITE_CONFIG_BYTES, root)
          ).toString("utf8");
          const helper = (
            await readBoundedRegularFile(siteUrlHelper, MAX_SITE_CONFIG_BYTES, root)
          ).toString("utf8");
          const expectedBase = `/${path.basename(root)}/`;
          const configured =
            content.includes('from "../../scripts/docs-site.js"') &&
            content.includes("documentationBase()") &&
            /\bbase\s*,/.test(content) &&
            helper.includes("DOCS_BASE") &&
            helper.includes("GITHUB_REPOSITORY") &&
            helper.includes("normalizeDocumentationBase");
          checks.push({
            check: "site-base",
            status: configured ? "pass" : "fail",
            detail: configured
              ? `Documentation base is environment-configurable with default ${expectedBase}`
              : `Expected an environment-configurable documentation base with default ${expectedBase}`,
          });
        }
      } catch (error) {
        checks.push({ check: "site-base", status: "fail", detail: errorMessage(error) });
      }

      if (!configuredTarget) {
        checks.push({
          check: "target-writable",
          status: "fail",
          detail: "The configured default target could not be resolved safely.",
        });
      } else if (!configuredTargetInformation) {
        checks.push({
          check: "target-writable",
          status: "warn",
          detail: `Not probed because the configured default target does not exist: ${configuredTarget}`,
        });
      } else {
        const probe = path.join(configuredTarget, `.awf-doctor-${process.pid}-${randomUUID()}`);
        let probeCreated = false;
        try {
          await writeFile(probe, "check", { flag: "wx" });
          probeCreated = true;
          await rm(probe);
          probeCreated = false;
          checks.push({ check: "target-writable", status: "pass", detail: configuredTarget });
        } catch (error) {
          checks.push({ check: "target-writable", status: "fail", detail: errorMessage(error) });
        } finally {
          if (probeCreated) {
            try {
              await rm(probe, { force: true });
            } catch (error) {
              checks.push({
                check: "target-probe-cleanup",
                status: "fail",
                detail: `Could not remove ${probe}: ${errorMessage(error)}`,
              });
            }
          }
        }
      }

      if (configuredTarget) {
        const metadataDirectory = path.join(configuredTarget, ".agentic-workflows");
        const lifecycleLock = path.join(metadataDirectory, "lifecycle.lock");
        try {
          const metadataInformation = await inspectOptionalPath(
            metadataDirectory,
            "the installation metadata directory",
          );
          if (metadataInformation) {
            assertRealDirectory(
              metadataInformation,
              metadataDirectory,
              "The installation metadata directory",
            );
          }
          const lockInformation = metadataInformation
            ? await inspectOptionalPath(lifecycleLock, "the lifecycle lock")
            : null;
          checks.push(
            lockInformation
              ? {
                  check: "lifecycle-lock",
                  status: "fail",
                  detail: `Lifecycle lock present at ${lifecycleLock}. Verify its recorded PID and timestamp before retrying; never remove it automatically.`,
                }
              : {
                  check: "lifecycle-lock",
                  status: "pass",
                  detail: `No lifecycle lock is present at ${lifecycleLock}`,
                },
          );
        } catch (error) {
          checks.push({ check: "lifecycle-lock", status: "fail", detail: errorMessage(error) });
        }
      } else {
        checks.push({
          check: "lifecycle-lock",
          status: "fail",
          detail: "Cannot inspect the lifecycle lock without a safely resolved default target.",
        });
      }

      const installationConflicts: string[] = [];
      const installationEntries: string[] = [];
      if (configuredTarget) {
        const metadataDirectory = path.join(configuredTarget, ".agentic-workflows");
        const installationDirectory = path.join(metadataDirectory, "installations");
        try {
          const metadataInformation = await inspectOptionalPath(
            metadataDirectory,
            "the installation metadata directory",
          );
          if (metadataInformation) {
            assertRealDirectory(
              metadataInformation,
              metadataDirectory,
              "The installation metadata directory",
            );
            const installationInformation = await inspectOptionalPath(
              installationDirectory,
              "the installation manifest directory",
            );
            if (installationInformation) {
              assertRealDirectory(
                installationInformation,
                installationDirectory,
                "The installation manifest directory",
              );
              for (const entry of await readDirectoryEntries(
                installationDirectory,
                "the installation manifest directory",
              )) {
                if (!entry.name.endsWith(".yml")) continue;
                installationEntries.push(entry.name);
                const id = path.basename(entry.name, ".yml");
                try {
                  const manifest = path.join(installationDirectory, entry.name);
                  assertRegularFile(
                    await inspectRequiredPath(manifest, "an installation manifest"),
                    manifest,
                    "An installation manifest",
                  );
                  await validateInstallation(recipePath(id), configuredTarget);
                } catch (error) {
                  installationConflicts.push(describeInstallationConflict(id, error));
                }
              }
            }
          }
        } catch (error) {
          installationConflicts.push(describeInstallationConflict("installation-directory", error));
        }
      } else {
        installationConflicts.push(
          "installation-directory: the configured default target could not be resolved safely",
        );
      }
      checks.push({
        check: "installations",
        status: installationConflicts.length === 0 ? "pass" : "fail",
        detail: `${installationEntries.length} found in ${configuredTarget ?? "an unresolved target"}; ${installationConflicts.length} conflict(s)${
          installationConflicts.length > 0 ? `: ${installationConflicts.join("; ")}` : ""
        }`,
      });
      for (const [agent, command] of Object.entries({
        "claude-code": "claude",
        codex: "codex",
        cursor: "cursor-agent",
        "gemini-cli": "gemini",
        opencode: "opencode",
      })) {
        throwIfAborted(signal);
        try {
          const detected = await commandExists(command);
          checks.push({
            check: `agent-${agent}`,
            status: detected ? "pass" : "warn",
            detail: detected
              ? `${command} found; command availability does not establish execution or outcome`
              : `${command} not found; exporter tests are independent`,
          });
        } catch (error) {
          checks.push({ check: `agent-${agent}`, status: "fail", detail: errorMessage(error) });
        }
      }
      const result = {
        schema_version: 1 as const,
        healthy: checks.every((check) => check.status !== "fail"),
        projectRoot: root,
        checks,
      };
      output(
        options.json
          ? result
          : `${result.healthy ? "Healthy" : "Unhealthy"} project at ${root}\n${checks
              .map((check) => `[${check.status.toUpperCase()}] ${check.check}: ${check.detail}`)
              .join("\n")}`,
        Boolean(options.json),
      );
      if (!result.healthy) process.exitCode = 1;
    });

  program
    .command("init")
    .description("Create local Agentic Workflows configuration.")
    .addOption(
      new Option("--agent <agent>", "Set the default destination format")
        .choices(agentIds)
        .default("generic"),
    )
    .option("--target <directory>", "Default target inside the project", ".")
    .option("--force", "Replace an existing AWF configuration")
    .action(async (options) => {
      if (!safeRelativeTarget(options.target)) {
        throw new AwfError("INVALID_PATH", "The configured target must be a safe relative path.");
      }
      const root = await projectRoot();
      const directory = path.join(root, ".agentic-workflows");
      await assertNoSymlink(root, directory);
      await mkdir(directory, { recursive: true });
      const file = path.join(directory, "config.yml");
      await assertNoSymlink(root, file);
      const temporary = path.join(directory, `.config-${randomUUID()}.tmp`);
      try {
        await writeFile(
          temporary,
          stringify({
            schema_version: 1,
            default_agent: options.agent,
            default_target: options.target,
          }),
          { flag: "wx", mode: 0o600 },
        );
        throwIfAborted(signal);
        if (options.force) {
          await replaceConfiguration(file, temporary);
        } else {
          await link(temporary, file);
          await rm(temporary);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") {
          throw new AwfError(
            "CONFLICT",
            "Configuration already exists. Use --force to replace it.",
          );
        }
        throw error;
      } finally {
        await rm(temporary, { force: true });
      }
      throwIfAborted(signal);
      output("Created .agentic-workflows/config.yml.");
    });

  program
    .command("manifest <workflow-id>")
    .description("Inspect a validated installation manifest.")
    .option("--target <directory>", "Target inside the project")
    .option("--json", "Print the manifest as JSON instead of YAML")
    .action(async (id, options) => {
      const root = await projectRoot();
      const config = await loadConfig(root);
      const manifest = await validateInstallation(
        await resolveWorkflowPath(id),
        await safeTarget(root, options.target ?? config.default_target),
      );
      output(options.json ? manifest : stringify(manifest), Boolean(options.json));
    });

  program
    .command("completion")
    .description("Generate tab completion for a supported shell.")
    .addArgument(
      new Argument("<shell>", "Shell whose completion script should be generated").choices([
        ...completionShells,
      ]),
    )
    .action(async (shell: CompletionShell) => {
      const catalog = await loadGeneratedCatalog();
      output(renderCompletion(shell, catalog).trimEnd());
    });

  return program;
}

async function run(): Promise<void> {
  const controller = new AbortController();
  let interrupted = false;
  let interruption: Error | undefined;
  let interruptionExitCode: 130 | 143 = 130;
  const interrupt = (signal: "SIGINT" | "SIGTERM") => {
    if (interrupted) return;
    interrupted = true;
    interruptionExitCode = signal === "SIGINT" ? 130 : 143;
    process.exitCode = interruptionExitCode;
    interruption = new Error(`The operation was interrupted by ${signal}.`);
    interruption.name = "AbortError";
    controller.abort(interruption);
    process.stderr.write(
      `${signal} received. Waiting for the active operation to stop safely; run awf doctor before retrying.\n`,
    );
  };
  const interruptWithSigint = () => interrupt("SIGINT");
  const interruptWithSigterm = () => interrupt("SIGTERM");
  process.once("SIGINT", interruptWithSigint);
  process.once("SIGTERM", interruptWithSigterm);
  try {
    await createProgram({ signal: controller.signal }).parseAsync();
  } catch (error) {
    if (
      !controller.signal.aborted ||
      (error !== interruption && errorMessage(error) !== interruption?.message)
    ) {
      throw error;
    }
  } finally {
    process.removeListener("SIGINT", interruptWithSigint);
    process.removeListener("SIGTERM", interruptWithSigterm);
  }
  if (interrupted) process.exitCode = interruptionExitCode;
}

const mainModule =
  process.argv[1] !== undefined &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (mainModule) {
  run().catch((error) => {
    if (error instanceof CommanderError && error.exitCode === 0) return;
    if ((error as Error).message !== "__AWF_HANDLED__") {
      try {
        fail(error, process.argv.includes("--json"), error instanceof CommanderError ? 2 : 1);
      } catch {
        // The failure was rendered and process.exitCode was set.
      }
    }
  });
}
