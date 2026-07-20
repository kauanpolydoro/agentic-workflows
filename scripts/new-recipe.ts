import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";
import { outputContractSchema } from "../packages/core/src/output-contract.js";
import { recipeSchema } from "../packages/core/src/schema.js";

const recipeIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const requiredFiles = [
  "recipe.yml",
  "workflow.md",
  "README.md",
  "checklist.md",
  "output.schema.json",
  "examples/input.md",
  "examples/expected-output.md",
] as const;

export interface ScaffoldRecipeOptions {
  id: string;
  recipesDirectory?: string;
  onFileWritten?: (relativePath: string) => void | Promise<void>;
}

function humanTitle(id: string): string {
  return id
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function scaffoldFiles(id: string): Record<(typeof requiredFiles)[number], string> {
  const title = humanTitle(id);
  const artifact = `${id}-result.md`;
  return {
    "recipe.yml": `schema_version: 3
id: ${id}
title: Author the ${title} workflow
summary: Produce a bounded ${title} result with explicit evidence, decisions, limitations, and verification steps.
version: 1.0.0
category: maintenance
difficulty: intermediate
risk_level: medium
estimated_duration: 30m
tags:
  - maintenance
  - evidence
inputs:
  required:
    - bounded scenario, requested outcome, and evidence inventory
  optional:
    - repository-specific policy and approval context
outputs:
  - ${artifact} with evidence, decision, limitations, and next steps
prerequisites:
  - the scenario boundary and authoritative evidence sources are identified
safety:
  destructive: false
  requires_human_approval: []
  forbidden_actions:
    - inventing evidence, execution results, compatibility, or approvals
effects:
  writes_code: false
  writes_configuration: false
  writes_documentation: false
  changes_dependencies: false
  changes_database: false
  changes_issue_tracker: false
  changes_production_traffic: false
  deletes_state: false
  publishes_artifacts: false
agent_requirements:
  capabilities:
    - repository-read
  manual_invocation_required: true
output_contract:
  schema: output.schema.json
canonical:
  file: workflow.md
agents:
  generic:
    bundle_compatibility: compatible
    capability_status: not-applicable
    limitations: []
  claude-code:
    bundle_compatibility: compatible
    capability_status: unknown
    limitations: []
  codex:
    bundle_compatibility: compatible
    capability_status: unknown
    limitations: []
  cursor:
    bundle_compatibility: compatible
    capability_status: unknown
    limitations: []
  gemini-cli:
    bundle_compatibility: compatible
    capability_status: unknown
    limitations: []
  opencode:
    bundle_compatibility: compatible
    capability_status: unknown
    limitations: []
verification:
  structural:
    status: derived
  installation:
    status: untested
  execution:
    status: untested
  outcome:
    status: untested
maintainers:
  - project-maintainers
license: MIT
`,
    "workflow.md": `# ${title}

## Objective

Transform a bounded scenario and its evidence into a complete \`${artifact}\` without asserting facts that the evidence does not establish.

## When to use

- Use this recipe after the domain-specific scenario, desired outcome, and authoritative evidence are available.

## When not to use

- Do not use this recipe while the scope is unknown, required evidence is unavailable, or the requested action belongs to a more specific workflow.

## Required inputs

- **Scenario and evidence inventory:** AUTHOR_INPUT_REQUIRED - define concrete data, formats, purpose, and integrity checks.

## Optional inputs

- **Repository policy and approvals:** AUTHOR_INPUT_REQUIRED - explain how each item changes the result.

## Preconditions

- The scenario boundary and authoritative evidence sources are identified.

## Workflow

1. **Scope:** record the bounded objective, excluded work, and evidence identifiers; continue only when the boundary is reviewable.
2. **Analyze:** evaluate the evidence using domain-specific criteria; stop when a material fact cannot be established.
3. **Decide:** record observations, inferences, recommendations, and any required approval separately.
4. **Validate:** check every material claim against its evidence source and the output contract.
5. **Deliver:** produce \`${artifact}\` with decisions, limitations, and next steps.

## Decision points

- If required evidence is missing or contradictory, stop and request the exact missing or reconciled record.
- If the proposed action exceeds the recorded scope, exclude it and route it to an appropriate workflow.

## Safety guardrails

- Never invent evidence, execution results, compatibility, or approvals.
- Keep actions inside the recorded boundary and redact secrets before retaining evidence.

## Human approval gates

- No human approval gate is declared by this starter because it has no mutable effect.
- Add a role-specific gate before enabling any mutable effect.

## Expected output

- A complete \`${artifact}\` containing Evidence, Decision, Limitations, and Next steps sections.

## Completion criteria

- Every material claim cites a defined evidence ID.
- The delivered artifact satisfies \`output.schema.json\`.
- Known limitations and unexecuted checks are explicit.

## Failure modes

- **F1:** Required evidence is absent, contradictory, or outside the declared boundary.
- **F2:** The expected artifact cannot satisfy its output contract without an unsupported claim.

## Recovery procedure

- **R1:** Stop, identify the missing or conflicting record, and resume only after its integrity is checked.
- **R2:** Remove the unsupported claim or revise the approved scope and contract before regenerating the artifact.

## Example

The complete synthetic scenario is in [\`examples/input.md\`](examples/input.md), and the reference artifact is in [\`examples/expected-output.md\`](examples/expected-output.md).
`,
    "README.md": `# ${title}

This authoring starter must be specialized with domain evidence before publication.

## Primary use cases

- AUTHOR_INPUT_REQUIRED - name concrete situations that this recipe resolves.

## When not to use

- Do not use it without a bounded scope, authoritative evidence, or the capabilities required by the final workflow.

## Required evidence

- AUTHOR_INPUT_REQUIRED - identify every source, format, purpose, and integrity check.

## Produced artifacts

- \`${artifact}\`, validated against \`output.schema.json\`.

## Primary risks

- Unsupported claims, excessive scope, missing approvals, and unclear recovery behavior.

## How to use this recipe

1. Replace each \`AUTHOR_INPUT_REQUIRED\` marker with domain-specific content.
2. Review every effect, capability, approval, and adapter limitation.
3. Run the repository validation and adversarial editorial review.

## Files

- \`recipe.yml\` defines metadata, effects, capabilities, and evidence states.
- \`workflow.md\` is the canonical procedure.
- \`checklist.md\` controls execution omissions.
- \`output.schema.json\` defines the result contract.
- \`examples/input.md\` and \`examples/expected-output.md\` provide the derivability reference.

## Verification status

- Structural status is derived from current validators and is not asserted by this source file.
- Installation, external-agent execution, and outcome review are untested.

## Limitations

- The starter is intentionally non-publishable until every author-input marker is replaced and the complete validation suite passes.
`,
    "checklist.md": `# ${title} execution checklist

## Scope and evidence

- [ ] The objective, exclusions, environment, and evidence inventory are explicit.
- [ ] Every material claim has a source that establishes the claimed boundary.

## Safety and decisions

- [ ] Effects, required capabilities, stop conditions, and role-based approvals are coherent.
- [ ] Observations, inferences, recommendations, and unexecuted actions remain distinct.

## Delivery

- [ ] The artifact satisfies \`output.schema.json\`.
- [ ] Limitations, recovery, ownership, and next steps are explicit.
- [ ] Every completion criterion has reviewable evidence.
`,
    "output.schema.json": `${JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: `https://agentic-workflows.dev/output-contracts/${id}/1.0.0`,
        title: `${title} output contract`,
        description: `Validates the complete ${artifact} reference artifact.`,
        type: "string",
        contentMediaType: "text/markdown",
        "x-awf-output-contract": {
          container: "document",
          artifacts: [
            {
              path: artifact,
              audience: "repository maintainers",
              requires_title: true,
              required_headings: ["Evidence", "Decision", "Limitations", "Next steps"],
              evidence_references: "required",
              minimum_distinct_evidence_references: 1,
            },
          ],
        },
      },
      null,
      2,
    )}\n`,
    "examples/input.md": `# Synthetic ${title} example input

**SYNTHETIC EXAMPLE - NOT A REAL PROJECT RECORD**

AUTHOR_INPUT_REQUIRED - provide a self-contained domain scenario, objective, scope, environment, constraints, and approvals.

## Evidence inventory

### E1 - Synthetic source record

- Type: AUTHOR_INPUT_REQUIRED
- Source: Embedded in this example
- Establishes: AUTHOR_INPUT_REQUIRED
- Does not establish: External execution or outcome approval
`,
    "examples/expected-output.md": `# Synthetic ${title} result

**SYNTHETIC EXAMPLE - NOT A REAL PROJECT RECORD**

## Evidence

- E1 establishes only the bounded facts embedded in the synthetic input.

## Decision

AUTHOR_INPUT_REQUIRED - provide the complete domain-specific artifact and distinguish fact from recommendation.

## Limitations

- External execution and outcome approval are not established by E1.

## Next steps

- Replace every author-input marker, validate the artifact, and obtain any role-based approval required by its effects.
`,
  };
}

async function pathExists(candidate: string): Promise<boolean> {
  try {
    await lstat(candidate);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function validateStagedScaffold(directory: string): Promise<void> {
  const entries = new Set(
    (await readdir(directory, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) =>
        path.relative(directory, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"),
      ),
  );
  for (const relative of requiredFiles) {
    if (!entries.has(relative)) throw new Error(`Scaffold is missing ${relative}.`);
  }
  recipeSchema.parse(
    parse(await readFile(path.join(directory, "recipe.yml"), "utf8"), {
      maxAliasCount: 0,
      uniqueKeys: true,
    }),
  );
  outputContractSchema.parse(
    JSON.parse(await readFile(path.join(directory, "output.schema.json"), "utf8")) as unknown,
  );
}

export async function scaffoldRecipe(options: ScaffoldRecipeOptions): Promise<string> {
  if (!recipeIdPattern.test(options.id)) {
    throw new Error("Recipe ID must use lowercase kebab-case.");
  }
  const recipesDirectory = path.resolve(options.recipesDirectory ?? "recipes");
  await mkdir(recipesDirectory, { recursive: true });
  const directory = path.join(recipesDirectory, options.id);
  if (await pathExists(directory))
    throw new Error(`Recipe directory already exists: ${directory}.`);

  const staging = await mkdtemp(path.join(recipesDirectory, `.${options.id}-staging-`));
  try {
    await mkdir(path.join(staging, "examples"));
    for (const [relative, content] of Object.entries(scaffoldFiles(options.id))) {
      await writeFile(path.join(staging, relative), content, { flag: "wx" });
      await options.onFileWritten?.(relative);
    }
    await validateStagedScaffold(staging);
    if (await pathExists(directory))
      throw new Error(`Recipe directory already exists: ${directory}.`);
    await rename(staging, directory);
    return directory;
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}

async function main(): Promise<void> {
  const id = process.argv[2];
  if (!id) {
    process.stderr.write("Usage: pnpm new:recipe <lowercase-kebab-case-id>\n");
    process.exitCode = 2;
    return;
  }
  try {
    const directory = await scaffoldRecipe({ id });
    process.stdout.write(
      `Created ${path.relative(process.cwd(), directory)} transactionally. Replace every AUTHOR_INPUT_REQUIRED marker before validation.\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) await main();

export const newRecipeScriptPath = fileURLToPath(import.meta.url);
