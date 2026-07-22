import { spawnSync } from "node:child_process";
import { lstat, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";
import { z } from "zod";
import { adapterRegistry, deriveAdapterSupport } from "../packages/core/src/adapter-registry.js";
import { loadCatalog } from "../packages/core/src/catalog.js";
import { validateCatalogContent } from "../packages/core/src/content-validation.js";
import {
  assertNoSymlink,
  readBoundedRegularFile,
  resolveInside,
} from "../packages/core/src/fs-security.js";
import { hashContent, hashNamedContent } from "../packages/core/src/manifest.js";
import {
  agentIds,
  type GeneratedCatalogRecipe,
  generatedCatalogRecipeSchema,
  type Recipe,
  recipeSchema,
  type VerificationEvidence,
  verificationEvidenceSchema,
} from "../packages/core/src/schema.js";

export type GenerationTarget = "all" | "catalog" | "schema" | "docs" | "compatibility";

const generationTargets = ["all", "catalog", "schema", "docs", "compatibility"] as const;
const recipeBundleFiles = [
  "recipe.yml",
  "workflow.md",
  "README.md",
  "checklist.md",
  "output.schema.json",
  "examples/input.md",
  "examples/expected-output.md",
] as const;
const structuralChecks = [
  "schema",
  "required-files",
  "content",
  "evidence-ids",
  "relative-links",
  "output-contract",
] as const;
const maximumEvidenceBytes = 1024 * 1024;
const maximumEvidenceArtifactBytes = 4 * 1024 * 1024;
const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const biomeCli = path.join(repositoryRoot, "node_modules", "@biomejs", "biome", "bin", "biome");

export interface LoadedEvidence {
  record: VerificationEvidence;
  relativePath: string;
  current: boolean;
  superseded: boolean;
}

interface GenerationOptions {
  repository?: string;
  check?: boolean;
}

class ArtifactWriter {
  readonly stale = new Set<string>();
  readonly expected = new Map<string, string>();

  constructor(
    private readonly repository: string,
    readonly check: boolean,
  ) {}

  async file(relative: string, content: string): Promise<void> {
    this.expected.set(relative, content);
    const target = path.join(this.repository, relative);
    if (this.check) {
      try {
        if ((await readFile(target, "utf8")) !== content) this.stale.add(relative);
      } catch {
        this.stale.add(relative);
      }
      return;
    }
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}

function generatedArtifactManifest(
  writer: ArtifactWriter,
  entries: readonly GeneratedCatalogRecipe[],
): string {
  const sourceHashes = Object.fromEntries(
    entries
      .map((entry) => [entry.id, entry.verification.structural.recipe_content_sha256] as const)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  const artifacts = [...writer.expected.entries()]
    .map(([artifactPath, content]) => ({ path: artifactPath, sha256: hashContent(content) }))
    .sort((left, right) => left.path.localeCompare(right.path));
  return json(
    {
      schema_version: 1,
      recipe_source_sha256: hashNamedContent(sourceHashes),
      artifacts,
    },
    "generated/artifact-manifest.json",
  );
}

function runs(requested: GenerationTarget, target: Exclude<GenerationTarget, "all">): boolean {
  return requested === "all" || requested === target;
}

export function parseGenerationArguments(args: readonly string[]): {
  target: GenerationTarget;
  check: boolean;
} {
  const positional = args.filter((argument) => !argument.startsWith("--"));
  const unknownFlags = args.filter(
    (argument) => argument.startsWith("--") && argument !== "--check",
  );
  if (unknownFlags.length > 0) throw new Error(`Unknown generation option: ${unknownFlags[0]}.`);
  if (positional.length > 1) throw new Error("Generation accepts at most one target.");
  const target = positional[0] ?? "all";
  if (!generationTargets.includes(target as GenerationTarget)) {
    throw new Error(`Unknown generation target: ${target}.`);
  }
  return { target: target as GenerationTarget, check: args.includes("--check") };
}

function json(content: unknown, relative: string): string {
  const raw = `${JSON.stringify(content, null, 2)}\n`;
  const formatted = spawnSync(
    process.execPath,
    [biomeCli, "format", "--stdin-file-path", relative],
    {
      cwd: repositoryRoot,
      input: raw,
      encoding: "utf8",
      shell: false,
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  if (formatted.status !== 0 || !formatted.stdout) {
    throw new Error(`Could not format generated JSON artifact ${relative}.`);
  }
  return formatted.stdout.endsWith("\n") ? formatted.stdout : `${formatted.stdout}\n`;
}

async function workingRecipeBundle(
  repository: string,
  recipe: string,
): Promise<Record<string, string>> {
  return Object.fromEntries(
    await Promise.all(
      recipeBundleFiles.map(async (relative) => [
        relative,
        await readFile(path.join(repository, "recipes", recipe, relative), "utf8"),
      ]),
    ),
  );
}

function committedRecipeBundle(
  repository: string,
  revision: string,
  recipe: string,
): Record<string, string> {
  return Object.fromEntries(
    recipeBundleFiles.map((relative) => {
      const object = `recipes/${recipe}/${relative}`;
      const result = spawnSync("git", ["show", `${revision}:${object}`], {
        cwd: repository,
        encoding: "utf8",
        shell: false,
        maxBuffer: 2 * 1024 * 1024,
      });
      if (result.status !== 0) {
        throw new Error(`Evidence revision ${revision} does not contain ${object}.`);
      }
      return [relative, result.stdout];
    }),
  );
}

async function evidenceFiles(repository: string): Promise<string[]> {
  const root = path.join(repository, "verification");
  const rootInfo = await lstat(root);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw new Error("verification must be a real directory.");
  }
  const files: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isSymbolicLink())
      throw new Error(`Verification entry cannot be a symlink: ${entry.name}.`);
    if (!entry.isDirectory()) continue;
    for (const file of await readdir(entryPath, { withFileTypes: true })) {
      const candidate = path.join(entryPath, file.name);
      if (file.isSymbolicLink())
        throw new Error(`Verification file cannot be a symlink: ${candidate}.`);
      if (file.isFile() && file.name.endsWith(".yml")) files.push(candidate);
    }
  }
  return files.sort();
}

export function resolveEvidenceSupersession(records: readonly LoadedEvidence[]): LoadedEvidence[] {
  const byId = new Map(records.map((item) => [item.record.id, item]));
  if (byId.size !== records.length) {
    const seen = new Set<string>();
    const duplicate = records.find((item) => {
      if (seen.has(item.record.id)) return true;
      seen.add(item.record.id);
      return false;
    });
    throw new Error(`Duplicate verification evidence ID: ${duplicate?.record.id ?? "unknown"}.`);
  }
  for (const item of records) {
    const supersedes = item.record.supersedes;
    if (!supersedes) continue;
    const target = byId.get(supersedes);
    if (!target) {
      throw new Error(`${item.relativePath} supersedes unknown evidence record ${supersedes}.`);
    }
    if (target.record.recipe !== item.record.recipe || target.record.agent !== item.record.agent) {
      throw new Error(
        `${item.relativePath} can supersede evidence only for the same recipe and agent.`,
      );
    }
  }
  for (const item of records) {
    const seen = new Set<string>();
    let cursor: LoadedEvidence | undefined = item;
    while (cursor?.record.supersedes) {
      if (seen.has(cursor.record.id)) {
        throw new Error(`Verification evidence supersession cycle includes ${cursor.record.id}.`);
      }
      seen.add(cursor.record.id);
      cursor = byId.get(cursor.record.supersedes);
    }
  }
  const supersededByCurrent = new Set(
    records
      .filter((item) => item.current && item.record.supersedes)
      .map((item) => item.record.supersedes as string),
  );
  const resolved = records.map((item) => ({
    ...item,
    superseded: item.current && supersededByCurrent.has(item.record.id),
  }));
  const activeFingerprints = new Map<string, string>();
  for (const item of resolved.filter((candidate) => candidate.current && !candidate.superseded)) {
    const fingerprint = [
      item.record.recipe,
      item.record.agent,
      item.record.installation.status,
      item.record.execution.status,
      item.record.outcome.status,
    ].join(":");
    const duplicate = activeFingerprints.get(fingerprint);
    if (duplicate) {
      throw new Error(
        `${item.relativePath} duplicates active verification claims from ${duplicate}; use supersedes to establish precedence.`,
      );
    }
    activeFingerprints.set(fingerprint, item.relativePath);
  }
  return resolved;
}

export async function loadEvidence(
  repository: string,
  recipes: readonly Recipe[],
): Promise<LoadedEvidence[]> {
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const currentHashes = new Map(
    await Promise.all(
      recipes.map(
        async (recipe) =>
          [recipe.id, hashNamedContent(await workingRecipeBundle(repository, recipe.id))] as const,
      ),
    ),
  );
  const loaded: LoadedEvidence[] = [];
  const ids = new Set<string>();

  for (const file of await evidenceFiles(repository)) {
    const content = await readBoundedRegularFile(
      file,
      maximumEvidenceBytes,
      path.join(repository, "verification"),
    );
    const raw = parse(content.toString("utf8"), { maxAliasCount: 0, uniqueKeys: true });
    const record = verificationEvidenceSchema.parse(raw);
    const relativePath = path.relative(repository, file).split(path.sep).join("/");
    if (ids.has(record.id)) throw new Error(`Duplicate verification evidence ID: ${record.id}.`);
    ids.add(record.id);

    const recipe = recipesById.get(record.recipe);
    if (!recipe) throw new Error(`${relativePath} references unknown recipe ${record.recipe}.`);
    const revision = spawnSync(
      "git",
      ["cat-file", "-e", `${record.source.repository_revision}^{commit}`],
      {
        cwd: repository,
        stdio: "ignore",
        shell: false,
      },
    );
    if (revision.status !== 0) {
      throw new Error(`${relativePath} references an unavailable source revision.`);
    }
    const reachable = spawnSync(
      "git",
      ["merge-base", "--is-ancestor", record.source.repository_revision, "HEAD"],
      {
        cwd: repository,
        stdio: "ignore",
        shell: false,
      },
    );
    if (reachable.status !== 0) {
      throw new Error(`${relativePath} references a source revision outside the current history.`);
    }
    const committedHash = hashNamedContent(
      committedRecipeBundle(repository, record.source.repository_revision, record.recipe),
    );
    if (committedHash !== record.recipe_content_sha256) {
      throw new Error(`${relativePath} does not match recipe content at its cited commit.`);
    }

    for (const artifact of Object.values(record.evidence)) {
      if (!artifact) continue;
      if (!artifact.path.startsWith("verification/")) {
        throw new Error(`${artifact.path} must stay inside the verification evidence tree.`);
      }
      const artifactPath = resolveInside(repository, artifact.path);
      await assertNoSymlink(repository, artifactPath);
      const artifactContent = await readBoundedRegularFile(
        artifactPath,
        maximumEvidenceArtifactBytes,
        repository,
      );
      if (hashContent(artifactContent) !== artifact.sha256) {
        throw new Error(`${artifact.path} does not match its retained evidence hash.`);
      }
    }

    loaded.push({
      record,
      relativePath,
      current:
        record.recipe_version === recipe.version &&
        record.adapter_version === adapterRegistry[record.agent].version &&
        record.recipe_content_sha256 === currentHashes.get(record.recipe),
      superseded: false,
    });
  }
  return resolveEvidenceSupersession(loaded);
}

export function aggregateStatus(
  records: readonly LoadedEvidence[],
  stage: "installation" | "execution" | "outcome",
  fallback: "untested" | "not-applicable",
): {
  status: VerificationEvidence[typeof stage]["status"];
  evidence: string[];
  stale_records: number;
} {
  const current = records.filter((item) => item.current && !item.superseded);
  const statuses = current.map((item) => item.record[stage].status);
  const status = statuses.includes("failing")
    ? "failing"
    : statuses.includes("passing")
      ? "passing"
      : statuses.length > 0 && statuses.every((value) => value === "not-applicable")
        ? "not-applicable"
        : fallback;
  return {
    status,
    evidence: current
      .filter((item) => item.record[stage].status === status)
      .map((item) => item.relativePath)
      .sort(),
    stale_records: records.filter((item) => !item.current).length,
  };
}

function generatedCatalog(
  recipes: readonly Recipe[],
  evidence: readonly LoadedEvidence[],
  recipeHashes: ReadonlyMap<string, string>,
): GeneratedCatalogRecipe[] {
  return recipes.map((recipe) => {
    const agents = Object.fromEntries(
      agentIds.map((agent) => {
        const relevant = evidence.filter(
          (item) => item.record.recipe === recipe.id && item.record.agent === agent,
        );
        const executionFallback =
          adapterRegistry[agent].executionTestStatus === "not-applicable"
            ? "not-applicable"
            : "untested";
        const outcomeFallback =
          adapterRegistry[agent].outcomeReviewStatus === "not-applicable"
            ? "not-applicable"
            : "untested";
        return [
          agent,
          {
            ...recipe.agents[agent],
            verification: {
              installation: aggregateStatus(relevant, "installation", "untested"),
              execution: aggregateStatus(relevant, "execution", executionFallback),
              outcome: aggregateStatus(relevant, "outcome", outcomeFallback),
            },
          },
        ];
      }),
    );
    return generatedCatalogRecipeSchema.parse({
      ...recipe,
      agents,
      verification: {
        structural: {
          status: "passing",
          source: "derived",
          checks: structuralChecks,
          recipe_content_sha256: recipeHashes.get(recipe.id),
        },
      },
    });
  });
}

async function validatedCatalogState(repository: string): Promise<{
  recipes: Recipe[];
  entries: GeneratedCatalogRecipe[];
  evidence: LoadedEvidence[];
}> {
  const recipesDirectory = path.join(repository, "recipes");
  const recipes = await loadCatalog(recipesDirectory);
  const contentIssues = await validateCatalogContent(recipesDirectory);
  if (contentIssues.length > 0) {
    const first = contentIssues[0];
    throw new Error(
      `Catalog content validation failed with ${contentIssues.length} issue(s); first: ${first?.recipe}/${first?.file} [${first?.code}] ${first?.message}`,
    );
  }
  const recipeHashes = new Map(
    await Promise.all(
      recipes.map(
        async (recipe) =>
          [recipe.id, hashNamedContent(await workingRecipeBundle(repository, recipe.id))] as const,
      ),
    ),
  );
  const evidence = await loadEvidence(repository, recipes);
  return { recipes, entries: generatedCatalog(recipes, evidence, recipeHashes), evidence };
}

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

function withAutonomousExecutionInvariants<T extends object>(schema: T) {
  const existingAllOf = (schema as { allOf?: unknown }).allOf;
  if (existingAllOf !== undefined && !Array.isArray(existingAllOf)) {
    throw new Error("Expected generated JSON Schema allOf to be an array.");
  }
  return {
    ...schema,
    allOf: [...(existingAllOf ?? []), ...autonomousExecutionInvariants],
  };
}

async function generateSchemas(writer: ArtifactWriter): Promise<void> {
  const recipeShape = z.toJSONSchema(recipeSchema);
  const catalogShape = z.toJSONSchema(generatedCatalogRecipeSchema.array());
  if (
    catalogShape.items === null ||
    typeof catalogShape.items !== "object" ||
    Array.isArray(catalogShape.items)
  ) {
    throw new Error("Expected generated catalog JSON Schema items to be an object schema.");
  }
  const recipeJsonSchema = {
    ...withAutonomousExecutionInvariants(recipeShape),
    $comment:
      "Field shape and the autonomous execution contract invariants are portable JSON Schema. Remaining cross-field recipe invariants require the Zod runtime validator.",
  };
  const catalogJsonSchema = {
    ...catalogShape,
    items: withAutonomousExecutionInvariants(catalogShape.items),
    $comment:
      "Field shape and the autonomous execution contract invariants are portable JSON Schema. Remaining catalog equivalence with source recipe invariants requires the Zod runtime validator and generator.",
  };
  const verificationJsonSchema = {
    ...z.toJSONSchema(verificationEvidenceSchema),
    $comment:
      "Field shape is portable JSON Schema. Stage ordering, evidence references, hashes, source commits, staleness, supersession, and conflict precedence require the Zod validator and repository generator.",
  };
  await writer.file(
    "generated/recipe.schema.json",
    json(recipeJsonSchema, "generated/recipe.schema.json"),
  );
  await writer.file(
    "generated/catalog.schema.json",
    json(catalogJsonSchema, "generated/catalog.schema.json"),
  );
  await writer.file(
    "generated/verification.schema.json",
    json(verificationJsonSchema, "generated/verification.schema.json"),
  );
  await writer.file(
    "verification/schema.json",
    json(verificationJsonSchema, "verification/schema.json"),
  );
}

async function generateCatalogArtifacts(
  writer: ArtifactWriter,
  entries: readonly GeneratedCatalogRecipe[],
): Promise<void> {
  await writer.file("generated/catalog.json", json(entries, "generated/catalog.json"));
  await writer.file(
    "generated/catalog.d.ts",
    'import type { GeneratedCatalogRecipe } from "@kauanpolydoro/agentic-workflows-core";\n\ndeclare const catalog: GeneratedCatalogRecipe[];\nexport default catalog;\n',
  );
}

function withoutTitle(markdown: string): string {
  return markdown.replace(/^#\s+.*?\n+/, "").trim();
}

async function generateDocumentation(
  writer: ArtifactWriter,
  repository: string,
  recipes: readonly Recipe[],
): Promise<void> {
  const expectedPages = new Set(recipes.map((recipe) => `${recipe.id}.md`).concat("index.md"));
  const catalogDirectory = path.join(repository, "docs/catalog");
  if (!writer.check) {
    await rm(catalogDirectory, { recursive: true, force: true });
    await mkdir(catalogDirectory, { recursive: true });
  } else {
    try {
      for (const file of await readdir(catalogDirectory)) {
        if (file.endsWith(".md") && !expectedPages.has(file))
          writer.stale.add(`docs/catalog/${file}`);
      }
    } catch {
      writer.stale.add("docs/catalog");
    }
  }

  for (const recipe of recipes) {
    const recipeDirectory = path.join(repository, "recipes", recipe.id);
    const workflow = (await readFile(path.join(recipeDirectory, "workflow.md"), "utf8"))
      .replaceAll(/(?:\.\/)?examples\/input\.md/g, "#complete-example-input")
      .replaceAll(/(?:\.\/)?examples\/expected-output\.md/g, "#complete-expected-output");
    const exampleInput = await readFile(path.join(recipeDirectory, "examples/input.md"), "utf8");
    const expectedOutput = await readFile(
      path.join(recipeDirectory, "examples/expected-output.md"),
      "utf8",
    );
    const outputContract = await readFile(path.join(recipeDirectory, "output.schema.json"), "utf8");
    const frontmatter = `---\ntitle: ${JSON.stringify(recipe.title)}\ndescription: ${JSON.stringify(recipe.summary)}\n---\n\n`;
    await writer.file(
      `docs/catalog/${recipe.id}.md`,
      `${frontmatter}${workflow.trimEnd()}\n\n## Output contract\n\nThe expected artifact is validated by the recipe-specific contract below.\n\n\`\`\`json\n${outputContract.trim()}\n\`\`\`\n\n## Complete example input\n\n${withoutTitle(exampleInput)}\n\n## Complete expected output\n\n${withoutTitle(expectedOutput)}\n`,
    );
  }
  await writer.file(
    "docs/catalog/index.md",
    `---\nlayout: page\ntitle: Workflow catalog\ndescription: Browse every workflow in the catalog and see exactly what has been tested for each one.\n---\n\n<script setup>\nimport CatalogExplorer from '../.vitepress/theme/components/CatalogExplorer.vue'\nimport catalog from '../../generated/catalog.json'\n</script>\n\n# Workflow catalog\n\nAll ${recipes.length} workflows are listed below.\nUse the filters to narrow the list; they run entirely in your browser and send nothing anywhere.\n\nThis page reflects the v0.3.0 schema version 4 release candidate.\nThe historical schema version 3 editorial dispositions do not promote these migrated bundles automatically; the migration and the autonomous addition remain pending the human gates recorded in the [recipe audit](../quality/recipe-audit.md).\n\n<CatalogExplorer :recipes="catalog" />\n\nIf JavaScript is disabled, you can still reach every workflow through the links below.\n\n${recipes.map((recipe) => `- [${recipe.title}](./${recipe.id}) - ${recipe.summary}`).join("\n")}\n`,
  );
}

function latest(values: Array<string | null>): string {
  return (
    values
      .filter((value): value is string => value !== null)
      .sort()
      .at(-1) ?? "not retained"
  );
}

async function generateCompatibility(
  writer: ArtifactWriter,
  entries: readonly GeneratedCatalogRecipe[],
  evidence: readonly LoadedEvidence[],
): Promise<void> {
  const rows = agentIds.map((agent) => {
    const adapter = adapterRegistry[agent];
    const current = evidence.filter(
      (item) => item.current && !item.superseded && item.record.agent === agent,
    );
    const passingCount = (stage: "installation" | "execution" | "outcome") =>
      entries.filter((entry) => entry.agents[agent].verification[stage].status === "passing")
        .length;
    const passingRecipes = (stage: "execution" | "outcome") =>
      new Set(
        entries
          .filter((entry) => entry.agents[agent].verification[stage].status === "passing")
          .map((entry) => entry.id),
      );
    const passingExecutionRecipes = passingRecipes("execution");
    const passingOutcomeRecipes = passingRecipes("outcome");
    const testedVersions = [
      ...new Set(
        current
          .filter((item) => passingExecutionRecipes.has(item.record.recipe))
          .map((item) => item.record.agent_version)
          .filter((value): value is string => value !== null),
      ),
    ];
    const externalExecution = current.filter((item) =>
      passingExecutionRecipes.has(item.record.recipe),
    );
    const outcomeReviews = current.filter((item) => passingOutcomeRecipes.has(item.record.recipe));
    const stale = evidence.filter((item) => !item.current && item.record.agent === agent).length;
    const superseded = evidence.filter(
      (item) => item.superseded && item.record.agent === agent,
    ).length;
    return `| ${adapter.displayName} | ${deriveAdapterSupport(adapter)} | ${adapter.exportFormat} | ${adapter.format.status} | ${adapter.exporter.status} | ${adapter.localGenerationContract.status} | not retained | ${adapter.localInstallationContract.status} | not retained | ${adapter.consumerParse.status} | ${passingCount("installation")}/${entries.length} | ${passingCount("execution")}/${entries.length} | ${passingCount("outcome")}/${entries.length} | ${testedVersions.join(", ") || "untested"} | ${latest(externalExecution.map((item) => item.record.finished_at))} | ${latest(outcomeReviews.map((item) => item.record.reviewed_at))} | ${stale} | ${superseded} | ${adapter.evidence.map((item) => `\`${item}\``).join(", ")} |`;
  });
  await writer.file(
    "docs/compatibility.md",
    `# Adapter compatibility\n\nThis table answers one question per column, so a value in one column never implies anything about the others.\n\n"Global support" describes only the exporter: \`supported\` means the official or project-owned format is confirmed, the serializer exists, and both the local generation contract and the temporary-directory installation contract pass.\n\nIt does not mean an external agent discovered or executed a recipe, that a specific agent version was tested, or that a reviewer approved an outcome.\nParsing by the consumer, external discovery, external execution, and human outcome review each have their own columns.\n\nDates for the local contracts appear as \`not retained\`: the repository has passing tests for them, but no dated attestation of those runs was kept.\n\n| Agent | Global support | Export format | Format | Serializer | Generation contract | Last local serializer test | Installation contract | Last installation lifecycle test | Consumer parse | Current recipe installations | External executions | Reviewed outcomes | Tested agent version | Last external execution | Last human outcome review | Stale records | Superseded records | Evidence |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | ---: | ---: | --- |\n${rows.join("\n")}\n\nHow to read the evidence columns:\n\nA recipe record counts as current only while it matches the recipe version, the adapter version, the complete seven-file recipe hash, and a source commit that exists in this repository's history.\nStale records stay visible in their column but cannot promote a passing stage.\nA current record can explicitly supersede an older one for the same recipe and agent, and conflicts between active records fail closed: failing beats passing, and passing beats untested.\nAt the recipe level, bundle compatibility describes whether one recipe can be serialized without losing meaning, while capability status describes its external execution requirements; neither is inferred from global exporter support.\n\nSee [the verification model](./guide/verification) and [adapter research](./research/adapter-sources) for the full rules.\n`,
  );
}

export async function generate(
  requested: GenerationTarget = "all",
  options: GenerationOptions = {},
): Promise<{ target: GenerationTarget; recipes: number; stale: string[] }> {
  const repository = path.resolve(options.repository ?? ".");
  const writer = new ArtifactWriter(repository, options.check ?? false);
  if (runs(requested, "schema")) await generateSchemas(writer);

  let state: Awaited<ReturnType<typeof validatedCatalogState>> | null = null;
  if (requested !== "schema") state = await validatedCatalogState(repository);
  if (runs(requested, "catalog")) await generateCatalogArtifacts(writer, state?.entries ?? []);
  if (runs(requested, "docs"))
    await generateDocumentation(writer, repository, state?.recipes ?? []);
  if (runs(requested, "compatibility"))
    await generateCompatibility(writer, state?.entries ?? [], state?.evidence ?? []);
  if (requested === "all") {
    await writer.file(
      "generated/artifact-manifest.json",
      generatedArtifactManifest(writer, state?.entries ?? []),
    );
  }

  const stale = [...writer.stale].sort();
  if ((options.check ?? false) && stale.length > 0) {
    throw new Error(`Generated artifacts are stale: ${stale.join(", ")}.`);
  }
  return { target: requested, recipes: state?.recipes.length ?? 0, stale };
}

async function main(): Promise<void> {
  try {
    const { target, check } = parseGenerationArguments(process.argv.slice(2));
    const result = await generate(target, { check });
    process.stdout.write(
      `${check ? "Verified" : "Generated"} ${target} artifacts from ${result.recipes} recipe(s).\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) await main();

export const generateScriptPath = fileURLToPath(import.meta.url);
