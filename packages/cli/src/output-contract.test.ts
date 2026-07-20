import { describe, expect, it } from "vitest";
import { parseCliOutput } from "./output-contract.js";

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
});
