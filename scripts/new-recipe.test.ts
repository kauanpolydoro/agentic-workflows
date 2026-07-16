import { mkdtemp, mkdir, readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { outputContractSchema } from "../packages/core/src/output-contract.js";
import { recipeSchema } from "../packages/core/src/schema.js";
import { scaffoldRecipe } from "./new-recipe.js";

async function recipesRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "awf-scaffold-"));
  const recipes = path.join(root, "recipes");
  await mkdir(recipes);
  return recipes;
}

describe("recipe scaffolder", () => {
  it("creates the complete v3 bundle only after validating staging", async () => {
    const recipes = await recipesRoot();
    const directory = await scaffoldRecipe({ id: "bounded-example", recipesDirectory: recipes });
    const files = (await readdir(directory, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) =>
        path.relative(directory, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"),
      )
      .sort();
    expect(files).toEqual([
      "README.md",
      "checklist.md",
      "examples/expected-output.md",
      "examples/input.md",
      "output.schema.json",
      "recipe.yml",
      "workflow.md",
    ]);
    expect(
      recipeSchema.parse(
        parse(await readFile(path.join(directory, "recipe.yml"), "utf8"), {
          maxAliasCount: 0,
          uniqueKeys: true,
        }),
      ).schema_version,
    ).toBe(3);
    expect(
      outputContractSchema.parse(
        JSON.parse(await readFile(path.join(directory, "output.schema.json"), "utf8")) as unknown,
      ).type,
    ).toBe("string");
  });

  it("refuses an existing destination without modifying it", async () => {
    const recipes = await recipesRoot();
    const first = await scaffoldRecipe({ id: "bounded-example", recipesDirectory: recipes });
    const before = await readFile(path.join(first, "recipe.yml"), "utf8");
    await expect(
      scaffoldRecipe({ id: "bounded-example", recipesDirectory: recipes }),
    ).rejects.toThrow(/already exists/);
    await expect(readFile(path.join(first, "recipe.yml"), "utf8")).resolves.toBe(before);
  });

  it("removes staging after an injected intermediate failure", async () => {
    const recipes = await recipesRoot();
    await expect(
      scaffoldRecipe({
        id: "bounded-example",
        recipesDirectory: recipes,
        onFileWritten(relative) {
          if (relative === "checklist.md") throw new Error("injected failure");
        },
      }),
    ).rejects.toThrow("injected failure");
    expect(await readdir(recipes)).toEqual([]);
  });
});
