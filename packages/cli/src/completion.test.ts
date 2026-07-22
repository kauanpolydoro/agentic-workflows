import { describe, expect, it } from "vitest";
import {
  completionCommandOptions,
  completionShells,
  renderCompletion,
  renderCompletionInstallInstructions,
} from "./completion.js";
import { createProgram } from "./index.js";

const catalog = [
  { id: "generate-tests", category: "testing" as const, tags: ["regression-test"] },
  { id: "review-pull-request", category: "code-review" as const, tags: ["quality"] },
];

describe("shell completion", () => {
  it.each(completionShells)("renders deterministic %s completion", (shell) => {
    const completion = renderCompletion(shell, catalog);

    expect(completion).toContain("review-pull-request");
    expect(completion).toContain("generate-tests");
    expect(completion).toContain("completion");
    expect(completion).toContain("context");
    expect(completion).toContain("codex");
    expect(completion).toContain("regression-test");
    expect(completion).toContain("autonomous");
    for (const option of [
      "category",
      "execution-mode",
      "tag",
      "adapter-status",
      "compatibility",
      "installation",
      "execution",
      "outcome",
    ]) {
      expect(completion).toContain(shell === "fish" ? `-l ${option}` : `--${option}`);
    }
    expect(completion).not.toContain("\u001b");
    expect(completion.endsWith("\n")).toBe(true);
    expect(renderCompletion(shell, catalog)).toBe(completion);
  });

  it("registers both public executable aliases", () => {
    expect(renderCompletion("bash", catalog)).toContain(
      "complete -o default -F _awf_completion awf agentic-workflows",
    );
    expect(renderCompletion("pwsh", catalog)).toContain("-CommandName awf,agentic-workflows");
    expect(renderCompletion("fish", catalog)).toContain("complete -c agentic-workflows");
    expect(renderCompletion("zsh", catalog)).toContain("#compdef awf agentic-workflows");
  });

  it("uses native directory completion for every supported shell", () => {
    expect(renderCompletion("bash", catalog)).toContain("compgen -d");
    expect(renderCompletion("zsh", catalog)).toContain("_directories");
    expect(renderCompletion("fish", catalog)).toContain("__fish_complete_directories");
    expect(renderCompletion("pwsh", catalog)).toContain("Get-ChildItem -LiteralPath");
  });

  it("keeps command-specific completion options synchronized with Commander", () => {
    const program = createProgram({ interactive: false });
    for (const command of program.commands) {
      const name = command.name() as keyof typeof completionCommandOptions;
      expect(
        command.options.map((option) => option.long).filter((option) => option !== undefined),
      ).toEqual(expect.arrayContaining([...completionCommandOptions[name]]));
      expect(completionCommandOptions[name]).toEqual(
        expect.arrayContaining(
          command.options
            .map((option) => option.long)
            .filter((option): option is string => option !== undefined),
        ),
      );
    }
  });

  it.each(completionShells)("provides non-mutating %s profile instructions", (shell) => {
    const instructions = renderCompletionInstallInstructions(shell);
    expect(instructions).toContain("will not edit");
    expect(instructions).toContain(`awf completion ${shell}`);
    expect(instructions).not.toContain("\u001b");
    expect(instructions.endsWith("\n")).toBe(true);
  });

  it("rejects unsafe catalog identifiers instead of interpolating shell syntax", () => {
    expect(() => renderCompletion("bash", [{ id: "unsafe;command" }])).toThrowError(
      "Cannot generate shell completion for an unsafe workflow ID.",
    );
    expect(() =>
      renderCompletion("fish", [{ id: "safe", category: "testing", tags: ["unsafe;command"] }]),
    ).toThrowError("Cannot generate shell completion for an unsafe tag.");
  });

  it("supports minimal catalog records without optional category or tags", () => {
    expect(renderCompletion("bash", [{ id: "safe-workflow" }])).toContain("safe-workflow");
  });
});
