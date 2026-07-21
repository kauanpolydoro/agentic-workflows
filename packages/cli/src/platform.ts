import { spawn } from "node:child_process";

export interface ExternalCommand {
  command: string;
  args: string[];
}

export interface LaunchedExternalCommand {
  once(event: "error", listener: (error: Error) => void): this;
  once(
    event: "close",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void,
  ): this;
}

export type ExternalCommandLauncher = (
  command: string,
  args: string[],
  options: { signal?: AbortSignal },
) => LaunchedExternalCommand;

export type DocumentationOpener = (documentation: string, signal?: AbortSignal) => Promise<boolean>;

interface DocumentationOpenDependencies {
  platform?: NodeJS.Platform;
  launch?: ExternalCommandLauncher;
}

export function documentationOpenCommand(
  documentation: string,
  platform: NodeJS.Platform = process.platform,
): ExternalCommand {
  if (platform === "darwin") return { command: "open", args: [documentation] };
  if (platform === "win32") {
    return {
      command: "rundll32.exe",
      args: ["url.dll,FileProtocolHandler", documentation],
    };
  }
  return { command: "xdg-open", args: [documentation] };
}

const launchExternalCommand: ExternalCommandLauncher = (command, args, options) =>
  spawn(command, args, {
    ...(options.signal ? { signal: options.signal } : {}),
    stdio: "ignore",
  });

export async function openDocumentationTarget(
  documentation: string,
  signal?: AbortSignal,
  dependencies: DocumentationOpenDependencies = {},
): Promise<boolean> {
  if (signal?.aborted) throw signal.reason ?? new Error("Documentation opening was aborted.");
  const { command, args } = documentationOpenCommand(
    documentation,
    dependencies.platform ?? process.platform,
  );
  const launch = dependencies.launch ?? launchExternalCommand;
  return new Promise<boolean>((resolve, reject) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", abort);
      resolve(value);
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", abort);
      reject(error);
    };
    const abort = () => fail(signal?.reason ?? new Error("Documentation opening was aborted."));
    signal?.addEventListener("abort", abort, { once: true });
    try {
      const child = launch(command, args, signal ? { signal } : {});
      child.once("error", (error) => {
        if (signal?.aborted) fail(signal.reason ?? error);
        else finish(false);
      });
      child.once("close", (code, closeSignal) => finish(code === 0 && closeSignal === null));
    } catch (error) {
      if (signal?.aborted) fail(signal.reason ?? error);
      else finish(false);
    }
  });
}
