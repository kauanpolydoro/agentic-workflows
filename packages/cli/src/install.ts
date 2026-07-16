import { randomUUID } from "node:crypto";
import { lstat, mkdir, open, realpath, rename, rm, rmdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type AgentId,
  AwfError,
  adapters,
  assertNoSymlink,
  createManifest,
  type GeneratedAdapterBundle,
  generateAdapterBundle,
  hashContent,
  type LegacyManifest,
  legacyManifestSchema,
  loadRecipe,
  loadRecipeSource,
  MAX_RECIPE_FILE_BYTES,
  type Manifest,
  manifestSchema,
  type Recipe,
  readBoundedRegularFile,
  resolveInside,
} from "@agentic-workflows/core";
import { parse, stringify } from "yaml";
import { CLI_VERSION } from "./version.js";

const manifestRelative = (recipe: string) => `.agentic-workflows/installations/${recipe}.yml`;
const targetLockRelative = ".agentic-workflows/lifecycle.lock";
const transactionRelative = (id: string) => `.agentic-workflows/transactions/${id}`;
const MAX_MANAGED_FILE_BYTES = 4 * 1024 * 1024;

type FilePrecondition = { state: "absent" } | { state: "present"; hash: string };

interface FileSnapshot {
  path: string;
  existed: boolean;
  content: Buffer | null;
  transactionResult: FilePrecondition;
}

interface FileMutation {
  relative: string;
  content: string | null;
  expected: FilePrecondition;
}

interface BundleFingerprint {
  recipe: string;
  recipeVersion: string;
  adapter: { id: AgentId; version: string };
  entrypoint: string;
  invocation: Manifest["invocation"];
  members: string[];
}

interface V2MigrationContract {
  from: BundleFingerprint;
  to: {
    recipeVersion: string;
    adapter: { id: AgentId; version: string };
  };
}

const migrationRegistryBrand: unique symbol = Symbol("awf-migration-registry");

export interface SyntheticV2MigrationRegistry {
  readonly [migrationRegistryBrand]: true;
  readonly contracts: readonly V2MigrationContract[];
}

interface LifecycleOptions {
  signal?: AbortSignal;
  /** Test-only synthetic contracts; production uses the fail-closed retained registry below. */
  migrationRegistry?: SyntheticV2MigrationRegistry;
  /** Test-only hook used to coordinate real concurrent lifecycle calls. */
  onLockAcquired?: () => void | Promise<void>;
  /** Test-only hook used to reproduce a change between planning and commit. */
  beforeMutation?: (relative: string, index: number) => void | Promise<void>;
}

export interface InstallOptions extends LifecycleOptions {
  agent: AgentId;
  force: boolean;
  dryRun: boolean;
  /** Test-only fault injection used to prove rollback behavior. */
  faultAfterMutation?: number;
  /** Test-only lifecycle stage used to prove transaction cleanup and rollback behavior. */
  faultAtStage?:
    | "after-staging"
    | "during-rename"
    | "after-replacement"
    | "before-manifest"
    | "during-cleanup";
}

export interface UpdatePlan {
  manifest: Manifest;
  requiresForce: boolean;
  changes: {
    create: string[];
    replace: string[];
    retire: string[];
    modifiedManagedFiles: string[];
    missingManagedFiles: string[];
  };
}

interface InternalUpdatePlan extends UpdatePlan {
  mutations: FileMutation[];
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === "ENOENT";
}

async function exists(file: string): Promise<boolean> {
  try {
    await lstat(file);
    return true;
  } catch (error) {
    if (isMissing(error)) return false;
    throw error;
  }
}

async function safeTargetRoot(target: string, create: boolean): Promise<string> {
  const absolute = path.resolve(target);
  if (await exists(absolute)) {
    const information = await lstat(absolute);
    if (!information.isDirectory() || information.isSymbolicLink()) {
      throw new AwfError("INVALID_PATH", "The installation target must be a real directory.");
    }
    return realpath(absolute);
  }

  let ancestor = path.dirname(absolute);
  while (!(await exists(ancestor))) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) {
      throw new AwfError("INVALID_PATH", "The installation target has no accessible parent.");
    }
    ancestor = parent;
  }
  const resolvedAncestor = await realpath(ancestor);
  if (!(await stat(resolvedAncestor)).isDirectory()) {
    throw new AwfError("INVALID_PATH", "The installation target parent must be a directory.");
  }
  const resolved = path.resolve(resolvedAncestor, path.relative(ancestor, absolute));
  if (create) {
    await mkdir(resolved, { recursive: true });
    const created = await realpath(resolved);
    if (created !== resolved) {
      throw new AwfError("INVALID_PATH", "The created installation target changed unexpectedly.");
    }
  }
  return resolved;
}

async function revalidateTargetRoot(root: string): Promise<void> {
  let information: Awaited<ReturnType<typeof lstat>>;
  try {
    information = await lstat(root);
  } catch (error) {
    throw new AwfError("INVALID_PATH", "The installation target is no longer accessible.", {
      root,
      causeCode: (error as NodeJS.ErrnoException).code,
    });
  }
  if (!information.isDirectory() || information.isSymbolicLink()) {
    throw new AwfError(
      "INVALID_PATH",
      "The installation target changed type during the operation.",
    );
  }
  if ((await realpath(root)) !== path.resolve(root)) {
    throw new AwfError("INVALID_PATH", "The installation target changed during the operation.");
  }
}

function assertValidBundle(bundle: GeneratedAdapterBundle): void {
  const requiredRoles = [
    "entrypoint",
    "checklist",
    "example-input",
    "example-output",
    "metadata",
    "output-schema",
  ] as const;
  const allowedRoles = new Set([...requiredRoles, "policy"]);
  const paths = new Set<string>();
  for (const file of bundle.files) {
    resolveInside("/managed-root", file.path);
    if (!allowedRoles.has(file.role)) {
      throw new AwfError("INVALID_MANIFEST", `Adapter generated unknown role ${file.role}.`);
    }
    if (paths.has(file.path)) {
      throw new AwfError("INVALID_MANIFEST", `Adapter generated duplicate path ${file.path}.`);
    }
    paths.add(file.path);
  }
  const entrypoints = bundle.files.filter(
    (file) => file.role === "entrypoint" && file.path === bundle.entrypoint,
  );
  if (entrypoints.length !== 1) {
    throw new AwfError("INVALID_MANIFEST", "Adapter bundle has an invalid entrypoint.");
  }
  for (const role of requiredRoles) {
    if (bundle.files.filter((file) => file.role === role).length !== 1) {
      throw new AwfError(
        "INVALID_MANIFEST",
        `Adapter bundle must contain exactly one ${role} file.`,
      );
    }
  }
  if (bundle.files.filter((file) => file.role === "policy").length > 1) {
    throw new AwfError("INVALID_MANIFEST", "Adapter bundle cannot contain multiple policy files.");
  }
}

async function recipeBundle(
  recipeDirectory: string,
  agent: AgentId,
): Promise<{ recipe: Recipe; bundle: GeneratedAdapterBundle }> {
  const { recipe, files } = await loadRecipeSource(recipeDirectory);
  const bundle = generateAdapterBundle(
    recipe,
    {
      workflow: files["workflow.md"],
      checklist: files["checklist.md"],
      exampleInput: files["examples/input.md"],
      exampleOutput: files["examples/expected-output.md"],
      metadata: files["recipe.yml"],
      outputSchema: files["output.schema.json"],
    },
    agent,
  );
  assertValidBundle(bundle);
  return { recipe, bundle };
}

async function assertSafeDestination(root: string, relative: string): Promise<string> {
  const destination = resolveInside(root, relative);
  await assertNoSymlink(root, destination);
  if (await exists(destination)) {
    const information = await lstat(destination);
    if (!information.isFile() || information.isSymbolicLink()) {
      throw new AwfError("INVALID_PATH", `Managed path is not a regular file: ${relative}.`);
    }
  }
  return destination;
}

interface ManifestRead<T> {
  manifest: T;
  precondition: FilePrecondition;
}

async function readManifestData(
  root: string,
  recipe: string,
): Promise<{ data: unknown; precondition: FilePrecondition }> {
  const file = await assertSafeDestination(root, manifestRelative(recipe));
  let data: unknown;
  let content: Buffer;
  try {
    content = await readBoundedRegularFile(file, MAX_RECIPE_FILE_BYTES, root);
    data = parse(content.toString("utf8"), { maxAliasCount: 0, uniqueKeys: true });
  } catch (error) {
    if (error instanceof AwfError && error.code !== "MISSING_FILE") throw error;
    throw new AwfError("INVALID_MANIFEST", `Cannot read the installation manifest for ${recipe}.`);
  }
  return {
    data,
    precondition: { state: "present", hash: hashContent(content) },
  };
}

async function readManifestFile(root: string, recipe: string): Promise<Manifest> {
  const { data } = await readManifestData(root, recipe);
  const parsed = manifestSchema.safeParse(data);
  if (!parsed.success || parsed.data.recipe !== recipe) {
    throw new AwfError("INVALID_MANIFEST", `The installation manifest for ${recipe} is invalid.`, {
      issues: parsed.success ? [] : parsed.error.issues,
    });
  }
  return parsed.data;
}

async function readLifecycleManifestFile(
  root: string,
  recipe: string,
): Promise<ManifestRead<Manifest | LegacyManifest>> {
  const { data, precondition } = await readManifestData(root, recipe);
  const current = manifestSchema.safeParse(data);
  if (current.success && current.data.recipe === recipe) {
    return { manifest: current.data, precondition };
  }
  const legacy = legacyManifestSchema.safeParse(data);
  if (legacy.success && legacy.data.recipe === recipe) {
    return { manifest: legacy.data, precondition };
  }
  throw new AwfError("INVALID_MANIFEST", `The installation manifest for ${recipe} is invalid.`, {
    currentIssues: current.success ? [] : current.error.issues,
    legacyIssues: legacy.success ? [] : legacy.error.issues,
  });
}

const legacyEntrypoints: Readonly<Record<AgentId, (recipe: string) => string>> = {
  generic: (recipe) => `.agentic-workflows/workflows/${recipe}.md`,
  cursor: (recipe) => `.cursor/rules/${recipe}.mdc`,
  "gemini-cli": (recipe) => `.gemini/commands/${recipe}.toml`,
  opencode: (recipe) => `.opencode/commands/${recipe}.md`,
  "claude-code": (recipe) => `.claude/skills/${recipe}/SKILL.md`,
  codex: (recipe) => `.agents/skills/${recipe}/SKILL.md`,
};

interface LegacyBundleFingerprint {
  recipe: string;
  recipeVersion: string;
  agent: AgentId;
  cliVersion: string;
  path: string;
  hash: string;
}

// No v1 file hash was retained with the historical installation report. Keep migration
// fail-closed until an exact source artifact and fingerprint are deliberately registered.
const registeredLegacyBundleFingerprints: readonly LegacyBundleFingerprint[] = [];

function validateLegacyManifest(manifest: LegacyManifest): string {
  const file = manifest.files[0];
  const expectedPath = legacyEntrypoints[manifest.agent](manifest.recipe);
  const registered = registeredLegacyBundleFingerprints.some(
    (fingerprint) =>
      fingerprint.recipe === manifest.recipe &&
      fingerprint.recipeVersion === manifest.recipe_version &&
      fingerprint.agent === manifest.agent &&
      fingerprint.cliVersion === manifest.cli_version &&
      fingerprint.path === file?.path &&
      fingerprint.path === expectedPath &&
      fingerprint.hash === file?.hash,
  );
  if (!registered || !file) {
    throw new AwfError(
      "INVALID_MANIFEST",
      "Legacy manifest has no retained exact bundle fingerprint. Refusing automatic lifecycle changes.",
    );
  }
  return file.path;
}

function sortedManifestMembers(files: Manifest["files"]): string[] {
  return files.map((file) => `${file.role}:${file.path}:${file.hash}`).sort();
}

function sortedGeneratedMembers(files: GeneratedAdapterBundle["files"]): string[] {
  return files.map((file) => `${file.role}:${file.path}:${hashContent(file.content)}`).sort();
}

function manifestFingerprint(manifest: Manifest): BundleFingerprint {
  return {
    recipe: manifest.recipe,
    recipeVersion: manifest.recipe_version,
    adapter: { ...manifest.adapter },
    entrypoint: manifest.entrypoint,
    invocation: { ...manifest.invocation },
    members: sortedManifestMembers(manifest.files),
  };
}

function sameFingerprint(left: BundleFingerprint, right: BundleFingerprint): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function generatedFingerprint(
  recipe: Recipe,
  bundle: GeneratedAdapterBundle,
  agent: AgentId,
): BundleFingerprint {
  return {
    recipe: recipe.id,
    recipeVersion: recipe.version,
    adapter: { id: agent, version: adapters[agent].version },
    entrypoint: bundle.entrypoint,
    invocation: {
      mode: bundle.invocation.mode,
      command: bundle.invocation.command,
      implicit_invocation_control: bundle.invocation.implicitInvocationControl,
      warning: bundle.invocation.warning,
    },
    members: sortedGeneratedMembers(bundle.files),
  };
}

function createMigrationRegistry(
  contracts: readonly V2MigrationContract[],
): SyntheticV2MigrationRegistry {
  return { [migrationRegistryBrand]: true, contracts };
}

// No historical schema-v2 bundle fingerprint exists yet. A future production migration must
// add an exact retained source fingerprint here instead of weakening manifest comparison.
const productionV2MigrationRegistry = createMigrationRegistry([]);

export function createSyntheticV2MigrationRegistryForTest(
  from: Manifest,
  to: V2MigrationContract["to"],
): SyntheticV2MigrationRegistry {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Synthetic migration registries are available only to lifecycle tests.");
  }
  return createMigrationRegistry([{ from: manifestFingerprint(from), to }]);
}

function registryFrom(options?: LifecycleOptions): SyntheticV2MigrationRegistry {
  if (!options?.migrationRegistry) return productionV2MigrationRegistry;
  if (
    process.env.NODE_ENV !== "test" ||
    options.migrationRegistry[migrationRegistryBrand] !== true
  ) {
    throw new AwfError("INVALID_MANIFEST", "Untrusted bundle migration registry rejected.");
  }
  return options.migrationRegistry;
}

async function expectedBundleForManifest(
  recipeDirectory: string,
  manifest: Manifest,
): Promise<GeneratedAdapterBundle> {
  const { recipe, bundle } = await recipeBundle(recipeDirectory, manifest.adapter.id);
  if (
    !sameFingerprint(
      manifestFingerprint(manifest),
      generatedFingerprint(recipe, bundle, manifest.adapter.id),
    )
  ) {
    throw new AwfError(
      "INVALID_MANIFEST",
      "Manifest identity, members, or invocation policy do not match the exact current adapter bundle.",
    );
  }
  return bundle;
}

async function migratableBundleForManifest(
  recipeDirectory: string,
  manifest: Manifest,
  registry: SyntheticV2MigrationRegistry = productionV2MigrationRegistry,
): Promise<GeneratedAdapterBundle> {
  const { recipe, bundle } = await recipeBundle(recipeDirectory, manifest.adapter.id);
  const current = generatedFingerprint(recipe, bundle, manifest.adapter.id);
  if (sameFingerprint(manifestFingerprint(manifest), current)) return bundle;
  const registered = registry.contracts.some(
    (contract) =>
      sameFingerprint(contract.from, manifestFingerprint(manifest)) &&
      contract.to.recipeVersion === current.recipeVersion &&
      contract.to.adapter.id === current.adapter.id &&
      contract.to.adapter.version === current.adapter.version,
  );
  if (!registered) {
    throw new AwfError(
      "INVALID_MANIFEST",
      "Manifest bundle has no registered exact migration to the current recipe and adapter.",
    );
  }
  return bundle;
}

export async function readManifest(recipeDirectory: string, target: string): Promise<Manifest> {
  const root = await safeTargetRoot(target, false);
  const recipe = await loadRecipe(recipeDirectory);
  const manifest = await readManifestFile(root, recipe.id);
  await expectedBundleForManifest(recipeDirectory, manifest);
  for (const file of manifest.files) await assertSafeDestination(root, file.path);
  return manifest;
}

export async function validateInstallation(
  recipeDirectory: string,
  target: string,
): Promise<Manifest> {
  const root = await safeTargetRoot(target, false);
  const manifest = await readManifest(recipeDirectory, root);
  const states = await currentStates(root, manifest);
  const invalid = [...states].filter(([, state]) => state !== "unmodified");
  if (invalid.length > 0) {
    throw new AwfError("INVALID_MANIFEST", "Installed files do not match the manifest.", {
      files: invalid.map(([file, state]) => ({ file, state })),
    });
  }
  return manifest;
}

async function currentStates(
  root: string,
  manifest: Pick<Manifest, "files"> | Pick<LegacyManifest, "files">,
): Promise<ReadonlyMap<string, "unmodified" | "modified" | "missing">> {
  return statesFromObservations(manifest, await observeManifestFiles(root, manifest));
}

async function observeManifestFiles(
  root: string,
  manifest: Pick<Manifest, "files"> | Pick<LegacyManifest, "files">,
): Promise<ReadonlyMap<string, FilePrecondition>> {
  const observations = new Map<string, FilePrecondition>();
  for (const file of manifest.files) {
    observations.set(file.path, await observePrecondition(root, file.path));
  }
  return observations;
}

function statesFromObservations(
  manifest: Pick<Manifest, "files"> | Pick<LegacyManifest, "files">,
  observations: ReadonlyMap<string, FilePrecondition>,
): ReadonlyMap<string, "unmodified" | "modified" | "missing"> {
  return new Map(
    manifest.files.map((file) => {
      const current = observations.get(file.path);
      return [
        file.path,
        current?.state === "absent"
          ? "missing"
          : current?.hash === file.hash
            ? "unmodified"
            : "modified",
      ] as const;
    }),
  );
}

async function readManagedFile(root: string, file: string): Promise<Buffer> {
  return readBoundedRegularFile(file, MAX_MANAGED_FILE_BYTES, root);
}

async function observePrecondition(root: string, relative: string): Promise<FilePrecondition> {
  const destination = await assertSafeDestination(root, relative);
  if (!(await exists(destination))) return { state: "absent" };
  try {
    return { state: "present", hash: hashContent(await readManagedFile(root, destination)) };
  } catch (error) {
    if (error instanceof AwfError && error.code === "MISSING_FILE") return { state: "absent" };
    throw error;
  }
}

function samePrecondition(left: FilePrecondition, right: FilePrecondition): boolean {
  return (
    left.state === right.state &&
    (left.state === "absent" || (right.state === "present" && left.hash === right.hash))
  );
}

function transactionResultFor(mutation: FileMutation): FilePrecondition {
  return mutation.content === null
    ? { state: "absent" }
    : { state: "present", hash: hashContent(mutation.content) };
}

async function assertPrecondition(root: string, mutation: FileMutation): Promise<void> {
  const actual = await observePrecondition(root, mutation.relative);
  if (!samePrecondition(actual, mutation.expected)) {
    throw new AwfError(
      "CONFLICT",
      `Managed path changed after planning: ${mutation.relative}. Refusing to overwrite the new state.`,
      { path: mutation.relative, expected: mutation.expected, actual },
    );
  }
}

async function syncFile(file: string, content: string): Promise<void> {
  const handle = await open(file, "wx", 0o600);
  try {
    await handle.writeFile(content, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function injectedCleanupFailure(): Promise<never> {
  throw new Error("Injected transaction cleanup failure.");
}

function throwIfAborted(signal?: AbortSignal): void {
  signal?.throwIfAborted();
}

async function replaceFile(
  root: string,
  destination: string,
  staged: string,
): Promise<string | null> {
  await mkdir(path.dirname(destination), { recursive: true });
  await assertNoSymlink(root, destination);
  if (process.platform !== "win32" || !(await exists(destination))) {
    await rename(staged, destination);
    return null;
  }

  const backup = `${destination}.${randomUUID()}.replace-backup`;
  await rename(destination, backup);
  try {
    await rename(staged, destination);
  } catch (error) {
    try {
      await rename(backup, destination);
    } catch (rollbackError) {
      throw new AwfError(
        "CONFLICT",
        "File replacement failed and the previous file could not be restored.",
        {
          path: destination,
          cause: (error as Error).message,
          rollbackError: (rollbackError as Error).message,
        },
      );
    }
    throw error;
  }
  return backup;
}

async function restoreSnapshot(root: string, snapshot: FileSnapshot): Promise<void> {
  const current = await observePrecondition(root, snapshot.path);
  if (!samePrecondition(current, snapshot.transactionResult)) {
    throw new AwfError(
      "CONFLICT",
      `Managed path changed during rollback: ${snapshot.path}. Refusing to overwrite the new state.`,
      { path: snapshot.path, expected: snapshot.transactionResult, actual: current },
    );
  }
  const destination = await assertSafeDestination(root, snapshot.path);
  if (!snapshot.existed) {
    await rm(destination, { force: true });
    return;
  }
  if (!snapshot.content) throw new Error(`Missing rollback content for ${snapshot.path}.`);
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.rollback`;
  await writeFile(temporary, snapshot.content, { flag: "wx", mode: 0o600 });
  try {
    const replacementBackup = await replaceFile(root, destination, temporary);
    if (replacementBackup) await rm(replacementBackup, { force: true });
  } finally {
    await rm(temporary, { force: true });
  }
}

interface TargetLockRecord {
  schema_version: 1;
  pid: number;
  acquired_at: string;
  token: string;
}

function parseTargetLock(content: string): TargetLockRecord | null {
  try {
    const value = JSON.parse(content) as Partial<TargetLockRecord>;
    if (
      value.schema_version !== 1 ||
      !Number.isSafeInteger(value.pid) ||
      typeof value.acquired_at !== "string" ||
      typeof value.token !== "string" ||
      value.token.length === 0
    ) {
      return null;
    }
    return value as TargetLockRecord;
  } catch {
    return null;
  }
}

async function acquireLock(root: string): Promise<() => Promise<void>> {
  await revalidateTargetRoot(root);
  const lock = resolveInside(root, targetLockRelative);
  await assertNoSymlink(root, lock);
  await mkdir(path.dirname(lock), { recursive: true });
  await assertNoSymlink(root, lock);
  const record: TargetLockRecord = {
    schema_version: 1,
    pid: process.pid,
    acquired_at: new Date().toISOString(),
    token: randomUUID(),
  };
  try {
    await writeFile(lock, `${JSON.stringify(record)}\n`, {
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      let owner: TargetLockRecord | null = null;
      try {
        owner = parseTargetLock(
          (await readBoundedRegularFile(lock, 16 * 1024, root)).toString("utf8"),
        );
      } catch {
        // An unreadable lock is still authoritative. Lifecycle operations never steal it.
      }
      throw new AwfError(
        "CONFLICT",
        "Another installation lifecycle operation owns this target. Locks are never stolen automatically; verify the owner and remove a stale lock manually.",
        owner ? { pid: owner.pid, acquiredAt: owner.acquired_at } : {},
      );
    }
    throw error;
  }
  return async () => {
    let current: TargetLockRecord | null = null;
    try {
      current = parseTargetLock(
        (await readBoundedRegularFile(lock, 16 * 1024, root)).toString("utf8"),
      );
    } catch (error) {
      throw new AwfError("CONFLICT", "Target lock disappeared before release.", {
        causeCode: (error as NodeJS.ErrnoException).code,
      });
    }
    if (current?.token !== record.token) {
      throw new AwfError(
        "CONFLICT",
        "Target lock ownership changed during the lifecycle operation; refusing to remove it.",
      );
    }
    await rm(lock, { force: true });
  };
}

async function withTargetLock<T>(
  root: string,
  operation: () => Promise<T>,
  options?: LifecycleOptions,
): Promise<T> {
  throwIfAborted(options?.signal);
  const releaseLock = await acquireLock(root);
  try {
    await options?.onLockAcquired?.();
    throwIfAborted(options?.signal);
    await revalidateTargetRoot(root);
    return await operation();
  } finally {
    try {
      await releaseLock();
    } finally {
      await cleanEmptyParents(root, [targetLockRelative]);
    }
  }
}

async function cleanEmptyParents(root: string, relatives: readonly string[]): Promise<void> {
  const directories = new Set(
    relatives.map((relative) => path.dirname(resolveInside(root, relative))),
  );
  for (const directory of [...directories].sort((left, right) => right.length - left.length)) {
    let current = directory;
    while (current !== root && current.startsWith(`${root}${path.sep}`)) {
      try {
        await rmdir(current);
      } catch {
        break;
      }
      current = path.dirname(current);
    }
  }
}

async function snapshotForMutation(root: string, mutation: FileMutation): Promise<FileSnapshot> {
  const destination = await assertSafeDestination(root, mutation.relative);
  if (mutation.expected.state === "absent") {
    if (await exists(destination)) {
      throw new AwfError("CONFLICT", `Managed path appeared after planning: ${mutation.relative}.`);
    }
    return {
      path: mutation.relative,
      existed: false,
      content: null,
      transactionResult: transactionResultFor(mutation),
    };
  }
  let content: Buffer;
  try {
    content = await readManagedFile(root, destination);
  } catch (error) {
    if (error instanceof AwfError && error.code === "MISSING_FILE") {
      throw new AwfError(
        "CONFLICT",
        `Managed path disappeared after planning: ${mutation.relative}.`,
      );
    }
    throw error;
  }
  const actualHash = hashContent(content);
  if (actualHash !== mutation.expected.hash) {
    throw new AwfError("CONFLICT", `Managed path changed after planning: ${mutation.relative}.`, {
      path: mutation.relative,
      expectedHash: mutation.expected.hash,
      actualHash,
    });
  }
  return {
    path: mutation.relative,
    existed: true,
    content,
    transactionResult: transactionResultFor(mutation),
  };
}

async function applyTransaction(
  root: string,
  mutations: readonly FileMutation[],
  options: LifecycleOptions & {
    faultAfterMutation?: number;
    faultAtStage?: InstallOptions["faultAtStage"];
  } = {},
): Promise<void> {
  const transactionId = randomUUID();
  const stagingRoot = resolveInside(root, transactionRelative(transactionId));
  const snapshots: FileSnapshot[] = [];
  const stagedFiles = new Map<string, string>();
  const replacementBackups = new Set<string>();
  let applied = 0;
  try {
    throwIfAborted(options.signal);
    await mkdir(path.dirname(stagingRoot), { recursive: true });
    await assertNoSymlink(root, stagingRoot);
    await mkdir(stagingRoot, { recursive: false });
    for (const [index, mutation] of mutations.entries()) {
      throwIfAborted(options.signal);
      if (mutation.content !== null) {
        const staged = path.join(stagingRoot, `${index}.staged`);
        await syncFile(staged, mutation.content);
        stagedFiles.set(mutation.relative, staged);
      }
    }
    throwIfAborted(options.signal);
    if (options.faultAtStage === "after-staging") {
      throw new Error("Injected transaction failure after staging.");
    }
    for (const mutation of mutations) {
      throwIfAborted(options.signal);
      snapshots.push(await snapshotForMutation(root, mutation));
    }
    throwIfAborted(options.signal);
    await revalidateTargetRoot(root);
    for (const [index, mutation] of mutations.entries()) {
      throwIfAborted(options.signal);
      await revalidateTargetRoot(root);
      await options.beforeMutation?.(mutation.relative, index);
      throwIfAborted(options.signal);
      await assertPrecondition(root, mutation);
      const destination = await assertSafeDestination(root, mutation.relative);
      if (
        options.faultAtStage === "before-manifest" &&
        mutation.relative.startsWith(".agentic-workflows/installations/")
      ) {
        throw new Error("Injected transaction failure before manifest commit.");
      }
      if (mutation.content === null) {
        await rm(destination, { force: true });
        applied += 1;
      } else {
        const staged = stagedFiles.get(mutation.relative);
        if (!staged) throw new Error(`Missing staged content for ${mutation.relative}.`);
        if (options.faultAtStage === "during-rename") {
          throw new Error("Injected transaction failure during rename.");
        }
        const replacementBackup = await replaceFile(root, destination, staged);
        applied += 1;
        if (replacementBackup) replacementBackups.add(replacementBackup);
        if (options.faultAtStage === "after-replacement") {
          throw new Error("Injected transaction failure after replacement.");
        }
        if (replacementBackup) {
          await rm(replacementBackup, { force: true });
          replacementBackups.delete(replacementBackup);
        }
      }
      if (options.faultAfterMutation === applied) {
        throw new Error("Injected transaction failure.");
      }
      throwIfAborted(options.signal);
    }
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const snapshot of snapshots.slice(0, applied).reverse()) {
      try {
        await restoreSnapshot(root, snapshot);
      } catch (rollbackError) {
        rollbackErrors.push((rollbackError as Error).message);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new AwfError("CONFLICT", "Installation failed and rollback was incomplete.", {
        cause: (error as Error).message,
        rollbackErrors,
      });
    }
    await cleanEmptyParents(
      root,
      mutations.slice(0, applied).map((mutation) => mutation.relative),
    );
    throw error;
  } finally {
    for (const backup of replacementBackups) await rm(backup, { force: true });
    if (options.faultAtStage === "during-cleanup") {
      try {
        await injectedCleanupFailure();
      } catch {
        await rm(stagingRoot, { recursive: true, force: true });
      }
    } else {
      await rm(stagingRoot, { recursive: true, force: true });
    }
    await cleanEmptyParents(root, [transactionRelative(transactionId)]);
  }
}

function manifestMutation(manifest: Manifest, expected: FilePrecondition): FileMutation {
  return {
    relative: manifestRelative(manifest.recipe),
    content: stringify(manifest),
    expected,
  };
}

async function plannedInstall(
  recipeDirectory: string,
  root: string,
  options: InstallOptions,
): Promise<{ manifest: Manifest; mutations: FileMutation[] }> {
  throwIfAborted(options.signal);
  const { recipe, bundle } = await recipeBundle(recipeDirectory, options.agent);
  const manifestPath = manifestRelative(recipe.id);
  const manifestDestination = await assertSafeDestination(root, manifestPath);
  const oldPaths = new Set<string>();
  const oldPreconditions = new Map<string, FilePrecondition>();
  let manifestPrecondition: FilePrecondition = { state: "absent" };
  if (await exists(manifestDestination)) {
    if (!options.force) throw new AwfError("CONFLICT", "An installation manifest already exists.");
    const previousRead = await readLifecycleManifestFile(root, recipe.id);
    const previous = previousRead.manifest;
    manifestPrecondition = previousRead.precondition;
    if (previous.schema_version === 1) validateLegacyManifest(previous);
    else {
      await migratableBundleForManifest(recipeDirectory, previous, registryFrom(options));
    }
    for (const file of previous.files) {
      oldPaths.add(file.path);
      oldPreconditions.set(file.path, await observePrecondition(root, file.path));
    }
  }
  for (const file of bundle.files) {
    const observed =
      oldPreconditions.get(file.path) ?? (await observePrecondition(root, file.path));
    if (observed.state === "present" && !oldPaths.has(file.path)) {
      throw new AwfError("CONFLICT", `Refusing to overwrite unmanaged file ${file.path}.`);
    }
    oldPreconditions.set(file.path, observed);
  }
  const manifest = createManifest(recipe, adapters[options.agent], bundle, CLI_VERSION);
  const desired = new Set(bundle.files.map((file) => file.path));
  const mutations: FileMutation[] = [
    ...bundle.files.map((file) => ({
      relative: file.path,
      content: file.content,
      expected: oldPreconditions.get(file.path) ?? { state: "absent" as const },
    })),
    ...[...oldPaths]
      .filter((file) => !desired.has(file))
      .map((file) => ({
        relative: file,
        content: null,
        expected: oldPreconditions.get(file) ?? { state: "absent" as const },
      })),
    manifestMutation(manifest, manifestPrecondition),
  ];
  throwIfAborted(options.signal);
  return { manifest, mutations };
}

export async function installRecipe(
  recipeDirectory: string,
  target: string,
  options: InstallOptions,
): Promise<Manifest> {
  throwIfAborted(options.signal);
  const root = await safeTargetRoot(target, !options.dryRun);
  if (options.dryRun) {
    const plan = await plannedInstall(recipeDirectory, root, options);
    throwIfAborted(options.signal);
    return plan.manifest;
  }
  return withTargetLock(
    root,
    async () => {
      const plan = await plannedInstall(recipeDirectory, root, options);
      throwIfAborted(options.signal);
      await applyTransaction(root, plan.mutations, options);
      return plan.manifest;
    },
    options,
  );
}

export async function updateRecipe(
  recipeDirectory: string,
  target: string,
  force: boolean,
  faultAfterMutation?: number,
  options: LifecycleOptions = {},
): Promise<Manifest> {
  throwIfAborted(options.signal);
  const root = await safeTargetRoot(target, false);
  return withTargetLock(
    root,
    async () => {
      const plan = await plannedUpdate(recipeDirectory, root, force, true, options);
      throwIfAborted(options.signal);
      await applyTransaction(
        root,
        plan.mutations,
        faultAfterMutation === undefined ? options : { ...options, faultAfterMutation },
      );
      return plan.manifest;
    },
    options,
  );
}

async function plannedUpdate(
  recipeDirectory: string,
  root: string,
  force: boolean,
  enforceModifiedFilePolicy = true,
  options: LifecycleOptions = {},
): Promise<InternalUpdatePlan> {
  throwIfAborted(options.signal);
  const recipe = await loadRecipe(recipeDirectory);
  const currentRead = await readLifecycleManifestFile(root, recipe.id);
  const current = currentRead.manifest;
  if (current.schema_version === 1) validateLegacyManifest(current);
  else {
    await migratableBundleForManifest(recipeDirectory, current, registryFrom(options));
  }
  const observations = new Map(await observeManifestFiles(root, current));
  const states = statesFromObservations(current, observations);
  if (enforceModifiedFilePolicy && !force) {
    const modified = [...states].find(([, state]) => state === "modified");
    if (modified) {
      throw new AwfError(
        "MODIFIED_FILE",
        `Refusing to change modified file ${modified[0]}. Use --force to override.`,
      );
    }
  }
  const agent = current.schema_version === 1 ? current.agent : current.adapter.id;
  const { bundle } = await recipeBundle(recipeDirectory, agent);
  const desired = new Set(bundle.files.map((file) => file.path));
  const currentPaths = new Set(current.files.map((file) => file.path));
  for (const file of bundle.files) {
    const observed = observations.get(file.path) ?? (await observePrecondition(root, file.path));
    if (!currentPaths.has(file.path) && observed.state === "present") {
      throw new AwfError("CONFLICT", `Refusing to overwrite unmanaged file ${file.path}.`);
    }
    observations.set(file.path, observed);
  }
  const createdFiles = [...desired].filter((file) => !currentPaths.has(file)).sort();
  const replacedFiles = [...desired].filter((file) => currentPaths.has(file)).sort();
  const retiredFiles = [...currentPaths].filter((file) => !desired.has(file)).sort();
  const previousAgent = current.schema_version === 1 ? current.agent : current.adapter.id;
  const previousAdapterVersion = current.schema_version === 1 ? null : current.adapter.version;
  const migration =
    current.schema_version !== 2 ||
    current.recipe_version !== recipe.version ||
    current.adapter.version !== adapters[agent].version ||
    createdFiles.length > 0 ||
    retiredFiles.length > 0
      ? {
          from_schema_version: current.schema_version,
          from_recipe_version: current.recipe_version,
          from_adapter: { id: previousAgent, version: previousAdapterVersion },
          created_files: createdFiles,
          retired_files: retiredFiles,
        }
      : null;
  const manifest = createManifest(
    recipe,
    adapters[agent],
    bundle,
    CLI_VERSION,
    new Date(),
    migration,
  );
  const modifiedManagedFiles = [...states]
    .filter(([, state]) => state === "modified")
    .map(([file]) => file)
    .sort();
  return {
    manifest,
    requiresForce: modifiedManagedFiles.length > 0 && !force,
    changes: {
      create: createdFiles,
      replace: replacedFiles,
      retire: retiredFiles,
      modifiedManagedFiles,
      missingManagedFiles: [...states]
        .filter(([, state]) => state === "missing")
        .map(([file]) => file)
        .sort(),
    },
    mutations: [
      ...bundle.files.map((file) => ({
        relative: file.path,
        content: file.content,
        expected: observations.get(file.path) ?? { state: "absent" as const },
      })),
      ...current.files
        .filter((file) => !desired.has(file.path))
        .map((file) => ({
          relative: file.path,
          content: null,
          expected: observations.get(file.path) ?? { state: "absent" as const },
        })),
      manifestMutation(manifest, currentRead.precondition),
    ],
  };
}

export async function planUpdateRecipe(
  recipeDirectory: string,
  target: string,
  force: boolean,
  options: LifecycleOptions = {},
): Promise<UpdatePlan> {
  throwIfAborted(options.signal);
  const root = await safeTargetRoot(target, false);
  const { manifest, requiresForce, changes } = await plannedUpdate(
    recipeDirectory,
    root,
    force,
    false,
    options,
  );
  throwIfAborted(options.signal);
  return { manifest, requiresForce, changes };
}

export async function removeRecipe(
  recipeDirectory: string,
  target: string,
  force: boolean,
  faultAfterMutation?: number,
  options: LifecycleOptions = {},
): Promise<Manifest | LegacyManifest> {
  throwIfAborted(options.signal);
  const root = await safeTargetRoot(target, false);
  return withTargetLock(
    root,
    async () => {
      const recipe = await loadRecipe(recipeDirectory);
      const currentRead = await readLifecycleManifestFile(root, recipe.id);
      const manifest = currentRead.manifest;
      if (manifest.schema_version === 1) validateLegacyManifest(manifest);
      else {
        await migratableBundleForManifest(recipeDirectory, manifest, registryFrom(options));
      }
      const observations = await observeManifestFiles(root, manifest);
      const states = statesFromObservations(manifest, observations);
      if (!force) {
        const modified = [...states].find(([, state]) => state === "modified");
        if (modified) {
          throw new AwfError(
            "MODIFIED_FILE",
            `Refusing to change modified file ${modified[0]}. Use --force to override.`,
          );
        }
      }
      const mutations: FileMutation[] = [
        ...manifest.files.map((file) => ({
          relative: file.path,
          content: null,
          expected: observations.get(file.path) ?? { state: "absent" as const },
        })),
        {
          relative: manifestRelative(recipe.id),
          content: null,
          expected: currentRead.precondition,
        },
      ];
      throwIfAborted(options.signal);
      await applyTransaction(
        root,
        mutations,
        faultAfterMutation === undefined ? options : { ...options, faultAfterMutation },
      );
      await cleanEmptyParents(
        root,
        mutations.map((mutation) => mutation.relative),
      );
      return manifest;
    },
    options,
  );
}
