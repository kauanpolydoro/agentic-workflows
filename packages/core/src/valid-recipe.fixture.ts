import type { Recipe } from "./schema.js";

export const validRecipeMetadata = {
  schema_version: 4,
  id: "safe-review",
  title: "Review safe changes",
  summary: "Review a focused change using explicit evidence and completion criteria.",
  version: "1.0.0",
  category: "code-review",
  execution_mode: "supervised",
  difficulty: "beginner",
  risk_level: "low",
  estimated_duration: "15m",
  tags: ["review"],
  inputs: { required: ["bounded diff"], optional: [] },
  outputs: ["safe-review-report.md with evidence and disposition"],
  prerequisites: ["the repository and immutable comparison revision are available"],
  safety: {
    destructive: false,
    requires_human_approval: [],
    forbidden_actions: ["exposing secrets or asserting unsupported findings"],
  },
  effects: {
    writes_code: false,
    writes_configuration: false,
    writes_documentation: false,
    changes_dependencies: false,
    changes_database: false,
    changes_issue_tracker: false,
    changes_production_traffic: false,
    deletes_state: false,
    publishes_artifacts: false,
  },
  agent_requirements: {
    capabilities: ["repository-read"],
    manual_invocation_required: true,
  },
  output_contract: { schema: "output.schema.json" },
  canonical: { file: "workflow.md" },
  agents: {
    generic: {
      bundle_compatibility: "compatible",
      capability_status: "not-applicable",
      limitations: [],
    },
    "claude-code": {
      bundle_compatibility: "compatible",
      capability_status: "unknown",
      limitations: [],
    },
    codex: {
      bundle_compatibility: "compatible",
      capability_status: "unknown",
      limitations: [],
    },
    cursor: {
      bundle_compatibility: "compatible",
      capability_status: "unknown",
      limitations: [],
    },
    "gemini-cli": {
      bundle_compatibility: "compatible",
      capability_status: "unknown",
      limitations: [],
    },
    opencode: {
      bundle_compatibility: "compatible",
      capability_status: "unknown",
      limitations: [],
    },
  },
  verification: {
    structural: { status: "derived" },
    installation: { status: "untested" },
    execution: { status: "untested" },
    outcome: { status: "untested" },
  },
  maintainers: ["project-maintainers"],
  license: "MIT",
} satisfies Recipe;

export const validOutputContract = `${JSON.stringify(
  {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://agentic-workflows.dev/output-contracts/safe-review/1.0.0",
    title: "Safe review output contract",
    description: "Validates the evidence-linked safe review report.",
    type: "string",
    contentMediaType: "text/markdown",
    "x-awf-output-contract": {
      container: "document",
      artifacts: [
        {
          path: "safe-review-report.md",
          audience: "repository maintainer",
          requires_title: true,
          required_headings: ["Finding", "Disposition"],
          evidence_references: "required",
          minimum_distinct_evidence_references: 1,
        },
      ],
    },
  },
  null,
  2,
)}\n`;

export const validRequiredFileContents = {
  "workflow.md": "# Safe review\n\nComplete workflow content.\n",
  "README.md": "# Safe review\n\nComplete README content.\n",
  "checklist.md": "# Safe review checklist\n\nComplete checklist content.\n",
  "output.schema.json": validOutputContract,
  "examples/input.md": "# Safe review input\n\nComplete input content.\n",
  "examples/expected-output.md": "# Safe review report\n\nComplete output content.\n",
} as const;
