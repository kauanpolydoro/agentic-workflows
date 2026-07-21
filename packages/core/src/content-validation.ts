import { lstat, opendir, realpath } from "node:fs/promises";
import path from "node:path";
import { findUnsafeAdapterInterpolations, type RecipeBundleSource } from "./adapters.js";
import { type CatalogLoadOptions, loadRecipeSource, resolveCatalogLoadLimits } from "./catalog.js";
import { AwfError } from "./errors.js";
import { assertNoSymlink, MAX_RECIPE_FILE_BYTES, readBoundedRegularFile } from "./fs-security.js";
import { outputContractSchema, validateExpectedOutput } from "./output-contract.js";
import type { Recipe } from "./schema.js";

export const WORKFLOW_SECTIONS = [
  "Objective",
  "When to use",
  "When not to use",
  "Required inputs",
  "Optional inputs",
  "Preconditions",
  "Workflow",
  "Decision points",
  "Safety guardrails",
  "Human approval gates",
  "Expected output",
  "Completion criteria",
  "Failure modes",
  "Recovery procedure",
  "Example",
] as const;

const README_SECTIONS = [
  "Primary use cases",
  "When not to use",
  "Required evidence",
  "Produced artifacts",
  "Primary risks",
  "How to use this recipe",
  "Files",
  "Verification status",
  "Limitations",
] as const;

const PLACEHOLDERS = [
  /\bTODO\b/i,
  /\bTBD\b/i,
  /lorem ipsum/i,
  /replace (?:this|with)/i,
  /insert (?:text|content|example)/i,
  /your[- ](?:project|name|value)/i,
  /AUTHOR_INPUT_REQUIRED/i,
];

const UNBOUNDED_PHRASES = [
  /\bfix everything\b/i,
  /\bimprove the code\b/i,
  /\bapply best practices\b/i,
];

const MAX_RELATIVE_LINKS_PER_FILE = 256;

const markdownBundleSources = {
  "workflow.md": "workflow",
  "checklist.md": "checklist",
  "examples/input.md": "exampleInput",
  "examples/expected-output.md": "exampleOutput",
} as const satisfies Readonly<Record<string, RecipeBundleSource>>;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "before",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

export interface ContentIssue {
  recipe: string;
  file: string;
  code: string;
  message: string;
}

interface MarkdownSection {
  heading: string;
  body: string;
}

function sections(markdown: string, level = 2): MarkdownSection[] {
  const marker = "#".repeat(level);
  const expression = new RegExp(`^${marker}\\s+(.+?)\\s*$`, "gm");
  const matches = [...markdown.matchAll(expression)];
  return matches.map((match, index) => ({
    heading: match[1]?.trim() ?? "",
    body: markdown.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index).trim(),
  }));
}

function normalizedTokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[`*_]/g, "")
      .match(/[a-z0-9][a-z0-9-]*/g)
      ?.filter((token) => token.length > 2 && !STOP_WORDS.has(token)) ?? [],
  );
}

function covers(document: string, declaration: string): boolean {
  const required = [...normalizedTokens(declaration)];
  if (required.length === 0) return true;
  const actual = normalizedTokens(document);
  const matched = required.filter((token) => actual.has(token)).length;
  return matched / required.length >= 0.5;
}

function evidenceDefinitions(input: string): string[] {
  return [...input.matchAll(/^###\s+(E\d+)\s+(?:-|:)/gm)].map((match) => match[1] as string);
}

function evidenceReferences(output: string): string[] {
  return [...output.matchAll(/\bE\d+\b/g)].map((match) => match[0]);
}

function normalizedControl(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`*_:[\]().,;]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasMeaningfulSectionContent(value: string): boolean {
  return withoutFencedCode(value)
    .split("\n")
    .some((line) => {
      const normalized = line
        .replace(/^\s*(?:[-*+] |\d+\. |-{3,}|\|)/, "")
        .replace(/[`*_~|:#()[\]]/g, "")
        .trim();
      return /[a-z0-9]/i.test(normalized);
    });
}

function duplicateIds(ids: readonly string[]): Set<string> {
  return new Set(ids.filter((id, index) => ids.indexOf(id) !== index));
}

function isConditionalDecision(line: string): boolean {
  const statement = line
    .replace(/^[-*]\s+/, "")
    .replaceAll("**", "")
    .trim();
  if (!/^If\s+\S/i.test(statement)) return false;
  const separator = statement.indexOf(",");
  if (separator < 0) return false;
  const condition = statement.slice(2, separator).trim();
  const consequence = statement.slice(separator + 1).trim();
  return condition.length > 0 && /[a-z]/i.test(consequence);
}

interface MarkdownFence {
  marker: "`" | "~";
  length: number;
}

function openingFence(line: string): MarkdownFence | null {
  const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  if (!match) return null;
  const delimiter = match[1] as string;
  const marker = delimiter[0] as MarkdownFence["marker"];
  if (marker === "`" && (match[2] as string).includes("`")) return null;
  return { marker, length: delimiter.length };
}

function closesFence(line: string, fence: MarkdownFence): boolean {
  const match = line.match(/^ {0,3}(`+|~+)[ \t]*$/);
  if (!match) return false;
  const delimiter = match[1] as string;
  return delimiter[0] === fence.marker && delimiter.length >= fence.length;
}

function withoutFencedCode(markdown: string): string {
  let fence: MarkdownFence | null = null;
  return markdown
    .split("\n")
    .map((line) => {
      if (fence) {
        if (closesFence(line, fence)) fence = null;
        return "";
      }
      fence = openingFence(line);
      return fence ? "" : line;
    })
    .join("\n");
}

function markdownAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>();
  const occurrences = new Map<string, number>();
  for (const match of withoutFencedCode(markdown).matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
    const explicit = (match[1] as string).match(/\s+\{#([a-zA-Z0-9_-]+)\}\s*$/)?.[1];
    const source = explicit
      ? explicit
      : (match[1] as string)
          .replace(/\s+#+$/, "")
          .replace(/\s+\{#[a-zA-Z0-9_-]+\}\s*$/, "")
          .replace(/<[^>]+>/g, "")
          .replace(/[`*_~]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");
    const count = occurrences.get(source) ?? 0;
    occurrences.set(source, count + 1);
    anchors.add(count === 0 ? source : `${source}-${count}`);
  }
  return anchors;
}

function decodedLinkTarget(target: string): { pathname: string; anchor: string | null } | null {
  const normalized = target.startsWith("<") && target.endsWith(">") ? target.slice(1, -1) : target;
  const [pathAndQuery = "", encodedAnchor] = normalized.split("#", 2);
  try {
    return {
      pathname: decodeURIComponent(pathAndQuery.split("?", 1)[0] ?? ""),
      anchor: encodedAnchor === undefined ? null : decodeURIComponent(encodedAnchor),
    };
  } catch {
    return null;
  }
}

function push(
  issues: ContentIssue[],
  recipe: string,
  file: string,
  code: string,
  message: string,
): void {
  issues.push({ recipe, file, code, message });
}

function isContained(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`))
  );
}

function relativeLinkFailureCode(error: unknown): string {
  if (error instanceof AwfError && error.code === "INVALID_PATH") return "UNSAFE_RELATIVE_LINK";
  if (error instanceof AwfError && error.code === "FILE_TOO_LARGE") {
    return "RELATIVE_LINK_TARGET_TOO_LARGE";
  }
  return "BROKEN_RELATIVE_LINK";
}

async function validateRelativeLinks(
  recipeDirectory: string,
  recipe: string,
  relativeFile: string,
  content: string,
  issues: ContentIssue[],
): Promise<void> {
  const absoluteRecipeDirectory = path.resolve(recipeDirectory);
  const containmentRoot = path.dirname(path.dirname(absoluteRecipeDirectory));
  let inspectedLinks = 0;
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    inspectedLinks += 1;
    if (inspectedLinks > MAX_RELATIVE_LINKS_PER_FILE) {
      push(
        issues,
        recipe,
        relativeFile,
        "TOO_MANY_RELATIVE_LINKS",
        `File exceeds the limit of ${MAX_RELATIVE_LINKS_PER_FILE} Markdown links.`,
      );
      break;
    }
    const target = match[1]?.trim();
    if (!target || /^[a-z]+:/i.test(target)) continue;
    const decoded = decodedLinkTarget(target);
    if (!decoded) {
      push(
        issues,
        recipe,
        relativeFile,
        "INVALID_RELATIVE_LINK_ENCODING",
        `Relative link contains malformed percent encoding: ${target}`,
      );
      continue;
    }
    if (decoded.pathname && path.isAbsolute(decoded.pathname)) {
      push(
        issues,
        recipe,
        relativeFile,
        "UNSAFE_RELATIVE_LINK",
        `Relative link uses an absolute filesystem path: ${target}`,
      );
      continue;
    }
    const resolved = decoded.pathname
      ? path.resolve(absoluteRecipeDirectory, path.dirname(relativeFile), decoded.pathname)
      : path.resolve(absoluteRecipeDirectory, relativeFile);
    if (!isContained(containmentRoot, resolved)) {
      push(
        issues,
        recipe,
        relativeFile,
        "UNSAFE_RELATIVE_LINK",
        `Relative link escapes the catalog repository boundary: ${target}`,
      );
      continue;
    }
    let targetContent: string | null = null;
    try {
      await assertNoSymlink(containmentRoot, resolved);
      const info = await lstat(resolved);
      if (info.isSymbolicLink()) {
        throw new AwfError("INVALID_PATH", "Relative link targets must not be symbolic links.");
      }
      if (!info.isFile() && !info.isDirectory()) {
        throw new AwfError("INVALID_PATH", "Relative links must target a file or directory.");
      }
      if (decoded.anchor !== null && info.isFile()) {
        targetContent = (
          await readBoundedRegularFile(resolved, MAX_RECIPE_FILE_BYTES, containmentRoot)
        ).toString("utf8");
      }
    } catch (error) {
      const code = relativeLinkFailureCode(error);
      push(
        issues,
        recipe,
        relativeFile,
        code,
        code === "BROKEN_RELATIVE_LINK"
          ? `Relative link does not resolve: ${target}`
          : `Relative link cannot be inspected safely: ${target}. ${
              error instanceof Error ? error.message : String(error)
            }`,
      );
      continue;
    }
    if (
      decoded.anchor !== null &&
      targetContent !== null &&
      !markdownAnchors(targetContent).has(decoded.anchor)
    ) {
      push(
        issues,
        recipe,
        relativeFile,
        "BROKEN_RELATIVE_LINK_ANCHOR",
        `Relative link anchor does not resolve: ${target}`,
      );
    }
  }
}

interface RecipeContentValidation {
  issues: ContentIssue[];
  recipe: Recipe | null;
  totalBytes: number;
}

async function recipeLoadIssue(
  recipeDirectory: string,
  error: unknown,
): Promise<Omit<ContentIssue, "recipe">> {
  let file = "recipe.yml";
  if (error instanceof AwfError && typeof error.details.path === "string") {
    const requestedRoot = path.resolve(recipeDirectory);
    const roots = [requestedRoot];
    try {
      const canonicalRoot = await realpath(requestedRoot);
      if (canonicalRoot !== requestedRoot) roots.unshift(canonicalRoot);
    } catch {
      // The requested path still identifies missing-file errors when canonicalization is impossible.
    }
    const candidate = path.resolve(error.details.path);
    for (const root of roots) {
      const relative = path.relative(root, candidate);
      if (isContained(root, candidate) && relative) {
        file = relative.split(path.sep).join("/");
        break;
      }
    }
  }
  const incompleteMarker =
    error instanceof AwfError && error.details.reason === "incomplete-marker";
  const code = incompleteMarker
    ? "PLACEHOLDER"
    : error instanceof AwfError && error.code !== "INVALID_RECIPE"
      ? error.code
      : "INVALID_RECIPE_CONTRACT";
  return {
    file,
    code,
    message: error instanceof Error ? error.message : String(error),
  };
}

async function validateRecipeContentResult(
  recipeDirectory: string,
  options: CatalogLoadOptions = {},
): Promise<RecipeContentValidation> {
  const issues: ContentIssue[] = [];
  const recipeName = path.basename(recipeDirectory);
  const markdownFiles = [
    "workflow.md",
    "README.md",
    "checklist.md",
    "examples/input.md",
    "examples/expected-output.md",
  ] as const;
  const files = [...markdownFiles, "output.schema.json"] as const;
  let loaded: Awaited<ReturnType<typeof loadRecipeSource>>;
  try {
    loaded = await loadRecipeSource(recipeDirectory, options);
  } catch (error) {
    const issue = await recipeLoadIssue(recipeDirectory, error);
    push(issues, recipeName, issue.file, issue.code, issue.message);
    const inspectedBytes =
      error instanceof AwfError &&
      typeof error.details.recipeBytes === "number" &&
      Number.isSafeInteger(error.details.recipeBytes) &&
      error.details.recipeBytes >= 0
        ? error.details.recipeBytes
        : 0;
    return { issues, recipe: null, totalBytes: inspectedBytes };
  }
  const recipe = loaded.recipe;
  const content = Object.fromEntries(
    files.map((file) => [file, loaded.files[file]] as const),
  ) as Record<(typeof files)[number], string>;

  for (const [file, source] of Object.entries(markdownBundleSources) as Array<
    [keyof typeof markdownBundleSources, RecipeBundleSource]
  >) {
    for (const violation of findUnsafeAdapterInterpolations(content[file], source)) {
      push(
        issues,
        recipeName,
        file,
        "UNSAFE_ADAPTER_INTERPOLATION",
        `${file} contains ${violation.syntax}, which ${violation.agent} interprets as ${violation.effect}; recipe bundle content must remain inert.`,
      );
    }
  }

  for (const file of markdownFiles) {
    const markdown = content[file];
    for (const pattern of PLACEHOLDERS) {
      if (pattern.test(markdown))
        push(
          issues,
          recipeName,
          file,
          "PLACEHOLDER",
          `Content matches prohibited placeholder ${pattern}.`,
        );
    }
  }

  for (const file of markdownFiles) {
    const markdown = content[file];
    for (const pattern of UNBOUNDED_PHRASES) {
      if (pattern.test(markdown))
        push(
          issues,
          recipe.id,
          file,
          "UNBOUNDED_PHRASE",
          `Content uses unbounded phrase ${pattern}.`,
        );
    }
    const h1 = [...withoutFencedCode(markdown).matchAll(/^#\s+(.+)$/gm)];
    if (h1.length !== 1)
      push(
        issues,
        recipe.id,
        file,
        "INVALID_TITLE_COUNT",
        `Expected one level-one title, found ${h1.length}.`,
      );
    await validateRelativeLinks(recipeDirectory, recipe.id, file, markdown, issues);
  }

  try {
    const outputContract = outputContractSchema.parse(
      JSON.parse(content["output.schema.json"]) as unknown,
    );
    const outputContractIssues = validateExpectedOutput(
      outputContract,
      content["examples/expected-output.md"],
    );
    for (const issue of outputContractIssues) {
      push(issues, recipe.id, "examples/expected-output.md", issue.code, issue.message);
    }
    const contractuallyTrivial = outputContract["x-awf-output-contract"].artifacts.every(
      (artifact) => {
        const artifactIssues = outputContractIssues.filter(
          (issue) => issue.artifact === artifact.path,
        );
        if (artifactIssues.some((issue) => issue.code === "MISSING_OUTPUT_ARTIFACT")) return true;
        const allHeadingsMissing = artifact.required_headings.every((heading) =>
          artifactIssues.some(
            (issue) =>
              issue.code === "MISSING_OUTPUT_HEADING" && issue.message.endsWith(`: ${heading}.`),
          ),
        );
        const evidenceMissing =
          artifact.evidence_references !== "required" ||
          artifactIssues.some((issue) => issue.code === "MISSING_OUTPUT_EVIDENCE");
        return allHeadingsMissing && evidenceMissing;
      },
    );
    if (contractuallyTrivial)
      push(
        issues,
        recipe.id,
        "examples/expected-output.md",
        "TRIVIAL_EXPECTED_OUTPUT",
        "Expected output omits every contract-required artifact or all required structure and evidence.",
      );
  } catch (error) {
    push(
      issues,
      recipe.id,
      "output.schema.json",
      "INVALID_OUTPUT_SCHEMA",
      error instanceof Error ? error.message : String(error),
    );
  }

  const workflowSections = sections(content["workflow.md"]);
  const workflowHeadings = workflowSections.map((section) => section.heading);
  for (const required of WORKFLOW_SECTIONS) {
    const section = workflowSections.find((candidate) => candidate.heading === required);
    if (!section)
      push(
        issues,
        recipe.id,
        "workflow.md",
        "MISSING_SECTION",
        `Missing required section: ${required}.`,
      );
    else if (!hasMeaningfulSectionContent(section.body))
      push(
        issues,
        recipe.id,
        "workflow.md",
        "EMPTY_SECTION",
        `Section is empty or trivial: ${required}.`,
      );
  }
  const ordered = WORKFLOW_SECTIONS.filter((heading) => workflowHeadings.includes(heading));
  if (
    ordered.some(
      (heading, index) =>
        workflowHeadings.indexOf(heading) > workflowHeadings.indexOf(ordered[index + 1] ?? heading),
    )
  )
    push(
      issues,
      recipe.id,
      "workflow.md",
      "SECTION_ORDER",
      "Canonical workflow sections are out of order.",
    );

  const workflow = content["workflow.md"];
  for (const item of recipe.inputs.required) {
    if (
      !covers(
        workflowSections.find((section) => section.heading === "Required inputs")?.body ?? "",
        item,
      )
    )
      push(
        issues,
        recipe.id,
        "workflow.md",
        "MISSING_REQUIRED_INPUT",
        `Required input is not represented: ${item}`,
      );
  }
  for (const item of recipe.outputs) {
    if (
      !covers(
        workflowSections.find((section) => section.heading === "Expected output")?.body ?? "",
        item,
      )
    )
      push(
        issues,
        recipe.id,
        "workflow.md",
        "MISSING_OUTPUT",
        `Declared output is not represented: ${item}`,
      );
  }
  for (const item of recipe.safety.forbidden_actions) {
    if (
      !covers(
        workflowSections.find((section) => section.heading === "Safety guardrails")?.body ?? "",
        item,
      )
    )
      push(
        issues,
        recipe.id,
        "workflow.md",
        "MISSING_FORBIDDEN_ACTION",
        `Forbidden action is not represented: ${item}`,
      );
  }
  for (const item of recipe.safety.requires_human_approval) {
    if (
      !covers(
        workflowSections.find((section) => section.heading === "Human approval gates")?.body ?? "",
        item,
      )
    )
      push(
        issues,
        recipe.id,
        "workflow.md",
        "MISSING_APPROVAL",
        `Human approval is not represented: ${item}`,
      );
  }

  const failureIds = [...workflow.matchAll(/^[-*]\s+\*\*(F\d+):?\*\*/gm)].map(
    (match) => match[1] as string,
  );
  const recoveryIds = [...workflow.matchAll(/^[-*]\s+\*\*(R\d+):?\*\*/gm)].map(
    (match) => match[1] as string,
  );
  const failures = new Set(failureIds);
  const recoveries = new Set(recoveryIds);
  if (failures.size === 0 || recoveries.size === 0)
    push(
      issues,
      recipe.id,
      "workflow.md",
      "UNPAIRED_FAILURE_RECOVERY",
      "Failure modes and recovery procedures require explicit F/R IDs.",
    );
  for (const failure of failures) {
    const expected = `R${failure?.slice(1)}`;
    if (!recoveries.has(expected))
      push(
        issues,
        recipe.id,
        "workflow.md",
        "UNPAIRED_FAILURE_RECOVERY",
        `${failure} has no ${expected} recovery.`,
      );
  }
  for (const recovery of recoveries) {
    const expected = `F${recovery.slice(1)}`;
    if (!failures.has(expected))
      push(
        issues,
        recipe.id,
        "workflow.md",
        "ORPHAN_RECOVERY",
        `${recovery} has no ${expected} failure mode.`,
      );
  }
  for (const id of duplicateIds(failureIds))
    push(
      issues,
      recipe.id,
      "workflow.md",
      "DUPLICATE_FAILURE_ID",
      `Failure ID is defined more than once: ${id}.`,
    );
  for (const id of duplicateIds(recoveryIds))
    push(
      issues,
      recipe.id,
      "workflow.md",
      "DUPLICATE_RECOVERY_ID",
      `Recovery ID is defined more than once: ${id}.`,
    );

  const decisionBody =
    workflowSections.find((section) => section.heading === "Decision points")?.body ?? "";
  const decisionItems = decisionBody.split("\n").filter((line) => /^[-*]\s+/.test(line));
  if (decisionItems.length === 0 || decisionItems.some((line) => !isConditionalDecision(line)))
    push(
      issues,
      recipe.id,
      "workflow.md",
      "NON_CONDITIONAL_DECISION",
      "Every decision item must state an explicit If condition followed by a concrete action.",
    );

  const readmeSections = sections(content["README.md"]);
  for (const required of README_SECTIONS) {
    const section = readmeSections.find((candidate) => candidate.heading === required);
    if (!section)
      push(
        issues,
        recipe.id,
        "README.md",
        "INCOMPLETE_README",
        `Missing README section: ${required}.`,
      );
    else if (!hasMeaningfulSectionContent(section.body))
      push(
        issues,
        recipe.id,
        "README.md",
        "EMPTY_README_SECTION",
        `README section is empty or trivial: ${required}.`,
      );
  }
  const verificationReadme = readmeSections.find(
    (section) => section.heading === "Verification status",
  )?.body;
  if (
    !verificationReadme ||
    !/(?:structural[^.\n]*derived|derived[^.\n]*structural)/i.test(verificationReadme) ||
    !/(?:installation[^.\n]*untested|untested[^.\n]*installation)/i.test(verificationReadme) ||
    !/(?:execution[^.\n]*untested|untested[^.\n]*execution)/i.test(verificationReadme) ||
    !/(?:outcome[^.\n]*untested|untested[^.\n]*outcome)/i.test(verificationReadme) ||
    /(?:structural[^.\n]*passing|passing[^.\n]*structural)/i.test(verificationReadme)
  )
    push(
      issues,
      recipe.id,
      "README.md",
      "INCOHERENT_VERIFICATION_README",
      "Verification status must describe structural checks as derived and installation, execution, and outcome as untested unless retained evidence proves otherwise.",
    );

  const checklistSections = sections(content["checklist.md"]);
  if (
    checklistSections.length === 0 ||
    checklistSections.some((section) => !/^- \[ \]\s+\S/m.test(section.body))
  )
    push(
      issues,
      recipe.id,
      "checklist.md",
      "TRIVIAL_CHECKLIST",
      "The execution checklist must organize actionable controls under named phases.",
    );
  const workflowActions = new Set(
    workflow
      .split("\n")
      .filter((line) => /^\d+\.\s+/.test(line))
      .map((line) => normalizedControl(line.replace(/^\d+\.\s+/, "")))
      .filter(Boolean),
  );
  const copiedControls = content["checklist.md"]
    .split("\n")
    .filter((line) => /^- \[ \]\s+/.test(line))
    .map((line) => normalizedControl(line.replace(/^- \[ \]\s+/, "")))
    .filter((line) => workflowActions.has(line));
  if (copiedControls.length > 1)
    push(
      issues,
      recipe.id,
      "checklist.md",
      "CHECKLIST_COPIES_WORKFLOW",
      "Multiple checklist controls copy workflow actions instead of checking execution omissions.",
    );

  const input = content["examples/input.md"];
  const output = content["examples/expected-output.md"];
  const syntheticMarker = /\b(?:fictional|synthetic)\b/i;
  if (!syntheticMarker.test(input))
    push(
      issues,
      recipe.id,
      "examples/input.md",
      "UNLABELED_SYNTHETIC_INPUT",
      "Example input must identify its scenario as synthetic or fictional.",
    );
  if (!syntheticMarker.test(output))
    push(
      issues,
      recipe.id,
      "examples/expected-output.md",
      "UNLABELED_SYNTHETIC_OUTPUT",
      "Expected output must remain identifiable as synthetic or fictional when read alone.",
    );
  const inventoryHeading = /^## Evidence inventory\s*$/m.exec(input);
  const scenarioPrefix = inventoryHeading ? input.slice(0, inventoryHeading.index) : "";
  if (
    !inventoryHeading ||
    !scenarioPrefix
      .split("\n")
      .some((line) => line.trim().length > 0 && !/^#{1,6}\s/.test(line.trim()))
  )
    push(
      issues,
      recipe.id,
      "examples/input.md",
      "TRIVIAL_EXAMPLE_INPUT",
      "Example input must present a self-contained scenario before its evidence inventory.",
    );
  if (/^(?:this|the) (?:output|report|result) (?:will|should|includes?)\b/im.test(output))
    push(
      issues,
      recipe.id,
      "examples/expected-output.md",
      "DESCRIPTIVE_OUTPUT",
      "Expected output describes an artifact instead of presenting it.",
    );

  const definitions = evidenceDefinitions(input);
  for (const id of duplicateIds(definitions))
    push(
      issues,
      recipe.id,
      "examples/input.md",
      "DUPLICATE_EVIDENCE_ID",
      `Evidence ID is defined more than once: ${id}.`,
    );
  if (definitions.length === 0)
    push(
      issues,
      recipe.id,
      "examples/input.md",
      "MISSING_EVIDENCE",
      "At least one evidence ID is required.",
    );
  const evidenceSections = sections(input, 3).filter((section) =>
    /^E\d+\s+(?:-|:)/.test(section.heading),
  );
  for (const section of evidenceSections) {
    if (!hasMeaningfulSectionContent(section.body)) {
      push(
        issues,
        recipe.id,
        "examples/input.md",
        "TRIVIAL_EVIDENCE_RECORD",
        `Evidence record ${section.heading.split(/\s+/)[0]} lacks structured source details.`,
      );
    }
  }
  const known = new Set(definitions);
  const outputReferences = evidenceReferences(output);
  if (outputReferences.length === 0)
    push(
      issues,
      recipe.id,
      "examples/expected-output.md",
      "MISSING_OUTPUT_EVIDENCE",
      "Expected output must trace material claims to the input evidence inventory.",
    );
  for (const id of new Set(outputReferences)) {
    if (!known.has(id))
      push(
        issues,
        recipe.id,
        "examples/expected-output.md",
        "UNKNOWN_EVIDENCE_ID",
        `Output cites undefined evidence ID: ${id}.`,
      );
  }

  return { issues, recipe, totalBytes: loaded.totalBytes };
}

export async function validateRecipeContent(
  recipeDirectory: string,
  options: CatalogLoadOptions = {},
): Promise<ContentIssue[]> {
  return (await validateRecipeContentResult(recipeDirectory, options)).issues;
}

function filesystemErrorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

async function catalogRecipeDirectories(
  recipesDirectory: string,
  maxRecipes: number,
): Promise<string[]> {
  const absolute = path.resolve(recipesDirectory);
  let rootInformation: Awaited<ReturnType<typeof lstat>>;
  try {
    rootInformation = await lstat(absolute);
  } catch (error) {
    const code = filesystemErrorCode(error);
    throw new AwfError(
      code === "ENOENT" ? "MISSING_FILE" : "INVALID_PATH",
      "Cannot safely inspect the content-validation catalog root.",
      { path: absolute, causeCode: code },
    );
  }
  if (rootInformation.isSymbolicLink() || !rootInformation.isDirectory()) {
    throw new AwfError("INVALID_PATH", "Content validation requires a real catalog directory.", {
      path: absolute,
    });
  }
  let resolvedRoot: string;
  try {
    resolvedRoot = await realpath(absolute);
  } catch (error) {
    throw new AwfError("INVALID_PATH", "Cannot resolve the content-validation catalog root.", {
      path: absolute,
      causeCode: filesystemErrorCode(error),
    });
  }

  const directories: string[] = [];
  let entries: Awaited<ReturnType<typeof opendir>>;
  try {
    entries = await opendir(resolvedRoot);
  } catch (error) {
    throw new AwfError("INVALID_PATH", "Cannot enumerate the content-validation catalog.", {
      path: resolvedRoot,
      causeCode: filesystemErrorCode(error),
    });
  }
  for await (const entry of entries) {
    const candidate = path.join(resolvedRoot, entry.name);
    let information: Awaited<ReturnType<typeof lstat>>;
    try {
      information = await lstat(candidate);
    } catch (error) {
      throw new AwfError("INVALID_PATH", "Cannot inspect a content-validation catalog entry.", {
        path: candidate,
        causeCode: filesystemErrorCode(error),
      });
    }
    if (information.isSymbolicLink()) {
      throw new AwfError(
        "INVALID_PATH",
        "Content-validation catalog entries must not be symbolic links.",
        { path: candidate },
      );
    }
    if (!information.isDirectory()) continue;
    directories.push(candidate);
    if (directories.length > maxRecipes) {
      throw new AwfError(
        "FILE_TOO_LARGE",
        "Content-validation catalog recipe count exceeds the configured limit.",
        {
          path: resolvedRoot,
          limit: maxRecipes,
          actual: directories.length,
        },
      );
    }
  }
  return directories.sort((left, right) => left.localeCompare(right));
}

export async function validateCatalogContent(
  recipesDirectory: string,
  options: CatalogLoadOptions = {},
): Promise<ContentIssue[]> {
  const limits = resolveCatalogLoadLimits(options);
  const directories = await catalogRecipeDirectories(recipesDirectory, limits.maxRecipes);
  const issues: ContentIssue[] = [];
  const validRecipes: Recipe[] = [];
  let catalogBytes = 0;
  for (const directory of directories) {
    const result = await validateRecipeContentResult(directory, limits);
    catalogBytes += result.totalBytes;
    if (catalogBytes > limits.maxCatalogBytes) {
      throw new AwfError(
        "FILE_TOO_LARGE",
        "Content-validation catalog exceeds the configured total byte limit.",
        {
          path: path.resolve(recipesDirectory),
          resource: "catalog-bytes",
          limit: limits.maxCatalogBytes,
          actual: catalogBytes,
        },
      );
    }
    issues.push(...result.issues);
    if (result.recipe) validRecipes.push(result.recipe);
  }
  const titles = new Map<string, string>();
  for (const recipe of validRecipes) {
    const previous = titles.get(recipe.title.toLowerCase());
    if (previous)
      push(
        issues,
        recipe.id,
        "recipe.yml",
        "DUPLICATE_RECIPE_TITLE",
        `Recipe title duplicates ${previous}: ${recipe.title}.`,
      );
    else titles.set(recipe.title.toLowerCase(), recipe.id);
  }
  return issues.sort((left, right) =>
    `${left.recipe}/${left.file}/${left.code}`.localeCompare(
      `${right.recipe}/${right.file}/${right.code}`,
    ),
  );
}
