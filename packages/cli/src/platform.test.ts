import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import {
  documentationOpenCommand,
  type ExternalCommandLauncher,
  openDocumentationTarget,
} from "./platform.js";

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

  it.each([
    ["linux", "xdg-open"],
    ["darwin", "open"],
    ["win32", "rundll32.exe"],
  ] as const)("waits for a successful %s opener", async (platform, expectedCommand) => {
    const child = new EventEmitter();
    const launch = vi.fn(() => child) as unknown as ExternalCommandLauncher;
    const pending = openDocumentationTarget("https://example.invalid/docs", undefined, {
      platform,
      launch,
    });
    child.emit("close", 0, null);

    await expect(pending).resolves.toBe(true);
    expect(launch).toHaveBeenCalledWith(
      expectedCommand,
      expect.arrayContaining(["https://example.invalid/docs"]),
      {},
    );
  });

  it("reports launcher errors and non-zero exits as a deterministic fallback", async () => {
    for (const outcome of ["error", "non-zero"] as const) {
      const child = new EventEmitter();
      const launch = (() => child) as unknown as ExternalCommandLauncher;
      const pending = openDocumentationTarget("https://example.invalid/docs", undefined, {
        platform: "win32",
        launch,
      });
      if (outcome === "error") child.emit("error", new Error("unavailable"));
      else child.emit("close", 7, null);
      await expect(pending).resolves.toBe(false);
    }
  });

  it("propagates cancellation independently of platform process behavior", async () => {
    const child = new EventEmitter();
    const launch = (() => child) as unknown as ExternalCommandLauncher;
    const controller = new AbortController();
    const reason = new Error("cancelled");
    const pending = openDocumentationTarget("https://example.invalid/docs", controller.signal, {
      platform: "win32",
      launch,
    });
    controller.abort(reason);
    await expect(pending).rejects.toBe(reason);
  });
});
