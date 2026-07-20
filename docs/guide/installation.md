# Installation

The CLI is public on npm, and `npx` is the shortest path to run it.

## Run with npx

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
npx --yes @kauanpolydoro/agentic-workflows@latest show review-pull-request
```

To pin the CLI in a project, install it as a development dependency:

```bash
npm install --save-dev @kauanpolydoro/agentic-workflows
npx agentic-workflows list
```

Node.js 22 or newer is required.
Every command on this page corresponds to a supported repository workflow.

## Install from source

Use this path when developing the repository or validating changes that have not been published.

## What you need

- Git
- Node.js 22 or newer
- Corepack, which ships with Node.js and picks the right pnpm version for you

## Clone, build, and try it

```bash
git clone https://github.com/kauanpolydoro/agentic-workflows.git
cd agentic-workflows
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm awf list
```

The last command prints the catalog.
If you see a list of workflows, everything is working.

If your GitHub SSH keys are already set up, you can clone with `git@github.com:kauanpolydoro/agentic-workflows.git` instead.

## Install a workflow into another project

Run this from the root of the project that should receive the workflow:

```bash
AWF_CATALOG_ROOT=/path/to/agentic-workflows/recipes \
  node /path/to/agentic-workflows/packages/cli/dist/index.js \
  install review-pull-request --agent generic
```

Two tips before you commit to anything:

- Add `--dry-run` to see exactly which files would be created, without creating them.
- The CLI refuses to touch files that already exist unless you explicitly pass `--force`.

## What about a global install?

A global installation is not required.
Using `npx` keeps the selected package version explicit and avoids a stale global CLI.
