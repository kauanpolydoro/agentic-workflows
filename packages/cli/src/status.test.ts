import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { installRecipe } from "./install.js";
import { inspectInstallations, summarizeInstallations } from "./status.js";

const catalog = path.resolve("recipes");
const recipe = path.join(catalog, "review-pull-request");
const temporaryDirectories: string[] = [];

async function temporaryTarget(): Promise<string> {
  const target = await mkdtemp(path.join(os.tmpdir(), "awf-status-"));
  temporaryDirectories.push(target);
  return target;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("installation status", () => {
  it("summarizes every health state without discarding the total", () => {
    expect(
      summarizeInstallations([
        { id: "one", status: "healthy", agent: null, recipeVersion: null, files: 1, issue: null },
        { id: "two", status: "drifted", agent: null, recipeVersion: null, files: 1, issue: null },
        { id: "three", status: "invalid", agent: null, recipeVersion: null, files: 0, issue: null },
      ]),
    ).toEqual({ total: 3, healthy: 1, drifted: 1, invalid: 1 });
  });

  it("reports empty, healthy, and drifted targets", async () => {
    const target = await temporaryTarget();
    expect(await inspectInstallations(catalog, target)).toEqual([]);
    const manifest = await installRecipe(recipe, target, {
      agent: "codex",
      force: false,
      dryRun: false,
    });

    expect(await inspectInstallations(catalog, target)).toMatchObject([
      {
        id: "review-pull-request",
        status: "healthy",
        agent: "codex",
        files: manifest.files.length,
        issue: null,
      },
    ]);

    const entrypoint = path.join(target, manifest.entrypoint);
    await writeFile(entrypoint, `${await readFile(entrypoint, "utf8")}local edit\n`);
    expect(await inspectInstallations(catalog, target, "review-pull-request")).toMatchObject([
      {
        id: "review-pull-request",
        status: "drifted",
        issue: { files: [{ file: manifest.entrypoint, state: "modified" }] },
      },
    ]);
  });

  it("rejects a symlinked installation manifest directory", async () => {
    const target = await temporaryTarget();
    const external = await temporaryTarget();
    await mkdir(path.join(target, ".agentic-workflows"));
    await symlink(external, path.join(target, ".agentic-workflows", "installations"), "dir");

    await expect(inspectInstallations(catalog, target)).rejects.toMatchObject({
      code: "INVALID_PATH",
    });
  });
});
