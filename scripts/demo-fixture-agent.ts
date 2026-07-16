import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

interface FixtureAgentArguments {
  workflow: string;
  input: string;
  reference: string;
  output: string;
}

function parseArguments(args: readonly string[]): FixtureAgentArguments {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!flag?.startsWith("--") || !value) {
      throw new Error("Fixture-agent arguments must be supplied as --name value pairs.");
    }
    if (values.has(flag)) throw new Error(`Duplicate fixture-agent argument: ${flag}.`);
    values.set(flag, value);
  }
  const required = ["--workflow", "--input", "--reference", "--output"] as const;
  for (const flag of required) {
    if (!values.has(flag)) throw new Error(`Missing fixture-agent argument: ${flag}.`);
  }
  if (values.size !== required.length) throw new Error("Unknown fixture-agent argument supplied.");
  return {
    workflow: path.resolve(values.get("--workflow") as string),
    input: path.resolve(values.get("--input") as string),
    reference: path.resolve(values.get("--reference") as string),
    output: path.resolve(values.get("--output") as string),
  };
}

export async function runFixtureAgent(args: readonly string[]): Promise<void> {
  const parsed = parseArguments(args);
  const [workflow, input, reference] = await Promise.all([
    readFile(parsed.workflow, "utf8"),
    readFile(parsed.input, "utf8"),
    readFile(parsed.reference, "utf8"),
  ]);
  for (const heading of ["## Objective", "## Workflow", "## Completion criteria"]) {
    if (!workflow.includes(heading)) throw new Error(`Installed workflow is missing ${heading}.`);
  }
  if (!input.includes("## Evidence inventory") || !/^### E\d+\s+(?:-|:)/m.test(input)) {
    throw new Error("Fixture input does not contain a populated evidence inventory.");
  }
  if (!/^#\s+\S/m.test(reference)) {
    throw new Error("Committed fixture output does not contain a document title.");
  }
  await writeFile(parsed.output, reference, { encoding: "utf8", flag: "wx" });
  process.stdout.write(
    `Fixture agent read ${path.basename(parsed.workflow)} and produced ${path.basename(parsed.output)}.\n`,
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  await runFixtureAgent(process.argv.slice(2));
}
