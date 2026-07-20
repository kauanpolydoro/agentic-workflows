import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  type AgentId,
  adapters,
  hashContent,
  loadRecipe,
  type Manifest,
} from "@kauanpolydoro/agentic-workflows-core";
import { parse as parseToml } from "smol-toml";
import { describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import {
  createSyntheticV2MigrationRegistryForTest,
  installRecipe,
  planInstallRecipe,
  planRemoveRecipe,
  planUpdateRecipe,
  readManifest,
  removeRecipe,
  updateRecipe,
  validateInstallation,
} from "./install.js";

const recipeDirectory = path.resolve("recipes/review-pull-request");
const secondRecipeDirectory = path.resolve("recipes/reproduce-bug");
const recipeId = "review-pull-request";
const manifestPath = (target: string) =>
  path.join(target, ".agentic-workflows/installations/review-pull-request.yml");
const legacyEntrypoints: Record<AgentId, string> = {
  generic: ".agentic-workflows/workflows/review-pull-request.md",
  cursor: ".cursor/rules/review-pull-request.mdc",
  "gemini-cli": ".gemini/commands/review-pull-request.toml",
  opencode: ".opencode/commands/review-pull-request.md",
  "claude-code": ".claude/skills/review-pull-request/SKILL.md",
  codex: ".agents/skills/review-pull-request/SKILL.md",
};
const requiredBundleRoles = [
  "checklist",
  "entrypoint",
  "example-input",
  "example-output",
  "metadata",
  "output-schema",
] as const;

const manifestAttacks: Array<{
  name: string;
  mutate: (manifest: Manifest) => Manifest;
}> = [
  {
    name: "a .git path",
    mutate: (manifest) => ({
      ...manifest,
      files: manifest.files.map((file) =>
        file.role === "metadata" ? { ...file, path: ".git/config" } : file,
      ),
    }),
  },
  {
    name: "a source path",
    mutate: (manifest) => ({
      ...manifest,
      files: manifest.files.map((file) =>
        file.role === "metadata" ? { ...file, path: "src/index.ts" } : file,
      ),
    }),
  },
  {
    name: "another adapter namespace",
    mutate: (manifest) => ({
      ...manifest,
      files: manifest.files.map((file) =>
        file.role === "metadata"
          ? { ...file, path: ".cursor/rules/review-pull-request.mdc" }
          : file,
      ),
    }),
  },
  {
    name: "an unregistered missing member",
    mutate: (manifest) => ({
      ...manifest,
      files: manifest.files.map((file) =>
        file.role === "metadata"
          ? {
              ...file,
              path: ".agentic-workflows/workflows/review-pull-request/ghost.md",
            }
          : file,
      ),
    }),
  },
  {
    name: "a duplicate path",
    mutate: (manifest) => {
      const checklist = manifest.files.find((file) => file.role === "checklist");
      if (!checklist) throw new Error("Fixture bundle omitted its checklist.");
      return {
        ...manifest,
        files: manifest.files.map((file) =>
          file.role === "metadata" ? { ...file, path: checklist.path } : file,
        ),
      };
    },
  },
  {
    name: "a divergent recipe version",
    mutate: (manifest) => ({ ...manifest, recipe_version: "9.9.9" }),
  },
  {
    name: "a divergent adapter ID",
    mutate: (manifest) => ({ ...manifest, adapter: { ...manifest.adapter, id: "cursor" } }),
  },
  {
    name: "a divergent adapter version",
    mutate: (manifest) => ({ ...manifest, adapter: { ...manifest.adapter, version: "9.9.9" } }),
  },
];

function expectCompleteBundle(files: readonly { role: string }[], agent: AgentId): void {
  const expected = agent === "codex" ? [...requiredBundleRoles, "policy"] : requiredBundleRoles;
  expect(files.map((file) => file.role).sort()).toEqual([...expected].sort());
}

async function temporaryTarget(label: string): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), `awf ${label} path with spaces `));
}

async function missing(file: string): Promise<void> {
  await expect(stat(file)).rejects.toMatchObject({ code: "ENOENT" });
}

async function syntheticV2Migration(target: string): Promise<{
  recipeDirectory: string;
  source: Manifest;
  registry: ReturnType<typeof createSyntheticV2MigrationRegistryForTest>;
  legacyOutputPath: string;
  currentOutputPath: string;
}> {
  const installed = await installRecipe(recipeDirectory, target, {
    agent: "generic",
    force: false,
    dryRun: false,
  });
  const outputSchema = installed.files.find((file) => file.role === "output-schema");
  if (!outputSchema) throw new Error("Fixture bundle omitted its output schema.");
  const currentOutputPath = outputSchema.path;
  const legacyOutputPath = outputSchema.path.replace(
    /output\.schema\.json$/,
    "legacy-output.schema.json",
  );
  await rename(path.join(target, currentOutputPath), path.join(target, legacyOutputPath));
  const source: Manifest = {
    ...installed,
    recipe_version: "1.1.0",
    files: installed.files.map((file) =>
      file.role === "output-schema" ? { ...file, path: legacyOutputPath } : file,
    ),
  };
  await writeFile(manifestPath(target), stringify(source));

  const recipeRoot = await temporaryTarget("synthetic v2 recipe");
  const currentRecipeDirectory = path.join(recipeRoot, recipeId);
  await cp(recipeDirectory, currentRecipeDirectory, { recursive: true });
  const workflow = path.join(currentRecipeDirectory, "workflow.md");
  await writeFile(
    workflow,
    `${await readFile(workflow, "utf8")}\n<!-- synthetic migration target -->\n`,
  );
  const recipe = await loadRecipe(currentRecipeDirectory);
  const registry = createSyntheticV2MigrationRegistryForTest(source, {
    recipeVersion: recipe.version,
    adapter: { id: "generic", version: adapters.generic.version },
  });
  return {
    recipeDirectory: currentRecipeDirectory,
    source,
    registry,
    legacyOutputPath,
    currentOutputPath,
  };
}

describe("transactional installation lifecycle", () => {
  it("supports dry-run without writing", async () => {
    const target = await temporaryTarget("dry run");
    const manifest = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: true,
    });
    expectCompleteBundle(manifest.files, "generic");
    await missing(manifestPath(target));
    for (const file of manifest.files) await missing(path.join(target, file.path));
  });

  it("plans an installation with optional content without writing", async () => {
    const parent = await temporaryTarget("install plan parent");
    const target = path.join(parent, "missing target");

    const plan = await planInstallRecipe(
      recipeDirectory,
      target,
      {
        agent: "codex",
        force: false,
        dryRun: true,
      },
      { includeContent: true },
    );

    expect(plan.requiresForce).toBe(false);
    expect(plan.changes.create).toEqual(plan.manifest.files.map((file) => file.path).sort());
    expect(plan.changes.replace).toEqual([]);
    expect(plan.changes.unchanged).toEqual([]);
    expect(plan.proposedFiles).toHaveLength(plan.manifest.files.length);
    expect(plan.proposedFiles?.every((file) => file.content.length > 0)).toBe(true);
    await missing(target);
  });

  it("plans and applies an update without rewriting unchanged managed files", async () => {
    const target = await temporaryTarget("update dry run");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const originalManifest = await readFile(manifestPath(target), "utf8");
    const entrypoint = installed.files.find((file) => file.role === "entrypoint");
    expect(entrypoint).toBeDefined();
    const entrypointPath = path.join(target, entrypoint?.path ?? "missing");
    const originalEntrypoint = await readFile(entrypointPath, "utf8");

    const plan = await planUpdateRecipe(recipeDirectory, target, false);

    expect(plan.changes.create).toEqual([]);
    expect(plan.changes.retire).toEqual([]);
    expect(plan.changes.replace).toEqual([]);
    expect(plan.changes.unchanged).toEqual(installed.files.map((file) => file.path).sort());
    expect(plan.changes.modifiedManagedFiles).toEqual([]);
    expect(plan.changes.missingManagedFiles).toEqual([]);
    expect(await readFile(manifestPath(target), "utf8")).toBe(originalManifest);
    expect(await readFile(entrypointPath, "utf8")).toBe(originalEntrypoint);

    const mutatedPaths: string[] = [];
    await updateRecipe(recipeDirectory, target, false, undefined, {
      beforeWrite: (relative) => {
        mutatedPaths.push(relative);
      },
    });
    expect(mutatedPaths).toEqual([".agentic-workflows/installations/review-pull-request.yml"]);
    expect(await readFile(entrypointPath, "utf8")).toBe(originalEntrypoint);
  });

  it("does not create a missing target during dry-run or manifest reads", async () => {
    const parent = await temporaryTarget("missing dry run parent");
    const target = path.join(parent, "target that does not exist");
    const manifest = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: true,
    });
    expectCompleteBundle(manifest.files, "generic");
    await missing(target);
    await expect(readManifest(recipeDirectory, target)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    await missing(target);
  });

  it("rejects a target whose existing ancestor is a regular file", async () => {
    const parent = await temporaryTarget("file ancestor");
    const file = path.join(parent, "not-a-directory");
    await writeFile(file, "blocking target creation\n");
    await expect(
      installRecipe(recipeDirectory, path.join(file, "nested"), {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).rejects.toMatchObject({ code: "INVALID_PATH" });
  });

  it("installs a complete bundle and blocks overwrite", async () => {
    const target = await temporaryTarget("overwrite");
    const manifest = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    expect(manifest.schema_version).toBe(2);
    expect(manifest.entrypoint).toBe(
      ".agentic-workflows/workflows/review-pull-request/workflow.md",
    );
    expectCompleteBundle(manifest.files, "generic");
    for (const file of manifest.files)
      expect(await readFile(path.join(target, file.path))).not.toBe("");
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it.each(["checklist", "output-schema"])(
    "protects a modified %s file on update and remove",
    async (role) => {
      const target = await temporaryTarget(`${role} protection`);
      const manifest = await installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
      });
      const auxiliary = manifest.files.find((file) => file.role === role);
      expect(auxiliary).toBeDefined();
      const file = path.join(target, auxiliary?.path ?? "missing");
      await writeFile(file, `${await readFile(file, "utf8")}local change\n`);
      const plan = await planUpdateRecipe(recipeDirectory, target, false);
      expect(plan.requiresForce).toBe(true);
      expect(plan.changes.modifiedManagedFiles).toContain(auxiliary?.path);
      await expect(updateRecipe(recipeDirectory, target, false)).rejects.toMatchObject({
        code: "MODIFIED_FILE",
      });
      await expect(removeRecipe(recipeDirectory, target, false)).rejects.toMatchObject({
        code: "MODIFIED_FILE",
      });
      await updateRecipe(recipeDirectory, target, true);
      await expect(removeRecipe(recipeDirectory, target, false)).resolves.toMatchObject({
        recipe: recipeId,
      });
      await missing(manifestPath(target));
    },
  );

  it("plans removal of modified managed files without deleting them", async () => {
    const target = await temporaryTarget("remove plan");
    const manifest = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const entrypoint = manifest.files.find((file) => file.role === "entrypoint");
    if (!entrypoint) throw new Error("Fixture bundle omitted its entrypoint.");
    const entrypointPath = path.join(target, entrypoint.path);
    await writeFile(entrypointPath, `${await readFile(entrypointPath, "utf8")}local edit\n`);

    const plan = await planRemoveRecipe(recipeDirectory, target, false);

    expect(plan.requiresForce).toBe(true);
    expect(plan.changes.remove).toEqual(manifest.files.map((file) => file.path).sort());
    expect(plan.changes.modifiedManagedFiles).toEqual([entrypoint.path]);
    expect(await readFile(entrypointPath, "utf8")).toContain("local edit");
    expect(await readFile(manifestPath(target), "utf8")).toContain("schema_version");
  });

  it("refuses to overwrite an unmanaged auxiliary file", async () => {
    const target = await temporaryTarget("unmanaged auxiliary");
    const checklist = path.join(
      target,
      ".agentic-workflows/workflows/review-pull-request/checklist.md",
    );
    await mkdir(path.dirname(checklist), { recursive: true });
    await writeFile(checklist, "keep this local file\n");
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await readFile(checklist, "utf8")).toBe("keep this local file\n");
    await missing(manifestPath(target));
  });

  it("preserves a file that appears between install planning and commit", async () => {
    const target = await temporaryTarget("install commit race");
    let racedPath: string | undefined;
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
        beforeMutation: async (relative, index) => {
          if (index !== 0) return;
          racedPath = path.join(target, relative);
          await mkdir(path.dirname(racedPath), { recursive: true });
          await writeFile(racedPath, "external writer won\n");
        },
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(racedPath).toBeDefined();
    expect(await readFile(racedPath ?? "missing", "utf8")).toBe("external writer won\n");
    await missing(manifestPath(target));
  });

  it("preserves a managed file changed between update planning and commit", async () => {
    const target = await temporaryTarget("update commit race");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const first = installed.files[0];
    const raced = installed.files[1];
    if (!first || !raced) throw new Error("Fixture bundle must contain at least two files.");
    const firstPath = path.join(target, first.path);
    const racedPath = path.join(target, raced.path);
    const firstBefore = await readFile(firstPath, "utf8");

    await expect(
      updateRecipe(recipeDirectory, target, true, undefined, {
        beforeMutation: async (_relative, index) => {
          if (index === 1) await writeFile(racedPath, "external update\n");
        },
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await readFile(firstPath, "utf8")).toBe(firstBefore);
    expect(await readFile(racedPath, "utf8")).toBe("external update\n");
  });

  it("does not overwrite an external change detected before a no-op commit", async () => {
    const target = await temporaryTarget("rollback commit race");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const first = installed.files[0];
    if (!first) throw new Error("Fixture bundle must contain a file.");
    const firstPath = path.join(target, first.path);

    await expect(
      updateRecipe(recipeDirectory, target, true, undefined, {
        beforeMutation: async (_relative, index) => {
          if (index !== 1) return;
          await writeFile(firstPath, "external change after replacement\n");
          throw new Error("Injected concurrent writer failure.");
        },
      }),
    ).rejects.toThrow("Injected concurrent writer failure.");
    expect(await readFile(firstPath, "utf8")).toBe("external change after replacement\n");
  });

  it("rejects an unregistered bundle-composition change", async () => {
    const target = await temporaryTarget("bundle composition migration");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "codex",
      force: false,
      dryRun: false,
    });
    const policy = installed.files.find((file) => file.role === "policy");
    expect(policy).toBeDefined();
    await rm(path.join(target, policy?.path ?? "missing"));
    await writeFile(
      manifestPath(target),
      stringify({
        ...installed,
        files: installed.files.filter((file) => file.role !== "policy"),
      }),
    );

    await expect(updateRecipe(recipeDirectory, target, false)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    await missing(path.join(target, policy?.path ?? "missing"));
  });

  it("rejects an exact historical v2 bundle without a registered migration", async () => {
    const target = await temporaryTarget("unregistered exact v2 migration");
    const migration = await syntheticV2Migration(target);
    await expect(updateRecipe(migration.recipeDirectory, target, true)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    await expect(readFile(path.join(target, migration.legacyOutputPath))).resolves.toBeDefined();
    await missing(path.join(target, migration.currentOutputPath));
  });

  it("migrates only an exact registered v2 bundle and preserves migration boundaries", async () => {
    const target = await temporaryTarget("registered bundle migration");
    const migration = await syntheticV2Migration(target);
    const legacyOutput = path.join(target, migration.legacyOutputPath);
    const currentOutput = path.join(target, migration.currentOutputPath);
    const originalLegacyOutput = await readFile(legacyOutput, "utf8");

    await writeFile(legacyOutput, `${originalLegacyOutput}\nlocal change\n`);
    await expect(
      updateRecipe(migration.recipeDirectory, target, false, undefined, {
        migrationRegistry: migration.registry,
      }),
    ).rejects.toMatchObject({ code: "MODIFIED_FILE" });
    await writeFile(legacyOutput, originalLegacyOutput);

    await writeFile(currentOutput, "unmanaged destination\n");
    await expect(
      updateRecipe(migration.recipeDirectory, target, true, undefined, {
        migrationRegistry: migration.registry,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await readFile(currentOutput, "utf8")).toBe("unmanaged destination\n");
    await rm(currentOutput);

    const plan = await planUpdateRecipe(migration.recipeDirectory, target, false, {
      migrationRegistry: migration.registry,
    });
    expect(plan.changes.create).toContain(migration.currentOutputPath);
    expect(plan.changes.retire).toContain(migration.legacyOutputPath);
    const migrated = await updateRecipe(migration.recipeDirectory, target, false, undefined, {
      migrationRegistry: migration.registry,
    });
    expect(migrated.migration).toMatchObject({
      from_schema_version: 2,
      from_recipe_version: migration.source.recipe_version,
      created_files: [migration.currentOutputPath],
      retired_files: [migration.legacyOutputPath],
    });
    await missing(legacyOutput);
    await expect(readManifest(migration.recipeDirectory, target)).resolves.toEqual(migrated);
  });

  it("rejects oversized managed files before hashing or rollback snapshots", async () => {
    const target = await temporaryTarget("oversized managed file");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const checklist = installed.files.find((file) => file.role === "checklist");
    expect(checklist).toBeDefined();
    await writeFile(
      path.join(target, checklist?.path ?? "missing"),
      Buffer.alloc(4 * 1024 * 1024 + 1),
    );
    await expect(updateRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
    });
  });

  it("reports missing managed files in an update plan", async () => {
    const target = await temporaryTarget("missing managed file");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const checklist = installed.files.find((file) => file.role === "checklist");
    expect(checklist).toBeDefined();
    await rm(path.join(target, checklist?.path ?? "missing"));

    const plan = await planUpdateRecipe(recipeDirectory, target, false);
    expect(plan.changes.missingManagedFiles).toContain(checklist?.path);
  });

  it("rejects an untrusted synthetic migration registry", async () => {
    const target = await temporaryTarget("untrusted migration registry");
    await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    await expect(
      planUpdateRecipe(recipeDirectory, target, false, {
        migrationRegistry: {} as never,
      }),
    ).rejects.toMatchObject({ code: "INVALID_MANIFEST" });
  });

  it("keeps synthetic migration registries test-only", async () => {
    const target = await temporaryTarget("migration registry environment");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      expect(() =>
        createSyntheticV2MigrationRegistryForTest(installed, {
          recipeVersion: installed.recipe_version,
          adapter: { id: "generic", version: adapters.generic.version },
        }),
      ).toThrow("lifecycle tests");
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previous;
    }
  });

  it("rolls back an interrupted install and releases its lock", async () => {
    const target = await temporaryTarget("install rollback");
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
        faultAfterMutation: 2,
      }),
    ).rejects.toThrow("Injected transaction failure");
    await missing(manifestPath(target));
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).resolves.toMatchObject({ recipe: recipeId });
  });

  it.each(["after-staging", "during-rename", "after-replacement", "before-manifest"] as const)(
    "rolls back and cleans staging after a %s fault",
    async (faultAtStage) => {
      const target = await temporaryTarget(`fault ${faultAtStage}`);
      await expect(
        installRecipe(recipeDirectory, target, {
          agent: "generic",
          force: false,
          dryRun: false,
          faultAtStage,
        }),
      ).rejects.toThrow("Injected transaction failure");
      await missing(manifestPath(target));
      await missing(path.join(target, ".agentic-workflows", "transactions"));
      await expect(
        installRecipe(recipeDirectory, target, {
          agent: "generic",
          force: false,
          dryRun: false,
        }),
      ).resolves.toMatchObject({ recipe: recipeId });
    },
  );

  it("recovers from an injected cleanup fault without leaving staging state", async () => {
    const target = await temporaryTarget("cleanup fault");
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
        faultAtStage: "during-cleanup",
      }),
    ).resolves.toMatchObject({ recipe: recipeId });
    await missing(path.join(target, ".agentic-workflows", "transactions"));
    await expect(validateInstallation(recipeDirectory, target)).resolves.toMatchObject({
      recipe: recipeId,
    });
  });

  it("rolls back an interrupted update without changing hashes", async () => {
    const target = await temporaryTarget("update rollback");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const before = new Map(
      await Promise.all(
        installed.files.map(
          async (file) =>
            [file.path, hashContent(await readFile(path.join(target, file.path)))] as const,
        ),
      ),
    );
    await expect(updateRecipe(recipeDirectory, target, false, 1)).rejects.toThrow(
      "Injected transaction failure",
    );
    for (const file of installed.files) {
      expect(hashContent(await readFile(path.join(target, file.path)))).toBe(before.get(file.path));
    }
    await expect(readManifest(recipeDirectory, target)).resolves.toMatchObject({
      recipe: recipeId,
    });
  });

  it("does not write when installation is already aborted", async () => {
    const target = await temporaryTarget("pre-aborted install");
    const controller = new AbortController();
    controller.abort();
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    await missing(manifestPath(target));
    await missing(path.join(target, ".agentic-workflows"));
  });

  it("rolls back when update is aborted between mutations", async () => {
    const target = await temporaryTarget("aborted update");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const before = new Map(
      await Promise.all(
        installed.files.map(
          async (file) => [file.path, await readFile(path.join(target, file.path))] as const,
        ),
      ),
    );
    const manifestBefore = await readFile(manifestPath(target));
    const controller = new AbortController();
    await expect(
      updateRecipe(recipeDirectory, target, true, undefined, {
        signal: controller.signal,
        beforeMutation: (_relative, index) => {
          if (index === 1) controller.abort();
        },
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    for (const file of installed.files) {
      expect(await readFile(path.join(target, file.path))).toEqual(before.get(file.path));
    }
    expect(await readFile(manifestPath(target))).toEqual(manifestBefore);
  });

  it("treats an existing target lock as authoritative and never steals it", async () => {
    const target = await temporaryTarget("lock");
    const lock = path.join(target, ".agentic-workflows/lifecycle.lock");
    await mkdir(path.dirname(lock), { recursive: true });
    await writeFile(lock, "active\n", { flag: "wx" });
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await readFile(lock, "utf8")).toBe("active\n");
  });

  it("serializes real concurrent lifecycle operations across recipes", async () => {
    const target = await temporaryTarget("concurrent target lock");
    let releaseFirst: (() => void) | undefined;
    let reportAcquired: (() => void) | undefined;
    const holdFirst = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const acquired = new Promise<void>((resolve) => {
      reportAcquired = resolve;
    });
    const first = installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
      onLockAcquired: async () => {
        reportAcquired?.();
        await holdFirst;
      },
    });
    await acquired;
    await expect(
      installRecipe(secondRecipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    releaseFirst?.();
    await expect(first).resolves.toMatchObject({ recipe: recipeId });
    await expect(
      installRecipe(secondRecipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).resolves.toMatchObject({ recipe: "reproduce-bug" });
  });

  it("rejects a manifest that names an arbitrary correctly hashed file", async () => {
    const target = await temporaryTarget("allowlist");
    const manifest = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const victim = path.join(target, "victim.txt");
    await writeFile(victim, "do not remove\n");
    const metadata = manifest.files.find((file) => file.role === "metadata");
    expect(metadata).toBeDefined();
    const forged = {
      ...manifest,
      files: manifest.files.map((file) =>
        file.path === metadata?.path
          ? { ...file, path: "victim.txt", hash: hashContent("do not remove\n") }
          : file,
      ),
    };
    await writeFile(manifestPath(target), stringify(forged));
    await expect(removeRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    expect(await readFile(victim, "utf8")).toBe("do not remove\n");
  });

  it("rejects a syntactically valid manifest for another recipe", async () => {
    const target = await temporaryTarget("wrong manifest recipe");
    const installed = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    await writeFile(manifestPath(target), stringify({ ...installed, recipe: "other-recipe" }));

    await expect(readManifest(recipeDirectory, target)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
  });

  it("rejects an installation manifest that cannot be parsed", async () => {
    const target = await temporaryTarget("malformed manifest");
    await mkdir(path.dirname(manifestPath(target)), { recursive: true });
    await writeFile(manifestPath(target), "schema_version: [\n");

    await expect(readManifest(recipeDirectory, target)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
  });

  it.each(manifestAttacks)("rejects a manifest containing $name", async ({ mutate }) => {
    const target = await temporaryTarget("manifest attack");
    const manifest = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const entrypoint = manifest.files.find((file) => file.role === "entrypoint");
    expect(entrypoint).toBeDefined();
    const entrypointPath = path.join(target, entrypoint?.path ?? "missing");
    const original = await readFile(entrypointPath, "utf8");
    await writeFile(manifestPath(target), stringify(mutate(manifest)));

    await expect(removeRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    expect(await readFile(entrypointPath, "utf8")).toBe(original);
  });

  it("rejects a forged hash for a canonical managed path", async () => {
    const target = await temporaryTarget("canonical manifest forgery");
    const manifest = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const metadata = manifest.files.find((file) => file.role === "metadata");
    expect(metadata).toBeDefined();
    const metadataPath = path.join(target, metadata?.path ?? "missing");
    await writeFile(metadataPath, "unmanaged replacement\n");
    await writeFile(
      manifestPath(target),
      stringify({
        ...manifest,
        files: manifest.files.map((file) =>
          file.role === "metadata"
            ? { ...file, hash: hashContent("unmanaged replacement\n") }
            : file,
        ),
      }),
    );

    await expect(removeRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    expect(await readFile(metadataPath, "utf8")).toBe("unmanaged replacement\n");
  });

  it("rejects traversal and role forgery before touching managed files", async () => {
    const target = await temporaryTarget("manifest forgery");
    const manifest = await installRecipe(recipeDirectory, target, {
      agent: "generic",
      force: false,
      dryRun: false,
    });
    const entrypoint = manifest.files.find((file) => file.role === "entrypoint");
    expect(entrypoint).toBeDefined();
    const entrypointPath = path.join(target, entrypoint?.path ?? "missing");
    const originalEntrypoint = await readFile(entrypointPath, "utf8");
    const forgedRole = {
      ...manifest,
      files: manifest.files.map((file) =>
        file.role === "metadata" ? { ...file, role: "policy" } : file,
      ),
    };
    await writeFile(manifestPath(target), stringify(forgedRole));
    await expect(removeRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    expect(await readFile(entrypointPath, "utf8")).toBe(originalEntrypoint);

    const forgedTraversal = {
      ...manifest,
      files: manifest.files.map((file) =>
        file.role === "metadata" ? { ...file, path: "../outside.txt" } : file,
      ),
    };
    await writeFile(manifestPath(target), stringify(forgedTraversal));
    await expect(updateRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    expect(await readFile(entrypointPath, "utf8")).toBe(originalEntrypoint);
  });

  it.each(Object.keys(adapters) as AgentId[])(
    "rejects an unregistered legacy %s bundle even at its canonical path",
    async (agent) => {
      const target = await temporaryTarget(`${agent} legacy migration`);
      const legacy = legacyEntrypoints[agent];
      const content = `legacy ${agent}\n`;
      await mkdir(path.dirname(path.join(target, legacy)), { recursive: true });
      await mkdir(path.dirname(manifestPath(target)), { recursive: true });
      await writeFile(path.join(target, legacy), content);
      await writeFile(
        manifestPath(target),
        stringify({
          schema_version: 1,
          recipe: recipeId,
          recipe_version: "1.1.0",
          agent,
          installed_at: "2026-01-01T00:00:00.000Z",
          target: ".",
          files: [{ path: legacy, hash: hashContent(content) }],
          cli_version: "0.1.0",
        }),
      );
      await expect(updateRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
        code: "INVALID_MANIFEST",
      });
      await expect(removeRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
        code: "INVALID_MANIFEST",
      });
      expect(await readFile(path.join(target, legacy), "utf8")).toBe(content);
    },
  );

  it("rejects a forged legacy path instead of treating it as a migration", async () => {
    const target = await temporaryTarget("forged legacy migration");
    const victim = path.join(target, "victim.txt");
    await writeFile(victim, "preserve\n");
    await mkdir(path.dirname(manifestPath(target)), { recursive: true });
    await writeFile(
      manifestPath(target),
      stringify({
        schema_version: 1,
        recipe: recipeId,
        recipe_version: "1.1.0",
        agent: "generic",
        installed_at: "2026-01-01T00:00:00.000Z",
        target: ".",
        files: [{ path: "victim.txt", hash: hashContent("preserve\n") }],
        cli_version: "0.1.0",
      }),
    );
    await expect(updateRecipe(recipeDirectory, target, true)).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    expect(await readFile(victim, "utf8")).toBe("preserve\n");
  });

  it("rejects symlink targets and managed-path parents", async () => {
    const realTarget = await temporaryTarget("real target");
    const linkedTarget = `${realTarget}-link`;
    await symlink(realTarget, linkedTarget, process.platform === "win32" ? "junction" : "dir");
    await expect(
      installRecipe(recipeDirectory, linkedTarget, {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).rejects.toMatchObject({ code: "INVALID_PATH" });

    const target = await temporaryTarget("managed symlink");
    const outside = await temporaryTarget("outside");
    await mkdir(path.join(target, ".agentic-workflows"), { recursive: true });
    await symlink(
      outside,
      path.join(target, ".agentic-workflows/workflows"),
      process.platform === "win32" ? "junction" : "dir",
    );
    await expect(
      installRecipe(recipeDirectory, target, {
        agent: "generic",
        force: false,
        dryRun: false,
      }),
    ).rejects.toMatchObject({ code: "INVALID_PATH" });
  });
});

describe.each(Object.keys(adapters) as AgentId[])("%s adapter installation contract", (agent) => {
  it("generates, installs, validates, updates, and removes its complete project bundle", async () => {
    const adapter = adapters[agent];
    const recipe = await loadRecipe(recipeDirectory);
    const target = await temporaryTarget(`${agent} contract`);
    const manifest = await installRecipe(recipeDirectory, target, {
      agent,
      force: false,
      dryRun: false,
    });
    expect(manifest.entrypoint).toBe(adapter.entrypoint(recipe));
    expect(manifest.adapter).toEqual({ id: agent, version: adapter.version });
    expectCompleteBundle(manifest.files, agent);
    expect(manifest.files.find((file) => file.role === "entrypoint")?.path).toBe(
      manifest.entrypoint,
    );
    for (const file of manifest.files)
      await expect(readFile(path.join(target, file.path))).resolves.toBeDefined();

    const entrypoint = await readFile(path.join(target, manifest.entrypoint), "utf8");
    const links = [...entrypoint.matchAll(/\]\((?!https?:|#)([^)]+)\)/g)].map((match) => match[1]);
    for (const link of links) {
      expect(link).toBeDefined();
      const linked = path.resolve(path.dirname(path.join(target, manifest.entrypoint)), link ?? "");
      await expect(stat(linked)).resolves.toMatchObject({});
    }
    if (agent === "gemini-cli") {
      const data = parseToml(entrypoint);
      expect(data.prompt).toContain("{{args}}");
    }
    if (agent === "codex") {
      const policy = manifest.files.find((file) => file.role === "policy");
      expect(parse(await readFile(path.join(target, policy?.path ?? "missing"), "utf8"))).toEqual({
        policy: { allow_implicit_invocation: false },
      });
    }
    await expect(readManifest(recipeDirectory, target)).resolves.toEqual(manifest);
    await expect(validateInstallation(recipeDirectory, target)).resolves.toEqual(manifest);
    await expect(updateRecipe(recipeDirectory, target, false)).resolves.toMatchObject({
      adapter: { id: agent },
    });
    await expect(removeRecipe(recipeDirectory, target, false)).resolves.toMatchObject({
      recipe: recipeId,
    });
    await missing(path.join(target, manifest.entrypoint));
  });
});
