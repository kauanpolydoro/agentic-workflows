import { constants, type Dir, type Stats } from "node:fs";
import { type FileHandle, lstat, open, opendir, realpath } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { adapters } from "./adapters.js";
import { mapWithConcurrency } from "./catalog-concurrency.js";
import { AwfError } from "./errors.js";
import { MAX_RECIPE_FILE_BYTES } from "./fs-security.js";
import {
  type AgentId,
  type Recipe,
  type RecipeCompatibilityStatus,
  recipeSchema,
  type SupportStatus,
} from "./schema.js";

export const recipeSourceFiles = [
  "recipe.yml",
  "workflow.md",
  "README.md",
  "checklist.md",
  "output.schema.json",
  "examples/input.md",
  "examples/expected-output.md",
] as const;
export type RecipeSourceFile = (typeof recipeSourceFiles)[number];

export interface LoadedRecipeSource {
  recipe: Recipe;
  files: Readonly<Record<RecipeSourceFile, string>>;
  totalBytes: number;
}
const incompleteMarkers = [
  /TODO/i,
  /TBD/i,
  /lorem ipsum/i,
  /replace (?:this|with)/i,
  /AUTHOR_INPUT_REQUIRED/i,
];

export interface CatalogLoadLimits {
  maxRecipes: number;
  maxFilesPerRecipe: number;
  maxFileBytes: number;
  maxRecipeBytes: number;
  maxCatalogBytes: number;
  concurrency: number;
}

export type CatalogLoadOptions = Partial<CatalogLoadLimits>;

export const DEFAULT_CATALOG_LOAD_LIMITS: Readonly<CatalogLoadLimits> = Object.freeze({
  maxRecipes: 512,
  maxFilesPerRecipe: 128,
  maxFileBytes: MAX_RECIPE_FILE_BYTES,
  maxRecipeBytes: 8 * 1024 * 1024,
  maxCatalogBytes: 64 * 1024 * 1024,
  concurrency: 8,
});

interface CatalogRoot {
  path: string;
  realPath: string;
}

interface CatalogFile {
  path: string;
  realPath: string;
  relativePath: string;
  stat: Stats;
}

interface InspectedRecipe {
  path: string;
  realPath: string;
  files: ReadonlyMap<string, CatalogFile>;
  totalBytes: number;
}

export function resolveCatalogLoadLimits(options: CatalogLoadOptions = {}): CatalogLoadLimits {
  const limits = { ...DEFAULT_CATALOG_LOAD_LIMITS, ...options };
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new AwfError("INVALID_RECIPE", "Catalog load limits must be positive integers.", {
        scope: "catalog-configuration",
        limit: name,
        value,
      });
    }
  }

  return limits;
}

function isContained(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`))
  );
}

function catalogPathError(
  message: string,
  candidate: string,
  scope: string,
  reason: string,
  causeCode?: string,
): AwfError {
  return new AwfError("INVALID_PATH", message, {
    path: candidate,
    scope,
    reason,
    ...(causeCode ? { causeCode } : {}),
  });
}

function limitError(
  message: string,
  resource: string,
  limit: number,
  actual: number,
  candidate?: string,
): AwfError {
  return new AwfError("FILE_TOO_LARGE", message, {
    scope: "catalog",
    resource,
    limit,
    actual,
    ...(candidate ? { path: candidate } : {}),
  });
}

function errorCode(error: unknown): string | undefined {
  return (error as NodeJS.ErrnoException | undefined)?.code;
}

async function resolveCatalogPath(candidate: string, scope: string): Promise<string> {
  try {
    return await realpath(candidate);
  } catch (error) {
    throw catalogPathError(
      "Cannot resolve a catalog path.",
      candidate,
      scope,
      "realpath-failed",
      errorCode(error),
    );
  }
}

async function inspectDirectoryRoot(candidate: string, scope: string): Promise<CatalogRoot> {
  const absolute = path.resolve(candidate);
  let info: Stats;
  try {
    info = await lstat(absolute);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      throw new AwfError("MISSING_FILE", `Missing ${absolute}.`, {
        path: absolute,
        scope,
      });
    }
    throw catalogPathError(
      "Cannot inspect a catalog directory.",
      absolute,
      scope,
      "inspection-failed",
      errorCode(error),
    );
  }

  if (info.isSymbolicLink()) {
    throw catalogPathError(
      "Catalog directories must not be symbolic links.",
      absolute,
      scope,
      "symbolic-link",
    );
  }
  if (!info.isDirectory()) {
    throw catalogPathError(
      "A catalog directory path is not a directory.",
      absolute,
      scope,
      "not-directory",
    );
  }

  const resolved = await resolveCatalogPath(absolute, scope);
  return { path: absolute, realPath: resolved };
}

function normalizedRelative(root: string, candidate: string): string {
  return path.relative(root, candidate).split(path.sep).join("/");
}

async function inspectRecipe(
  recipeDirectory: string,
  limits: CatalogLoadLimits,
  catalogRoot?: string,
): Promise<InspectedRecipe> {
  const root = await inspectDirectoryRoot(recipeDirectory, "recipe-directory");
  if (catalogRoot && !isContained(catalogRoot, root.realPath)) {
    throw catalogPathError(
      "Recipe directory resolves outside the catalog root.",
      root.path,
      "recipe-directory",
      "outside-root",
    );
  }

  const files = new Map<string, CatalogFile>();
  const directories = [root.realPath];
  let totalBytes = 0;

  for (let index = 0; index < directories.length; index += 1) {
    const directory = directories[index] as string;
    const current = await inspectDirectoryRoot(directory, "recipe-directory");
    if (!isContained(root.realPath, current.realPath)) {
      throw catalogPathError(
        "Recipe content resolves outside its recipe directory.",
        directory,
        "recipe-directory",
        "outside-root",
      );
    }

    let entries: Dir;
    try {
      entries = await opendir(current.realPath);
    } catch (error) {
      throw catalogPathError(
        "Cannot enumerate a recipe directory.",
        current.realPath,
        "recipe-directory",
        "enumeration-failed",
        errorCode(error),
      );
    }

    for await (const entry of entries) {
      const entryPath = path.join(current.realPath, entry.name);
      let info: Stats;
      try {
        info = await lstat(entryPath);
      } catch (error) {
        throw catalogPathError(
          "Cannot inspect a recipe entry.",
          entryPath,
          "recipe-entry",
          "inspection-failed",
          errorCode(error),
        );
      }

      if (info.isSymbolicLink()) {
        throw catalogPathError(
          "Recipe content must not contain symbolic links.",
          entryPath,
          "recipe-entry",
          "symbolic-link",
        );
      }
      if (!info.isDirectory() && !info.isFile()) {
        throw catalogPathError(
          "Recipe content must contain only regular files and directories.",
          entryPath,
          "recipe-entry",
          "unsupported-file-type",
        );
      }

      const resolved = await resolveCatalogPath(entryPath, "recipe-entry");
      if (!isContained(root.realPath, resolved)) {
        throw catalogPathError(
          "Recipe content resolves outside its recipe directory.",
          entryPath,
          "recipe-entry",
          "outside-root",
        );
      }

      if (info.isDirectory()) {
        directories.push(resolved);
        continue;
      }

      const relativePath = normalizedRelative(root.realPath, resolved);
      if (files.size + 1 > limits.maxFilesPerRecipe) {
        throw limitError(
          "Recipe file count exceeds the configured limit.",
          "recipe-files",
          limits.maxFilesPerRecipe,
          files.size + 1,
          root.path,
        );
      }
      if (info.size > limits.maxFileBytes) {
        throw limitError(
          "Recipe file exceeds the configured byte limit.",
          "file-bytes",
          limits.maxFileBytes,
          info.size,
          entryPath,
        );
      }

      totalBytes += info.size;
      if (totalBytes > limits.maxRecipeBytes) {
        throw limitError(
          "Recipe content exceeds the configured total byte limit.",
          "recipe-bytes",
          limits.maxRecipeBytes,
          totalBytes,
          root.path,
        );
      }
      files.set(relativePath, {
        path: entryPath,
        realPath: resolved,
        relativePath,
        stat: info,
      });
    }
  }

  return {
    path: root.path,
    realPath: root.realPath,
    files,
    totalBytes,
  };
}

function sameFile(expected: Stats, actual: Stats): boolean {
  const identityMatches =
    expected.ino === 0 ||
    actual.ino === 0 ||
    (expected.dev === actual.dev && expected.ino === actual.ino);
  return identityMatches && expected.size === actual.size && expected.mtimeMs === actual.mtimeMs;
}

async function readCatalogFile(
  file: CatalogFile,
  recipeRoot: string,
  limits: CatalogLoadLimits,
): Promise<string> {
  let before: Stats;
  try {
    before = await lstat(file.path);
  } catch (error) {
    throw new AwfError("MISSING_FILE", `Missing required file: ${file.relativePath}.`, {
      path: file.path,
      scope: "recipe-file",
      causeCode: errorCode(error),
    });
  }
  if (before.isSymbolicLink()) {
    throw catalogPathError(
      "Recipe files must not be symbolic links.",
      file.path,
      "recipe-file",
      "symbolic-link",
    );
  }
  if (!before.isFile()) {
    throw catalogPathError(
      "Recipe files must be regular files.",
      file.path,
      "recipe-file",
      "not-file",
    );
  }
  if (before.size > limits.maxFileBytes) {
    throw limitError(
      "Recipe file exceeds the configured byte limit.",
      "file-bytes",
      limits.maxFileBytes,
      before.size,
      file.path,
    );
  }

  const resolved = await resolveCatalogPath(file.path, "recipe-file");
  if (resolved !== file.realPath || !isContained(recipeRoot, resolved)) {
    throw catalogPathError(
      "Recipe file changed or resolves outside its recipe directory.",
      file.path,
      "recipe-file",
      "path-changed",
    );
  }

  // Node has no portable openat/O_BENEATH API to pin every parent directory.
  // Revalidation plus O_NOFOLLOW on POSIX narrows, but cannot eliminate, the residual parent-swap race.
  const noFollowFlag = process.platform === "win32" ? 0 : constants.O_NOFOLLOW;
  let handle: FileHandle;
  try {
    handle = await open(file.path, constants.O_RDONLY | noFollowFlag);
  } catch (error) {
    if (errorCode(error) === "ELOOP") {
      throw catalogPathError(
        "Recipe files must not be symbolic links.",
        file.path,
        "recipe-file",
        "symbolic-link",
      );
    }
    throw catalogPathError(
      "Cannot open a recipe file.",
      file.path,
      "recipe-file",
      "open-failed",
      errorCode(error),
    );
  }

  try {
    const opened = await handle.stat();
    if (!opened.isFile()) {
      throw catalogPathError(
        "Recipe files must be regular files.",
        file.path,
        "recipe-file",
        "not-file",
      );
    }
    if (!sameFile(file.stat, opened) || !sameFile(before, opened)) {
      throw catalogPathError(
        "Recipe file changed while the catalog was loading.",
        file.path,
        "recipe-file",
        "file-changed",
      );
    }
    const openedPath = await resolveCatalogPath(file.path, "recipe-file");
    if (openedPath !== file.realPath || !isContained(recipeRoot, openedPath)) {
      throw catalogPathError(
        "Recipe file changed or resolves outside its recipe directory.",
        file.path,
        "recipe-file",
        "path-changed",
      );
    }

    const chunks: Buffer[] = [];
    let bytesReadTotal = 0;
    while (bytesReadTotal <= limits.maxFileBytes) {
      const remaining = limits.maxFileBytes + 1 - bytesReadTotal;
      const buffer = Buffer.allocUnsafe(Math.min(64 * 1024, remaining));
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, bytesReadTotal);
      if (bytesRead === 0) break;
      chunks.push(buffer.subarray(0, bytesRead));
      bytesReadTotal += bytesRead;
    }
    if (bytesReadTotal > limits.maxFileBytes) {
      throw limitError(
        "Recipe file exceeds the configured byte limit.",
        "file-bytes",
        limits.maxFileBytes,
        bytesReadTotal,
        file.path,
      );
    }
    const afterRead = await handle.stat();
    if (bytesReadTotal !== opened.size || !sameFile(opened, afterRead)) {
      throw catalogPathError(
        "Recipe file changed while the catalog was loading.",
        file.path,
        "recipe-file",
        "file-changed",
      );
    }
    return Buffer.concat(chunks, bytesReadTotal).toString("utf8");
  } catch (error) {
    if (error instanceof AwfError) throw error;
    throw catalogPathError(
      "Cannot read a recipe file.",
      file.path,
      "recipe-file",
      "read-failed",
      errorCode(error),
    );
  } finally {
    await handle.close();
  }
}

async function parseInspectedRecipe(
  inspected: InspectedRecipe,
  limits: CatalogLoadLimits,
): Promise<LoadedRecipeSource> {
  const contents = new Map<string, string>();
  for (const relative of recipeSourceFiles) {
    const file = inspected.files.get(relative);
    if (!file) {
      throw new AwfError("MISSING_FILE", `Missing required file: ${relative}.`, {
        path: path.join(inspected.path, relative),
        scope: "recipe-file",
      });
    }
    const content = await readCatalogFile(file, inspected.realPath, limits);
    if (incompleteMarkers.some((marker) => marker.test(content))) {
      throw new AwfError("INVALID_RECIPE", `${relative} contains an incomplete scaffold marker.`, {
        path: file.path,
        scope: "recipe-file",
        reason: "incomplete-marker",
      });
    }
    contents.set(relative, content);
  }

  const metadata = contents.get("recipe.yml") as string;
  let raw: unknown;
  try {
    raw = parse(metadata, { maxAliasCount: 0, uniqueKeys: true });
  } catch (error) {
    throw new AwfError("INVALID_RECIPE", `Malformed YAML: ${(error as Error).message}`);
  }
  const result = recipeSchema.safeParse(raw);
  if (!result.success)
    throw new AwfError("INVALID_RECIPE", "Recipe metadata is invalid.", {
      issues: result.error.issues,
    });
  if (path.basename(inspected.realPath) !== result.data.id)
    throw new AwfError("INVALID_RECIPE", "Recipe ID must match its directory name.");
  return {
    recipe: result.data,
    files: Object.fromEntries(contents) as Record<RecipeSourceFile, string>,
    totalBytes: inspected.totalBytes,
  };
}

export async function loadRecipe(
  recipeDirectory: string,
  options: CatalogLoadOptions = {},
): Promise<Recipe> {
  const limits = resolveCatalogLoadLimits(options);
  return (await parseInspectedRecipe(await inspectRecipe(recipeDirectory, limits), limits)).recipe;
}

export async function loadRecipeSource(
  recipeDirectory: string,
  options: CatalogLoadOptions = {},
): Promise<LoadedRecipeSource> {
  const limits = resolveCatalogLoadLimits(options);
  const inspected = await inspectRecipe(recipeDirectory, limits);
  try {
    return await parseInspectedRecipe(inspected, limits);
  } catch (error) {
    if (error instanceof AwfError) {
      throw new AwfError(error.code, error.message, {
        ...error.details,
        recipeBytes: inspected.totalBytes,
      });
    }
    throw error;
  }
}

export async function loadCatalog(
  recipesDirectory: string,
  options: CatalogLoadOptions = {},
): Promise<Recipe[]> {
  const limits = resolveCatalogLoadLimits(options);
  const root = await inspectDirectoryRoot(recipesDirectory, "catalog-directory");
  const recipeDirectories: string[] = [];
  let entries: Dir;
  try {
    entries = await opendir(root.realPath);
  } catch (error) {
    throw catalogPathError(
      "Cannot enumerate the catalog directory.",
      root.path,
      "catalog-directory",
      "enumeration-failed",
      errorCode(error),
    );
  }

  for await (const entry of entries) {
    const entryPath = path.join(root.realPath, entry.name);
    let info: Stats;
    try {
      info = await lstat(entryPath);
    } catch (error) {
      throw catalogPathError(
        "Cannot inspect a catalog entry.",
        entryPath,
        "catalog-entry",
        "inspection-failed",
        errorCode(error),
      );
    }
    if (info.isSymbolicLink()) {
      throw catalogPathError(
        "Catalog entries must not be symbolic links.",
        entryPath,
        "catalog-entry",
        "symbolic-link",
      );
    }
    if (!info.isDirectory()) continue;

    recipeDirectories.push(entryPath);
    if (recipeDirectories.length > limits.maxRecipes) {
      throw limitError(
        "Catalog recipe count exceeds the configured limit.",
        "catalog-recipes",
        limits.maxRecipes,
        recipeDirectories.length,
        root.path,
      );
    }
  }

  const inspected = await mapWithConcurrency(recipeDirectories, limits.concurrency, (directory) =>
    inspectRecipe(directory, limits, root.realPath),
  );
  const catalogBytes = inspected.reduce((total, recipe) => total + recipe.totalBytes, 0);
  if (catalogBytes > limits.maxCatalogBytes) {
    throw limitError(
      "Catalog content exceeds the configured total byte limit.",
      "catalog-bytes",
      limits.maxCatalogBytes,
      catalogBytes,
      root.path,
    );
  }

  const recipes = await mapWithConcurrency(
    inspected,
    limits.concurrency,
    async (recipe) => (await parseInspectedRecipe(recipe, limits)).recipe,
  );
  const ids = new Set<string>();
  for (const recipe of recipes) {
    if (ids.has(recipe.id))
      throw new AwfError("INVALID_RECIPE", `Duplicate recipe ID: ${recipe.id}.`);
    ids.add(recipe.id);
  }
  return recipes.sort((left, right) => left.id.localeCompare(right.id));
}

export interface RecipeFilters {
  category?: string;
  agent?: AgentId;
  tag?: string;
  support?: SupportStatus;
  compatibility?: RecipeCompatibilityStatus;
}
export function filterRecipes(recipes: readonly Recipe[], filters: RecipeFilters): Recipe[] {
  return recipes.filter(
    (recipe) =>
      (!filters.category || recipe.category === filters.category) &&
      (!filters.tag || recipe.tags.includes(filters.tag)) &&
      (!filters.compatibility ||
        (filters.agent !== undefined &&
          recipe.agents[filters.agent].bundle_compatibility === filters.compatibility)) &&
      (!filters.support ||
        (filters.agent !== undefined && adapters[filters.agent].support === filters.support)),
  );
}
