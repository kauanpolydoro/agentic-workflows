import type {
  ExecutionMode,
  GeneratedCatalogRecipe,
  RecipeCompatibilityStatus,
  SupportStatus,
} from "@kauanpolydoro/agentic-workflows-core";
import type { RegisteredAdapterId } from "@kauanpolydoro/agentic-workflows-core/adapter-registry";
import {
  adapterRegistry,
  deriveAdapterSupport,
} from "@kauanpolydoro/agentic-workflows-core/adapter-registry";

type AllOr<T extends string> = T | "all";
type VerificationStage = "installation" | "execution" | "outcome";
type VerificationStatus =
  GeneratedCatalogRecipe["agents"][RegisteredAdapterId]["verification"][VerificationStage]["status"];

export interface CatalogFilters {
  query: string;
  category: string;
  executionMode: AllOr<ExecutionMode>;
  adapter: AllOr<RegisteredAdapterId>;
  compatibility: AllOr<RecipeCompatibilityStatus>;
  support: AllOr<SupportStatus>;
  installation: AllOr<VerificationStatus>;
  execution: AllOr<VerificationStatus>;
  outcome: AllOr<VerificationStatus>;
}

const registeredAdapterIds = Object.keys(adapterRegistry) as RegisteredAdapterId[];

export const adapterOptions = registeredAdapterIds
  .map((id) => ({
    id,
    label: adapterRegistry[id].displayName,
    support: deriveAdapterSupport(adapterRegistry[id]),
  }))
  .sort((left, right) => left.label.localeCompare(right.label));

export const supportOptions = [...new Set(adapterOptions.map((adapter) => adapter.support))].sort();

export function createDefaultCatalogFilters(): CatalogFilters {
  return {
    query: "",
    category: "all",
    executionMode: "all",
    adapter: "all",
    compatibility: "compatible",
    support: "all",
    installation: "all",
    execution: "all",
    outcome: "all",
  };
}

export function resetCatalogFilters(filters: CatalogFilters): void {
  Object.assign(filters, createDefaultCatalogFilters());
}

export function hasActiveCatalogFilters(filters: CatalogFilters): boolean {
  const defaults = createDefaultCatalogFilters();
  return Object.entries(defaults).some(
    ([key, value]) => filters[key as keyof CatalogFilters] !== value,
  );
}

function matchesText(recipe: GeneratedCatalogRecipe, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean);
  if (terms.length === 0) return true;

  const searchable = [
    recipe.id,
    recipe.title,
    recipe.summary,
    recipe.category,
    recipe.execution_mode,
    ...recipe.tags,
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => searchable.includes(term));
}

function matchesVerificationStage(
  recipe: GeneratedCatalogRecipe,
  adapterId: RegisteredAdapterId,
  stage: VerificationStage,
  expected: AllOr<VerificationStatus>,
): boolean {
  return expected === "all" || recipe.agents[adapterId].verification[stage].status === expected;
}

function matchesAdapterDimensions(
  recipe: GeneratedCatalogRecipe,
  filters: CatalogFilters,
): boolean {
  const candidates = filters.adapter === "all" ? registeredAdapterIds : [filters.adapter];

  return candidates.some((adapterId) => {
    const recipeAdapter = recipe.agents[adapterId];
    const support = deriveAdapterSupport(adapterRegistry[adapterId]);
    return (
      (filters.compatibility === "all" ||
        recipeAdapter.bundle_compatibility === filters.compatibility) &&
      (filters.support === "all" || support === filters.support) &&
      matchesVerificationStage(recipe, adapterId, "installation", filters.installation) &&
      matchesVerificationStage(recipe, adapterId, "execution", filters.execution) &&
      matchesVerificationStage(recipe, adapterId, "outcome", filters.outcome)
    );
  });
}

export function filterCatalog(
  recipes: readonly GeneratedCatalogRecipe[],
  filters: CatalogFilters,
): GeneratedCatalogRecipe[] {
  return recipes.filter(
    (recipe) =>
      matchesText(recipe, filters.query) &&
      (filters.category === "all" || recipe.category === filters.category) &&
      (filters.executionMode === "all" || recipe.execution_mode === filters.executionMode) &&
      matchesAdapterDimensions(recipe, filters),
  );
}

export function catalogResultMessage(count: number): string {
  if (count === 0) return "No workflows match the selected filters.";
  return `${count} ${count === 1 ? "workflow matches" : "workflows match"} the selected filters.`;
}
