import { describe, expect, it } from "vitest";
import { validRecipeMetadata } from "./valid-recipe.fixture.js";
import {
  agentIds,
  generatedCatalogRecipeSchema,
  recipeSchema,
  verificationEvidenceSchema,
} from "./schema.js";

const artifact = (name: string) => ({
  path: `verification/artifacts/record/${name}.txt`,
  sha256: "a".repeat(64),
});

const untestedRecord = {
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
} as const;

function generatedRecipe() {
  return {
    ...validRecipeMetadata,
    agents: Object.fromEntries(
      agentIds.map((agent) => [
        agent,
        {
          ...validRecipeMetadata.agents[agent],
          verification: {
            installation: { status: "untested", evidence: [], stale_records: 0 },
            execution: {
              status: agent === "generic" ? "not-applicable" : "untested",
              evidence: [],
              stale_records: 0,
            },
            outcome: {
              status: agent === "generic" ? "not-applicable" : "untested",
              evidence: [],
              stale_records: 0,
            },
          },
        },
      ]),
    ),
    verification: {
      structural: {
        status: "passing",
        source: "derived",
        checks: ["schema"],
        recipe_content_sha256: "d".repeat(64),
      },
    },
  };
}

describe("retained verification evidence", () => {
  it("accepts an explicit supersession reference without inventing a run", () => {
    expect(
      verificationEvidenceSchema.parse({
        ...untestedRecord,
        id: "safe-review-codex-recheck",
        supersedes: untestedRecord.id,
      }).supersedes,
    ).toBe(untestedRecord.id);
  });

  it("accepts a fully evidenced passing outcome", () => {
    const evidence = Object.fromEntries(
      [
        "command_log",
        "stdout",
        "stderr",
        "installation_artifact",
        "input_file",
        "output_file",
        "outcome_review",
      ].map((name) => [name, artifact(name)]),
    );
    expect(
      verificationEvidenceSchema.parse({
        ...untestedRecord,
        id: "safe-review-codex-passing",
        agent_version: "real-version-from-fixture",
        fixture: "fixtures/safe-review/input.md",
        command: "codex exec --fixture fixtures/safe-review/input.md",
        exit_code: 0,
        started_at: "2026-01-01T00:00:00Z",
        finished_at: "2026-01-01T00:01:00Z",
        environment: {
          runner_image: "fixture-image@sha256:abc",
          os: "linux",
          node_version: "22.0.0",
          pnpm_version: "10.0.0",
        },
        installation: { status: "passing" },
        execution: { status: "passing" },
        outcome: { status: "passing" },
        evidence,
        reviewer: "repository-maintainer-fixture",
        reviewed_at: "2026-01-01T00:02:00Z",
        criteria: [
          {
            id: "C1",
            description: "The fixture output satisfies its completion criteria.",
            status: "passing",
            evidence: ["outcome_review"],
          },
        ],
      }).outcome.status,
    ).toBe("passing");
  });

  it("rejects criterion claims without retained evidence", () => {
    expect(() =>
      verificationEvidenceSchema.parse({
        ...untestedRecord,
        criteria: [
          {
            id: "C1",
            description: "A claimed review result.",
            status: "passing",
            evidence: [],
          },
        ],
      }),
    ).toThrow(/must cite at least one retained evidence artifact/);
  });

  it("rejects criterion references whose artifact is absent", () => {
    expect(() =>
      verificationEvidenceSchema.parse({
        ...untestedRecord,
        criteria: [
          {
            id: "C1",
            description: "A claimed review result.",
            status: "passing",
            evidence: ["outcome_review"],
          },
        ],
      }),
    ).toThrow(/references missing evidence artifact/);
  });

  it("rejects self-supersession", () => {
    expect(() =>
      verificationEvidenceSchema.parse({
        ...untestedRecord,
        supersedes: untestedRecord.id,
      }),
    ).toThrow(/cannot supersede itself/);
  });
});

describe("generated catalog metadata invariants", () => {
  it("accepts a generated projection of valid source metadata", () => {
    expect(generatedCatalogRecipeSchema.parse(generatedRecipe()).id).toBe("safe-review");
  });

  it("enforces source cross-field invariants in generated entries", () => {
    const generated = generatedRecipe();
    expect(() =>
      generatedCatalogRecipeSchema.parse({
        ...generated,
        effects: { ...generated.effects, writes_code: true },
      }),
    ).toThrow(/Generated catalog violates recipe metadata invariants/);
  });

  it("keeps bundle serialization separate from external capability evidence", () => {
    expect(() =>
      recipeSchema.parse({
        ...validRecipeMetadata,
        agents: {
          ...validRecipeMetadata.agents,
          generic: {
            ...validRecipeMetadata.agents.generic,
            bundle_compatibility: "limited",
            limitations: ["Synthetic limitation."],
          },
        },
      }),
    ).toThrow(/lossless project-owned recipe bundle/);
    expect(() =>
      recipeSchema.parse({
        ...validRecipeMetadata,
        agents: {
          ...validRecipeMetadata.agents,
          codex: {
            bundle_compatibility: "compatible",
            capability_status: "partial",
            limitations: [],
          },
        },
      }),
    ).toThrow(/partial or missing required capability/);
  });
});
