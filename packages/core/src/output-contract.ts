import { z } from "zod";

const cleanText = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), "Values cannot contain surrounding whitespace.");

const uniqueTextArray = z
  .array(cleanText)
  .min(1)
  .superRefine((items, context) => {
    const seen = new Set<string>();
    for (const [index, item] of items.entries()) {
      if (seen.has(item)) {
        context.addIssue({
          code: "custom",
          path: [index],
          message: `Duplicate value: ${item}.`,
        });
      }
      seen.add(item);
    }
  });

const artifactPath = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/)
  .refine((value) => value !== "output.schema.json", "Artifact paths must name Markdown files.");

const outputArtifactSchema = z
  .object({
    path: artifactPath,
    audience: cleanText,
    requires_title: z.boolean(),
    required_headings: uniqueTextArray,
    required_literals: z.array(cleanText).optional(),
    evidence_references: z.enum(["required", "forbidden", "optional"]),
    minimum_distinct_evidence_references: z.number().int().min(0),
  })
  .strict()
  .superRefine((artifact, context) => {
    if (
      artifact.evidence_references === "required" &&
      artifact.minimum_distinct_evidence_references < 1
    ) {
      context.addIssue({
        code: "custom",
        path: ["minimum_distinct_evidence_references"],
        message: "Evidence-based artifacts must require at least one distinct evidence reference.",
      });
    }
    if (
      artifact.evidence_references === "forbidden" &&
      artifact.minimum_distinct_evidence_references !== 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["minimum_distinct_evidence_references"],
        message: "Public artifacts that forbid evidence IDs must set the evidence minimum to zero.",
      });
    }
  });

export const outputContractSchema = z
  .object({
    $schema: z.literal("https://json-schema.org/draft/2020-12/schema"),
    $id: z.url(),
    title: cleanText,
    description: cleanText,
    type: z.literal("string"),
    contentMediaType: z.literal("text/markdown"),
    "x-awf-output-contract": z
      .object({
        container: z.enum(["document", "fenced-files"]),
        artifacts: z.array(outputArtifactSchema).min(1),
      })
      .strict(),
  })
  .strict()
  .superRefine((schema, context) => {
    const contract = schema["x-awf-output-contract"];
    if (contract.container === "document" && contract.artifacts.length !== 1) {
      context.addIssue({
        code: "custom",
        path: ["x-awf-output-contract", "artifacts"],
        message: "A document output contract must declare exactly one artifact.",
      });
    }
    const seen = new Set<string>();
    for (const [index, artifact] of contract.artifacts.entries()) {
      if (seen.has(artifact.path)) {
        context.addIssue({
          code: "custom",
          path: ["x-awf-output-contract", "artifacts", index, "path"],
          message: `Duplicate output artifact path: ${artifact.path}.`,
        });
      }
      seen.add(artifact.path);
    }
  });

export type OutputContract = z.infer<typeof outputContractSchema>;

export interface OutputContractIssue {
  code:
    | "MISSING_OUTPUT_ARTIFACT"
    | "UNDECLARED_OUTPUT_ARTIFACT"
    | "DUPLICATE_OUTPUT_ARTIFACT"
    | "MISSING_OUTPUT_HEADING"
    | "MISSING_OUTPUT_LITERAL"
    | "EMPTY_REQUIRED_TABLE"
    | "MISSING_OUTPUT_EVIDENCE"
    | "INSUFFICIENT_OUTPUT_EVIDENCE"
    | "EMPTY_OUTPUT_SECTION"
    | "PUBLIC_OUTPUT_EVIDENCE_LEAK"
    | "INVALID_OUTPUT_TITLE_COUNT"
    | "UNDECLARED_OUTPUT_CONTENT";
  artifact: string;
  message: string;
}

interface ParsedFencedFiles {
  files: Map<string, string[]>;
  outside: string;
}

function fencedFiles(markdown: string): ParsedFencedFiles {
  const files = new Map<string, string[]>();
  const retainedOutside: string[] = [];
  const expression = /^## File: `([^`]+)`\s*\n+```(?:markdown|md)\s*\n([\s\S]*?)\n```\s*$/gm;
  let cursor = 0;
  for (const match of markdown.matchAll(expression)) {
    retainedOutside.push(markdown.slice(cursor, match.index));
    const file = match[1] as string;
    const bodies = files.get(file) ?? [];
    bodies.push(match[2] as string);
    files.set(file, bodies);
    cursor = (match.index ?? 0) + match[0].length;
  }
  retainedOutside.push(markdown.slice(cursor));
  return { files, outside: retainedOutside.join("\n") };
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

function materialMarkdown(markdown: string): string {
  return withoutFencedCode(markdown).replace(/<!--[\s\S]*?(?:-->|$)/g, "");
}

function headings(markdown: string): Set<string> {
  return new Set(
    [...materialMarkdown(markdown).matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((match) =>
      (match[1] as string).replace(/\s+#+$/, "").trim(),
    ),
  );
}

interface ParsedHeading {
  level: number;
  title: string;
  line: number;
}

function parsedHeadings(markdown: string): ParsedHeading[] {
  const lines = materialMarkdown(markdown).split("\n");
  const parsed: ParsedHeading[] = [];
  for (const [line, value] of lines.entries()) {
    const match = value.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;
    parsed.push({
      level: (match[1] as string).length,
      title: (match[2] as string).replace(/\s+#+$/, "").trim(),
      line,
    });
  }
  return parsed;
}

function substantiveLines(markdown: string): string[] {
  return materialMarkdown(markdown)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (line.length === 0 || /^#{1,6}\s+/.test(line)) return false;
      if (/^(?:`{3,}|~{3,}|-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return false;
      if (/^\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line)) return false;
      if (/^\*\*SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE\*\*$/.test(line)) return false;
      const withoutMarkup = line.replace(/^[\s>*+\d.\-|]+/, "").replace(/[`*_~|:#()[\]]/g, "");
      return /[a-z0-9]/i.test(withoutMarkup);
    });
}

function headingBody(markdown: string, required: string): string | null {
  const material = materialMarkdown(markdown);
  const lines = material.split("\n");
  const allHeadings = parsedHeadings(markdown);
  const heading = allHeadings.find((candidate) => candidate.title === required);
  if (!heading) return null;
  const next = allHeadings.find(
    (candidate) => candidate.line > heading.line && candidate.level <= heading.level,
  );
  return lines.slice(heading.line + 1, next?.line).join("\n");
}

function isTableSeparator(line: string): boolean {
  return /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line.trim());
}

function hasPopulatedRequiredTable(markdown: string, header: string): boolean {
  const lines = materialMarkdown(markdown).split("\n");
  const headerIndex = lines.findIndex((line) => line.trim() === header);
  if (headerIndex < 0) return false;
  const separator = lines[headerIndex + 1];
  if (!separator || !isTableSeparator(separator)) return false;
  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";
    if (!line.startsWith("|")) return false;
    if (!isTableSeparator(line) && /[a-z0-9]/i.test(line.replace(/[|`*_~:#()[\]-]/g, ""))) {
      return true;
    }
  }
  return false;
}

function undeclaredWrapperContent(markdown: string): string {
  return markdown
    .replace(/^#\s+.+$/gm, "")
    .replace(/^\*\*SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE\*\*$/gm, "")
    .trim();
}

export function validateExpectedOutput(
  contract: OutputContract,
  markdown: string,
): OutputContractIssue[] {
  const issues: OutputContractIssue[] = [];
  const declaration = contract["x-awf-output-contract"];
  const parsed =
    declaration.container === "document"
      ? { files: new Map([[declaration.artifacts[0]?.path as string, [markdown]]]), outside: "" }
      : fencedFiles(markdown);
  const files = parsed.files;
  const declared = new Set(declaration.artifacts.map((artifact) => artifact.path));

  if (
    declaration.container === "fenced-files" &&
    undeclaredWrapperContent(parsed.outside).length > 0
  ) {
    issues.push({
      code: "UNDECLARED_OUTPUT_CONTENT",
      artifact: "<wrapper>",
      message:
        "Fenced-file output may contain only its wrapper title, the synthetic-example banner, and declared file blocks.",
    });
  }

  for (const [file, bodies] of files) {
    if (!declared.has(file)) {
      issues.push({
        code: "UNDECLARED_OUTPUT_ARTIFACT",
        artifact: file,
        message: `Expected output contains undeclared artifact ${file}.`,
      });
    }
    if (bodies.length > 1) {
      issues.push({
        code: "DUPLICATE_OUTPUT_ARTIFACT",
        artifact: file,
        message: `Expected output defines artifact ${file} more than once.`,
      });
    }
  }

  for (const artifact of declaration.artifacts) {
    const bodies = files.get(artifact.path);
    if (!bodies || bodies.length === 0) {
      issues.push({
        code: "MISSING_OUTPUT_ARTIFACT",
        artifact: artifact.path,
        message: `Expected output does not contain artifact ${artifact.path}.`,
      });
      continue;
    }
    const body = bodies[0] as string;
    const materialBody = materialMarkdown(body);
    const actualHeadings = headings(body);
    if (artifact.requires_title) {
      const titles = [...materialBody.matchAll(/^#\s+(.+?)\s*$/gm)];
      if (titles.length !== 1) {
        issues.push({
          code: "INVALID_OUTPUT_TITLE_COUNT",
          artifact: artifact.path,
          message: `${artifact.path} must contain exactly one level-one title.`,
        });
      }
    }
    for (const required of artifact.required_headings) {
      if (!actualHeadings.has(required)) {
        issues.push({
          code: "MISSING_OUTPUT_HEADING",
          artifact: artifact.path,
          message: `${artifact.path} is missing required heading: ${required}.`,
        });
      } else {
        const sectionBody = headingBody(body, required);
        if (sectionBody === null || substantiveLines(sectionBody).length === 0) {
          issues.push({
            code: "EMPTY_OUTPUT_SECTION",
            artifact: artifact.path,
            message: `${artifact.path} has no substantive content under required heading: ${required}.`,
          });
        }
      }
    }
    for (const required of artifact.required_literals ?? []) {
      if (!materialBody.includes(required)) {
        issues.push({
          code: "MISSING_OUTPUT_LITERAL",
          artifact: artifact.path,
          message: `${artifact.path} is missing required content: ${required}.`,
        });
      } else if (required.startsWith("|") && !hasPopulatedRequiredTable(body, required)) {
        issues.push({
          code: "EMPTY_REQUIRED_TABLE",
          artifact: artifact.path,
          message: `${artifact.path} must populate the required table headed by: ${required}.`,
        });
      }
    }
    const references = [...materialBody.matchAll(/\bE\d+\b/g)];
    const distinctReferences = new Set(references.map((reference) => reference[0])).size;
    if (artifact.evidence_references === "required" && references.length === 0) {
      issues.push({
        code: "MISSING_OUTPUT_EVIDENCE",
        artifact: artifact.path,
        message: `${artifact.path} must contain evidence references.`,
      });
    } else if (distinctReferences < artifact.minimum_distinct_evidence_references) {
      issues.push({
        code: "INSUFFICIENT_OUTPUT_EVIDENCE",
        artifact: artifact.path,
        message: `${artifact.path} contains ${distinctReferences} distinct evidence reference(s), below the declared minimum of ${artifact.minimum_distinct_evidence_references}.`,
      });
    }
    if (artifact.evidence_references === "forbidden" && references.length > 0) {
      issues.push({
        code: "PUBLIC_OUTPUT_EVIDENCE_LEAK",
        artifact: artifact.path,
        message: `${artifact.path} must not contain internal evidence references.`,
      });
    }
  }

  return issues;
}
