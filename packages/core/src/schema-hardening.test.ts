import { describe, expect, it } from "vitest";
import { manifestSchema, type Recipe, recipeSchema, verificationEvidenceSchema } from "./schema.js";
import { validRecipeMetadata } from "./valid-recipe.fixture.js";

function recipeFixture(): Recipe {
  return structuredClone(validRecipeMetadata);
}

const recipeInvariantCases: Array<{
  name: string;
  mutate: (recipe: Recipe) => void;
}> = [
  {
    name: "case-insensitive duplicate required inputs",
    mutate: (recipe) => {
      recipe.inputs.required = ["bounded diff", "BOUNDED DIFF"];
    },
  },
  {
    name: "an input in both required and optional sets",
    mutate: (recipe) => {
      recipe.inputs.optional = ["Bounded Diff"];
    },
  },
  {
    name: "duplicate agent capabilities",
    mutate: (recipe) => {
      recipe.agent_requirements.capabilities = ["repository-read", "repository-read"];
    },
  },
  {
    name: "a mutable effect without approval",
    mutate: (recipe) => {
      recipe.effects.writes_code = true;
    },
  },
  {
    name: "a mutable effect without its required capability",
    mutate: (recipe) => {
      recipe.effects.writes_configuration = true;
      recipe.safety.requires_human_approval = ["Repository maintainer approves the change."];
    },
  },
  {
    name: "state deletion without destructive and high-risk classification",
    mutate: (recipe) => {
      recipe.effects.deletes_state = true;
      recipe.safety.requires_human_approval = ["Repository maintainer approves deletion."];
    },
  },
  {
    name: "database mutation without database capability",
    mutate: (recipe) => {
      recipe.effects.changes_database = true;
      recipe.risk_level = "high";
      recipe.safety.requires_human_approval = ["Database owner approves execution."];
    },
  },
  {
    name: "a non-lossless generic bundle",
    mutate: (recipe) => {
      recipe.agents.generic.bundle_compatibility = "unknown";
    },
  },
  {
    name: "an executable generic capability claim",
    mutate: (recipe) => {
      recipe.agents.generic.capability_status = "confirmed";
    },
  },
  {
    name: "not-applicable capability for an external agent",
    mutate: (recipe) => {
      recipe.agents.codex.capability_status = "not-applicable";
    },
  },
  {
    name: "limited compatibility without a limitation",
    mutate: (recipe) => {
      recipe.agents.cursor.bundle_compatibility = "limited";
    },
  },
  {
    name: "a missing capability without a limitation",
    mutate: (recipe) => {
      recipe.agents.opencode.capability_status = "missing";
    },
  },
  {
    name: "duplicate maintainer identities",
    mutate: (recipe) => {
      recipe.maintainers = ["project-maintainers", "project-maintainers"];
    },
  },
  {
    name: "autonomous execution without its unattended contract",
    mutate: (recipe) => {
      recipe.execution_mode = "autonomous";
      recipe.agent_requirements.capabilities.push("persistent-execution");
    },
  },
  {
    name: "a missing execution mode",
    mutate: (recipe) => {
      delete (recipe as Partial<Recipe>).execution_mode;
    },
  },
  {
    name: "an unattended contract on a supervised recipe",
    mutate: (recipe) => {
      recipe.autonomy = {
        unattended_execution: true,
        authorization: "upfront",
        mid_run_human_input: "not-required",
        user_stop_signal: "required",
        hard_deadline: "required",
        durable_checkpoints: "required",
        resume: "required",
        failure_policy: "defer-and-continue",
      };
    },
  },
];

const hash = "a".repeat(64);
const manifestFixture = {
  schema_version: 2,
  recipe: "safe-review",
  recipe_version: "1.0.0",
  adapter: { id: "generic", version: "1.0.0" },
  entrypoint: ".agentic-workflows/workflows/safe-review/workflow.md",
  invocation: {
    mode: "manual",
    command: "awf show safe-review",
    implicit_invocation_control: "not-supported",
    warning: "Manual invocation is required.",
  },
  installed_at: "2026-01-01T00:00:00Z",
  target: ".",
  files: [
    {
      path: ".agentic-workflows/workflows/safe-review/workflow.md",
      hash,
      role: "entrypoint",
    },
    {
      path: ".agentic-workflows/workflows/safe-review/checklist.md",
      hash,
      role: "checklist",
    },
    {
      path: ".agentic-workflows/workflows/safe-review/examples/input.md",
      hash,
      role: "example-input",
    },
    {
      path: ".agentic-workflows/workflows/safe-review/examples/expected-output.md",
      hash,
      role: "example-output",
    },
    {
      path: ".agentic-workflows/workflows/safe-review/recipe.yml",
      hash,
      role: "metadata",
    },
    {
      path: ".agentic-workflows/workflows/safe-review/output.schema.json",
      hash,
      role: "output-schema",
    },
  ],
  migration: null,
  cli_version: "0.1.0",
} as const;

interface ManifestCandidate {
  schema_version: number;
  recipe: string;
  recipe_version: string;
  adapter: { id: string; version: string };
  entrypoint: string;
  invocation: {
    mode: string;
    command: string | null;
    implicit_invocation_control: string;
    warning: string | null;
  };
  installed_at: string;
  target: string;
  files: Array<{ path: string; hash: string; role: string }>;
  migration: unknown;
  cli_version: string;
}

function manifestCandidate(): ManifestCandidate {
  return structuredClone(manifestFixture) as unknown as ManifestCandidate;
}

function requiredItem<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error(`Fixture item ${index} is missing.`);
  return item;
}

interface EvidenceArtifact {
  path: string;
  sha256: string;
}

interface EvidenceCriterion {
  id: string;
  description: string;
  status: string;
  evidence: string[];
}

interface EvidenceCandidate {
  [key: string]: unknown;
  id: string;
  agent_version: string | null;
  fixture: string | null;
  command: string | null;
  exit_code: number | null;
  started_at: string | null;
  finished_at: string | null;
  environment: {
    runner_image: string | null;
    os: string | null;
    node_version: string | null;
    pnpm_version: string | null;
  };
  installation: { status: string };
  execution: { status: string };
  outcome: { status: string };
  evidence: Record<string, EvidenceArtifact | null>;
  reviewer: string | null;
  reviewed_at: string | null;
  criteria: EvidenceCriterion[];
}

function untestedEvidence(): EvidenceCandidate {
  return {
    schema_version: 2,
    id: "safe-review-codex-untested",
    recipe: "safe-review",
    recipe_version: "1.0.0",
    recipe_content_sha256: "b".repeat(64),
    agent: "codex",
    adapter_version: "1.0.0",
    agent_version: null,
    fixture: null,
    command: null,
    exit_code: null,
    started_at: null,
    finished_at: null,
    environment: {
      runner_image: null,
      os: null,
      node_version: null,
      pnpm_version: null,
    },
    source: {
      repository_revision: "c".repeat(40),
      workflow_run_url: null,
      runner: null,
    },
    installation: { status: "untested" },
    execution: { status: "untested" },
    outcome: { status: "untested" },
    evidence: {
      command_log: null,
      stdout: null,
      stderr: null,
      installation_artifact: null,
      input_file: null,
      output_file: null,
      outcome_review: null,
    },
    reviewer: null,
    reviewed_at: null,
    criteria: [],
    notes: [],
  };
}

function artifact(name: string) {
  return { path: `verification/artifacts/safe-review/${name}.txt`, sha256: hash };
}

function passingEvidence(): EvidenceCandidate {
  const record = untestedEvidence();
  record.id = "safe-review-codex-passing";
  record.agent_version = "fixture-agent-1.0.0";
  record.fixture = "fixtures/safe-review/input.md";
  record.command = "codex exec fixtures/safe-review/input.md";
  record.exit_code = 0;
  record.started_at = "2026-01-01T00:00:00Z";
  record.finished_at = "2026-01-01T00:01:00Z";
  record.environment = {
    runner_image: "fixture-image@sha256:abc",
    os: "linux",
    node_version: "22.0.0",
    pnpm_version: "10.0.0",
  };
  record.installation = { status: "passing" };
  record.execution = { status: "passing" };
  record.outcome = { status: "passing" };
  record.evidence = {
    command_log: artifact("command"),
    stdout: artifact("stdout"),
    stderr: artifact("stderr"),
    installation_artifact: artifact("installation"),
    input_file: artifact("input"),
    output_file: artifact("output"),
    outcome_review: artifact("review"),
  };
  record.reviewer = "repository-maintainer-fixture";
  record.reviewed_at = "2026-01-01T00:02:00Z";
  record.criteria = [
    {
      id: "C1",
      description: "The retained output satisfies the fixture criterion.",
      status: "passing",
      evidence: ["outcome_review"],
    },
  ];
  return record;
}

describe("recipe cross-field hardening", () => {
  it.each(recipeInvariantCases)("rejects $name", ({ mutate }) => {
    const recipe = recipeFixture();
    mutate(recipe);
    expect(recipeSchema.safeParse(recipe).success).toBe(false);
  });

  it("accepts the autonomous execution facet alongside a domain category", () => {
    const recipe = recipeFixture();
    recipe.execution_mode = "autonomous";
    recipe.agent_requirements.capabilities.push("persistent-execution", "distributed-coordination");
    recipe.autonomy = {
      unattended_execution: true,
      authorization: "upfront",
      mid_run_human_input: "not-required",
      user_stop_signal: "required",
      hard_deadline: "required",
      durable_checkpoints: "required",
      resume: "required",
      failure_policy: "defer-and-continue",
    };

    const result = recipeSchema.parse(recipe);
    expect(result.agent_requirements.capabilities).toContain("distributed-coordination");
  });

  it("rejects autonomous execution without persistent runtime capability", () => {
    const recipe = recipeFixture();
    recipe.execution_mode = "autonomous";
    recipe.autonomy = {
      unattended_execution: true,
      authorization: "upfront",
      mid_run_human_input: "not-required",
      user_stop_signal: "required",
      hard_deadline: "required",
      durable_checkpoints: "required",
      resume: "required",
      failure_policy: "fail-closed",
    };

    expect(recipeSchema.safeParse(recipe).success).toBe(false);
  });
});

describe("manifest path and composition hardening", () => {
  it.each([
    "/etc/passwd",
    "C:\\Windows\\system.ini",
    "nested\\file.md",
    "nested//file.md",
    "nested/./file.md",
    "nested/../file.md",
    ".git/config",
  ])("rejects managed path %s", (managedPath) => {
    const manifest = manifestCandidate();
    requiredItem(manifest.files, 4).path = managedPath;
    expect(manifestSchema.safeParse(manifest).success).toBe(false);
  });

  it("rejects duplicate migration members", () => {
    const manifest = manifestCandidate();
    manifest.migration = {
      from_schema_version: 1,
      from_recipe_version: "0.9.0",
      from_adapter: { id: "generic", version: null },
      created_files: ["new.md", "new.md"],
      retired_files: ["old.md", "old.md"],
    };
    expect(manifestSchema.safeParse(manifest).success).toBe(false);
  });

  it("rejects duplicate members, a wrong entrypoint, missing roles, and duplicate policies", () => {
    const duplicate = manifestCandidate();
    requiredItem(duplicate.files, 4).path = requiredItem(duplicate.files, 1).path;
    expect(manifestSchema.safeParse(duplicate).success).toBe(false);

    const entrypoint = manifestCandidate();
    entrypoint.entrypoint = "unregistered.md";
    expect(manifestSchema.safeParse(entrypoint).success).toBe(false);

    const missingRole = manifestCandidate();
    missingRole.files = missingRole.files.filter((file) => file.role !== "checklist");
    expect(manifestSchema.safeParse(missingRole).success).toBe(false);

    const policies = manifestCandidate();
    policies.files.push(
      { path: "policy-one.yml", hash, role: "policy" },
      { path: "policy-two.yml", hash, role: "policy" },
    );
    expect(manifestSchema.safeParse(policies).success).toBe(false);
  });
});

describe("verification evidence hardening", () => {
  it("accepts the complete passing fixture", () => {
    expect(verificationEvidenceSchema.safeParse(passingEvidence()).success).toBe(true);
  });

  it.each([
    {
      name: "an observed installation without execution artifacts",
      value: () => ({ ...untestedEvidence(), installation: { status: "passing" } }),
    },
    {
      name: "a finish time before the start time",
      value: () => ({ ...passingEvidence(), finished_at: "2025-12-31T23:59:00Z" }),
    },
    {
      name: "passing stages with a nonzero exit code",
      value: () => ({ ...passingEvidence(), exit_code: 1 }),
    },
    {
      name: "observed execution without a passing installation",
      value: () => ({ ...untestedEvidence(), execution: { status: "failing" } }),
    },
    {
      name: "an agent version without observed execution",
      value: () => ({ ...untestedEvidence(), agent_version: "unobserved-version" }),
    },
    {
      name: "a reviewer without an observed outcome",
      value: () => ({ ...untestedEvidence(), reviewer: "unobserved-reviewer" }),
    },
    {
      name: "a command without any observed stage",
      value: () => ({ ...untestedEvidence(), command: "codex exec input.md" }),
    },
    {
      name: "an outcome when execution is not applicable",
      value: () => ({
        ...untestedEvidence(),
        execution: { status: "not-applicable" },
        outcome: { status: "untested" },
      }),
    },
    {
      name: "a passing outcome with a failing criterion",
      value: () => {
        const record = passingEvidence();
        requiredItem(record.criteria, 0).status = "failing";
        return record;
      },
    },
    {
      name: "a failing outcome without a failing criterion",
      value: () => ({ ...passingEvidence(), outcome: { status: "failing" } }),
    },
    {
      name: "a not-reviewed criterion that cites conclusive evidence",
      value: () => {
        const record = passingEvidence();
        requiredItem(record.criteria, 0).status = "not-reviewed";
        return record;
      },
    },
    {
      name: "duplicate artifact paths",
      value: () => {
        const record = passingEvidence();
        const input = record.evidence.input_file;
        if (!input) throw new Error("Passing evidence fixture omitted its input artifact.");
        record.evidence.output_file = input;
        return record;
      },
    },
    {
      name: "duplicate criterion IDs and evidence references",
      value: () => {
        const record = passingEvidence();
        const criterion = requiredItem(record.criteria, 0);
        criterion.evidence = ["outcome_review", "outcome_review"];
        record.criteria.push({ ...criterion });
        return record;
      },
    },
  ])("rejects $name", ({ value }) => {
    expect(verificationEvidenceSchema.safeParse(value()).success).toBe(false);
  });
});
