import { mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { catalogRoot, findProjectRoot, generatedCatalogPath } from "./context.js";

describe("project-root discovery", () => {
  it("prefers the enclosing repository over a nested package manifest", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-root-"));
    await mkdir(path.join(root, ".git"));
    const nested = path.join(root, "packages", "nested", "src");
    await mkdir(nested, { recursive: true });
    await writeFile(path.join(root, "packages", "nested", "package.json"), "{}\n");
    await expect(findProjectRoot(nested)).resolves.toBe(root);
  });

  it("uses the repository root from a nested pnpm workspace package", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-workspace-root-"));
    await mkdir(path.join(root, ".git"));
    await writeFile(path.join(root, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n");
    const nested = path.join(root, "packages", "nested", "src");
    await mkdir(nested, { recursive: true });
    await writeFile(path.join(root, "packages", "nested", "package.json"), "{}\n");

    await expect(findProjectRoot(nested)).resolves.toBe(root);
  });

  it("prefers the enclosing repository over a nested initialized project", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-root-"));
    await mkdir(path.join(root, ".git"));
    const project = path.join(root, "nested");
    const start = path.join(project, "src");
    await mkdir(path.join(project, ".agentic-workflows"), { recursive: true });
    await mkdir(start);
    await writeFile(path.join(project, ".agentic-workflows", "config.yml"), "schema_version: 1\n");
    await expect(findProjectRoot(start)).resolves.toBe(root);
  });

  it("uses an initialized project when no repository marker exists", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-root-"));
    const start = path.join(root, "project", "src");
    await mkdir(path.join(root, "project", ".agentic-workflows"), { recursive: true });
    await mkdir(start);
    await writeFile(
      path.join(root, "project", ".agentic-workflows", "config.yml"),
      "schema_version: 1\n",
    );
    await expect(findProjectRoot(start)).resolves.toBe(path.join(root, "project"));
  });

  it("uses a package marker only when explicitly enabled", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-root-"));
    const start = path.join(root, "package", "src");
    await mkdir(start, { recursive: true });
    await writeFile(path.join(root, "package", "package.json"), "{}\n");
    await expect(findProjectRoot(start)).resolves.toBe(start);
    await expect(findProjectRoot(start, { allowPackageRoot: true })).resolves.toBe(
      path.join(root, "package"),
    );
  });

  it("honors an explicit project root", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-root-"));
    const start = path.join(root, "nested");
    await mkdir(start);
    await expect(findProjectRoot(start, { explicitRoot: root })).resolves.toBe(root);
  });

  it("rejects explicit roots that are files or symbolic links", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-invalid-root-"));
    const file = path.join(root, "file");
    await writeFile(file, "not a directory\n");
    await expect(findProjectRoot(file, { explicitRoot: file })).rejects.toThrow("real directory");

    const linked = path.join(root, "linked");
    await symlink(root, linked, "dir");
    await expect(findProjectRoot(linked, { explicitRoot: linked })).rejects.toThrow(
      "real directory",
    );
  });

  it("accepts a worktree .git file as a repository marker", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-root-"));
    const start = path.join(root, "src");
    await mkdir(start);
    await writeFile(path.join(start, ".git"), "not a directory\n");
    await expect(findProjectRoot(start)).resolves.toBe(start);
  });
});

describe("packaged catalog locations", () => {
  it("supports explicit source and generated catalog paths", () => {
    const source = process.env.AWF_CATALOG_ROOT;
    const generated = process.env.AWF_GENERATED_CATALOG_PATH;
    process.env.AWF_CATALOG_ROOT = "relative-recipes";
    process.env.AWF_GENERATED_CATALOG_PATH = "relative-catalog.json";
    try {
      expect(catalogRoot()).toBe(path.resolve("relative-recipes"));
      expect(generatedCatalogPath()).toBe(path.resolve("relative-catalog.json"));
    } finally {
      if (source === undefined) delete process.env.AWF_CATALOG_ROOT;
      else process.env.AWF_CATALOG_ROOT = source;
      if (generated === undefined) delete process.env.AWF_GENERATED_CATALOG_PATH;
      else process.env.AWF_GENERATED_CATALOG_PATH = generated;
    }
  });

  it("uses packaged catalog defaults when overrides are absent", () => {
    const source = process.env.AWF_CATALOG_ROOT;
    const generated = process.env.AWF_GENERATED_CATALOG_PATH;
    delete process.env.AWF_CATALOG_ROOT;
    delete process.env.AWF_GENERATED_CATALOG_PATH;
    try {
      expect(catalogRoot()).toMatch(/catalog$/);
      expect(generatedCatalogPath()).toMatch(/catalog\.json$/);
    } finally {
      if (source === undefined) delete process.env.AWF_CATALOG_ROOT;
      else process.env.AWF_CATALOG_ROOT = source;
      if (generated === undefined) delete process.env.AWF_GENERATED_CATALOG_PATH;
      else process.env.AWF_GENERATED_CATALOG_PATH = generated;
    }
  });
});
