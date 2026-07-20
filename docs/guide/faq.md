# Frequently asked questions

## Is this just a prompt collection?

No.
A prompt is a single block of text you paste somewhere.
Each recipe here is a structured bundle: a strict contract for inputs and outputs, an operational checklist, complete examples, safety gates, exporters for different agents, and a verification status that is tracked separately from the content.

## Does "supported" mean an agent actually ran the workflow?

No.
Supported means the exporter produces a format that has been confirmed against official documentation.
Whether an agent executed a workflow, and whether the result was any good, are separate stages with their own evidence.
The [compatibility matrix](../compatibility.md) shows all of them side by side.

## Does the CLI use the network?

No normal command does.
Cloning the repository and installing dependencies are setup steps you run yourself; after that, everything works offline.

## Can a recipe execute code on my machine?

No.
Recipes are YAML and Markdown data, and the CLI never executes their content.
A recipe's text may suggest commands for you or your agent to run, which is exactly why you should read a workflow before using it.

## Why might I not be able to install this from npm yet?

The first npm release has not been published yet.
After the tagged release is available, use `npx --yes @kauanpolydoro/agentic-workflows@latest list` or install the package as a project dependency.

## Can I edit a file after installing it?

Yes.
The CLI notices the changed hash during `update` and `remove` and preserves your edited file unless you explicitly pass `--force`.
