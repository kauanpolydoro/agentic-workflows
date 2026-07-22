<script setup lang="ts">
import type { GeneratedCatalogRecipe } from "@kauanpolydoro/agentic-workflows-core";
import { computed, reactive } from "vue";
import {
  // biome-ignore lint/correctness/noUnusedImports: Vue template binding.
  adapterOptions,
  catalogResultMessage,
  createDefaultCatalogFilters,
  filterCatalog,
  hasActiveCatalogFilters,
  resetCatalogFilters,
  supportOptions,
} from "./catalog-filter";

const props = defineProps<{ recipes: GeneratedCatalogRecipe[] }>();
const filters = reactive(createDefaultCatalogFilters());

// biome-ignore lint/correctness/noUnusedVariables: Vue template binding.
const categories = computed(() =>
  [...new Set(props.recipes.map((recipe) => recipe.category))].sort(),
);
// biome-ignore lint/correctness/noUnusedVariables: Vue template binding.
const executionModes = computed(() =>
  [...new Set(props.recipes.map((recipe) => recipe.execution_mode))].sort(),
);
// biome-ignore lint/correctness/noUnusedVariables: Vue template binding.
const compatibilityOptions = computed(() =>
  [
    ...new Set(
      props.recipes.flatMap((recipe) =>
        Object.values(recipe.agents).map((entry) => entry.bundle_compatibility),
      ),
    ),
  ].sort(),
);
const verificationOptions = (stage: "installation" | "execution" | "outcome") =>
  computed(() => [
    ...new Set(
      props.recipes.flatMap((recipe) =>
        Object.values(recipe.agents).map((entry) => entry.verification[stage].status),
      ),
    ),
  ]);
// biome-ignore lint/correctness/noUnusedVariables: Vue template binding.
const installationOptions = verificationOptions("installation");
// biome-ignore lint/correctness/noUnusedVariables: Vue template binding.
const executionOptions = verificationOptions("execution");
// biome-ignore lint/correctness/noUnusedVariables: Vue template binding.
const outcomeOptions = verificationOptions("outcome");
const filteredRecipes = computed(() => filterCatalog(props.recipes, filters));
// biome-ignore lint/correctness/noUnusedVariables: Vue template binding.
const hasActiveFilters = computed(() => hasActiveCatalogFilters(filters));
// biome-ignore lint/correctness/noUnusedVariables: Vue template binding.
const resultMessage = computed(() => catalogResultMessage(filteredRecipes.value.length));
</script>

<template>
  <section class="catalog-explorer" aria-labelledby="catalog-filter-heading">
    <form class="filter-panel" role="search" @submit.prevent>
      <div class="filter-heading">
        <div>
          <h2 id="catalog-filter-heading">Filter workflows</h2>
          <p id="catalog-filter-help">
            Every filter you add narrows the list. By default, only compatible recipes are shown.
          </p>
        </div>
        <button
          class="reset-button"
          type="button"
          :disabled="!hasActiveFilters"
          @click="resetCatalogFilters(filters)"
        >
          Reset filters
        </button>
      </div>

      <fieldset class="filter-grid" aria-describedby="catalog-filter-help">
        <legend class="visually-hidden">Workflow filters</legend>
        <label class="search-filter" for="catalog-query">
          Search
          <input
            id="catalog-query"
            v-model="filters.query"
            type="search"
            placeholder="Review, security, migration..."
          />
        </label>

        <label for="catalog-category">
          Category
          <select id="catalog-category" v-model="filters.category">
            <option value="all">All categories</option>
            <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>

        <label for="catalog-execution-mode">
          Execution mode
          <select id="catalog-execution-mode" v-model="filters.executionMode">
            <option value="all">All execution modes</option>
            <option v-for="item in executionModes" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>

        <label for="catalog-adapter">
          Adapter
          <select id="catalog-adapter" v-model="filters.adapter">
            <option value="all">All adapters</option>
            <option v-for="item in adapterOptions" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label for="catalog-compatibility">
          Recipe compatibility
          <select id="catalog-compatibility" v-model="filters.compatibility">
            <option value="all">All compatibility states</option>
            <option v-for="item in compatibilityOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label for="catalog-support">
          Global adapter support
          <select id="catalog-support" v-model="filters.support">
            <option value="all">All support states</option>
            <option v-for="item in supportOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>

        <label for="catalog-installation">
          Installation evidence
          <select id="catalog-installation" v-model="filters.installation">
            <option value="all">All installation states</option>
            <option v-for="item in installationOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label for="catalog-execution">
          Execution evidence
          <select id="catalog-execution" v-model="filters.execution">
            <option value="all">All execution states</option>
            <option v-for="item in executionOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label for="catalog-outcome">
          Outcome review
          <select id="catalog-outcome" v-model="filters.outcome">
            <option value="all">All outcome states</option>
            <option v-for="item in outcomeOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>
      </fieldset>
    </form>

    <p class="result-count" role="status" aria-live="polite" aria-atomic="true">
      {{ resultMessage }}
    </p>

    <div v-if="filteredRecipes.length > 0" class="workflow-grid">
      <a
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="workflow-card"
        :href="`./${recipe.id}`"
      >
        <span class="card-index">
          {{ recipe.category }}<template v-if="recipe.execution_mode === 'autonomous'"> · autonomous design</template>
        </span>
        <h2>{{ recipe.title }}</h2>
        <p>{{ recipe.summary }}</p>
        <span class="card-link">Read the workflow <span aria-hidden="true">→</span></span>
      </a>
    </div>

    <div v-else class="empty-state">
      <h2>No matching workflows</h2>
      <p>Change one or more filters, or reset them to see the full catalog again.</p>
      <button type="button" class="reset-button" @click="resetCatalogFilters(filters)">
        Reset filters
      </button>
    </div>
  </section>
</template>

<style scoped>
.filter-panel {
  margin: 0;
}

.filter-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 12px;
}

.filter-heading h2 {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 20px;
}

.filter-heading p {
  margin: 4px 0 0;
  color: var(--vp-c-text-2);
}

.filter-grid {
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  margin: 0;
}

.search-filter {
  grid-column: span 2;
}

.reset-button {
  min-height: 40px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 3px;
  padding: 8px 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.reset-button:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}

.reset-button:focus-visible,
.filter-grid input:focus-visible,
.filter-grid select:focus-visible {
  outline: 3px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.reset-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.empty-state {
  border: 1px dashed var(--vp-c-divider);
  padding: 28px;
  text-align: center;
}

.empty-state h2 {
  margin-top: 0;
  border: 0;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 520px) {
  .filter-heading {
    flex-direction: column;
  }

  .search-filter {
    grid-column: auto;
  }
}
</style>
