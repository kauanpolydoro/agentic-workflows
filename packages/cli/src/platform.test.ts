import { describe, expect, it } from "vitest";
import { documentationOpenCommand } from "./platform.js";

describe("platform commands", () => {
  it.each([
    ["linux", "xdg-open", ["https://example.invalid/docs"]],
    ["freebsd", "xdg-open", ["https://example.invalid/docs"]],
    ["darwin", "open", ["https://example.invalid/docs"]],
    ["win32", "rundll32.exe", ["url.dll,FileProtocolHandler", "https://example.invalid/docs"]],
  ] as const)("selects the documented %s opener", (platform, command, args) => {
    expect(documentationOpenCommand("https://example.invalid/docs", platform)).toEqual({
      command,
      args,
    });
  });
});
