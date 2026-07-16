import { describe, expect, it } from "vitest";
import { outputContractSchema, validateExpectedOutput } from "./output-contract.js";

function documentContract() {
  return outputContractSchema.parse({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://agentic-workflows.dev/output-contracts/example/1.0.0",
    title: "Example output contract",
    description: "Validates a complete evidence-based example report.",
    type: "string",
    contentMediaType: "text/markdown",
    "x-awf-output-contract": {
      container: "document",
      artifacts: [
        {
          path: "example-report.md",
          audience: "repository maintainer",
          requires_title: true,
          required_headings: ["Finding", "Limitations"],
          evidence_references: "required",
          minimum_distinct_evidence_references: 1,
        },
      ],
    },
  });
}

function fencedContract() {
  return outputContractSchema.parse({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://agentic-workflows.dev/output-contracts/split-example/1.0.0",
    title: "Split example output contract",
    description: "Validates separate public and internal Markdown artifacts.",
    type: "string",
    contentMediaType: "text/markdown",
    "x-awf-output-contract": {
      container: "fenced-files",
      artifacts: [
        {
          path: "public.md",
          audience: "public",
          requires_title: true,
          required_headings: ["Changes"],
          evidence_references: "forbidden",
          minimum_distinct_evidence_references: 0,
        },
        {
          path: "evidence.md",
          audience: "maintainers",
          requires_title: true,
          required_headings: ["Traceability"],
          evidence_references: "required",
          minimum_distinct_evidence_references: 1,
        },
      ],
    },
  });
}

describe("output contracts", () => {
  it("accepts a complete document artifact", () => {
    expect(
      validateExpectedOutput(
        documentContract(),
        "# Report\n\n## Finding\n\nObserved behavior is established by E1.\n\n## Limitations\n\nNo execution evidence was supplied.\n",
      ),
    ).toEqual([]);
  });

  it("does not let fenced code satisfy headings, titles, or evidence", () => {
    const issues = validateExpectedOutput(
      documentContract(),
      "```markdown\n# False title\n## Finding\n## Limitations\nE1\n```\n",
    );
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "INVALID_OUTPUT_TITLE_COUNT",
        "MISSING_OUTPUT_HEADING",
        "MISSING_OUTPUT_EVIDENCE",
      ]),
    );
  });

  it("rejects a heading-only artifact even when every required heading exists", () => {
    const issues = validateExpectedOutput(
      documentContract(),
      "# Report\n\n## Finding\n\n## Limitations\n\nE1\n",
    );
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["EMPTY_OUTPUT_SECTION"]),
    );
  });

  it("enforces the declared distinct-evidence floor", () => {
    const base = documentContract();
    const contract = outputContractSchema.parse({
      ...base,
      "x-awf-output-contract": {
        ...base["x-awf-output-contract"],
        artifacts: [
          {
            ...base["x-awf-output-contract"].artifacts[0],
            minimum_distinct_evidence_references: 2,
          },
        ],
      },
    });
    const issues = validateExpectedOutput(
      contract,
      "# Report\n\n## Finding\n\nObserved behavior is established by E1.\n\n## Limitations\n\nNo additional source was supplied.\n",
    );
    expect(issues.map((issue) => issue.code)).toContain("INSUFFICIENT_OUTPUT_EVIDENCE");
  });

  it("requires a body row for every required Markdown table", () => {
    const base = documentContract();
    const header = "| Finding | Evidence |";
    const contract = outputContractSchema.parse({
      ...base,
      "x-awf-output-contract": {
        ...base["x-awf-output-contract"],
        artifacts: [
          {
            ...base["x-awf-output-contract"].artifacts[0],
            required_literals: [header],
          },
        ],
      },
    });
    const output = `# Report

## Finding

${header}
| --- | --- |

## Limitations

No additional source was supplied. [E1]
`;
    expect(validateExpectedOutput(contract, output).map((issue) => issue.code)).toContain(
      "EMPTY_REQUIRED_TABLE",
    );
  });

  it.each([
    ["tilde", "~~~markdown", "~~~"],
    ["long backtick", "````markdown", "````"],
  ])("does not let %s fences satisfy material requirements", (_label, opening, closing) => {
    const issues = validateExpectedOutput(
      documentContract(),
      `${opening}\n# False title\n## Finding\n## Limitations\nE1\n${closing}\n`,
    );
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "INVALID_OUTPUT_TITLE_COUNT",
        "MISSING_OUTPUT_HEADING",
        "MISSING_OUTPUT_EVIDENCE",
      ]),
    );
  });

  it("does not treat backticks in a fence info string as a valid fence", () => {
    const issues = validateExpectedOutput(
      documentContract(),
      "```invalid`\n# False title\n## Finding\n## Limitations\nE1\n```\n",
    );
    expect(issues.length).toBeGreaterThan(0);
  });

  it("requires literals and evidence outside code fences and HTML comments", () => {
    const base = documentContract();
    const contract = outputContractSchema.parse({
      ...base,
      "x-awf-output-contract": {
        ...base["x-awf-output-contract"],
        artifacts: [
          {
            ...base["x-awf-output-contract"].artifacts[0],
            required_literals: ["APPROVED FOR RELEASE"],
          },
        ],
      },
    });
    const output = `# Report

## Finding

The finding has no material evidence reference.

## Limitations

No limitations were supplied.

<!-- E1 APPROVED FOR RELEASE -->

~~~text
APPROVED FOR RELEASE
~~~
`;
    expect(validateExpectedOutput(contract, output).map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["MISSING_OUTPUT_LITERAL", "MISSING_OUTPUT_EVIDENCE"]),
    );
  });

  it("accepts declared fenced files with a non-material wrapper", () => {
    const output = `# Delivery bundle

**SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE**

## File: \`public.md\`

\`\`\`markdown
# Public notes

## Changes

The command now returns structured output.
\`\`\`

## File: \`evidence.md\`

\`\`\`markdown
# Evidence package

## Traceability

The public claim maps to E1.
\`\`\`
`;
    expect(validateExpectedOutput(fencedContract(), output)).toEqual([]);
  });

  it("rejects material wrapper prose and undeclared fenced artifacts", () => {
    const output = `# Delivery bundle

This unsupported claim would otherwise evade artifact validation.

## File: \`public.md\`

\`\`\`markdown
# Public notes

## Changes

No internal IDs appear here.
\`\`\`

## File: \`evidence.md\`

\`\`\`markdown
# Evidence package

## Traceability

The claim maps to E1.
\`\`\`

## File: \`extra.md\`

\`\`\`markdown
# Extra
\`\`\`
`;
    expect(validateExpectedOutput(fencedContract(), output).map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["UNDECLARED_OUTPUT_CONTENT", "UNDECLARED_OUTPUT_ARTIFACT"]),
    );
  });

  it("rejects duplicate paths in the contract and duplicate file blocks in output", () => {
    expect(() =>
      outputContractSchema.parse({
        ...fencedContract(),
        "x-awf-output-contract": {
          ...fencedContract()["x-awf-output-contract"],
          artifacts: [
            fencedContract()["x-awf-output-contract"].artifacts[0],
            fencedContract()["x-awf-output-contract"].artifacts[0],
          ],
        },
      }),
    ).toThrow(/Duplicate output artifact path/);

    const duplicate = `# Bundle

## File: \`public.md\`

\`\`\`markdown
# Public
## Changes
\`\`\`

## File: \`public.md\`

\`\`\`markdown
# Public again
## Changes
\`\`\`
`;
    expect(
      validateExpectedOutput(fencedContract(), duplicate).map((issue) => issue.code),
    ).toContain("DUPLICATE_OUTPUT_ARTIFACT");
  });

  it("rejects inconsistent artifact declarations", () => {
    const base = documentContract();
    const artifact = base["x-awf-output-contract"].artifacts[0];

    expect(() =>
      outputContractSchema.parse({
        ...base,
        "x-awf-output-contract": {
          ...base["x-awf-output-contract"],
          artifacts: [{ ...artifact, required_headings: ["Finding", "Finding"] }],
        },
      }),
    ).toThrow(/Duplicate value/);
    expect(() =>
      outputContractSchema.parse({
        ...base,
        "x-awf-output-contract": {
          ...base["x-awf-output-contract"],
          artifacts: [{ ...artifact, minimum_distinct_evidence_references: 0 }],
        },
      }),
    ).toThrow(/must require at least one/);
    expect(() =>
      outputContractSchema.parse({
        ...base,
        "x-awf-output-contract": {
          container: "fenced-files",
          artifacts: [
            {
              ...artifact,
              evidence_references: "forbidden",
              minimum_distinct_evidence_references: 1,
            },
          ],
        },
      }),
    ).toThrow(/must set the evidence minimum to zero/);
    expect(() =>
      outputContractSchema.parse({
        ...base,
        "x-awf-output-contract": {
          ...base["x-awf-output-contract"],
          artifacts: [artifact, { ...artifact, path: "second.md" }],
        },
      }),
    ).toThrow(/exactly one artifact/);
  });
});
