const commandNames = [
  "list",
  "show",
  "install",
  "update",
  "remove",
  "status",
  "validate",
  "doctor",
  "init",
  "manifest",
  "completion",
] as const;

type CommandName = (typeof commandNames)[number];

const commandAnchors: Record<CommandName, string> = {
  list: "awf-list",
  show: "awf-show-workflow-id",
  install: "awf-install-workflow-id",
  update: "awf-update-workflow-id",
  remove: "awf-remove-workflow-id",
  status: "awf-status-workflow-id",
  validate: "awf-validate-path",
  doctor: "awf-doctor",
  init: "awf-init",
  manifest: "awf-manifest-workflow-id",
  completion: "awf-completion-shell",
};

interface ErrorMetadataInput {
  code?: unknown;
  message: string;
  details?: Readonly<Record<string, unknown>>;
}

export interface ErrorContractMetadata {
  code: string;
  command: CommandName | "awf";
  retryable: boolean;
  help_url: string;
  remediation: string;
}

export function commandFromArguments(args: readonly string[]): CommandName | "awf" {
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--project-root") {
      index += 1;
      continue;
    }
    if (argument?.startsWith("-")) continue;
    return commandNames.find((command) => command === argument) ?? "awf";
  }
  return "awf";
}

function defaultRemediation(code: string, command: CommandName | "awf"): string {
  switch (code) {
    case "CONFLICT":
      return "Inspect the conflicting path or lifecycle owner, then retry only after the conflict is resolved.";
    case "MODIFIED_FILE":
      return "Review a dry-run plan and preserve the local edit, or use --force only after explicit approval.";
    case "MISSING_FILE":
    case "NOT_FOUND":
      return command === "show"
        ? "Run `awf list` and retry with an available workflow ID."
        : "Verify the requested workflow, target, and project root before retrying.";
    case "INVALID_PATH":
      return "Choose a real, project-local path without symbolic-link or traversal boundaries.";
    case "FILE_TOO_LARGE":
      return "Reduce the referenced file below the documented size limit before retrying.";
    case "INVALID_RECIPE":
    case "INVALID_MANIFEST":
      return "Run `awf validate --strict` and `awf doctor` to identify the invalid record before retrying.";
    default:
      return command === "awf"
        ? "Run `awf --help` to verify the command syntax."
        : `Run \`awf ${command} --help\` and \`awf doctor\` before retrying.`;
  }
}

export function errorContractMetadata(
  value: ErrorMetadataInput,
  args: readonly string[] = process.argv.slice(2),
): ErrorContractMetadata {
  const code = typeof value.code === "string" ? value.code : "UNKNOWN_ERROR";
  const command = commandFromArguments(args);
  const explicitRemediation = value.details?.remediation;
  return {
    code,
    command,
    retryable:
      code === "CONFLICT" &&
      value.message.includes("Another installation lifecycle operation owns this target"),
    help_url:
      command === "awf"
        ? "https://kauanpolydoro.github.io/agentic-workflows/guide/cli-reference"
        : `https://kauanpolydoro.github.io/agentic-workflows/guide/cli-reference#${commandAnchors[command]}`,
    remediation:
      typeof explicitRemediation === "string"
        ? explicitRemediation
        : defaultRemediation(code, command),
  };
}
