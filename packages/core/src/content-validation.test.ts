import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOG_LOAD_LIMITS } from "./catalog.js";
import { validateCatalogContent, validateRecipeContent } from "./content-validation.js";
import { MAX_RECIPE_FILE_BYTES } from "./fs-security.js";

interface FixtureCase {
  name: string;
  kind: string;
  expected: string | null;
}

const fixtureCases = JSON.parse(
  await readFile(path.resolve("packages/core/test-fixtures/content-validation/cases.json"), "utf8"),
) as FixtureCase[];

async function fixture(kind: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "awf-content-"));
  const directory = path.join(root, "recipes", "write-release-notes");
  await cp(path.resolve("recipes/write-release-notes"), directory, { recursive: true });
  await cp(path.resolve("docs/quality"), path.join(root, "docs", "quality"), { recursive: true });
  await cp(path.resolve("docs/guide"), path.join(root, "docs", "guide"), { recursive: true });
  const replace = async (file: string, search: string | RegExp, value: string) => {
    const target = path.join(directory, file);
    await writeFile(target, (await readFile(target, "utf8")).replace(search, value));
  };
  const append = async (file: string, value: string) => {
    const target = path.join(directory, file);
    await writeFile(target, `${await readFile(target, "utf8")}\n${value}\n`);
  };

  if (kind === "remove-evidence-inventory")
    await replace("examples/input.md", "## Evidence inventory", "## Source records");
  if (kind === "append-unknown-evidence")
    await writeFile(
      path.join(directory, "examples/expected-output.md"),
      `${await readFile(path.join(directory, "examples/expected-output.md"), "utf8")}\nUnsupported claim. [E99]\n`,
    );
  if (kind === "duplicate-evidence") await replace("examples/input.md", /### E1\s+/, "### E2 ");
  if (kind === "remove-output-evidence")
    await replace("examples/expected-output.md", /\bE\d+\b/g, "source");
  if (kind === "remove-input-synthetic-label") {
    const target = path.join(directory, "examples/input.md");
    await writeFile(
      target,
      (await readFile(target, "utf8")).replace(/\b(?:fictional|synthetic)\b/gi, "illustrative"),
    );
  }
  if (kind === "remove-output-synthetic-label") {
    const target = path.join(directory, "examples/expected-output.md");
    await writeFile(
      target,
      (await readFile(target, "utf8")).replace(/\b(?:fictional|synthetic)\b/gi, "illustrative"),
    );
  }
  if (kind === "empty-objective")
    await replace(
      "workflow.md",
      /## Objective\n[\s\S]*?\n## When to use/,
      "## Objective\n\n## When to use",
    );
  if (kind === "append-placeholder")
    await writeFile(
      path.join(directory, "README.md"),
      `${await readFile(path.join(directory, "README.md"), "utf8")}\nTODO\n`,
    );
  if (kind === "empty-approval")
    await replace(
      "workflow.md",
      /## Human approval gates\n[\s\S]*?\n## Expected output/,
      "## Human approval gates\n\n## Expected output",
    );
  if (kind === "empty-guardrail")
    await replace(
      "workflow.md",
      /## Safety guardrails\n[\s\S]*?\n## Human approval gates/,
      "## Safety guardrails\n\n## Human approval gates",
    );
  if (kind === "trivial-output")
    await writeFile(
      path.join(directory, "examples/expected-output.md"),
      "# Expected output\n\nEverything passed.\n",
    );
  if (kind === "remove-canonical") await rm(path.join(directory, "workflow.md"));
  if (kind === "broken-link")
    await writeFile(
      path.join(directory, "README.md"),
      `${await readFile(path.join(directory, "README.md"), "utf8")}\n[Missing](./missing.md)\n`,
    );
  if (kind === "duplicate-title")
    await writeFile(
      path.join(directory, "checklist.md"),
      `${await readFile(path.join(directory, "checklist.md"), "utf8")}\n# Duplicate title\n`,
    );
  if (kind === "nonconditional-decision")
    await replace("workflow.md", /(^## Decision points\s+\n\s*)- If\b/m, "$1- Review whether");
  if (kind === "trivial-checklist")
    await writeFile(
      path.join(directory, "checklist.md"),
      "# Checklist\n\n- [ ] Review evidence.\n",
    );
  if (kind === "incoherent-verification-readme")
    await replace(
      "README.md",
      /## Verification status\n[\s\S]*?\n## Limitations/,
      "## Verification status\n\nValidation is available.\n\n## Limitations",
    );
  if (kind === "empty-readme-required-section")
    await replace(
      "README.md",
      /## Required evidence\n[\s\S]*?\n## Produced artifacts/,
      "## Required evidence\n\n## Produced artifacts",
    );
  if (kind === "unbounded-phrase")
    await writeFile(
      path.join(directory, "README.md"),
      `${await readFile(path.join(directory, "README.md"), "utf8")}\nApply best practices.\n`,
    );
  if (kind === "unpaired-recovery") await replace("workflow.md", "**R6:**", "**R7:**");
  if (kind === "invalid-output-schema")
    await writeFile(path.join(directory, "output.schema.json"), "{\n");
  if (kind === "missing-workflow-section")
    await replace("workflow.md", "## Optional inputs", "## Supplementary inputs");
  if (kind === "unrepresented-required-input")
    await replace(
      "recipe.yml",
      "    - release identity with version, previous version, draft or final status, audience, and responsible roles",
      "    - immutable unicorn registry with checksum certificate",
    );
  if (kind === "unrepresented-output")
    await replace(
      "recipe.yml",
      "  - public release-notes.md with visible status, reader-relevant changes, limitations, and approved upgrade actions",
      "  - signed deployment beacon inventory",
    );
  if (kind === "unrepresented-forbidden-action")
    await replace(
      "recipe.yml",
      "    - inventing shipped changes, contributors, commands, measurements, compatibility, or verification results",
      "    - rotating production encryption keys",
    );
  if (kind === "unrepresented-approval")
    await replace(
      "recipe.yml",
      "    - repository maintainer approval for required upgrade instructions",
      "    - legal owner approval for a trademark transfer",
    );
  if (kind === "orphan-recovery")
    await replace(
      "workflow.md",
      "\n## Example\n",
      "\n- **R99:** Escalate the synthetic orphan recovery record.\n\n## Example\n",
    );
  if (kind === "duplicate-failure-id")
    await replace(
      "workflow.md",
      "- **F2:** A publishable artifact",
      "- **F1:** A duplicate boundary failure record.\n- **F2:** A publishable artifact",
    );
  if (kind === "duplicate-recovery-id")
    await replace(
      "workflow.md",
      "- **R2:** Rebuild the artifact",
      "- **R1:** Repeat the synthetic boundary recovery.\n- **R2:** Rebuild the artifact",
    );
  if (kind === "missing-readme-section")
    await replace("README.md", "## Limitations", "## Constraints");
  if (kind === "checklist-copies-workflow")
    await append(
      "checklist.md",
      "## Copied actions\n\n- [ ] Copy the release identity, audience, responsible roles, and full comparison revisions into a release evidence ledger.\n- [ ] Resolve the revisions and record the ancestry result beside the comparison range.",
    );
  if (kind === "descriptive-output")
    await writeFile(
      path.join(directory, "examples/expected-output.md"),
      `The output will include two complete files.\n\n${await readFile(
        path.join(directory, "examples/expected-output.md"),
        "utf8",
      )}`,
    );
  if (kind === "trivial-evidence-record")
    await replace(
      "examples/input.md",
      /(### E1\s+(?:-|:)[^\n]*\n)[\s\S]*?(?=\n### E2\s+(?:-|:))/,
      "$1\n---\n",
    );
  if (kind === "missing-evidence-definitions")
    await replace("examples/input.md", /^### E/gm, "### Source E");
  if (kind === "invalid-link-encoding") await append("README.md", "[Invalid](%ZZ)");
  if (kind === "absolute-filesystem-link") await append("README.md", "[Absolute](/etc/passwd)");
  if (kind === "broken-link-anchor")
    await append("README.md", "[Missing anchor](./workflow.md#not-present)");
  if (kind === "too-many-links")
    await append(
      "README.md",
      Array.from(
        { length: 257 },
        (_, index) => `[External ${index}](https://example.test/${index})`,
      ).join("\n"),
    );
  if (kind === "unsafe-gemini-shell-workflow")
    await append("workflow.md", "Unsafe consumer macro: !{git status}");
  if (kind === "unsafe-gemini-file-checklist")
    await append("checklist.md", "```text\nUnsafe consumer macro: @{private.txt}\n```");
  if (kind === "unsafe-opencode-shell-input")
    await append("examples/input.md", "Unsafe consumer macro: !`git status`");
  if (kind === "unsafe-opencode-file-workflow")
    await append("workflow.md", "Unsafe consumer macro: @src/private.txt");
  if (kind === "unsafe-claude-shell-output")
    await append("examples/expected-output.md", "Unsafe consumer macro: !`git status`");
  if (kind === "tilde-fenced-title")
    await append("checklist.md", "~~~markdown\n# Non-material title\n~~~");
  return directory;
}

describe("content validation fixtures", () => {
  it.each(fixtureCases)("validates $name", async ({ kind, expected }) => {
    const issues = await validateRecipeContent(await fixture(kind));
    if (expected === null) expect(issues).toEqual([]);
    else expect(issues.map((issue) => issue.code)).toContain(expected);
  });

  it.each([
    ["unsafe-gemini-shell-workflow", "gemini-cli", "!{...}"],
    ["unsafe-gemini-file-checklist", "gemini-cli", "@{...}"],
    ["unsafe-opencode-shell-input", "opencode", "!`...`"],
    ["unsafe-opencode-file-workflow", "opencode", "@path"],
    ["unsafe-claude-shell-output", "claude-code", "!`...`"],
  ] as const)("rejects %s", async (kind, agent, syntax) => {
    const issues = await validateRecipeContent(await fixture(kind));
    expect(
      issues.some(
        (issue) =>
          issue.code === "UNSAFE_ADAPTER_INTERPOLATION" &&
          issue.message.includes(agent) &&
          issue.message.includes(syntax),
      ),
    ).toBe(true);
  });

  it("ignores titles inside tilde-fenced code", async () => {
    const issues = await validateRecipeContent(await fixture("tilde-fenced-title"));
    expect(issues.map((issue) => issue.code)).not.toContain("INVALID_TITLE_COUNT");
  });

  it("accepts directory links, angle-bracket targets, and explicit anchors", async () => {
    const directory = await fixture("valid");
    const readme = path.join(directory, "README.md");
    await writeFile(
      readme,
      `${await readFile(readme, "utf8")}\n[Recipe directory](.)\n[Workflow](<workflow.md#produce-evidence-backed-release-notes>)\n`,
    );

    await expect(validateRecipeContent(directory)).resolves.toEqual([]);
  });

  it("rejects an oversized required recipe file before reading it", async () => {
    const directory = await fixture("valid");
    await writeFile(
      path.join(directory, "README.md"),
      Buffer.alloc(MAX_RECIPE_FILE_BYTES + 1, "a"),
    );

    await expect(validateRecipeContent(directory)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "README.md",
          code: "FILE_TOO_LARGE",
        }),
      ]),
    );
  });

  it("rejects a required recipe file that is a symbolic link", async () => {
    const directory = await fixture("valid");
    const external = path.join(path.dirname(path.dirname(directory)), "external-readme.md");
    await writeFile(external, "# External\n");
    await rm(path.join(directory, "README.md"));
    await symlink(external, path.join(directory, "README.md"));

    await expect(validateRecipeContent(directory)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "README.md",
          code: "INVALID_PATH",
        }),
      ]),
    );
  });

  it("rejects a relative Markdown link that escapes the repository boundary", async () => {
    const directory = await fixture("valid");
    const repositoryRoot = path.dirname(path.dirname(directory));
    const external = `${repositoryRoot}-external.md`;
    const relativeTarget = path.relative(directory, external).split(path.sep).join("/");
    try {
      await writeFile(external, "# External\n");
      await writeFile(
        path.join(directory, "README.md"),
        `${await readFile(path.join(directory, "README.md"), "utf8")}\n[Escape](${relativeTarget})\n`,
      );

      await expect(validateRecipeContent(directory)).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            file: "README.md",
            code: "UNSAFE_RELATIVE_LINK",
          }),
        ]),
      );
    } finally {
      await rm(external, { force: true });
    }
  });

  it("rejects a relative Markdown link through a symbolic link", async () => {
    const directory = await fixture("valid");
    const repositoryRoot = path.dirname(path.dirname(directory));
    const external = path.join(repositoryRoot, "external-link-target.md");
    const linked = path.join(repositoryRoot, "docs", "linked.md");
    try {
      await writeFile(external, "# External\n");
      await symlink(external, linked);
      await writeFile(
        path.join(directory, "README.md"),
        `${await readFile(path.join(directory, "README.md"), "utf8")}\n[Linked](../../docs/linked.md)\n`,
      );

      await expect(validateRecipeContent(directory)).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            file: "README.md",
            code: "UNSAFE_RELATIVE_LINK",
          }),
        ]),
      );
    } finally {
      await rm(linked, { force: true });
      await rm(external, { force: true });
    }
  });
});

describe("catalog content validation", () => {
  it("detects duplicate recipe titles", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-content-catalog-"));
    const recipes = path.join(root, "recipes");
    const first = await fixture("valid");
    const second = await fixture("valid");
    await cp(first, path.join(recipes, "write-release-notes"), { recursive: true });
    await cp(second, path.join(recipes, "duplicate-release-notes"), { recursive: true });
    const metadataPath = path.join(recipes, "duplicate-release-notes", "recipe.yml");
    await writeFile(
      metadataPath,
      (await readFile(metadataPath, "utf8")).replace(
        "id: write-release-notes",
        "id: duplicate-release-notes",
      ),
    );
    const issues = await validateCatalogContent(recipes);
    expect(issues.map((issue) => issue.code)).toContain("DUPLICATE_RECIPE_TITLE");
  });

  it("rejects symbolic-link recipe directories", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-content-catalog-"));
    const recipes = path.join(root, "recipes");
    const target = await fixture("valid");
    await mkdir(recipes);
    await symlink(target, path.join(recipes, "write-release-notes"));

    await expect(validateCatalogContent(recipes)).rejects.toMatchObject({
      code: "INVALID_PATH",
    });
  });

  it("rejects catalogs that exceed the recipe-count limit", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-content-catalog-"));
    const recipes = path.join(root, "recipes");
    await mkdir(recipes);
    await Promise.all(
      Array.from({ length: DEFAULT_CATALOG_LOAD_LIMITS.maxRecipes + 1 }, (_, index) =>
        mkdir(path.join(recipes, `recipe-${index}`)),
      ),
    );

    await expect(validateCatalogContent(recipes)).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
      details: {
        limit: DEFAULT_CATALOG_LOAD_LIMITS.maxRecipes,
      },
    });
  });

  it("rejects a catalog whose cumulative recipe bytes exceed the configured limit", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-content-catalog-"));
    const recipes = path.join(root, "recipes");
    const source = await fixture("valid");
    await cp(source, path.join(recipes, "write-release-notes"), { recursive: true });

    await expect(validateCatalogContent(recipes, { maxCatalogBytes: 1 })).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
      details: {
        resource: "catalog-bytes",
        limit: 1,
        actual: expect.any(Number),
      },
    });
  });
});
