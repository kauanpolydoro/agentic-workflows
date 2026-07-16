import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkMarkdownLinks } from "./check-links.js";

describe("VitePress link boundaries", () => {
  it("rejects source links that escape docs even when the repository file exists", async () => {
    const repository = await mkdtemp(path.join(os.tmpdir(), "awf-doc-links-"));
    const docs = path.join(repository, "docs");
    const page = path.join(docs, "launch/reference.md");
    const source = path.join(repository, "recipes/example/examples/input.md");
    await mkdir(path.dirname(page), { recursive: true });
    await mkdir(path.dirname(source), { recursive: true });
    await writeFile(page, "# Reference\n\n[Input](../../recipes/example/examples/input.md)\n");
    await writeFile(source, "# Input\n");

    await expect(checkMarkdownLinks([page], docs, repository)).resolves.toEqual([
      "docs/launch/reference.md: ../../recipes/example/examples/input.md escapes the VitePress source directory",
    ]);
  });

  it("accepts published catalog links and validates their anchors", async () => {
    const repository = await mkdtemp(path.join(os.tmpdir(), "awf-doc-links-"));
    const docs = path.join(repository, "docs");
    const page = path.join(docs, "launch/reference.md");
    const catalog = path.join(docs, "catalog/example.md");
    await mkdir(path.dirname(page), { recursive: true });
    await mkdir(path.dirname(catalog), { recursive: true });
    await writeFile(page, "# Reference\n\n[Input](../catalog/example#complete-example-input)\n");
    await writeFile(catalog, "# Example\n\n## Complete example input\n");

    await expect(checkMarkdownLinks([page, catalog], docs, repository)).resolves.toEqual([]);
  });
});
