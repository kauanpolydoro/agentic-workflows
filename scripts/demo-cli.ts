import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import {
  outputContractSchema,
  validateExpectedOutput,
} from "../packages/core/src/output-contract.js";

const repository = path.resolve(".");
const cli = path.join(repository, "packages/cli/dist/index.js");
const fixtureAgent = path.join(repository, "scripts/demo-fixture-agent.ts");
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const project = await mkdtemp(path.join(os.tmpdir(), "awf demonstration with spaces "));
await mkdir(project, { recursive: true });
await writeFile(path.join(project, "package.json"), '{"private":true}\n');

function run(args: string[], expected = 0): void {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: project,
    stdio: "inherit",
    env: { ...process.env, NO_COLOR: "1" },
  });
  if (result.status !== expected) {
    throw new Error(`${args.join(" ")} returned ${result.status}; expected ${expected}.`);
  }
}

async function evaluateMaintainedReference(recipe: string): Promise<void> {
  const directory = path.join(repository, "recipes", recipe);
  const contract = outputContractSchema.parse(
    JSON.parse(await readFile(path.join(directory, "output.schema.json"), "utf8")),
  );
  const output = await readFile(path.join(directory, "examples/expected-output.md"), "utf8");
  const issues = validateExpectedOutput(contract, output);
  if (issues.length > 0) {
    throw new Error(
      `${recipe} reference output failed its contract: ${issues
        .map((issue) => `${issue.code} (${issue.artifact})`)
        .join(", ")}.`,
    );
  }
  process.stdout.write(`Reference contract passed: ${recipe} (${contract.title}).\n`);
}

function invokeFixtureAgent(args: string[]): void {
  const result = spawnSync(process.execPath, [tsxCli, fixtureAgent, ...args], {
    cwd: project,
    stdio: "inherit",
    env: { ...process.env, NO_COLOR: "1" },
  });
  if (result.status !== 0) {
    throw new Error(`Deterministic fixture-agent invocation returned ${result.status}.`);
  }
}

run(["list", "--category", "security"]);
run(["show", "review-pull-request"]);
process.stdout.write(
  `\nReference review:\n- ${path.join(repository, "recipes/debug-failing-ci/examples/input.md")}\n- ${path.join(repository, "recipes/review-pull-request/examples/input.md")}\n- ${path.join(repository, "recipes/synchronize-documentation/examples/input.md")}\n\n`,
);
for (const recipe of ["debug-failing-ci", "review-pull-request", "synchronize-documentation"]) {
  await evaluateMaintainedReference(recipe);
}
run(["install", "review-pull-request", "--agent", "generic", "--dry-run"]);
run(["install", "review-pull-request", "--agent", "generic"]);
const producedOutput = path.join(project, "review-pull-request-output.md");
invokeFixtureAgent([
  "--workflow",
  path.join(project, ".agentic-workflows/workflows/review-pull-request/workflow.md"),
  "--input",
  path.join(repository, "recipes/review-pull-request/examples/input.md"),
  "--reference",
  path.join(repository, "recipes/review-pull-request/examples/expected-output.md"),
  "--output",
  producedOutput,
]);
const reviewContract = outputContractSchema.parse(
  JSON.parse(
    await readFile(path.join(repository, "recipes/review-pull-request/output.schema.json"), "utf8"),
  ),
);
const producedIssues = validateExpectedOutput(
  reviewContract,
  await readFile(producedOutput, "utf8"),
);
if (producedIssues.length > 0) {
  throw new Error(
    `Fixture-agent output failed evaluation: ${producedIssues.map((issue) => issue.code).join(", ")}.`,
  );
}
process.stdout.write(
  "Explicit deterministic fake-agent invocation produced an output that passed the review-pull-request contract.\n",
);
const checklist = path.join(
  project,
  ".agentic-workflows/workflows/review-pull-request/checklist.md",
);
await writeFile(checklist, `${await readFile(checklist, "utf8")}demonstration edit\n`);
run(["update", "review-pull-request"], 1);
run(["remove", "review-pull-request"], 1);
run(["update", "review-pull-request", "--force"]);
run(["validate", project, "--strict"]);
run(["remove", "review-pull-request"]);

process.stdout.write(
  "Demonstration complete. A deterministic fake agent performed the explicit fixture invocation, three maintained outputs passed their contracts, and the export lifecycle passed. This fake-agent run is not external-agent execution or human outcome review; both remain untested here.\n",
);
