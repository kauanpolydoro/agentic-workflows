import { describe, expect, it } from "vitest";
import { completionShells, renderCompletion } from "./completion.js";

const catalog = [{ id: "generate-tests" }, { id: "review-pull-request" }];

describe("shell completion", () => {
  it.each(completionShells)("renders deterministic %s completion", (shell) => {
    const completion = renderCompletion(shell, catalog);

    expect(completion).toContain("review-pull-request");
    expect(completion).toContain("generate-tests");
    expect(completion).toContain("completion");
    expect(completion).toContain("codex");
    expect(completion).not.toContain("\u001b");
    expect(completion.endsWith("\n")).toBe(true);
    expect(renderCompletion(shell, catalog)).toBe(completion);
  });

  it("registers both public executable aliases", () => {
    expect(renderCompletion("bash", catalog)).toContain(
      "complete -F _awf_completion awf agentic-workflows",
    );
    expect(renderCompletion("pwsh", catalog)).toContain("-CommandName awf,agentic-workflows");
    expect(renderCompletion("fish", catalog)).toContain("complete -c agentic-workflows");
    expect(renderCompletion("zsh", catalog)).toContain("#compdef awf agentic-workflows");
  });

  it("rejects unsafe catalog identifiers instead of interpolating shell syntax", () => {
    expect(() => renderCompletion("bash", [{ id: "unsafe;command" }])).toThrowError(
      "Cannot generate shell completion for an unsafe workflow ID.",
    );
  });
});
