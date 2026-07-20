import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { stringify } from "yaml";
import { validRecipeMetadata, validRequiredFileContents } from "./valid-recipe.fixture.js";
import { loadCatalog, loadRecipe } from "./catalog.js";
import { mapWithConcurrency } from "./catalog-concurrency.js";

const requiredFiles = [
  "recipe.yml",
  "workflow.md",
  "README.md",
  "checklist.md",
  "output.schema.json",
  "examples/input.md",
  "examples/expected-output.md",
] as const;

const temporaryRoots = new Set<string>();

const validMetadata = validRecipeMetadata;

async function temporaryDirectory(prefix: string): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix));
  temporaryRoots.add(directory);
  return directory;
}

async function createRecipe(catalog: string, id = "safe-review"): Promise<string> {
  const recipe = path.join(catalog, id);
  await mkdir(path.join(recipe, "examples"), { recursive: true });
  await writeFile(path.join(recipe, "recipe.yml"), stringify({ ...validMetadata, id }));
  for (const [file, content] of Object.entries(validRequiredFileContents))
    await writeFile(path.join(recipe, file), content);
  return recipe;
}

async function createCatalog(): Promise<{ catalog: string; recipe: string }> {
  const root = await temporaryDirectory("awf-catalog-security-");
  const catalog = path.join(root, "recipes");
  await mkdir(catalog);
  return { catalog, recipe: await createRecipe(catalog) };
}

async function expectInvalidSymlink(operation: Promise<unknown>): Promise<void> {
  await expect(operation).rejects.toMatchObject({
    code: "INVALID_PATH",
    details: {
      reason: "symbolic-link",
    },
  });
}

afterEach(async () => {
  for (const root of temporaryRoots) await rm(root, { recursive: true, force: true });
  temporaryRoots.clear();
});

describe("untrusted catalog paths", () => {
  it("loads and sorts a valid catalog", async () => {
    const { catalog } = await createCatalog();
    await createRecipe(catalog, "another-review");

    await expect(loadCatalog(catalog)).resolves.toEqual([
      expect.objectContaining({ id: "another-review" }),
      expect.objectContaining({ id: "safe-review" }),
    ]);
  });

  it("ignores regular files beside recipe directories", async () => {
    const { catalog } = await createCatalog();
    await writeFile(path.join(catalog, "README.txt"), "not a recipe directory\n");
    await expect(loadCatalog(catalog)).resolves.toHaveLength(1);
  });

  it("reports a required recipe file replaced by a directory as missing", async () => {
    const { recipe } = await createCatalog();
    await rm(path.join(recipe, "workflow.md"));
    await mkdir(path.join(recipe, "workflow.md"));
    await expect(loadRecipe(recipe)).rejects.toMatchObject({ code: "MISSING_FILE" });
  });

  it("rejects a catalog root that is a symbolic link", async () => {
    const { catalog } = await createCatalog();
    const linkedCatalog = path.join(await temporaryDirectory("awf-linked-catalog-"), "recipes");
    await symlink(catalog, linkedCatalog, "dir");

    await expectInvalidSymlink(loadCatalog(linkedCatalog));
  });

  it("rejects a recipe directory that is a symbolic link", async () => {
    const sourceRoot = await temporaryDirectory("awf-recipe-source-");
    const source = await createRecipe(sourceRoot);
    const catalog = path.join(await temporaryDirectory("awf-recipe-link-"), "recipes");
    await mkdir(catalog);
    await symlink(source, path.join(catalog, "safe-review"), "dir");

    await expectInvalidSymlink(loadCatalog(catalog));
  });

  it("rejects a symbolic-link recipe passed directly to loadRecipe", async () => {
    const { recipe } = await createCatalog();
    const linkedRecipe = path.join(
      await temporaryDirectory("awf-direct-recipe-link-"),
      "safe-review",
    );
    await symlink(recipe, linkedRecipe, "dir");

    await expectInvalidSymlink(loadRecipe(linkedRecipe));
  });

  it.each(requiredFiles)("rejects an external symlink at required file %s", async (relative) => {
    const { recipe } = await createCatalog();
    const externalRoot = await temporaryDirectory("awf-external-recipe-file-");
    const external = path.join(externalRoot, "external.txt");
    await writeFile(external, "external content\n");
    await rm(path.join(recipe, relative));
    await symlink(external, path.join(recipe, relative), "file");

    await expectInvalidSymlink(loadRecipe(recipe));
  });

  it("rejects a required file linked to another file inside the recipe", async () => {
    const { recipe } = await createCatalog();
    await rm(path.join(recipe, "workflow.md"));
    await symlink("README.md", path.join(recipe, "workflow.md"), "file");

    await expectInvalidSymlink(loadRecipe(recipe));
  });

  it("rejects a symbolic-link chain", async () => {
    const { recipe } = await createCatalog();
    const externalRoot = await temporaryDirectory("awf-symlink-chain-");
    const external = path.join(externalRoot, "external.md");
    await writeFile(external, "external content\n");
    await symlink(external, path.join(recipe, "middle.md"), "file");
    await rm(path.join(recipe, "workflow.md"));
    await symlink("middle.md", path.join(recipe, "workflow.md"), "file");

    await expectInvalidSymlink(loadRecipe(recipe));
  });

  it("rejects a symbolic-link directory inside a recipe", async () => {
    const { recipe } = await createCatalog();
    const externalExamples = await temporaryDirectory("awf-external-examples-");
    await rm(path.join(recipe, "examples"), { recursive: true });
    await symlink(externalExamples, path.join(recipe, "examples"), "dir");

    await expectInvalidSymlink(loadRecipe(recipe));
  });

  it("rejects a symbolic link in a future asset", async () => {
    const { recipe } = await createCatalog();
    const assets = path.join(recipe, "assets");
    await mkdir(assets);
    await symlink("../README.md", path.join(assets, "reference.md"), "file");

    await expectInvalidSymlink(loadRecipe(recipe));
  });
});

describe("catalog resource limits", () => {
  it("limits the number of recipes before loading their content", async () => {
    const { catalog } = await createCatalog();
    await createRecipe(catalog, "another-review");

    await expect(loadCatalog(catalog, { maxRecipes: 1 })).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
      details: { resource: "catalog-recipes", limit: 1, actual: 2 },
    });
  });

  it("limits files per recipe including future assets", async () => {
    const { recipe } = await createCatalog();
    await writeFile(path.join(recipe, "future-asset.md"), "future content\n");

    await expect(loadRecipe(recipe, { maxFilesPerRecipe: 6 })).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
      details: { resource: "recipe-files", limit: 6, actual: 7 },
    });
  });

  it("limits bytes for each file", async () => {
    const { recipe } = await createCatalog();

    await expect(loadRecipe(recipe, { maxFileBytes: 64 })).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
      details: { resource: "file-bytes", limit: 64 },
    });
  });

  it("limits total bytes for each recipe", async () => {
    const { recipe } = await createCatalog();

    await expect(loadRecipe(recipe, { maxRecipeBytes: 128 })).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
      details: { resource: "recipe-bytes", limit: 128 },
    });
  });

  it("limits total bytes for the catalog", async () => {
    const { catalog } = await createCatalog();

    await expect(loadCatalog(catalog, { maxCatalogBytes: 128 })).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
      details: { resource: "catalog-bytes", limit: 128 },
    });
  });

  it("rejects invalid limit configuration with structured details", async () => {
    const { catalog } = await createCatalog();

    await expect(loadCatalog(catalog, { concurrency: 0 })).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      details: { scope: "catalog-configuration", limit: "concurrency", value: 0 },
    });
  });

  it("never starts more mapping operations than the configured concurrency", async () => {
    let active = 0;
    let peak = 0;
    const result = await mapWithConcurrency(
      Array.from({ length: 12 }, (_, index) => index),
      3,
      async (value) => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise<void>((resolve) => setImmediate(resolve));
        active -= 1;
        return value * 2;
      },
    );

    expect(peak).toBe(3);
    expect(result).toEqual(Array.from({ length: 12 }, (_, index) => index * 2));
  });

  it("rejects invalid concurrency and propagates the first mapper failure", async () => {
    await expect(mapWithConcurrency([1], 0, async (value) => value)).rejects.toThrow(
      "Catalog concurrency must be a positive integer.",
    );
    const failure = new Error("synthetic mapper failure");
    await expect(
      mapWithConcurrency([1, 2, 3], 2, async (value) => {
        if (value === 2) throw failure;
        await new Promise<void>((resolve) => setImmediate(resolve));
        return value;
      }),
    ).rejects.toBe(failure);
  });

  it("waits for concurrent mapper failures without replacing the first failure", async () => {
    let releaseSecond!: () => void;
    let releaseFirstFailure!: () => void;
    const secondStarted = new Promise<void>((resolve) => {
      releaseSecond = resolve;
    });
    const firstFailureReady = new Promise<void>((resolve) => {
      releaseFirstFailure = resolve;
    });
    const firstFailure = new Error("first mapper failure");
    const secondFailure = new Error("second mapper failure");

    const operation = mapWithConcurrency([1, 2], 2, async (value) => {
      if (value === 1) {
        await secondStarted;
        releaseFirstFailure();
        throw firstFailure;
      }
      releaseSecond();
      await firstFailureReady;
      await Promise.resolve();
      throw secondFailure;
    });

    await expect(operation).rejects.toBe(firstFailure);
  });

  it("returns an empty result without invoking a mapper", async () => {
    let invoked = false;
    await expect(
      mapWithConcurrency([], 2, async () => {
        invoked = true;
        return 1;
      }),
    ).resolves.toEqual([]);
    expect(invoked).toBe(false);
  });
});
