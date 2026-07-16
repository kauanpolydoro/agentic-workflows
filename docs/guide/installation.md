# Installation from source

The packages are not published to npm yet.
Use the repository checkout so every command corresponds to a real artifact.

## Requirements

- Git
- Node.js 22 or a compatible later release
- Corepack

## Build and inspect

```bash
git clone https://github.com/kauanpolydoro/agentic-workflows.git
cd agentic-workflows
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm awf list
```

Use the SSH URL `git@github.com:kauanpolydoro/agentic-workflows.git` only when your GitHub SSH credentials are already configured.

Install a generic workflow into another checkout from that project's root:

```bash
AWF_CATALOG_ROOT=/path/to/agentic-workflows/recipes \
  node /path/to/agentic-workflows/packages/cli/dist/index.js \
  install review-pull-request --agent generic
```

Run with `--dry-run` first to inspect the planned manifest.
The CLI refuses existing files unless you pass `--force` explicitly.

## Future package installation

Package-registry installation is planned but unavailable.
No `npx` or global package command is supported until a release is actually published.
