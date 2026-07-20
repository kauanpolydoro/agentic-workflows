import { Readable, Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { parseAgentChoice, promptInitWizard } from "./wizard.js";

describe("init wizard choices", () => {
  it("accepts a numbered choice, an agent ID, and an empty default", () => {
    expect(parseAgentChoice("1", "codex")).toBe("generic");
    expect(parseAgentChoice(" codex ", "generic")).toBe("codex");
    expect(parseAgentChoice("", "codex")).toBe("codex");
  });

  it("rejects values outside the displayed choices", () => {
    expect(parseAgentChoice("0", "generic")).toBeNull();
    expect(parseAgentChoice("999", "generic")).toBeNull();
    expect(parseAgentChoice("unknown", "generic")).toBeNull();
  });

  it("prompts with plain text and retries invalid agent and target answers", async () => {
    async function* answers() {
      for (const answer of ["unknown\n", "3\n", "../outside\n", ".\n"]) {
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
        yield answer;
      }
    }
    let rendered = "";
    const output = new Writable({
      write(chunk, _encoding, callback) {
        rendered += String(chunk);
        callback();
      },
    });

    await expect(
      promptInitWizard({
        defaultAgent: "generic",
        defaultTarget: ".",
        isValidTarget: (value) => value === ".",
        input: Readable.from(answers()),
        output,
      }),
    ).resolves.toEqual({ agent: "codex", target: "." });
    expect(rendered).toContain("Choose one of:");
    expect(rendered).toContain("Use a relative path that stays inside the project root.");
    expect(rendered).not.toContain("\u001b");
  });
});
