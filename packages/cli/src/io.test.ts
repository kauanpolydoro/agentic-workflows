import { afterEach, describe, expect, it, vi } from "vitest";
import { AwfError } from "@agentic-workflows/core";
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
    expect(process.stderr.write).toHaveBeenCalledWith("Error: badred\n");
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
      error: "AwfError",
      code: "INVALID_PATH",
      message: "unsafe\u001b[31m path",
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
});
