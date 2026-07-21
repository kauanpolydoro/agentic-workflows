import { describe, expect, it } from "vitest";
import { commandFromArguments, errorContractMetadata } from "./error-contract.js";

describe("machine error metadata", () => {
  it("finds commands around global options", () => {
    expect(commandFromArguments(["--project-root", "/tmp/project", "list", "--json"])).toBe("list");
    expect(commandFromArguments(["show", "list", "--json"])).toBe("show");
    expect(commandFromArguments(["context", "--json"])).toBe("context");
    expect(commandFromArguments(["--project-root=/tmp/project", "doctor", "--json"])).toBe(
      "doctor",
    );
    expect(commandFromArguments(["--unknown"])).toBe("awf");
  });

  it("adds command help, conservative retryability, and remediation", () => {
    expect(
      errorContractMetadata({ code: "INVALID_PATH", message: "unsafe" }, [
        "install",
        "workflow",
        "--json",
      ]),
    ).toEqual({
      code: "INVALID_PATH",
      command: "install",
      retryable: false,
      help_url:
        "https://kauanpolydoro.github.io/agentic-workflows/guide/cli-reference#awf-install-workflow-id",
      help_command: "awf install --help",
      remediation:
        "Choose a real, project-local path without symbolic-link or traversal boundaries.",
    });
  });

  it("preserves explicit remediation and marks only active lifecycle conflicts retryable", () => {
    expect(
      errorContractMetadata(
        {
          code: "CONFLICT",
          message: "Another installation lifecycle operation owns this target.",
          details: { remediation: "Wait for the recorded owner to finish." },
        },
        ["update"],
      ),
    ).toMatchObject({
      retryable: true,
      remediation: "Wait for the recorded owner to finish.",
    });
  });

  it("turns lifecycle-lock ownership into a precise manual recovery", () => {
    expect(
      errorContractMetadata(
        {
          code: "CONFLICT",
          message: "Another installation lifecycle operation owns this target.",
          details: { pid: 5150, acquiredAt: "2026-07-20T12:00:00.000Z" },
        },
        ["update"],
      ),
    ).toMatchObject({
      retryable: true,
      remediation: expect.stringMatching(
        /PID 5150.*2026-07-20T12:00:00\.000Z.*manually removing.*awf doctor/,
      ),
    });
  });

  it.each([
    ["CONFLICT", ["install"], "conflicting path"],
    ["MODIFIED_FILE", ["remove"], "dry-run plan"],
    ["MISSING_FILE", ["show"], "awf list"],
    ["NOT_FOUND", ["status"], "project root"],
    ["FILE_TOO_LARGE", ["validate"], "size limit"],
    ["INVALID_RECIPE", ["validate"], "awf validate --strict"],
    ["INVALID_MANIFEST", ["manifest"], "awf doctor"],
    ["INTERRUPTED", ["show"], "awf show --help"],
  ] as const)("provides default %s recovery", (code, args, expected) => {
    expect(errorContractMetadata({ code, message: "failure" }, args).remediation).toContain(
      expected,
    );
  });

  it("covers unknown errors and lifecycle locks without valid owner metadata", () => {
    expect(errorContractMetadata({ code: 42, message: "unknown" }, []).remediation).toContain(
      "awf --help",
    );
    expect(
      errorContractMetadata(
        {
          code: "CONFLICT",
          message: "Another installation lifecycle operation owns this target.",
          details: { pid: "invalid" },
        },
        ["update"],
      ),
    ).toMatchObject({
      retryable: true,
      remediation: expect.stringContaining("Identify the lifecycle-lock owner"),
    });
  });
});
