import { createInterface } from "node:readline/promises";
import type { Readable, Writable } from "node:stream";
import { type AgentId, adapterRegistry, agentIds } from "@kauanpolydoro/agentic-workflows-core";

export interface InitWizardResult {
  agent: AgentId;
  target: string;
}

export interface InitWizardOptions {
  defaultAgent: AgentId;
  defaultTarget: string;
  isValidTarget: (value: string) => boolean;
  signal?: AbortSignal;
  input?: Readable;
  output?: Writable;
}

export type InitWizard = (options: InitWizardOptions) => Promise<InitWizardResult>;

export function parseAgentChoice(value: string, fallback: AgentId): AgentId | null {
  const answer = value.trim().toLowerCase();
  if (answer.length === 0) return fallback;
  const numeric = Number(answer);
  if (Number.isSafeInteger(numeric) && numeric >= 1 && numeric <= agentIds.length) {
    return agentIds[numeric - 1] ?? null;
  }
  return agentIds.find((agent) => agent === answer) ?? null;
}

export const promptInitWizard: InitWizard = async (options) => {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const readline = createInterface({
    input,
    output,
    terminal: false,
  });
  const question = (prompt: string) =>
    options.signal
      ? readline.question(prompt, { signal: options.signal })
      : readline.question(prompt);
  try {
    output.write("Configure Agentic Workflows for this project.\n\nDefault agent:\n");
    for (const [index, agent] of agentIds.entries()) {
      output.write(`  ${index + 1}) ${adapterRegistry[agent].displayName} (${agent})\n`);
    }

    let agent: AgentId | null = null;
    while (!agent) {
      const answer = await question(`Choose a number or agent ID [${options.defaultAgent}]: `);
      agent = parseAgentChoice(answer, options.defaultAgent);
      if (!agent) {
        output.write(`Choose one of: ${agentIds.join(", ")}.\n`);
      }
    }

    let target = "";
    while (!options.isValidTarget(target)) {
      const answer = await question(
        `Project-relative installation target [${options.defaultTarget}]: `,
      );
      target = answer.trim().length === 0 ? options.defaultTarget : answer.trim();
      if (!options.isValidTarget(target)) {
        output.write("Use a relative path that stays inside the project root.\n");
      }
    }

    return { agent, target };
  } finally {
    readline.close();
  }
};
