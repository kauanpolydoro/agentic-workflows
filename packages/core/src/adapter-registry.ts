export const localContractStatuses = ["passing", "failing", "untested", "not-applicable"] as const;

export type LocalContractStatus = (typeof localContractStatuses)[number];

interface VerificationFact<Status extends string> {
  status: Status;
  evidence: readonly string[];
}

interface AdapterRegistryDefinition {
  id: "generic" | "claude-code" | "codex" | "cursor" | "gemini-cli" | "opencode";
  version: string;
  displayName: string;
  destinationPattern: string;
  exportFormat:
    | "plain-markdown-bundle"
    | "skill-md-bundle"
    | "custom-command-toml-bundle"
    | "opencode-command-markdown-bundle";
  namingRules: string;
  officialDocumentation: string | null;
  format: VerificationFact<"confirmed" | "unknown">;
  exporter: VerificationFact<"implemented" | "missing">;
  localGenerationContract: VerificationFact<LocalContractStatus>;
  localInstallationContract: VerificationFact<LocalContractStatus>;
  consumerParse: VerificationFact<LocalContractStatus>;
  externalExecution: VerificationFact<LocalContractStatus>;
  outcomeReview: VerificationFact<LocalContractStatus>;
  testedAgentVersion: string | null;
  lastExternalExecutionAt: string | null;
  lastOutcomeReviewAt: string | null;
}

export interface AdapterRegistryEntry extends AdapterRegistryDefinition {
  formatConfirmed: boolean;
  exporterImplemented: boolean;
  localGenerationContractStatus: LocalContractStatus;
  installationTestStatus: LocalContractStatus;
  consumerParseStatus: LocalContractStatus;
  executionTestStatus: LocalContractStatus;
  outcomeReviewStatus: LocalContractStatus;
  lastVerified: string | null;
  evidence: readonly string[];
}

function assertFactEvidence(adapter: string, fact: string, value: VerificationFact<string>): void {
  const observed = ["confirmed", "implemented", "passing", "failing"].includes(value.status);
  if (observed && value.evidence.length === 0) {
    throw new Error(`${adapter} ${fact} status ${value.status} requires retained evidence.`);
  }
  if (!observed && value.evidence.length > 0) {
    throw new Error(`${adapter} ${fact} status ${value.status} cannot cite passing evidence.`);
  }
  if (new Set(value.evidence).size !== value.evidence.length) {
    throw new Error(`${adapter} ${fact} evidence paths must be unique.`);
  }
}

export function defineAdapterRegistryEntry(
  definition: AdapterRegistryDefinition,
): AdapterRegistryEntry {
  const facts = {
    format: definition.format,
    exporter: definition.exporter,
    localGenerationContract: definition.localGenerationContract,
    localInstallationContract: definition.localInstallationContract,
    consumerParse: definition.consumerParse,
    externalExecution: definition.externalExecution,
    outcomeReview: definition.outcomeReview,
  };
  for (const [name, fact] of Object.entries(facts)) {
    assertFactEvidence(definition.id, name, fact);
  }
  const executionObserved = ["passing", "failing"].includes(definition.externalExecution.status);
  if (
    definition.externalExecution.status === "passing" &&
    definition.consumerParse.status !== "passing"
  ) {
    throw new Error(
      `${definition.id} passing external execution requires passing consumer parsing.`,
    );
  }
  if (executionObserved !== (definition.testedAgentVersion !== null)) {
    throw new Error(
      `${definition.id} testedAgentVersion must be present only for observed external execution.`,
    );
  }
  if (executionObserved !== (definition.lastExternalExecutionAt !== null)) {
    throw new Error(
      `${definition.id} lastExternalExecutionAt must be present only for observed external execution.`,
    );
  }
  const outcomeObserved = ["passing", "failing"].includes(definition.outcomeReview.status);
  if (outcomeObserved !== (definition.lastOutcomeReviewAt !== null)) {
    throw new Error(
      `${definition.id} lastOutcomeReviewAt must be present only for an observed outcome review.`,
    );
  }
  if (outcomeObserved && definition.externalExecution.status !== "passing") {
    throw new Error(`${definition.id} outcome review requires passing external execution.`);
  }
  const evidence = [...new Set(Object.values(facts).flatMap((fact) => fact.evidence))];
  return {
    ...definition,
    formatConfirmed: definition.format.status === "confirmed",
    exporterImplemented: definition.exporter.status === "implemented",
    localGenerationContractStatus: definition.localGenerationContract.status,
    installationTestStatus: definition.localInstallationContract.status,
    consumerParseStatus: definition.consumerParse.status,
    executionTestStatus: definition.externalExecution.status,
    outcomeReviewStatus: definition.outcomeReview.status,
    lastVerified: definition.lastExternalExecutionAt,
    evidence,
  };
}

const formatSource = ["docs/research/adapter-sources.md"] as const;
const exporterEvidence = ["packages/core/src/adapters.ts"] as const;
const generationEvidence = ["packages/core/src/core.test.ts"] as const;
const installationEvidence = ["packages/cli/src/install.integration.test.ts"] as const;
const untested = { status: "untested", evidence: [] } as const;

type ExternalVerification = Pick<
  AdapterRegistryDefinition,
  | "consumerParse"
  | "externalExecution"
  | "outcomeReview"
  | "testedAgentVersion"
  | "lastExternalExecutionAt"
  | "lastOutcomeReviewAt"
>;

const untestedExternalVerification: ExternalVerification = {
  consumerParse: untested,
  externalExecution: untested,
  outcomeReview: untested,
  testedAgentVersion: null,
  lastExternalExecutionAt: null,
  lastOutcomeReviewAt: null,
};

function externalAdapter(
  definition: Omit<
    AdapterRegistryDefinition,
    | "format"
    | "exporter"
    | "localGenerationContract"
    | "localInstallationContract"
    | "consumerParse"
    | "externalExecution"
    | "outcomeReview"
    | "testedAgentVersion"
    | "lastExternalExecutionAt"
    | "lastOutcomeReviewAt"
  >,
  verification: ExternalVerification = untestedExternalVerification,
): AdapterRegistryEntry {
  return defineAdapterRegistryEntry({
    ...definition,
    format: { status: "confirmed", evidence: formatSource },
    exporter: { status: "implemented", evidence: exporterEvidence },
    localGenerationContract: { status: "passing", evidence: generationEvidence },
    localInstallationContract: { status: "passing", evidence: installationEvidence },
    ...verification,
  });
}

export const adapterRegistry = {
  generic: defineAdapterRegistryEntry({
    id: "generic",
    version: "1.0.0",
    displayName: "Generic Markdown",
    destinationPattern: ".agentic-workflows/workflows/<recipe-id>/workflow.md",
    exportFormat: "plain-markdown-bundle",
    namingRules: "Use the recipe ID as a lowercase kebab-case directory name.",
    officialDocumentation: null,
    format: { status: "confirmed", evidence: ["packages/core/src/adapters.ts"] },
    exporter: { status: "implemented", evidence: exporterEvidence },
    localGenerationContract: { status: "passing", evidence: generationEvidence },
    localInstallationContract: { status: "passing", evidence: installationEvidence },
    consumerParse: { status: "not-applicable", evidence: [] },
    externalExecution: { status: "not-applicable", evidence: [] },
    outcomeReview: { status: "not-applicable", evidence: [] },
    testedAgentVersion: null,
    lastExternalExecutionAt: null,
    lastOutcomeReviewAt: null,
  }),
  "claude-code": externalAdapter({
    id: "claude-code",
    version: "1.0.0",
    displayName: "Claude Code",
    destinationPattern: ".claude/skills/<recipe-id>/SKILL.md",
    exportFormat: "skill-md-bundle",
    namingRules: "Use the recipe ID as the project skill directory name.",
    officialDocumentation: "https://code.claude.com/docs/en/skills",
  }),
  codex: externalAdapter({
    id: "codex",
    version: "1.0.0",
    displayName: "OpenAI Codex",
    destinationPattern: ".agents/skills/<recipe-id>/SKILL.md",
    exportFormat: "skill-md-bundle",
    namingRules: "Use the recipe ID as the project skill directory name.",
    officialDocumentation: "https://developers.openai.com/codex/skills",
  }),
  cursor: externalAdapter({
    id: "cursor",
    version: "1.0.0",
    displayName: "Cursor",
    destinationPattern: ".cursor/skills/<recipe-id>/SKILL.md",
    exportFormat: "skill-md-bundle",
    namingRules: "Use the recipe ID as the project Agent Skill directory name.",
    officialDocumentation: "https://cursor.com/docs/context/skills",
  }),
  "gemini-cli": externalAdapter({
    id: "gemini-cli",
    version: "1.0.0",
    displayName: "Gemini CLI",
    destinationPattern: ".gemini/commands/<recipe-id>.toml",
    exportFormat: "custom-command-toml-bundle",
    namingRules: "Use the recipe ID as the TOML filename and slash-command name.",
    officialDocumentation: "https://geminicli.com/docs/cli/custom-commands/",
  }),
  opencode: externalAdapter({
    id: "opencode",
    version: "1.0.0",
    displayName: "OpenCode",
    destinationPattern: ".opencode/commands/<recipe-id>.md",
    exportFormat: "opencode-command-markdown-bundle",
    namingRules: "Use the recipe ID as the Markdown filename and slash-command name.",
    officialDocumentation: "https://opencode.ai/docs/commands/",
  }),
} as const satisfies Record<string, AdapterRegistryEntry>;

export type RegisteredAdapterId = keyof typeof adapterRegistry;

export function deriveAdapterSupport(
  adapter: Pick<
    AdapterRegistryEntry,
    | "formatConfirmed"
    | "exporterImplemented"
    | "localGenerationContractStatus"
    | "installationTestStatus"
  >,
): "supported" | "partial" | "experimental" | "unsupported" | "unknown" {
  if (!adapter.exporterImplemented) return "unsupported";
  if (!adapter.formatConfirmed) return "unknown";
  if (
    adapter.localGenerationContractStatus === "failing" ||
    adapter.installationTestStatus === "failing"
  ) {
    return "partial";
  }
  if (
    adapter.localGenerationContractStatus === "passing" &&
    adapter.installationTestStatus === "passing"
  ) {
    return "supported";
  }
  return "experimental";
}
