import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { AwfError } from "@kauanpolydoro/agentic-workflows-core";
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

    await rm(entrypoint);
    expect(await inspectInstallations(catalog, target, "review-pull-request")).toMatchObject([
      {
        status: "drifted",
        issue: { files: [{ file: manifest.entrypoint, state: "missing" }] },
      },
    ]);
  });

  it("distinguishes absent metadata from unsafe target and metadata paths", async () => {
    const target = await temporaryTarget();
    expect(await inspectInstallations(catalog, path.join(target, "not-created"))).toEqual([]);

    const targetFile = path.join(target, "target-file");
    await writeFile(targetFile, "not a directory\n");
    await expect(inspectInstallations(catalog, targetFile)).rejects.toMatchObject({
      code: "INVALID_PATH",
    });

    const metadataFileTarget = path.join(target, "metadata-file-target");
    await mkdir(metadataFileTarget);
    await writeFile(path.join(metadataFileTarget, ".agentic-workflows"), "not a directory\n");
    await expect(inspectInstallations(catalog, metadataFileTarget)).rejects.toMatchObject({
      code: "INVALID_PATH",
    });

    const emptyMetadataTarget = path.join(target, "empty-metadata-target");
    await mkdir(path.join(emptyMetadataTarget, ".agentic-workflows"), { recursive: true });
    expect(await inspectInstallations(catalog, emptyMetadataTarget)).toEqual([]);
  });

  it("reports malformed manifest entries independently and in stable order", async () => {
    const target = await temporaryTarget();
    await installRecipe(recipe, target, {
      agent: "codex",
      force: false,
      dryRun: false,
    });
    const installationDirectory = path.join(target, ".agentic-workflows", "installations");
    const validManifest = await readFile(
      path.join(installationDirectory, "review-pull-request.yml"),
      "utf8",
    );
    await writeFile(path.join(installationDirectory, "Upper.yml"), validManifest);
    await writeFile(path.join(installationDirectory, "broken.yml"), "[invalid yaml\n");
    await writeFile(path.join(installationDirectory, "foreign.yml"), validManifest);
    await mkdir(path.join(installationDirectory, "directory.yml"));
    await writeFile(path.join(installationDirectory, "ignored.txt"), "ignored\n");

    const statuses = await inspectInstallations(catalog, target);
    expect(statuses.map((status) => status.id)).toEqual([
      "broken",
      "directory",
      "foreign",
      "review-pull-request",
      "Upper",
    ]);
    expect(statuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "Upper",
          status: "invalid",
          issue: expect.objectContaining({ code: "INVALID_MANIFEST" }),
        }),
        expect.objectContaining({
          id: "broken",
          status: "invalid",
          issue: expect.objectContaining({ code: "INVALID_MANIFEST" }),
        }),
        expect.objectContaining({
          id: "directory",
          status: "invalid",
          issue: expect.objectContaining({ code: "INVALID_PATH" }),
        }),
        expect.objectContaining({
          id: "foreign",
          status: "invalid",
          issue: expect.objectContaining({ code: "INVALID_MANIFEST" }),
        }),
      ]),
    );
    expect(await inspectInstallations(catalog, target, "not-installed")).toEqual([]);
  });

  it("marks an otherwise valid manifest invalid when its catalog recipe is unavailable", async () => {
    const target = await temporaryTarget();
    const emptyCatalog = await temporaryTarget();
    await installRecipe(recipe, target, {
      agent: "codex",
      force: false,
      dryRun: false,
    });

    expect(await inspectInstallations(emptyCatalog, target)).toMatchObject([
      {
        id: "review-pull-request",
        status: "invalid",
        issue: { code: "MISSING_FILE" },
      },
    ]);
  });

  it("normalizes unexpected validator failures without aborting status inspection", async () => {
    const target = await temporaryTarget();
    await installRecipe(recipe, target, {
      agent: "codex",
      force: false,
      dryRun: false,
    });

    const malformedFiles = await inspectInstallations(catalog, target, undefined, {
      validateInstallation: async () => {
        throw new AwfError("MODIFIED_FILE", "malformed drift details", {
          files: [null, {}, { file: 42, state: "modified" }, { file: "workflow.md", state: 42 }],
        });
      },
    });
    expect(malformedFiles).toMatchObject([{ status: "invalid", issue: { code: "MODIFIED_FILE" } }]);
    expect(malformedFiles[0]?.issue).not.toHaveProperty("files");

    const codedObject = await inspectInstallations(catalog, target, undefined, {
      validateInstallation: async () => {
        throw { code: "E_SYNTHETIC" };
      },
    });
    expect(codedObject).toMatchObject([
      {
        status: "invalid",
        issue: { code: "E_SYNTHETIC", message: "[object Object]" },
      },
    ]);

    const primitive = await inspectInstallations(catalog, target, undefined, {
      validateInstallation: async () => {
        throw "synthetic failure";
      },
    });
    expect(primitive).toMatchObject([
      {
        status: "invalid",
        issue: { code: "UNKNOWN_ERROR", message: "synthetic failure" },
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
