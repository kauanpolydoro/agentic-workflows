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
});
