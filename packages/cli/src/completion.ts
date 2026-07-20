import {
  agentIds,
  AwfError,
  type GeneratedCatalogRecipe,
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

const commands = [
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

const workflowCommands = ["show", "install", "update", "remove", "status", "manifest"] as const;
const agents = agentIds;
const workflowIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validatedWorkflowIds(catalog: readonly Pick<GeneratedCatalogRecipe, "id">[]): string[] {
  const ids = catalog.map((recipe) => recipe.id).sort();
  const invalid = ids.find((id) => !workflowIdPattern.test(id));
  if (invalid) {
    throw new AwfError(
      "INVALID_RECIPE",
      "Cannot generate shell completion for an unsafe workflow ID.",
      {
        id: invalid,
      },
    );
  }
  return ids;
}

function bashCompletion(workflows: readonly string[]): string {
  return `# bash completion for awf
_awf_completion() {
  local current previous command
  COMPREPLY=()
  current="\${COMP_WORDS[COMP_CWORD]}"
  previous="\${COMP_WORDS[COMP_CWORD-1]}"
  command="\${COMP_WORDS[1]}"

  case "$previous" in
    --agent) COMPREPLY=( $(compgen -W "${agents.join(" ")}" -- "$current") ); return ;;
  esac

  if [[ $COMP_CWORD -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "${commands.join(" ")}" -- "$current") )
    return
  fi

  case "$command" in
    ${workflowCommands.join("|")})
      if [[ $COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "${workflows.join(" ")}" -- "$current") )
        return
      fi
      ;;
    completion)
      if [[ $COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "${completionShells.join(" ")}" -- "$current") )
        return
      fi
      ;;
  esac

  COMPREPLY=( $(compgen -W "--agent --target --dry-run --show-content --force --json --raw --open --location --strict --maintainer --failures-only --no-interactive --install-instructions --project-root --help" -- "$current") )
}
complete -F _awf_completion awf agentic-workflows
`;
}

function zshCompletion(workflows: readonly string[]): string {
  return `#compdef awf agentic-workflows

_awf() {
  local command
  local -a commands workflows agents shells options
  commands=(${commands.join(" ")})
  workflows=(${workflows.join(" ")})
  agents=(${agents.join(" ")})
  shells=(${completionShells.join(" ")})
  options=(--agent --target --dry-run --show-content --force --json --raw --open --location --strict --maintainer --failures-only --no-interactive --install-instructions --project-root --help)

  if (( CURRENT == 2 )); then
    compadd -- $commands
    return
  fi

  command="\${words[2]}"
  if [[ "\${words[CURRENT-1]}" == "--agent" ]]; then
    compadd -- $agents
  elif [[ "$command" == "completion" && $CURRENT -eq 3 ]]; then
    compadd -- $shells
  elif [[ " ${workflowCommands.join(" ")} " == *" $command "* && $CURRENT -eq 3 ]]; then
    compadd -- $workflows
  else
    compadd -- $options
  fi
}

compdef _awf awf agentic-workflows
`;
}

function fishCompletion(workflows: readonly string[]): string {
  const lines = ["# fish completion for awf"];
  for (const executable of ["awf", "agentic-workflows"]) {
    lines.push(`complete -c ${executable} -f`);
    for (const command of commands) {
      lines.push(`complete -c ${executable} -n '__fish_use_subcommand' -a '${command}'`);
    }
    lines.push(
      `complete -c ${executable} -n '__fish_seen_subcommand_from ${workflowCommands.join(" ")}' -a '${workflows.join(" ")}'`,
      `complete -c ${executable} -n '__fish_seen_subcommand_from completion' -a '${completionShells.join(" ")}'`,
      `complete -c ${executable} -l agent -xa '${agents.join(" ")}'`,
      `complete -c ${executable} -l target -r`,
      `complete -c ${executable} -l project-root -r`,
      `complete -c ${executable} -l json`,
      `complete -c ${executable} -l location`,
      `complete -c ${executable} -l failures-only`,
      `complete -c ${executable} -l no-interactive`,
      `complete -c ${executable} -l install-instructions`,
      `complete -c ${executable} -l help`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function powerShellCompletion(workflows: readonly string[]): string {
  return `# PowerShell completion for awf
$awfCompleter = {
  param($wordToComplete, $commandAst, $cursorPosition)
  $tokens = @($commandAst.CommandElements | ForEach-Object { $_.Extent.Text })
  $commands = @('${commands.join("','")}')
  $workflows = @('${workflows.join("','")}')
  $agents = @('${agents.join("','")}')
  $shells = @('${completionShells.join("','")}')
  $options = @('--agent','--target','--dry-run','--show-content','--force','--json','--raw','--open','--location','--strict','--maintainer','--failures-only','--no-interactive','--install-instructions','--project-root','--help')
  $command = if ($tokens.Count -gt 1) { $tokens[1] } else { '' }

  if ($tokens.Count -le 2) { $candidates = $commands }
  elseif ($tokens[-2] -eq '--agent') { $candidates = $agents }
  elseif ($command -eq 'completion' -and $tokens.Count -le 3) { $candidates = $shells }
  elseif (@('${workflowCommands.join("','")}') -contains $command -and $tokens.Count -le 3) { $candidates = $workflows }
  else { $candidates = $options }

  $candidates |
    Where-Object { $_ -like "$wordToComplete*" } |
    ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
}
Register-ArgumentCompleter -Native -CommandName awf,agentic-workflows -ScriptBlock $awfCompleter
`;
}

export function renderCompletion(
  shell: CompletionShell,
  catalog: readonly Pick<GeneratedCatalogRecipe, "id">[],
): string {
  const workflows = validatedWorkflowIds(catalog);
  switch (shell) {
    case "bash":
      return bashCompletion(workflows);
    case "zsh":
      return zshCompletion(workflows);
    case "fish":
      return fishCompletion(workflows);
    case "pwsh":
      return powerShellCompletion(workflows);
  }
}

export function renderCompletionInstallInstructions(shell: CompletionShell): string {
  return `${installInstructions[shell]}\n`;
}
