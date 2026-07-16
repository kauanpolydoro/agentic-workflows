import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runFixtureAgent } from "./demo-fixture-agent.js";

describe("deterministic demonstration fixture agent", () => {
  it("reads the installed workflow and input before creating the declared output", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-fixture-agent "));
    const workflow = path.join(root, "installed", "workflow.md");
    const input = path.join(root, "input.md");
    const reference = path.join(root, "reference.md");
    const output = path.join(root, "produced.md");
    await mkdir(path.dirname(workflow), { recursive: true });
    await writeFile(
      workflow,
      "# Workflow\n\n## Objective\n\nReview.\n\n## Workflow\n\nInspect.\n\n## Completion criteria\n\nReport.\n",
    );
    await writeFile(input, "# Input\n\n## Evidence inventory\n\n### E1 - Source\n\nObserved.\n");
    await writeFile(reference, "# Produced report\n\nEvidence E1 was considered.\n");

    await runFixtureAgent([
      "--workflow",
      workflow,
      "--input",
      input,
      "--reference",
      reference,
      "--output",
      output,
    ]);

    expect(await readFile(output, "utf8")).toBe(await readFile(reference, "utf8"));
    await expect(
      runFixtureAgent([
        "--workflow",
        workflow,
        "--input",
        input,
        "--reference",
        reference,
        "--output",
        output,
      ]),
    ).rejects.toMatchObject({ code: "EEXIST" });
  });

  it("rejects an input without evidence before writing output", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-fixture-agent-invalid "));
    const workflow = path.join(root, "workflow.md");
    const input = path.join(root, "input.md");
    const reference = path.join(root, "reference.md");
    const output = path.join(root, "produced.md");
    await writeFile(
      workflow,
      "# Workflow\n\n## Objective\n\nReview.\n\n## Workflow\n\nInspect.\n\n## Completion criteria\n\nReport.\n",
    );
    await writeFile(input, "# Input\n\nNo evidence records.\n");
    await writeFile(reference, "# Produced report\n");
    await expect(
      runFixtureAgent([
        "--workflow",
        workflow,
        "--input",
        input,
        "--reference",
        reference,
        "--output",
        output,
      ]),
    ).rejects.toThrow(/evidence inventory/);
  });
});
