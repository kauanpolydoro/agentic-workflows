import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const manualReviewThreshold = 0.2;
const reviewSchemaVersion = 1;
const reviewDigestVersion = "awf-content-similarity-review-v1";

const surfaces = [
  "workflow-steps",
  "decision-points",
  "failure-modes",
  "recovery-procedures",
  "checklist-controls",
  "example-artifact",
] as const;

type Surface = (typeof surfaces)[number];

const ignored = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "before",
  "after",
  "workflow",
  "recipe",
  "evidence",
  "expected",
  "output",
  "passing",
  "untested",
  "verification",
]);

interface SimilarityReview {
  recipes: [string, string];
  surface: Surface;
  disposition: "acceptable" | "rewritten";
  rationale: string;
  reviewer: string;
  reviewedAt: string;
  contentSha256: string;
}

interface SurfaceDocument {
  content: string;
  shingles: Set<string>;
  literalBlocks: Set<string>;
}

interface SimilarityRow {
  left: string;
  right: string;
  surface: Surface;
  score: number;
  contentSha256: string;
}

interface FrequentShingle {
  shingle: string;
  recipes: string[];
  surfaces: Surface[];
}

interface LiteralRepeat {
  block: string;
  blockSha256: string;
  recipes: string[];
  surfaces: Surface[];
}

function markdownSection(markdown: string, heading: string): string {
  const expression = new RegExp(`^## ${heading}\\s*$`, "m");
  const match = expression.exec(markdown);
  if (!match || match.index === undefined) return "";
  const bodyStart = match.index + match[0].length;
  const nextHeading = /^##\s+/m.exec(markdown.slice(bodyStart));
  const bodyEnd =
    nextHeading?.index === undefined ? markdown.length : bodyStart + nextHeading.index;
  return markdown.slice(bodyStart, bodyEnd).trim();
}

function shingles(markdown: string): Set<string> {
  const words =
    markdown
      .replace(/^#{1,6}\s+.*$/gm, "")
      .replace(/^[-*]\s+\[[ x]\]\s*/gm, "")
      .replace(/\bE\d+\b/g, "")
      .replace(/external agent execution[^.]*\./gi, "")
      .replace(/outcome review[^.]*\./gi, "")
      .toLowerCase()
      .match(/[a-z][a-z0-9-]+/g)
      ?.filter((word) => word.length > 3 && !ignored.has(word)) ?? [];
  return new Set(words.slice(0, -4).map((_, index) => words.slice(index, index + 5).join(" ")));
}

function literalBlocks(markdown: string): Set<string> {
  return new Set(
    markdown
      .split(/\n\s*\n/u)
      .map((block) =>
        block
          .replace(/^#{1,6}\s+.*$/gm, "")
          .replace(/^[-*]\s+\[[ x]\]\s*/gm, "")
          .replace(/\bE\d+\b/g, "EVIDENCE")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase(),
      )
      .filter((block) => block.length >= 120 && block.split(" ").length >= 18),
  );
}

function jaccard(left: Set<string>, right: Set<string>): number {
  const intersection = [...left].filter((item) => right.has(item)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function pairKey(left: string, right: string, surface: Surface): string {
  return `${[left, right].sort().join("|")}|${surface}`;
}

function reviewDigest(
  left: string,
  right: string,
  surface: Surface,
  leftContent: string,
  rightContent: string,
): string {
  const documents = [
    { recipe: left, content: leftContent },
    { recipe: right, content: rightContent },
  ].sort((first, second) => first.recipe.localeCompare(second.recipe));
  return sha256(
    JSON.stringify({
      digest_version: reviewDigestVersion,
      surface,
      documents,
    }),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSurface(value: unknown): value is Surface {
  return typeof value === "string" && (surfaces as readonly string[]).includes(value);
}

function validReviewDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function loadReviewRecord(
  value: unknown,
  index: number,
  knownRecipes: Set<string>,
): SimilarityReview {
  if (!isRecord(value)) {
    throw new Error(`Similarity review ${index + 1} must be a mapping.`);
  }

  const allowedFields = new Set([
    "recipes",
    "surface",
    "disposition",
    "rationale",
    "reviewer",
    "reviewed_at",
    "content_sha256",
  ]);
  const unknownFields = Object.keys(value).filter((field) => !allowedFields.has(field));
  if (unknownFields.length > 0) {
    throw new Error(
      `Similarity review ${index + 1} has unknown field(s): ${unknownFields.join(", ")}.`,
    );
  }

  const recipes = value.recipes;
  if (
    !Array.isArray(recipes) ||
    recipes.length !== 2 ||
    recipes.some((recipe) => typeof recipe !== "string" || !knownRecipes.has(recipe)) ||
    recipes[0] === recipes[1]
  ) {
    throw new Error(`Similarity review ${index + 1} must name two distinct known recipe IDs.`);
  }
  if (!isSurface(value.surface)) {
    throw new Error(`Similarity review ${index + 1} has an unknown surface.`);
  }
  if (value.disposition !== "acceptable" && value.disposition !== "rewritten") {
    throw new Error(`Similarity review ${index + 1} has an invalid disposition.`);
  }
  if (typeof value.rationale !== "string" || value.rationale.trim().length === 0) {
    throw new Error(`Similarity review ${index + 1} requires a non-empty rationale.`);
  }
  if (typeof value.reviewer !== "string" || value.reviewer.trim().length === 0) {
    throw new Error(`Similarity review ${index + 1} requires a reviewer identity.`);
  }
  if (typeof value.reviewed_at !== "string" || !validReviewDate(value.reviewed_at)) {
    throw new Error(`Similarity review ${index + 1} requires reviewed_at in YYYY-MM-DD form.`);
  }
  if (typeof value.content_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.content_sha256)) {
    throw new Error(`Similarity review ${index + 1} requires a lowercase SHA-256 digest.`);
  }

  return {
    recipes: [recipes[0] as string, recipes[1] as string],
    surface: value.surface,
    disposition: value.disposition,
    rationale: value.rationale.trim(),
    reviewer: value.reviewer.trim(),
    reviewedAt: value.reviewed_at,
    contentSha256: value.content_sha256,
  };
}

async function loadReviews(knownRecipes: Set<string>): Promise<SimilarityReview[]> {
  let parsed: unknown;
  try {
    parsed = parse(await readFile("docs/quality/content-similarity-reviews.yml", "utf8"), {
      maxAliasCount: 0,
      uniqueKeys: true,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  if (!isRecord(parsed) || parsed.schema_version !== reviewSchemaVersion) {
    throw new Error(
      `content-similarity-reviews.yml must declare schema_version: ${reviewSchemaVersion}.`,
    );
  }
  if (!Array.isArray(parsed.reviews)) {
    throw new Error("content-similarity-reviews.yml must declare a reviews array.");
  }

  const reviews = parsed.reviews.map((review, index) =>
    loadReviewRecord(review, index, knownRecipes),
  );
  const seen = new Set<string>();
  for (const review of reviews) {
    const key = pairKey(review.recipes[0], review.recipes[1], review.surface);
    if (seen.has(key)) throw new Error(`Duplicate similarity review for ${key}.`);
    seen.add(key);
  }
  return reviews;
}

function markdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

const recipeIds = (await readdir("recipes", { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const knownRecipes = new Set(recipeIds);
const documents = new Map<string, Map<Surface, SurfaceDocument>>();

for (const recipe of recipeIds) {
  const workflow = await readFile(path.join("recipes", recipe, "workflow.md"), "utf8");
  const checklist = await readFile(path.join("recipes", recipe, "checklist.md"), "utf8");
  const example = await readFile(
    path.join("recipes", recipe, "examples/expected-output.md"),
    "utf8",
  );
  const contentBySurface = new Map<Surface, string>([
    ["workflow-steps", markdownSection(workflow, "Workflow")],
    ["decision-points", markdownSection(workflow, "Decision points")],
    ["failure-modes", markdownSection(workflow, "Failure modes")],
    ["recovery-procedures", markdownSection(workflow, "Recovery procedure")],
    ["checklist-controls", checklist.trim()],
    ["example-artifact", example.trim()],
  ]);
  documents.set(
    recipe,
    new Map(
      [...contentBySurface].map(([surface, content]) => [
        surface,
        { content, shingles: shingles(content), literalBlocks: literalBlocks(content) },
      ]),
    ),
  );
}

const shingleOccurrences = new Map<string, { recipes: Set<string>; surfaces: Set<Surface> }>();
const literalOccurrences = new Map<string, { recipes: Set<string>; surfaces: Set<Surface> }>();
for (const [recipe, recipeDocuments] of documents) {
  for (const [surface, document] of recipeDocuments) {
    for (const shingle of document.shingles) {
      const occurrence = shingleOccurrences.get(shingle) ?? {
        recipes: new Set<string>(),
        surfaces: new Set<Surface>(),
      };
      occurrence.recipes.add(recipe);
      occurrence.surfaces.add(surface);
      shingleOccurrences.set(shingle, occurrence);
    }
    for (const block of document.literalBlocks) {
      const occurrence = literalOccurrences.get(block) ?? {
        recipes: new Set<string>(),
        surfaces: new Set<Surface>(),
      };
      occurrence.recipes.add(recipe);
      occurrence.surfaces.add(surface);
      literalOccurrences.set(block, occurrence);
    }
  }
}

const frequentShingles: FrequentShingle[] = [...shingleOccurrences]
  .filter(([, occurrence]) => occurrence.recipes.size >= 2)
  .map(([shingle, occurrence]) => ({
    shingle,
    recipes: [...occurrence.recipes].sort(),
    surfaces: [...occurrence.surfaces].sort(),
  }))
  .sort(
    (left, right) =>
      right.recipes.length - left.recipes.length || left.shingle.localeCompare(right.shingle),
  );
const literalRepeats: LiteralRepeat[] = [...literalOccurrences]
  .filter(([, occurrence]) => occurrence.recipes.size >= 2)
  .map(([block, occurrence]) => ({
    block,
    blockSha256: sha256(block),
    recipes: [...occurrence.recipes].sort(),
    surfaces: [...occurrence.surfaces].sort(),
  }))
  .sort(
    (left, right) =>
      right.recipes.length - left.recipes.length ||
      right.block.length - left.block.length ||
      left.blockSha256.localeCompare(right.blockSha256),
  );

const rows: SimilarityRow[] = [];
for (let leftIndex = 0; leftIndex < recipeIds.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < recipeIds.length; rightIndex += 1) {
    const left = recipeIds[leftIndex] as string;
    const right = recipeIds[rightIndex] as string;
    for (const surface of surfaces) {
      const leftDocument = documents.get(left)?.get(surface) as SurfaceDocument;
      const rightDocument = documents.get(right)?.get(surface) as SurfaceDocument;
      rows.push({
        left,
        right,
        surface,
        score: jaccard(leftDocument.shingles, rightDocument.shingles),
        contentSha256: reviewDigest(
          left,
          right,
          surface,
          leftDocument.content,
          rightDocument.content,
        ),
      });
    }
  }
}

const reviews = await loadReviews(knownRecipes);
const reviewByKey = new Map(
  reviews.map((review) => [pairKey(review.recipes[0], review.recipes[1], review.surface), review]),
);
const ranked = rows.sort((left, right) => right.score - left.score);
const warnings = ranked.filter((row) => row.score >= manualReviewThreshold);
const unresolved = warnings.filter((row) => {
  const review = reviewByKey.get(pairKey(row.left, row.right, row.surface));
  return !review || review.contentSha256 !== row.contentSha256;
});
const staleReviews = reviews.filter((review) => {
  const row = rows.find(
    (candidate) =>
      pairKey(candidate.left, candidate.right, candidate.surface) ===
      pairKey(review.recipes[0], review.recipes[1], review.surface),
  );
  return !row || row.contentSha256 !== review.contentSha256;
});
const reported = ranked.slice(0, Math.max(30, warnings.length));
const table = reported
  .map((row) => {
    const review = reviewByKey.get(pairKey(row.left, row.right, row.surface));
    const current = review?.contentSha256 === row.contentSha256;
    const disposition = current
      ? review.disposition
      : review
        ? "stale review"
        : row.score < manualReviewThreshold
          ? "below threshold"
          : "review required";
    const provenance = current
      ? `${review.reviewer} on ${review.reviewedAt}`
      : review
        ? `${review.reviewer} on ${review.reviewedAt}; content changed`
        : "";
    const rationale = review?.rationale ?? "";
    return `| ${row.left} | ${row.right} | ${row.surface} | ${row.score.toFixed(3)} | \`${row.contentSha256}\` | ${disposition} | ${markdownCell(provenance)} | ${markdownCell(rationale)} |`;
  })
  .join("\n");
const frequentShingleRows = frequentShingles
  .slice(0, 30)
  .map(
    (entry) =>
      `| ${markdownCell(entry.shingle)} | ${entry.recipes.length} | ${entry.recipes.join(", ")} | ${entry.surfaces.join(", ")} |`,
  )
  .join("\n");
const literalRepeatRows = literalRepeats
  .map(
    (entry) =>
      `| \`${entry.blockSha256}\` | ${entry.recipes.join(", ")} | ${entry.surfaces.join(", ")} | ${markdownCell(entry.block.slice(0, 180))}${entry.block.length > 180 ? "..." : ""} |`,
  )
  .join("\n");
const corpusSha256 = sha256(
  JSON.stringify(
    recipeIds.flatMap((recipe) =>
      surfaces.map((surface) => ({
        recipe,
        surface,
        content: documents.get(recipe)?.get(surface)?.content ?? "",
      })),
    ),
  ),
);

await writeFile(
  "docs/quality/content-similarity.md",
  `# Lexical content similarity report

Generated deterministically by the pnpm audit:similarity command.

The audit compares five-token shingles for workflow actions, decision points, failure modes, recovery procedures, checklist controls, and complete example artifacts.

It removes required headings, checklist markers, evidence IDs, common stop words, and minimal verification boilerplate.

Lexical similarity is a triage signal, not proof of editorial duplication, originality, correctness, or semantic quality.

This command gates only whether every lexical warning has a human review tied to the exact current pair content.

## Result

- Recipes compared: ${recipeIds.length}
- Surface comparisons: ${rows.length}
- Manual-review threshold: ${manualReviewThreshold.toFixed(3)} Jaccard similarity
- Review schema version: ${reviewSchemaVersion}
- Review digest version: \`${reviewDigestVersion}\`
- Audited corpus SHA-256: \`${corpusSha256}\`
- Comparisons above the review threshold: ${warnings.length}
- Stale retained reviews: ${staleReviews.length}
- Unresolved current-content reviews: ${unresolved.length}
- Cross-recipe literal blocks of at least 120 normalized characters: ${literalRepeats.length}
- Five-token shingles shared by at least two recipes: ${frequentShingles.length}

The pair table contains every comparison at or above the review threshold plus the 30 closest comparisons below it.

| Recipe A | Recipe B | Surface | Similarity | Current content SHA-256 | Disposition | Review provenance | Review rationale |
| --- | --- | --- | ---: | --- | --- | --- | --- |
${table}

## Repeated literal blocks

This detector reports exact normalized paragraph-sized blocks shared by at least two recipes after headings, checklist markers, evidence numbers, case, and whitespace are normalized.

It reports every qualifying block rather than applying a silent result cap.

| Block SHA-256 | Recipes | Surfaces | Preview |
| --- | --- | --- | --- |
${literalRepeatRows || "| none | none | none | No qualifying cross-recipe literal block was detected. |"}

## Frequent five-token shingles

This table shows the 30 most widely shared five-token shingles that occur in at least two recipes.

It is an explicitly capped diagnostic inventory, not a pass or fail result.

| Shingle | Recipe count | Recipes | Surfaces |
| --- | ---: | --- | --- |
${frequentShingleRows || "| none | 0 | none | none |"}

## Manual review contract

Every row at or above the threshold requires one retained review in content-similarity-reviews.yml.

A current review records the two recipe IDs, surface, disposition, rationale, reviewer identity, review date, and the exact current content SHA-256 shown above.

Any source change that alters either reviewed surface changes that digest and makes the review stale.

A missing or stale review for a row at or above the threshold makes the command fail after regenerating this report.

The acceptable disposition requires a domain-specific reason why the shared language is unavoidable and operationally correct.

The rewritten disposition means the source recipes were changed to remove interchangeable prose and the reported score reflects the reviewed content.

Shared canonical headings, evidence notation, safety vocabulary, and verification terminology are not defects by themselves.

Do not lower similarity through cosmetic synonym replacement.

Passing this lexical-review gate does not assign a semantic recipe-quality status.
`,
);

const summary = `Compared ${rows.length} recipe surfaces; ${warnings.length} crossed the threshold, ${staleReviews.length} retained reviews are stale, and ${unresolved.length} current-content reviews remain unresolved.\n`;
if (unresolved.length > 0) {
  process.stderr.write(summary);
  process.exitCode = 1;
} else {
  process.stdout.write(summary);
}
