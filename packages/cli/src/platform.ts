export interface ExternalCommand {
  command: string;
  args: string[];
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
