# Introduction

Agentic Workflows is a catalog of step-by-step procedures for coding agents such as Claude Code and Codex, plus a small command-line tool called `awf` that installs them into your project.

Think of each workflow as a careful playbook for one recurring engineering task: reviewing a pull request, debugging a failing CI run, planning a database migration.
Instead of writing a long prompt from scratch every time, you install a workflow that already spells out which inputs to collect, which steps to follow, which safety rules to respect, and what a good result looks like.

## The three pieces

The project keeps a strict separation between its parts:

1. **Recipes** (`recipes/`) are the workflows themselves.
   Each recipe is plain YAML and Markdown: data and instructions, never executable code.
2. **The core library** (`@kauanpolydoro/agentic-workflows-core`) checks that recipes are complete and converts them into the file formats different agents expect.
3. **The CLI** (`awf`) lets you browse the catalog and install a recipe into your project, keeping a record of every file it creates.

## What installing means, and what it does not

Installing a workflow copies files into your project.
Nothing more.
During normal use the CLI never sends recipe data over the network and never executes anything a recipe says.

Keep one thing in mind: a workflow's text may suggest commands for you or your agent to run later.
Installing the workflow is not permission to run those commands.
Read what you install, the same way you would read a script from the internet before running it.

## Where to go next

- [Install the CLI from source](./installation) and browse the catalog on your own machine.
- [Explore the catalog](../catalog/) to see every available workflow.
- [Learn how verification works](./verification) to understand what "tested" means on this site.
