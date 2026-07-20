import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { stringify } from "yaml";
import { hashContent, hashNamedContent } from "../packages/core/src/manifest.js";
import {
  type Recipe,
  type VerificationEvidence,
  verificationEvidenceSchema,
} from "../packages/core/src/schema.js";
import { validRecipeMetadata } from "../packages/core/src/valid-recipe.fixture.js";
import {
  aggregateStatus,
  loadEvidence,
  type LoadedEvidence,
  resolveEvidenceSupersession,
} from "./generate.js";

const recipeBundleFiles = [
  "recipe.yml",
  "workflow.md",
  "README.md",
  "checklist.md",
  "output.schema.json",
  "examples/input.md",
  "examples/expected-output.md",
] as const;

function untestedRecord(id: string): VerificationEvidence {
  return verificationEvidenceSchema.parse({
    schema_version: 2,
    id,
    recipe: "safe-review",
    recipe_version: "1.0.0",
    recipe_content_sha256: "a".repeat(64),
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
      repository_revision: "b".repeat(40),
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
  });
}

function loaded(
  id: string,
  installation: "passing" | "failing" | "untested",
  options: { current?: boolean; supersedes?: string } = {},
): LoadedEvidence {
  return {
    record: {
      ...untestedRecord(id),
      supersedes: options.supersedes,
      installation: { status: installation },
    },
    relativePath: `verification/safe-review/${id}.yml`,
    current: options.current ?? true,
    superseded: false,
  };
}

async function evidenceRepository(): Promise<{
  repository: string;
  artifactPath: string;
  recipe: Recipe;
}> {
  const repository = await mkdtemp(path.join(os.tmpdir(), "awf-evidence-"));
  const recipeDirectory = path.join(repository, "recipes", "safe-review");
  const bundle: Record<string, string> = {};
  for (const relative of recipeBundleFiles) {
    const content = `${relative} synthetic fixture\n`;
    bundle[relative] = content;
    await mkdir(path.dirname(path.join(recipeDirectory, relative)), { recursive: true });
    await writeFile(path.join(recipeDirectory, relative), content);
  }
  execFileSync("git", ["init", "--quiet"], { cwd: repository });
  execFileSync("git", ["add", "recipes"], { cwd: repository });
  execFileSync(
    "git",
    [
      "-c",
      "user.name=Evidence Fixture",
      "-c",
      "user.email=evidence@example.test",
      "commit",
      "--quiet",
      "--no-gpg-sign",
      "-m",
      "fixture",
    ],
    { cwd: repository },
  );
  const revision = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repository,
    encoding: "utf8",
  }).trim();
  const evidenceDirectory = path.join(repository, "verification", "artifacts", "record");
  await mkdir(evidenceDirectory, { recursive: true });
  const evidenceContents = {
    command_log: "command fixture\n",
    stdout: "stdout fixture\n",
    stderr: "stderr fixture\n",
    installation_artifact: "installation fixture\n",
  } as const;
  const evidence = Object.fromEntries(
    await Promise.all(
      Object.entries(evidenceContents).map(async ([name, content]) => {
        const relative = `verification/artifacts/record/${name}.txt`;
        await writeFile(path.join(repository, relative), content);
        return [name, { path: relative, sha256: hashContent(content) }];
      }),
    ),
  );
  const record = verificationEvidenceSchema.parse({
    ...untestedRecord("safe-review-codex-installation"),
    recipe_content_sha256: hashNamedContent(bundle),
    command: "pnpm test:integration",
    exit_code: 0,
    started_at: "2026-01-01T00:00:00Z",
    finished_at: "2026-01-01T00:01:00Z",
    environment: {
      runner_image: "fixture-image@sha256:abc",
      os: "linux",
      node_version: "22.0.0",
      pnpm_version: "10.0.0",
    },
    source: {
      repository_revision: revision,
      workflow_run_url: null,
      runner: "local-fixture",
    },
    installation: { status: "passing" },
    evidence: {
      ...evidence,
      input_file: null,
      output_file: null,
      outcome_review: null,
    },
  });
  const recordDirectory = path.join(repository, "verification", "safe-review");
  await mkdir(recordDirectory, { recursive: true });
  await writeFile(path.join(recordDirectory, "record.yml"), stringify(record));
  return {
    repository,
    artifactPath: path.join(evidenceDirectory, "stdout.txt"),
    recipe: validRecipeMetadata,
  };
}

describe("verification evidence aggregation", () => {
  it("uses fail-closed precedence for conflicting active records", () => {
    const status = aggregateStatus(
      [loaded("passing-record", "passing"), loaded("failing-record", "failing")],
      "installation",
      "untested",
    );
    expect(status).toEqual({
      status: "failing",
      evidence: ["verification/safe-review/failing-record.yml"],
      stale_records: 0,
    });
  });

  it("excludes stale evidence from status promotion", () => {
    const status = aggregateStatus(
      [loaded("stale-record", "passing", { current: false })],
      "installation",
      "untested",
    );
    expect(status).toEqual({ status: "untested", evidence: [], stale_records: 1 });
  });

  it("lets an explicit current record supersede an older current record", () => {
    const records = resolveEvidenceSupersession([
      loaded("old-record", "failing"),
      loaded("new-record", "passing", { supersedes: "old-record" }),
    ]);
    expect(records.find((item) => item.record.id === "old-record")?.superseded).toBe(true);
    expect(aggregateStatus(records, "installation", "untested").status).toBe("passing");
  });

  it("rejects duplicate active claims without explicit supersession", () => {
    expect(() =>
      resolveEvidenceSupersession([
        loaded("first-record", "passing"),
        loaded("second-record", "passing"),
      ]),
    ).toThrow(/duplicates active verification claims/);
  });

  it("rejects duplicate record identifiers", () => {
    expect(() =>
      resolveEvidenceSupersession([
        loaded("duplicate-record", "passing"),
        loaded("duplicate-record", "failing"),
      ]),
    ).toThrow(/Duplicate verification evidence ID/);
  });

  it("rejects unknown and cyclic supersession", () => {
    expect(() =>
      resolveEvidenceSupersession([
        loaded("new-record", "passing", { supersedes: "missing-record" }),
      ]),
    ).toThrow(/supersedes unknown evidence record/);
    expect(() =>
      resolveEvidenceSupersession([
        loaded("first-record", "passing", { supersedes: "second-record" }),
        loaded("second-record", "failing", { supersedes: "first-record" }),
      ]),
    ).toThrow(/supersession cycle/);
  });
});

describe("verification evidence loading", () => {
  it("accepts matching retained artifacts and detects later tampering", async () => {
    const fixture = await evidenceRepository();
    const loadedRecords = await loadEvidence(fixture.repository, [fixture.recipe]);
    expect(loadedRecords).toHaveLength(1);
    expect(loadedRecords[0]?.current).toBe(true);
    await writeFile(fixture.artifactPath, "tampered fixture\n");
    await expect(loadEvidence(fixture.repository, [fixture.recipe])).rejects.toThrow(
      /does not match its retained evidence hash/,
    );
  });

  it("marks a valid historical record stale when the recipe version changes", async () => {
    const fixture = await evidenceRepository();
    const changedRecipe = { ...fixture.recipe, version: "1.1.0" } as Recipe;
    const loadedRecords = await loadEvidence(fixture.repository, [changedRecipe]);
    expect(loadedRecords[0]?.current).toBe(false);
  });
});
