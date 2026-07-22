import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { parse } from "yaml";
import {
  adapters,
  generateAdapterBundle,
  type RecipeBundleSources,
} from "../packages/core/src/adapters.js";
import { loadRecipeSource } from "../packages/core/src/catalog.js";
import {
  bundleFingerprintHash,
  generatedBundleFingerprint,
} from "../packages/core/src/bundle-fingerprint.js";
import { createManifest } from "../packages/core/src/manifest.js";
import { type AgentId, agentIds, type Recipe } from "../packages/core/src/schema.js";

const repository = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const biome = require.resolve("@biomejs/biome/bin/biome");
const sourceTag = "v0.2.2";
const sourceTagRef = "refs/tags/v0.2.2";
const sourceCommit = "8de51cb34e4494fd0b6478292027a153ea43293b";
const sourcePackageVersion = "0.2.2";
const targetPackageVersion = "0.3.0";
const targetTag = "v0.3.0";
const targetTagRef = "refs/tags/v0.3.0";
const expectedRecipeCount = 20;
const expectedAdapterCount = 6;
const registryFile = path.join(repository, "packages/cli/src/migrations/v0-2-2-to-v0-3-0.ts");
const fixtureFile = path.join(
  repository,
  "packages/cli/test-fixtures/v0.2.2-to-v0.3.0-write-release-notes-generic.json",
);
const serializerFiles = [
  "packages/core/src/adapter-registry.ts",
  "packages/core/src/adapters.ts",
  "packages/core/src/manifest.ts",
] as const;

interface HistoricalRecipe {
  recipe: Recipe;
  sources: RecipeBundleSources;
}

interface RetainedMigration {
  recipe: string;
  from_version: string;
  to_version: string;
  bundles: Record<AgentId, { from: string; to: string }>;
}

function git(args: string[]): string {
  const result = spawnSync("git", args, {
    cwd: repository,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  }
  return result.stdout;
}

function optionalCommit(ref: string): string | null {
  const result = spawnSync("git", ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], {
    cwd: repository,
    encoding: "utf8",
  });
  if (result.status === 0) return result.stdout.trim();
  if (result.status === 1 && result.stdout === "" && result.stderr === "") return null;
  throw new Error(result.stderr.trim() || `Could not resolve optional ref ${ref}.`);
}

function sourceAt(relative: string): string {
  return git(["show", `${sourceCommit}:${relative}`]);
}

function bundleSources(files: Readonly<Record<string, string>>): RecipeBundleSources {
  const required = (relative: string): string => {
    const value = files[relative];
    if (value === undefined) throw new Error(`Missing recipe source ${relative}.`);
    return value;
  };
  return {
    workflow: required("workflow.md"),
    checklist: required("checklist.md"),
    exampleInput: required("examples/input.md"),
    exampleOutput: required("examples/expected-output.md"),
    metadata: required("recipe.yml"),
    outputSchema: required("output.schema.json"),
  };
}

function historicalRecipe(id: string): HistoricalRecipe {
  const relative = (file: string) => `recipes/${id}/${file}`;
  const files = Object.fromEntries(
    [
      "recipe.yml",
      "workflow.md",
      "checklist.md",
      "examples/input.md",
      "examples/expected-output.md",
      "output.schema.json",
    ].map((file) => [file, sourceAt(relative(file))]),
  );
  const metadata = parse(files["recipe.yml"] ?? "", {
    maxAliasCount: 0,
    uniqueKeys: true,
  }) as unknown;
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    !("id" in metadata) ||
    metadata.id !== id ||
    !("version" in metadata) ||
    typeof metadata.version !== "string" ||
    !("summary" in metadata) ||
    typeof metadata.summary !== "string"
  ) {
    throw new Error(`Historical recipe metadata is invalid for ${id}.`);
  }
  return {
    recipe: metadata as Recipe,
    sources: bundleSources(files),
  };
}

async function currentRecipe(id: string): Promise<HistoricalRecipe> {
  const loaded = await loadRecipeSource(path.join(repository, "recipes", id));
  return {
    recipe: loaded.recipe,
    sources: bundleSources(loaded.files),
  };
}

function bundleHash(recipe: HistoricalRecipe, agent: AgentId): string {
  const bundle = generateAdapterBundle(recipe.recipe, recipe.sources, agent);
  return bundleFingerprintHash(generatedBundleFingerprint(recipe.recipe, bundle, agent));
}

async function migrations(): Promise<RetainedMigration[]> {
  const resolvedSourceCommit = git(["rev-parse", `${sourceTagRef}^{commit}`]).trim();
  if (resolvedSourceCommit !== sourceCommit) {
    throw new Error(`${sourceTag} resolved to unexpected commit ${resolvedSourceCommit}.`);
  }
  const historicalCliPackage = JSON.parse(sourceAt("packages/cli/package.json")) as {
    version?: unknown;
  };
  if (historicalCliPackage.version !== sourcePackageVersion) {
    throw new Error(
      `${sourceTag} CLI package version is ${String(historicalCliPackage.version)}, expected ${sourcePackageVersion}.`,
    );
  }
  const currentCliPackage = JSON.parse(
    await readFile(path.join(repository, "packages/cli/package.json"), "utf8"),
  ) as { version?: unknown };
  if (currentCliPackage.version !== targetPackageVersion) {
    throw new Error(
      `This retained registry is pinned to CLI ${targetPackageVersion}; preserve its target fingerprints before preparing ${String(currentCliPackage.version)}.`,
    );
  }
  if (agentIds.length !== expectedAdapterCount || new Set(agentIds).size !== agentIds.length) {
    throw new Error(`Expected ${expectedAdapterCount} unique adapters, found ${agentIds.length}.`);
  }
  for (const relative of serializerFiles) {
    if (sourceAt(relative) !== (await readFile(path.join(repository, relative), "utf8"))) {
      throw new Error(
        `${relative} changed after ${sourceTag}; retain a historical serializer before regenerating migrations.`,
      );
    }
  }

  const recipeIds = git(["ls-tree", "-d", "--name-only", `${sourceCommit}:recipes`])
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();
  if (recipeIds.length !== expectedRecipeCount || new Set(recipeIds).size !== recipeIds.length) {
    throw new Error(
      `${sourceTag} must contain ${expectedRecipeCount} unique recipes, found ${recipeIds.length}.`,
    );
  }
  const retained: RetainedMigration[] = [];
  for (const id of recipeIds) {
    const from = historicalRecipe(id);
    const to = await currentRecipe(id);
    if (from.recipe.version === to.recipe.version) {
      throw new Error(`${id} must change recipe version between retained migration endpoints.`);
    }
    const bundles = {} as Record<AgentId, { from: string; to: string }>;
    for (const agent of agentIds) {
      const fromHash = bundleHash(from, agent);
      const toHash = bundleHash(to, agent);
      if (fromHash === toHash) {
        throw new Error(`${id}:${agent} has identical source and target bundle fingerprints.`);
      }
      bundles[agent] = { from: fromHash, to: toHash };
    }
    retained.push({
      recipe: id,
      from_version: from.recipe.version,
      to_version: to.recipe.version,
      bundles,
    });
  }
  const migrationKeys = retained.flatMap((migration) =>
    agentIds.map((agent) => `${migration.recipe}:${agent}`),
  );
  const expectedMigrationCount = expectedRecipeCount * expectedAdapterCount;
  if (
    migrationKeys.length !== expectedMigrationCount ||
    new Set(migrationKeys).size !== expectedMigrationCount
  ) {
    throw new Error(
      `Expected ${expectedMigrationCount} unique retained migration edges, found ${migrationKeys.length}.`,
    );
  }
  return retained;
}

function registrySource(retained: readonly RetainedMigration[]): string {
  const source = `// Generated by scripts/generate-v022-v030-migrations.ts from ${sourceTag} (${sourceCommit}) to CLI ${targetPackageVersion}.\n// This release-pair registry is immutable after ${targetTag} exists.\n\nimport type { AgentId } from "@kauanpolydoro/agentic-workflows-core";\n\nexport interface RetainedV2Migration {\n  recipe: string;\n  from_version: string;\n  to_version: string;\n  bundles: Record<AgentId, { from: string; to: string }>;\n}\n\nexport const retainedV022ToV030Migrations = ${JSON.stringify(retained, undefined, 2)} as const satisfies readonly RetainedV2Migration[];\n`;
  const formatted = spawnSync(
    process.execPath,
    [biome, "format", "--stdin-file-path", registryFile],
    {
      cwd: repository,
      encoding: "utf8",
      input: source,
    },
  );
  if (formatted.status !== 0) {
    throw new Error(formatted.stderr.trim() || "Could not format the migration registry.");
  }
  return formatted.stdout;
}

function fixtureSource(retained: readonly RetainedMigration[]): string {
  const id = "write-release-notes";
  const migration = retained.find((candidate) => candidate.recipe === id);
  if (!migration) throw new Error(`Missing retained migration for ${id}.`);
  const from = historicalRecipe(id);
  const bundle = generateAdapterBundle(from.recipe, from.sources, "generic");
  const manifest = createManifest(
    from.recipe,
    adapters.generic,
    bundle,
    "0.2.2",
    new Date("2026-01-01T00:00:00.000Z"),
  );
  if (bundleHash(from, "generic") !== migration.bundles.generic.from) {
    throw new Error("The retained generic fixture does not match its migration fingerprint.");
  }
  return `${JSON.stringify(
    {
      migration_pair: "v0.2.2-to-v0.3.0",
      source_tag: sourceTag,
      source_commit: sourceCommit,
      target_package_version: targetPackageVersion,
      manifest,
      files: bundle.files,
    },
    undefined,
    2,
  )}\n`;
}

async function checkOrWrite(file: string, expected: string, check: boolean): Promise<void> {
  if (check) {
    const current = await readFile(file, "utf8").catch(() => "");
    if (current !== expected) throw new Error(`${path.relative(repository, file)} is stale.`);
    return;
  }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, expected);
}

async function verifyPublishedTarget(targetCommit: string): Promise<void> {
  const taggedCliPackage = JSON.parse(
    git(["show", `${targetCommit}:packages/cli/package.json`]),
  ) as { version?: unknown };
  if (taggedCliPackage.version !== targetPackageVersion) {
    throw new Error(
      `${targetTag} CLI package version is ${String(taggedCliPackage.version)}, expected ${targetPackageVersion}.`,
    );
  }
  for (const file of [registryFile, fixtureFile]) {
    const relative = path.relative(repository, file).split(path.sep).join("/");
    const published = git(["show", `${targetCommit}:${relative}`]);
    const retained = await readFile(file, "utf8").catch(() => "");
    if (retained !== published) {
      throw new Error(
        `${relative} differs from immutable ${targetTag} target ${targetCommit}; add a new versioned registry instead of rewriting published endpoints.`,
      );
    }
  }
}

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--check")) {
  throw new Error("Usage: generate-v022-v030-migrations.ts [--check]");
}
const check = args.includes("--check");
const publishedTargetCommit = optionalCommit(targetTagRef);
if (publishedTargetCommit !== null) {
  if (!check) {
    throw new Error(
      `${targetTag} already exists at ${publishedTargetCommit}; its retained migration endpoints are immutable. Add a new versioned registry for a later release.`,
    );
  }
  await verifyPublishedTarget(publishedTargetCommit);
  const currentCommit = git(["rev-parse", "HEAD^{commit}"]).trim();
  if (currentCommit === publishedTargetCommit) {
    const retained = await migrations();
    await checkOrWrite(registryFile, registrySource(retained), true);
    await checkOrWrite(fixtureFile, fixtureSource(retained), true);
    console.log(
      `Regenerated and verified 120 exact v0.2.2 to v0.3.0 migrations at ${targetTag} (${publishedTargetCommit}).`,
    );
  } else {
    console.log(
      `Verified 120 immutable v0.2.2 to v0.3.0 migrations against ${targetTag} (${publishedTargetCommit}).`,
    );
  }
} else {
  const retained = await migrations();
  await checkOrWrite(registryFile, registrySource(retained), check);
  await checkOrWrite(fixtureFile, fixtureSource(retained), check);
  console.log(
    `${check ? "Verified" : "Generated"} ${retained.length * agentIds.length} exact v0.2.2 bundle migrations and one E2E fixture for unpublished ${targetTag}.`,
  );
}
