import { readFile } from "node:fs/promises";
import {
  type GeneratedCatalogRecipe,
  type RecipeCompatibilityStatus,
  generatedCatalogRecipeSchema,
} from "@kauanpolydoro/agentic-workflows-core";
import {
  adapterRegistry,
  deriveAdapterSupport,
} from "@kauanpolydoro/agentic-workflows-core/adapter-registry";
import { describe, expect, it } from "vitest";
import generatedCatalog from "../../../../generated/catalog.json";
import {
  type CatalogFilters,
  catalogResultMessage,
  createDefaultCatalogFilters,
  filterCatalog,
  hasActiveCatalogFilters,
  resetCatalogFilters,
} from "./catalog-filter";

const recipes = generatedCatalogRecipeSchema.array().parse(generatedCatalog);

function filters(overrides: Partial<CatalogFilters> = {}): CatalogFilters {
  return { ...createDefaultCatalogFilters(), ...overrides };
}

function recipeWithCompatibility(
  recipe: GeneratedCatalogRecipe,
  adapter: keyof GeneratedCatalogRecipe["agents"],
  compatibility: RecipeCompatibilityStatus,
): GeneratedCatalogRecipe {
  return {
    ...recipe,
    agents: {
      ...recipe.agents,
      [adapter]: { ...recipe.agents[adapter], bundle_compatibility: compatibility },
    },
  };
}

function recipeWithVerification(
  recipe: GeneratedCatalogRecipe,
  adapter: keyof GeneratedCatalogRecipe["agents"],
  statuses: Partial<GeneratedCatalogRecipe["agents"][typeof adapter]["verification"]>,
): GeneratedCatalogRecipe {
  return {
    ...recipe,
    agents: {
      ...recipe.agents,
      [adapter]: {
        ...recipe.agents[adapter],
        verification: { ...recipe.agents[adapter].verification, ...statuses },
      },
    },
  };
}

describe("catalog filtering", () => {
  it("loads the real generated catalog through the current recipe schema", () => {
    expect(recipes).toHaveLength(generatedCatalog.length);
    expect(recipes.length).toBeGreaterThan(0);
  });

  it("combines text, category, adapter, compatibility, support, and verification with AND", () => {
    const result = filterCatalog(
      recipes,
      filters({
        query: "public release",
        category: "release",
        adapter: "codex",
        compatibility: "compatible",
        support: "supported",
        installation: "untested",
        execution: "untested",
        outcome: "untested",
      }),
    );

    expect(result.map((recipe) => recipe.id)).toEqual(["write-release-notes"]);
  });

  it.each(["unknown", "limited"] as const)(
    "does not count %s recipe compatibility as compatible",
    (compatibility) => {
      const source = recipes.find((recipe) => recipe.id === "write-release-notes");
      expect(source).toBeDefined();
      const changed = recipeWithCompatibility(
        source as GeneratedCatalogRecipe,
        "codex",
        compatibility,
      );

      expect(
        filterCatalog([changed], filters({ adapter: "codex", compatibility: "compatible" })),
      ).toEqual([]);
      expect(filterCatalog([changed], filters({ adapter: "codex", compatibility }))).toEqual([
        changed,
      ]);
    },
  );

  it("keeps global adapter support separate from recipe compatibility", () => {
    const source = recipes.find((recipe) => recipe.id === "write-release-notes");
    expect(source).toBeDefined();
    expect(deriveAdapterSupport(adapterRegistry.codex)).toBe("supported");

    expect(
      filterCatalog(
        [source as GeneratedCatalogRecipe],
        filters({ adapter: "codex", compatibility: "compatible", support: "supported" }),
      ),
    ).toEqual([source]);
    expect(
      filterCatalog(
        [source as GeneratedCatalogRecipe],
        filters({ adapter: "codex", compatibility: "compatible", support: "unknown" }),
      ),
    ).toEqual([]);
  });

  it.each([
    ["installation", "passing"],
    ["execution", "failing"],
    ["outcome", "not-applicable"],
  ] as const)("filters %s independently", (stage, status) => {
    const source = recipes[0];
    expect(source).toBeDefined();
    const changed = recipeWithVerification(source as GeneratedCatalogRecipe, "codex", {
      [stage]: { status },
    });

    expect(filterCatalog([changed], filters({ adapter: "codex", [stage]: status }))).toEqual([
      changed,
    ]);
    expect(filterCatalog([changed], filters({ adapter: "codex", [stage]: "untested" }))).toEqual(
      [],
    );
  });

  it("returns an explicit zero-result state", () => {
    const result = filterCatalog(recipes, filters({ query: "no-such-workflow-token" }));

    expect(result).toEqual([]);
    expect(catalogResultMessage(result.length)).toBe("No workflows match the selected filters.");
  });

  it("resets every filter to its safe default", () => {
    const current = filters({
      query: "security",
      category: "security",
      adapter: "cursor",
      compatibility: "unknown",
      support: "experimental",
      installation: "passing",
      execution: "failing",
      outcome: "not-applicable",
    });

    expect(hasActiveCatalogFilters(current)).toBe(true);
    resetCatalogFilters(current);

    expect(current).toEqual(createDefaultCatalogFilters());
    expect(hasActiveCatalogFilters(current)).toBe(false);
    expect(filterCatalog(recipes, current)).toHaveLength(recipes.length);
  });
});

describe("CatalogExplorer accessibility and no-JavaScript fallback", () => {
  it("associates every filter label with a native control and announces result changes", async () => {
    const source = await readFile(new URL("./CatalogExplorer.vue", import.meta.url), "utf8");
    const controlIds = [
      "catalog-query",
      "catalog-category",
      "catalog-adapter",
      "catalog-compatibility",
      "catalog-support",
      "catalog-installation",
      "catalog-execution",
      "catalog-outcome",
    ];

    for (const id of controlIds) {
      expect(source).toContain(`for="${id}"`);
      expect(source).toContain(`id="${id}"`);
    }
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain("<fieldset");
    expect(source).toContain("<legend");
    expect(source).toMatch(/<button[\s\S]*?type="button"/u);
  });

  it("keeps a static link for every generated recipe when JavaScript is unavailable", async () => {
    const page = await readFile(new URL("../../../catalog/index.md", import.meta.url), "utf8");

    for (const recipe of recipes) {
      expect(page).toContain(`[${recipe.title}](./${recipe.id})`);
    }
  });
});
