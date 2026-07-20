import {
  agentIds,
  AwfError,
  categoryIds,
  type GeneratedCatalogRecipe,
  recipeCompatibilityStatuses,
  supportStatuses,
  verificationStatuses,
} from "@kauanpolydoro/agentic-workflows-core";

export const completionShells = ["bash", "zsh", "fish", "pwsh"] as const;

export type CompletionShell = (typeof completionShells)[number];

const installInstructions: Record<CompletionShell, string> = {
  bash: [
    "The CLI will not edit your shell profile.",
    "Add this line to ~/.bashrc, then start a new Bash session:",
    "source <(awf completion bash)",
  ].join("\n"),
  zsh: [
    "The CLI will not edit your shell profile.",
    "Add this line to ~/.zshrc after compinit, then start a new Zsh session:",
    "source <(awf completion zsh)",
  ].join("\n"),
  fish: [
    "The CLI will not edit your shell configuration.",
    "Create ~/.config/fish/completions if needed, then run:",
    "awf completion fish > ~/.config/fish/completions/awf.fish",
  ].join("\n"),
  pwsh: [
    "The CLI will not edit your PowerShell profile.",
    "Add this line to $PROFILE, then start a new PowerShell session:",
    "awf completion pwsh | Out-String | Invoke-Expression",
  ].join("\n"),
};

export const completionCommands = [
  "context",
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

export type CompletionCommand = (typeof completionCommands)[number];

const globalOptions = ["--project-root", "--help", "--version"] as const;

export const completionCommandOptions = {
  context: ["--json"],
  list: [
    "--category",
    "--agent",
    "--tag",
    "--adapter-status",
    "--compatibility",
    "--installation",
    "--execution",
    "--outcome",
    "--json",
  ],
  show: ["--agent", "--json", "--raw", "--open", "--location"],
  install: ["--agent", "--target", "--dry-run", "--show-content", "--force", "--json"],
  update: ["--target", "--dry-run", "--show-content", "--force", "--json"],
  remove: ["--target", "--dry-run", "--force", "--json"],
  status: ["--target", "--failures-only", "--json"],
  validate: ["--json", "--strict"],
  doctor: ["--json", "--maintainer", "--failures-only"],
  init: ["--agent", "--target", "--no-interactive", "--force", "--json"],
  manifest: ["--target", "--json"],
  completion: ["--install-instructions"],
} as const satisfies Record<CompletionCommand, readonly string[]>;

const workflowCommands = ["show", "install", "update", "remove", "status", "manifest"] as const;
const completionTokenPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface CompletionCatalogRecipe extends Pick<GeneratedCatalogRecipe, "id"> {
  category?: GeneratedCatalogRecipe["category"];
  tags?: GeneratedCatalogRecipe["tags"];
}

interface CompletionData {
  workflows: string[];
  categories: string[];
  tags: string[];
}

function validatedTokens(label: string, values: readonly string[]): string[] {
  const unique = [...new Set(values)].sort();
  const invalid = unique.find((value) => !completionTokenPattern.test(value));
  if (invalid) {
    throw new AwfError(
      "INVALID_RECIPE",
      `Cannot generate shell completion for an unsafe ${label}.`,
      { [label]: invalid },
    );
  }
  return unique;
}

function completionData(catalog: readonly CompletionCatalogRecipe[]): CompletionData {
  return {
    workflows: validatedTokens(
      "workflow ID",
      catalog.map((recipe) => recipe.id),
    ),
    categories: validatedTokens("category", [
      ...categoryIds,
      ...catalog.flatMap((recipe) => (recipe.category ? [recipe.category] : [])),
    ]),
    tags: validatedTokens(
      "tag",
      catalog.flatMap((recipe) => recipe.tags ?? []),
    ),
  };
}

function commandCases(indent: string): string {
  return completionCommands
    .map(
      (command) =>
        `${indent}${command}) options="${completionCommandOptions[command].join(" ")}" ;;`,
    )
    .join("\n");
}

function bashCompletion(data: CompletionData): string {
  return `# bash completion for awf
_awf_completion() {
  local current previous command command_index options index
  COMPREPLY=()
  current="\${COMP_WORDS[COMP_CWORD]}"
  previous="\${COMP_WORDS[COMP_CWORD-1]}"
  command=""
  command_index=0

  for ((index=1; index<COMP_CWORD; index++)); do
    case "\${COMP_WORDS[index]}" in
      ${completionCommands.join("|")}) command="\${COMP_WORDS[index]}"; command_index=$index; break ;;
    esac
  done

  case "$command:$previous" in
    *:--project-root|install:--target|update:--target|remove:--target|status:--target|init:--target)
      compopt -o default 2>/dev/null
      return ;;
    list:--agent|show:--agent|install:--agent|init:--agent)
      COMPREPLY=( $(compgen -W "${agentIds.join(" ")}" -- "$current") ); return ;;
    list:--category)
      COMPREPLY=( $(compgen -W "${data.categories.join(" ")}" -- "$current") ); return ;;
    list:--tag)
      COMPREPLY=( $(compgen -W "${data.tags.join(" ")}" -- "$current") ); return ;;
    list:--adapter-status)
      COMPREPLY=( $(compgen -W "${supportStatuses.join(" ")}" -- "$current") ); return ;;
    list:--compatibility)
      COMPREPLY=( $(compgen -W "${recipeCompatibilityStatuses.join(" ")}" -- "$current") ); return ;;
    list:--installation|list:--execution|list:--outcome)
      COMPREPLY=( $(compgen -W "${verificationStatuses.join(" ")}" -- "$current") ); return ;;
  esac

  if [[ -z "$command" ]]; then
    COMPREPLY=( $(compgen -W "${completionCommands.join(" ")} ${globalOptions.join(" ")}" -- "$current") )
    return
  fi

  if [[ $COMP_CWORD -eq $((command_index+1)) ]]; then
    case "$command" in
      ${workflowCommands.join("|")})
        COMPREPLY=( $(compgen -W "${data.workflows.join(" ")}" -- "$current") ); return ;;
      completion)
        COMPREPLY=( $(compgen -W "${completionShells.join(" ")}" -- "$current") ); return ;;
    esac
  fi

  case "$command" in
${commandCases("    ")}
    *) options="" ;;
  esac
  COMPREPLY=( $(compgen -W "${globalOptions.join(" ")} $options" -- "$current") )
}
complete -o default -F _awf_completion awf agentic-workflows
`;
}

function zshCompletion(data: CompletionData): string {
  return `#compdef awf agentic-workflows

_awf() {
  local command previous
  integer command_index index
  local -a commands workflows agents shells global_options options categories tags
  commands=(${completionCommands.join(" ")})
  workflows=(${data.workflows.join(" ")})
  agents=(${agentIds.join(" ")})
  shells=(${completionShells.join(" ")})
  categories=(${data.categories.join(" ")})
  tags=(${data.tags.join(" ")})
  global_options=(${globalOptions.join(" ")})
  command=""
  command_index=0

  for ((index=2; index<CURRENT; index++)); do
    if (( $commands[(Ie)\${words[index]}] )); then
      command="\${words[index]}"
      command_index=$index
      break
    fi
  done
  previous="\${words[CURRENT-1]}"

  case "$command:$previous" in
    *:--project-root|install:--target|update:--target|remove:--target|status:--target|init:--target)
      _files
      return ;;
    list:--agent|show:--agent|install:--agent|init:--agent)
      compadd -- $agents
      return ;;
    list:--category)
      compadd -- $categories
      return ;;
    list:--tag)
      compadd -- $tags
      return ;;
    list:--adapter-status)
      compadd -- ${supportStatuses.join(" ")}
      return ;;
    list:--compatibility)
      compadd -- ${recipeCompatibilityStatuses.join(" ")}
      return ;;
    list:--installation|list:--execution|list:--outcome)
      compadd -- ${verificationStatuses.join(" ")}
      return ;;
  esac

  if [[ -z "$command" ]]; then
    compadd -- $commands $global_options
    return
  fi

  if (( CURRENT == command_index + 1 )); then
    case "$command" in
      ${workflowCommands.join("|")}) compadd -- $workflows; return ;;
      completion) compadd -- $shells; return ;;
    esac
  fi

  case "$command" in
${completionCommands
  .map((command) => `    ${command}) options=(${completionCommandOptions[command].join(" ")}) ;;`)
  .join("\n")}
    *) options=() ;;
  esac
  compadd -- $global_options $options
}

compdef _awf awf agentic-workflows
`;
}

function fishOption(
  executable: string,
  command: CompletionCommand,
  option: string,
  data: CompletionData,
): string {
  const parts = [
    `complete -c ${executable}`,
    `-n '__fish_seen_subcommand_from ${command}'`,
    `-l ${option.slice(2)}`,
  ];
  const choices =
    option === "--agent"
      ? agentIds
      : option === "--category"
        ? data.categories
        : option === "--tag"
          ? data.tags
          : option === "--adapter-status"
            ? supportStatuses
            : option === "--compatibility"
              ? recipeCompatibilityStatuses
              : ["--installation", "--execution", "--outcome"].includes(option)
                ? verificationStatuses
                : null;
  if (choices) parts.push(`-xa '${choices.join(" ")}'`);
  else if (["--target", "--project-root"].includes(option)) parts.push("-r");
  return parts.join(" ");
}

function fishCompletion(data: CompletionData): string {
  const lines = ["# fish completion for awf"];
  for (const executable of ["awf", "agentic-workflows"]) {
    lines.push(`complete -c ${executable} -f`);
    for (const command of completionCommands) {
      lines.push(`complete -c ${executable} -n '__fish_use_subcommand' -a '${command}'`);
      for (const option of completionCommandOptions[command]) {
        lines.push(fishOption(executable, command, option, data));
      }
    }
    lines.push(
      `complete -c ${executable} -n '__fish_seen_subcommand_from ${workflowCommands.join(" ")}' -a '${data.workflows.join(" ")}'`,
      `complete -c ${executable} -n '__fish_seen_subcommand_from completion' -a '${completionShells.join(" ")}'`,
      `complete -c ${executable} -l project-root -r`,
      `complete -c ${executable} -l help`,
      `complete -c ${executable} -l version`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function powerShellCompletion(data: CompletionData): string {
  const commandOptions = completionCommands
    .map((command) => `    '${command}' = @('${completionCommandOptions[command].join("','")}')`)
    .join("\n");
  return `# PowerShell completion for awf
$awfCompleter = {
  param($wordToComplete, $commandAst, $cursorPosition)
  $tokens = @($commandAst.CommandElements | ForEach-Object { $_.Extent.Text })
  $commands = @('${completionCommands.join("','")}')
  $workflows = @('${data.workflows.join("','")}')
  $agents = @('${agentIds.join("','")}')
  $shells = @('${completionShells.join("','")}')
  $categories = @('${data.categories.join("','")}')
  $tags = @('${data.tags.join("','")}')
  $globalOptions = @('${globalOptions.join("','")}')
  $commandOptions = @{
${commandOptions}
  }
  $command = $tokens | Where-Object { $commands -contains $_ } | Select-Object -First 1
  $commandIndex = if ($command) { [Array]::IndexOf($tokens, $command) } else { -1 }
  $previous = if ($tokens.Count -gt 1) { $tokens[-2] } else { '' }

  if (-not $command) { $candidates = $commands + $globalOptions }
  elseif ($previous -eq '--agent') { $candidates = $agents }
  elseif ($command -eq 'list' -and $previous -eq '--category') { $candidates = $categories }
  elseif ($command -eq 'list' -and $previous -eq '--tag') { $candidates = $tags }
  elseif ($command -eq 'list' -and $previous -eq '--adapter-status') { $candidates = @('${supportStatuses.join("','")}') }
  elseif ($command -eq 'list' -and $previous -eq '--compatibility') { $candidates = @('${recipeCompatibilityStatuses.join("','")}') }
  elseif ($command -eq 'list' -and (@('--installation','--execution','--outcome') -contains $previous)) { $candidates = @('${verificationStatuses.join("','")}') }
  elseif ($command -eq 'completion' -and $tokens.Count -le $commandIndex + 2) { $candidates = $shells }
  elseif ((@('${workflowCommands.join("','")}') -contains $command) -and $tokens.Count -le $commandIndex + 2) { $candidates = $workflows }
  else { $candidates = $globalOptions + $commandOptions[$command] }

  $candidates |
    Where-Object { $_ -like "$wordToComplete*" } |
    ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
}
Register-ArgumentCompleter -Native -CommandName awf,agentic-workflows -ScriptBlock $awfCompleter
`;
}

export function renderCompletion(
  shell: CompletionShell,
  catalog: readonly CompletionCatalogRecipe[],
): string {
  const data = completionData(catalog);
  switch (shell) {
    case "bash":
      return bashCompletion(data);
    case "zsh":
      return zshCompletion(data);
    case "fish":
      return fishCompletion(data);
    case "pwsh":
      return powerShellCompletion(data);
  }
}

export function renderCompletionInstallInstructions(shell: CompletionShell): string {
  return `${installInstructions[shell]}\n`;
}
