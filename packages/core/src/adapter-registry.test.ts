import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  adapterRegistry,
  defineAdapterRegistryEntry,
  deriveAdapterSupport,
} from "./adapter-registry.js";

const baseDefinition = {
  id: "codex",
  version: "1.0.0",
  displayName: "Codex fixture",
  destinationPattern: ".agents/skills/<recipe-id>/SKILL.md",
  exportFormat: "skill-md-bundle",
  namingRules: "Use the recipe ID.",
  officialDocumentation: "https://example.test/format",
  format: { status: "confirmed", evidence: ["verification/format.md"] },
  exporter: { status: "implemented", evidence: ["packages/core/src/adapters.ts"] },
  localGenerationContract: {
    status: "passing",
    evidence: ["packages/core/src/core.test.ts"],
  },
  localInstallationContract: {
    status: "passing",
    evidence: ["packages/cli/src/install.integration.test.ts"],
  },
  consumerParse: { status: "untested", evidence: [] },
  externalExecution: { status: "untested", evidence: [] },
  outcomeReview: { status: "untested", evidence: [] },
  testedAgentVersion: null,
  lastExternalExecutionAt: null,
  lastOutcomeReviewAt: null,
} as const;

describe("adapter registry facts", () => {
  it("derives supported only from confirmed format and passing local contracts", () => {
    for (const adapter of Object.values(adapterRegistry)) {
      expect(deriveAdapterSupport(adapter)).toBe("supported");
      expect(adapter.localGenerationContractStatus).toBe("passing");
      expect(adapter.installationTestStatus).toBe("passing");
    }
  });

  it("retains external facts only for agents with current run evidence", () => {
    for (const id of ["cursor", "gemini-cli", "opencode"] as const) {
      const adapter = adapterRegistry[id];
      expect(adapter.consumerParseStatus).toBe("untested");
      expect(adapter.executionTestStatus).toBe("untested");
      expect(adapter.outcomeReviewStatus).toBe("untested");
      expect(adapter.testedAgentVersion).toBeNull();
      expect(adapter.lastExternalExecutionAt).toBeNull();
      expect(adapter.lastOutcomeReviewAt).toBeNull();
    }

    expect(adapterRegistry["claude-code"]).toMatchObject({
      consumerParseStatus: "passing",
      executionTestStatus: "passing",
      outcomeReviewStatus: "untested",
      testedAgentVersion: "2.1.209 (Claude Code)",
      lastExternalExecutionAt: "2026-07-15T20:59:04Z",
      lastOutcomeReviewAt: null,
    });
    expect(adapterRegistry.codex).toMatchObject({
      consumerParseStatus: "passing",
      executionTestStatus: "passing",
      outcomeReviewStatus: "untested",
      testedAgentVersion: "codex-cli 0.144.4",
      lastExternalExecutionAt: "2026-07-15T21:01:37Z",
      lastOutcomeReviewAt: null,
    });
    expect(adapterRegistry.codex.evidence).toContain(
      "verification/review-pull-request/codex-20260715-final-execution.yml",
    );
  });

  it("cites repository evidence paths that exist", () => {
    for (const adapter of Object.values(adapterRegistry)) {
      for (const evidence of adapter.evidence) {
        expect(existsSync(path.resolve(evidence)), `${adapter.id}: ${evidence}`).toBe(true);
      }
    }
  });

  it("uses fail-closed support precedence", () => {
    const supported = defineAdapterRegistryEntry(baseDefinition);
    expect(deriveAdapterSupport(supported)).toBe("supported");
    expect(deriveAdapterSupport({ ...supported, localGenerationContractStatus: "failing" })).toBe(
      "partial",
    );
    expect(deriveAdapterSupport({ ...supported, localGenerationContractStatus: "untested" })).toBe(
      "experimental",
    );
    expect(deriveAdapterSupport({ ...supported, formatConfirmed: false })).toBe("unknown");
    expect(deriveAdapterSupport({ ...supported, exporterImplemented: false })).toBe("unsupported");
  });

  it("rejects observed facts without evidence", () => {
    expect(() =>
      defineAdapterRegistryEntry({
        ...baseDefinition,
        localGenerationContract: { status: "passing", evidence: [] },
      }),
    ).toThrow(/requires retained evidence/);
  });

  it("rejects unobserved facts with evidence and duplicate evidence paths", () => {
    expect(() =>
      defineAdapterRegistryEntry({
        ...baseDefinition,
        consumerParse: { status: "untested", evidence: ["verification/parse.yml"] },
      }),
    ).toThrow(/cannot cite passing evidence/);
    expect(() =>
      defineAdapterRegistryEntry({
        ...baseDefinition,
        localGenerationContract: {
          status: "passing",
          evidence: ["packages/core/src/core.test.ts", "packages/core/src/core.test.ts"],
        },
      }),
    ).toThrow(/evidence paths must be unique/);
  });

  it("requires timestamps and versions for observed external facts", () => {
    expect(() =>
      defineAdapterRegistryEntry({
        ...baseDefinition,
        consumerParse: { status: "passing", evidence: ["verification/parse.yml"] },
        externalExecution: { status: "failing", evidence: ["verification/execution.yml"] },
      }),
    ).toThrow(/testedAgentVersion/);
    expect(() =>
      defineAdapterRegistryEntry({
        ...baseDefinition,
        consumerParse: { status: "passing", evidence: ["verification/parse.yml"] },
        externalExecution: { status: "failing", evidence: ["verification/execution.yml"] },
        testedAgentVersion: "1.0.0",
      }),
    ).toThrow(/lastExternalExecutionAt/);
  });

  it("rejects invented external version and review facts", () => {
    expect(() =>
      defineAdapterRegistryEntry({ ...baseDefinition, testedAgentVersion: "1.2.3" }),
    ).toThrow(/testedAgentVersion/);
    expect(() =>
      defineAdapterRegistryEntry({
        ...baseDefinition,
        externalExecution: { status: "passing", evidence: ["verification/execution.yml"] },
        testedAgentVersion: "1.2.3",
        lastExternalExecutionAt: "2026-01-01T00:00:00Z",
      }),
    ).toThrow(/requires passing consumer parsing/);
    expect(() =>
      defineAdapterRegistryEntry({
        ...baseDefinition,
        outcomeReview: { status: "passing", evidence: ["verification/review.md"] },
        lastOutcomeReviewAt: "2026-01-01T00:00:00Z",
      }),
    ).toThrow(/requires passing external execution/);
    expect(() =>
      defineAdapterRegistryEntry({
        ...baseDefinition,
        lastOutcomeReviewAt: "2026-01-01T00:00:00Z",
      }),
    ).toThrow(/lastOutcomeReviewAt/);
  });
});
