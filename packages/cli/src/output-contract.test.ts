import { describe, expect, it } from "vitest";
import { normalizeProjectContext, parseCliOutput } from "./output-contract.js";

describe("CLI output contracts", () => {
  it("accepts a complete project-context report", () => {
    const value = {
      schema_version: 1,
      project_root: "/project",
      selection_source: "explicit",
      project_root_fallback: false,
      reason: "Selected explicitly.",
    };
    expect(parseCliOutput("context", value)).toEqual(value);
  });

  it("rejects omitted required fields and undocumented additions", () => {
    expect(() =>
      parseCliOutput("error", {
        schema_version: 1,
        error: "AwfError",
        message: "Invalid target.",
        code: "INVALID_PATH",
      }),
    ).toThrow();
    expect(() =>
      parseCliOutput("documentation_open", {
        schema_version: 1,
        target: "https://example.invalid",
        opened: false,
        undocumented: true,
      }),
    ).toThrow();
  });

  it("accepts versioned lifecycle and interruption records", () => {
    expect(
      parseCliOutput("lifecycle_plan", {
        schema_version: 1,
        operation: "install",
        dry_run: true,
        requires_force: false,
        changes: { create: ["workflow.md"] },
      }),
    ).toMatchObject({ operation: "install" });
    expect(
      parseCliOutput("error", {
        schema_version: 1,
        error: "AbortError",
        message: "The operation was interrupted by SIGINT.",
        code: "INTERRUPTED",
        command: "show",
        retryable: false,
        help_url: "https://example.invalid/cli#show",
        remediation: "Run awf doctor.",
        details: { signal: "SIGINT" },
      }),
    ).toMatchObject({ code: "INTERRUPTED" });
  });

  it("exposes catalog, recipe, and manifest contracts from one public registry", () => {
    expect(parseCliOutput("catalog_list", [])).toEqual([]);
    expect(() => parseCliOutput("recipe", { schema_version: 2 })).toThrow();
    expect(() => parseCliOutput("manifest", { schema_version: 1 })).toThrow();
  });

  it("normalizes context fields across compatible version 1 command shapes", () => {
    const reason = "Selected explicitly.";
    const expected = {
      schema_version: 1,
      project_root: "/project",
      selection_source: "explicit",
      project_root_fallback: false,
      reason,
    };
    const context = { ...expected };
    const status = {
      schema_version: 1,
      target: "/project",
      project_context: {
        project_root: "/project",
        selection_source: "explicit",
        project_root_fallback: false,
        reason,
      },
      filter: "all",
      summary: { total: 0, healthy: 0, drifted: 0, invalid: 0 },
      installations: [],
    };
    const doctor = {
      schema_version: 1,
      status: "pass",
      healthy: true,
      exit_code: 0,
      projectRoot: "/project",
      projectContext: { root: "/project", source: "explicit", reason },
      filter: "all",
      summary: { total: 0, pass: 0, warn: 0, fail: 0 },
      checks: [],
    };
    const init = {
      schema_version: 1,
      created: true,
      replaced: false,
      config_path: ".agentic-workflows/config.yml",
      project_context: { root: "/project", source: "explicit", reason },
      configuration: {
        schema_version: 1,
        default_agent: "generic",
        default_target: ".",
      },
      next: "Run awf list.",
    };

    expect(normalizeProjectContext("context", context)).toEqual(expected);
    expect(normalizeProjectContext("status", status)).toEqual(expected);
    expect(normalizeProjectContext("doctor", doctor)).toEqual(expected);
    expect(normalizeProjectContext("init", init)).toEqual(expected);
  });
});
