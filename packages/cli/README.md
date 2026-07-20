# Agentic Workflows CLI

`awf` inspects and installs evidence-oriented workflow bundles for coding agents.

## Usage

Run the CLI without a global installation:

```bash
npx --yes @kauanpolydoro/agentic-workflows list
```

Or install it in a project:

```bash
npm install --save-dev @kauanpolydoro/agentic-workflows
npx agentic-workflows list
```

Node.js 22 or newer is required.

The package includes the versioned recipe catalog used by `list`, `show`, `install`, `update`, `remove`, and strict validation.

Installation generates adapter files and a hash-bearing manifest in the selected project.

It does not execute an external agent, satisfy human approval gates, or approve workflow outcomes.

See the [repository installation guide](https://kauanpolydoro.github.io/agentic-workflows/guide/installation.html)
and [CLI reference](https://kauanpolydoro.github.io/agentic-workflows/guide/cli-reference.html)
for the complete contract.
