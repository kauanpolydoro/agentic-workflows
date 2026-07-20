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
    for (const outcome of ["error", "non-zero", "signal"] as const) {
      const child = new EventEmitter();
      const launch = (() => child) as unknown as ExternalCommandLauncher;
      const pending = openDocumentationTarget("https://example.invalid/docs", undefined, {
        platform: "win32",
        launch,
      });
      if (outcome === "error") child.emit("error", new Error("unavailable"));
      else if (outcome === "non-zero") child.emit("close", 7, null);
      else child.emit("close", 0, "SIGTERM");
      await expect(pending).resolves.toBe(false);
    }
  });

  it("uses the current platform when only a launcher is injected", async () => {
    const child = new EventEmitter();
    const launch = vi.fn(() => child) as unknown as ExternalCommandLauncher;
    const pending = openDocumentationTarget("https://example.invalid/docs", undefined, {
      launch,
    });
    child.emit("close", 0, null);
    await expect(pending).resolves.toBe(true);
    expect(launch).toHaveBeenCalledOnce();
  });

  it("ignores duplicate child completion events after settling", async () => {
    const child = new EventEmitter();
    const launch = (() => child) as unknown as ExternalCommandLauncher;
    const pending = openDocumentationTarget("https://example.invalid/docs", undefined, {
      platform: "linux",
      launch,
    });
    child.emit("error", new Error("first terminal event"));
    child.emit("close", 0, null);
    await expect(pending).resolves.toBe(false);
  });

  it("reports a synchronous launcher failure as a deterministic fallback", async () => {
    const launch = (() => {
      throw new Error("synchronous launcher failure");
    }) as ExternalCommandLauncher;
    await expect(
      openDocumentationTarget("https://example.invalid/docs", undefined, {
        platform: "linux",
        launch,
      }),
    ).resolves.toBe(false);
  });

  it("rejects an already aborted request before launching", async () => {
    const reason = new Error("already cancelled");
    const controller = new AbortController();
    controller.abort(reason);
    const launch = vi.fn() as unknown as ExternalCommandLauncher;
    await expect(
      openDocumentationTarget("https://example.invalid/docs", controller.signal, {
        platform: "linux",
        launch,
      }),
    ).rejects.toBe(reason);
    expect(launch).not.toHaveBeenCalled();
  });

  it("keeps cancellation authoritative when launch throws concurrently", async () => {
    const controller = new AbortController();
    const reason = new Error("cancelled during launch");
    const launch = (() => {
      controller.abort(reason);
      throw new Error("launcher also failed");
    }) as ExternalCommandLauncher;
    await expect(
      openDocumentationTarget("https://example.invalid/docs", controller.signal, {
        platform: "darwin",
        launch,
      }),
    ).rejects.toBe(reason);
  });

  it("uses the launcher error when an aborted synthetic signal has no reason", async () => {
    class SyntheticSignal extends EventTarget {
      public aborted = false;
      public reason: unknown;
      public onabort: ((this: AbortSignal, event: Event) => unknown) | null = null;
      public throwIfAborted(): void {
        if (this.aborted) throw this.reason;
      }
    }
    const signal = new SyntheticSignal();
    const child = new EventEmitter();
    const launch = (() => child) as unknown as ExternalCommandLauncher;
    const pending = openDocumentationTarget("https://example.invalid/docs", signal as AbortSignal, {
      platform: "linux",
      launch,
    });
    signal.aborted = true;
    const error = new Error("aborted launcher error");
    child.emit("error", error);
    await expect(pending).rejects.toBe(error);
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
