import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generate, parseGenerationArguments } from "./generate.js";

const repository = path.resolve(import.meta.dirname, "..");
const recipeDocumentationDependencies = [
  "docs/decisions/0001-portable-core-and-data-only-recipes.md",
  "docs/guide/contributing.md",
  "docs/guide/autonomous-workflows.md",
  "docs/guide/security.md",
  "docs/guide/verification.md",
  "docs/compatibility.md",
  "docs/quality/recipe-quality-standard.md",
  "docs/research/adapter-sources.md",
] as const;

const autonomousExecutionInvariants = [
  {
    if: {
      properties: { execution_mode: { const: "autonomous" } },
      required: ["execution_mode"],
    },
    // biome-ignore lint/suspicious/noThenProperty: JSON Schema uses then as a conditional keyword.
    then: {
      required: ["autonomy", "agent_requirements"],
      properties: {
        agent_requirements: {
          type: "object",
          required: ["capabilities"],
          properties: {
            capabilities: {
              type: "array",
              contains: { const: "persistent-execution" },
              minContains: 1,
            },
          },
        },
      },
    },
  },
  {
    if: {
      properties: { execution_mode: { const: "supervised" } },
      required: ["execution_mode"],
    },
    // biome-ignore lint/suspicious/noThenProperty: JSON Schema uses then as a conditional keyword.
    then: { not: { required: ["autonomy"] } },
  },
] as const;

interface GeneratedJsonSchema {
  allOf?: unknown[];
  items?: GeneratedJsonSchema;
  properties?: {
    schema_version?: { const?: number };
    execution_mode?: { enum?: string[] };
  };
}

async function generationRepository(
  recipeIds: readonly string[] | "all" = ["write-release-notes"],
): Promise<string> {
  const target = await mkdtemp(path.join(os.tmpdir(), "awf-generation-"));
  if (recipeIds === "all") {
    await cp(path.join(repository, "recipes"), path.join(target, "recipes"), { recursive: true });
  } else {
    await mkdir(path.join(target, "recipes"));
    for (const id of recipeIds) {
      await cp(path.join(repository, "recipes", id), path.join(target, "recipes", id), {
        recursive: true,
      });
    }
  }
  await mkdir(path.join(target, "verification"));
  for (const relative of recipeDocumentationDependencies) {
    await mkdir(path.dirname(path.join(target, relative)), { recursive: true });
    await cp(path.join(repository, relative), path.join(target, relative));
  }
  return target;
}

async function filesBelow(directory: string): Promise<string[]> {
  try {
    return (await readdir(directory, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) =>
        path.relative(directory, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"),
      )
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

describe("generation targets", () => {
  it("parses one explicit target and rejects unknown arguments", () => {
    expect(parseGenerationArguments([])).toEqual({ target: "all", check: false });
    expect(parseGenerationArguments(["catalog", "--check"])).toEqual({
      target: "catalog",
      check: true,
    });
    expect(() => parseGenerationArguments(["unknown"])).toThrow(/Unknown generation target/);
    expect(() => parseGenerationArguments(["catalog", "schema"])).toThrow(/at most one target/);
    expect(() => parseGenerationArguments(["--force"])).toThrow(/Unknown generation option/);
  });

  it("keeps catalog, schema, documentation, and compatibility targets isolated", async () => {
    const catalogRepository = await generationRepository();
    await generate("catalog", { repository: catalogRepository });
    expect(await filesBelow(path.join(catalogRepository, "generated"))).toEqual([
      "catalog.d.ts",
      "catalog.json",
    ]);
    expect(await filesBelow(path.join(catalogRepository, "docs", "catalog"))).toEqual([]);

    const schemaRepository = await mkdtemp(path.join(os.tmpdir(), "awf-schema-generation-"));
    await generate("schema", { repository: schemaRepository });
    expect(await filesBelow(path.join(schemaRepository, "generated"))).toEqual([
      "catalog.schema.json",
      "recipe.schema.json",
      "verification.schema.json",
    ]);
    expect(await filesBelow(path.join(schemaRepository, "verification"))).toEqual(["schema.json"]);
    const recipeJsonSchema = JSON.parse(
      await readFile(path.join(schemaRepository, "generated", "recipe.schema.json"), "utf8"),
    ) as GeneratedJsonSchema;
    const catalogJsonSchema = JSON.parse(
      await readFile(path.join(schemaRepository, "generated", "catalog.schema.json"), "utf8"),
    ) as GeneratedJsonSchema;
    expect(recipeJsonSchema.properties?.schema_version?.const).toBe(4);
    expect(recipeJsonSchema.properties?.execution_mode?.enum).toEqual(["supervised", "autonomous"]);
    expect(recipeJsonSchema.allOf).toEqual(autonomousExecutionInvariants);
    expect(catalogJsonSchema.items?.allOf).toEqual(autonomousExecutionInvariants);

    const docsRepository = await generationRepository();
    await generate("docs", { repository: docsRepository });
    expect(await filesBelow(path.join(docsRepository, "generated"))).toEqual([]);
    expect(await filesBelow(path.join(docsRepository, "docs", "catalog"))).toHaveLength(2);

    const compatibilityRepository = await generationRepository();
    await generate("compatibility", { repository: compatibilityRepository });
    expect(await filesBelow(path.join(compatibilityRepository, "generated"))).toEqual([]);
    expect(await filesBelow(path.join(compatibilityRepository, "docs", "catalog"))).toEqual([]);
    expect(
      await readFile(path.join(compatibilityRepository, "docs", "compatibility.md"), "utf8"),
    ).toContain("# Adapter compatibility");
  });

  it("generates root-hosted documentation metadata without duplicate page URLs", async () => {
    const target = await generationRepository(["review-pull-request"]);
    const previousBase = process.env.DOCS_BASE;
    const previousOrigin = process.env.DOCS_ORIGIN;
    process.env.DOCS_BASE = "/";
    process.env.DOCS_ORIGIN = "https://docs.example.test";
    try {
      await generate("docs", { repository: target });
    } finally {
      if (previousBase === undefined) delete process.env.DOCS_BASE;
      else process.env.DOCS_BASE = previousBase;
      if (previousOrigin === undefined) delete process.env.DOCS_ORIGIN;
      else process.env.DOCS_ORIGIN = previousOrigin;
    }
    const recipePage = await readFile(
      path.join(target, "docs/catalog/review-pull-request.md"),
      "utf8",
    );
    expect(recipePage).not.toContain("https://docs.example.test");
    expect(recipePage).not.toContain("property: og:url");
    expect(recipePage).not.toContain("rel: canonical");

    process.env.DOCS_BASE = "/example-fork/";
    process.env.DOCS_ORIGIN = "https://example-owner.github.io";
    try {
      await expect(generate("docs", { repository: target, check: true })).resolves.toMatchObject({
        stale: [],
      });
    } finally {
      if (previousBase === undefined) delete process.env.DOCS_BASE;
      else process.env.DOCS_BASE = previousBase;
      if (previousOrigin === undefined) delete process.env.DOCS_ORIGIN;
      else process.env.DOCS_ORIGIN = previousOrigin;
    }
  });

  it("writes an integrity manifest for the complete generated artifact set", async () => {
    const target = await generationRepository("all");
    await generate("all", { repository: target });
    const manifest = JSON.parse(
      await readFile(path.join(target, "generated", "artifact-manifest.json"), "utf8"),
    ) as {
      schema_version: number;
      recipe_source_sha256: string;
      artifacts: Array<{ path: string; sha256: string }>;
    };
    expect(manifest.schema_version).toBe(1);
    expect(manifest.recipe_source_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.artifacts).toHaveLength(29);
    expect(new Set(manifest.artifacts.map((artifact) => artifact.path)).size).toBe(
      manifest.artifacts.length,
    );
    expect(manifest.artifacts.map((artifact) => artifact.path)).not.toContain(
      "generated/artifact-manifest.json",
    );
    expect(manifest.artifacts.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining([
        "generated/catalog.json",
        "generated/recipe.schema.json",
        "generated/catalog.schema.json",
        "generated/verification.schema.json",
        "verification/schema.json",
        "docs/catalog/index.md",
        "docs/compatibility.md",
      ]),
    );
    for (const artifact of manifest.artifacts) {
      const content = await readFile(path.join(target, artifact.path));
      expect(createHash("sha256").update(content).digest("hex"), artifact.path).toBe(
        artifact.sha256,
      );
    }
    const catalog = JSON.parse(
      await readFile(path.join(target, "generated", "catalog.json"), "utf8"),
    ) as Array<{ id: string; execution_mode: string; autonomy?: unknown }>;
    expect(catalog.find((recipe) => recipe.id === "resolve-github-issues")).toMatchObject({
      execution_mode: "autonomous",
      autonomy: { unattended_execution: true },
    });
    expect(
      catalog
        .filter((recipe) => recipe.id !== "resolve-github-issues")
        .every((recipe) => recipe.execution_mode === "supervised" && recipe.autonomy === undefined),
    ).toBe(true);
  });
});
