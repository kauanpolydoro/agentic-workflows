import { afterEach, describe, expect, it, vi } from "vitest";
import { AwfError } from "@kauanpolydoro/agentic-workflows-core";
import { fail, output } from "./io.js";

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("terminal output", () => {
  it("sanitizes control sequences in human output", () => {
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    output("safe\u001b]8;;https://example.invalid\u0007label\u001b]8;;\u0007\u001b[31mred");
    expect(write).toHaveBeenCalledWith("safelabelred\n");
  });

  it("preserves structured JSON encoding", () => {
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    output({ value: "line\nnext" }, true);
    expect(write).toHaveBeenCalledWith('{\n  "value": "line\\nnext"\n}\n');
  });

  it("sanitizes human error messages", () => {
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    expect(() => fail(new Error("bad\u001b[31mred"))).toThrow("__AWF_HANDLED__");
    expect(process.stderr.write).toHaveBeenCalledWith(
      "Error: badred\nHelp: awf --help\nNext: Run `awf --help` to verify the command syntax.\n",
    );
  });

  it("preserves codes, remediation, and validation issues in human errors", () => {
    const write = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    expect(() =>
      fail(
        new AwfError("INVALID_RECIPE", "strict failure", {
          issues: [
            {
              code: "BROKEN_LINK",
              path: "example/workflow.md",
              severity: "error",
              remediation: "Correct the relative target.",
            },
          ],
          remediation: "Run `awf validate --strict` again.",
        }),
      ),
    ).toThrow("__AWF_HANDLED__");

    expect(String(write.mock.calls[0]?.[0])).toBe(
      "Error [INVALID_RECIPE]: strict failure\n" +
        "Details:\n" +
        "- [BROKEN_LINK] at example/workflow.md\n" +
        "  Fix: Correct the relative target.\n" +
        "Help: awf --help\n" +
        "Next: Run `awf validate --strict` again.\n",
    );
  });

  it("renders lifecycle-lock ownership and safe manual recovery for people", () => {
    const write = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    expect(() =>
      fail(
        new AwfError("CONFLICT", "Another installation lifecycle operation owns this target.", {
          pid: 5150,
          acquiredAt: "2026-07-20T12:00:00.000Z",
        }),
      ),
    ).toThrow("__AWF_HANDLED__");

    const rendered = String(write.mock.calls[0]?.[0]);
    expect(rendered).toContain("Owner: PID 5150, acquired at 2026-07-20T12:00:00.000Z");
    expect(rendered).toContain("Next: Confirm that PID 5150 is no longer active");
    expect(rendered).toContain("manually removing the lifecycle lock");
    expect(rendered).toContain("`awf doctor`");
  });

  it("remains colorless when NO_COLOR is set", () => {
    const previous = process.env.NO_COLOR;
    process.env.NO_COLOR = "1";
    try {
      const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
      output("plain output");
      expect(write).toHaveBeenCalledWith("plain output\n");
      expect(String(write.mock.calls[0]?.[0])).not.toContain("\u001b");
    } finally {
      if (previous === undefined) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = previous;
    }
  });

  it("renders machine-readable errors with stable codes", () => {
    const write = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    expect(() => fail(new AwfError("INVALID_PATH", "unsafe\u001b[31m path"), true)).toThrow(
      "__AWF_HANDLED__",
    );
    const rendered = String(write.mock.calls[0]?.[0]);
    expect(rendered).not.toContain("\u001b");
    expect(JSON.parse(rendered)).toMatchObject({
      schema_version: 1,
      error: "AwfError",
      code: "INVALID_PATH",
      message: "unsafe\u001b[31m path",
      command: "awf",
      retryable: false,
      help_url: "https://kauanpolydoro.github.io/agentic-workflows/guide/cli-reference",
      remediation:
        "Choose a real, project-local path without symbolic-link or traversal boundaries.",
      details: { help_command: "awf --help" },
    });
  });

  it("retains structured diagnostic details in JSON errors", () => {
    const write = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    expect(() =>
      fail(
        new AwfError("INVALID_RECIPE", "strict failure", {
          issues: [
            {
              code: "BROKEN_LINK",
              path: "example/workflow.md",
              severity: "error",
              remediation: "Correct the relative target.",
            },
          ],
        }),
        true,
      ),
    ).toThrow("__AWF_HANDLED__");
    expect(JSON.parse(String(write.mock.calls[0]?.[0]))).toMatchObject({
      details: {
        issues: [
          {
            code: "BROKEN_LINK",
            path: "example/workflow.md",
            severity: "error",
            remediation: "Correct the relative target.",
          },
        ],
      },
    });
  });

  it("normalizes malformed human issue metadata and filters suggestions", () => {
    const write = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    expect(() =>
      fail(
        new AwfError("INVALID_RECIPE", "mixed details", {
          issues: [{}, { code: 42, path: false }],
          suggestions: [42, "review-pull-request"],
          pid: "invalid",
          acquiredAt: "2026-07-20T12:00:00.000Z",
        }),
      ),
    ).toThrow("__AWF_HANDLED__");
    const rendered = String(write.mock.calls[0]?.[0]);
    expect(rendered).toContain("- [ISSUE]");
    expect(rendered).toContain("Suggestions: review-pull-request");
    expect(rendered).not.toContain("Owner:");
  });

  it("renders non-error values through the complete JSON contract", () => {
    const write = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    expect(() => fail({ reason: "unknown" }, true, 2)).toThrow("__AWF_HANDLED__");
    expect(JSON.parse(String(write.mock.calls[0]?.[0]))).toMatchObject({
      schema_version: 1,
      error: "UnknownError",
      message: "[object Object]",
      code: "UNKNOWN_ERROR",
      command: "awf",
    });
    expect(process.exitCode).toBe(2);
  });
});
