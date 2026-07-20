import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { CompletionShell } from "../packages/cli/src/completion.js";

const supportedShells = ["bash", "zsh", "fish", "pwsh"] as const;
const requestedIndex = process.argv.indexOf("--shell");
const requested = requestedIndex >= 0 ? process.argv[requestedIndex + 1] : undefined;
if (requested !== undefined && !supportedShells.includes(requested as CompletionShell)) {
  throw new Error(`Unsupported completion smoke shell ${JSON.stringify(requested)}.`);
}

function commandAvailable(command: string): boolean {
  const result = spawnSync(command, ["--version"], { encoding: "utf8", shell: false });
  return result.status === 0;
}

const candidates: readonly CompletionShell[] = requested
  ? [requested as CompletionShell]
  : process.platform === "win32"
    ? ["pwsh"]
    : supportedShells;
const shells = candidates.filter(commandAvailable);
if (requested && shells.length === 0) {
  throw new Error(`${requested} is required for its native completion smoke test.`);
}
if (shells.length === 0) throw new Error("No supported shell is available for completion smoke.");

const cli = path.resolve("packages/cli/dist/index.js");
const workspace = await mkdtemp(path.join(os.tmpdir(), "awf completion smoke with spaces "));
const cleanup = () => rmSync(workspace, { recursive: true, force: true });
process.once("exit", cleanup);

const executable = path.join(workspace, process.platform === "win32" ? "awf.cmd" : "awf");
await writeFile(
  executable,
  process.platform === "win32" ? "@echo off\r\nexit /b 0\r\n" : "#!/bin/sh\nexit 0\n",
);
if (process.platform !== "win32") await chmod(executable, 0o755);
const pathEnvironmentKey =
  Object.keys(process.env).find((key) => key.toLowerCase() === "path") ?? "PATH";
const executableEnvironment = {
  ...process.env,
  [pathEnvironmentKey]: [workspace, process.env[pathEnvironmentKey]]
    .filter(Boolean)
    .join(path.delimiter),
};

function run(command: string, args: readonly string[], environment = process.env): string {
  const result = spawnSync(command, args, {
    cwd: workspace,
    encoding: "utf8",
    env: environment,
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with ${String(result.status)}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return result.stdout;
}

function assertCandidates(shell: CompletionShell, output: string): void {
  for (const [label, candidate] of [
    ["OPTIONS", "--agent"],
    ["AGENT", "codex"],
    ["CATEGORY", "code-review"],
    ["INSTALL", "--dry-run"],
  ] as const) {
    const line = output.split(/\r?\n/).find((value) => value.startsWith(`${label}:`));
    if (
      !line
        ?.slice(label.length + 1)
        .split(/\s+/)
        .includes(candidate)
    ) {
      throw new Error(`${shell} completion omitted ${label}:${candidate}:\n${output}`);
    }
  }
  const install = output.split(/\r?\n/).find((line) => line.startsWith("INSTALL:"));
  if (install?.includes("--category")) {
    throw new Error(`${shell} offered the list-only --category option to install.`);
  }
}

async function smoke(shell: CompletionShell): Promise<void> {
  const completion = run(process.execPath, [cli, "completion", shell]);
  const completionFile = path.join(workspace, `awf completion.${shell}`);
  await writeFile(completionFile, completion);
  const environment = { ...executableEnvironment, AWF_COMPLETION_FILE: completionFile };
  let output: string;

  if (shell === "bash") {
    const wrapper = path.join(workspace, "bash-smoke.sh");
    await writeFile(
      wrapper,
      `set -euo pipefail
source "$AWF_COMPLETION_FILE"
COMP_WORDS=(awf list --a); COMP_CWORD=2; _awf_completion
printf 'OPTIONS:%s\n' "\${COMPREPLY[*]}"
COMP_WORDS=(awf list --agent co); COMP_CWORD=3; _awf_completion
printf 'AGENT:%s\n' "\${COMPREPLY[*]}"
COMP_WORDS=(awf list --category co); COMP_CWORD=3; _awf_completion
printf 'CATEGORY:%s\n' "\${COMPREPLY[*]}"
COMP_WORDS=(awf install review-pull-request --); COMP_CWORD=3; _awf_completion
printf 'INSTALL:%s\n' "\${COMPREPLY[*]}"
`,
    );
    output = run("bash", ["--noprofile", "--norc", wrapper], environment);
  } else if (shell === "zsh") {
    const wrapper = path.join(workspace, "zsh-smoke.zsh");
    await writeFile(
      wrapper,
      `set -eu
typeset -a CAPTURED
compdef() { :; }
_files() { CAPTURED=(__FILES__); }
compadd() {
  CAPTURED=()
  local candidate
  for candidate in "$@"; do
    [[ "$candidate" == "--" ]] || CAPTURED+=("$candidate")
  done
}
source "$AWF_COMPLETION_FILE"
words=(awf list --a); CURRENT=3; _awf
print -r -- "OPTIONS:\${(j: :)CAPTURED}"
words=(awf list --agent co); CURRENT=4; _awf
print -r -- "AGENT:\${(j: :)CAPTURED}"
words=(awf list --category co); CURRENT=4; _awf
print -r -- "CATEGORY:\${(j: :)CAPTURED}"
words=(awf install review-pull-request --); CURRENT=4; _awf
print -r -- "INSTALL:\${(j: :)CAPTURED}"
`,
    );
    output = run("zsh", ["-f", wrapper], environment);
  } else if (shell === "fish") {
    const wrapper = path.join(workspace, "fish-smoke.fish");
    await writeFile(
      wrapper,
      `source "$AWF_COMPLETION_FILE"
function complete_awf
  complete -C "$argv[1]" | string replace -r '\\t.*$' '' | string join ' '
end
printf 'OPTIONS:%s\\n' (complete_awf 'awf list --a')
printf 'AGENT:%s\\n' (complete_awf 'awf list --agent co')
printf 'CATEGORY:%s\\n' (complete_awf 'awf list --category co')
printf 'INSTALL:%s\\n' (complete_awf 'awf install review-pull-request --')
`,
    );
    output = run("fish", ["--no-config", wrapper], environment);
  } else {
    const wrapper = path.join(workspace, "pwsh-smoke.ps1");
    await writeFile(
      wrapper,
      `$ErrorActionPreference = 'Stop'
. $env:AWF_COMPLETION_FILE
if (-not (Get-Command awf -ErrorAction SilentlyContinue)) {
  throw 'The temporary awf executable is not available to PowerShell.'
}
function Complete-Awf([string]$InputText) {
  $result = TabExpansion2 -inputScript $InputText -cursorColumn $InputText.Length
  return (($result.CompletionMatches | ForEach-Object { $_.CompletionText }) -join ' ')
}
Write-Output "OPTIONS:$(Complete-Awf 'awf list --a')"
Write-Output "AGENT:$(Complete-Awf 'awf list --agent co')"
Write-Output "CATEGORY:$(Complete-Awf 'awf list --category co')"
Write-Output "INSTALL:$(Complete-Awf 'awf install review-pull-request --')"
`,
    );
    output = run("pwsh", ["-NoLogo", "-NoProfile", "-File", wrapper], environment);
  }

  assertCandidates(shell, output);
  process.stdout.write(`${shell} completion loaded and returned command-specific candidates.\n`);
}

for (const shell of shells) await smoke(shell);

cleanup();
process.removeListener("exit", cleanup);
