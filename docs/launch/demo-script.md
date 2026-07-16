# Launch demonstration script

1. Explain that recipes are structured contracts rather than executable plugins.
2. Run `pnpm awf list --category security`.
3. Run `pnpm awf show review-pull-request --raw` and point to approval and completion sections.
4. Open the self-contained inputs and complete reference outputs for `debug-failing-ci`, `review-pull-request`, and `synchronize-documentation`.
5. Run their deterministic output-contract evaluations through `pnpm demo` and show that all three maintained artifacts pass.
6. Inspect the installed Generic Markdown bundle and the explicit `review-pull-request` invocation performed by `scripts/demo-fixture-agent.ts`.
7. Show the newly produced output file passing its output contract.
8. Explain that the fixture agent replays a committed reference output and therefore proves the runner contract, not external-agent reasoning or a human-approved outcome.
9. Select one material claim in each output, trace it to its input evidence ID, and compare it with the recipe completion criteria.
10. Inspect the manifest hashes in the disposable project.
11. Modify the installed checklist and show that update and remove protect the auxiliary file.
12. Open the searchable catalog and filter global support, recipe compatibility, installation, execution, and outcome independently.
13. End on the verification matrix, explicitly noting that external-agent execution and outcome review remain untested by the fake-agent demonstration.

The complete cross-platform local lifecycle is available through `pnpm demo` in `scripts/demo-cli.ts`.

The maintained reference-output review and fake-agent invocation are source, runner, and contract quality demonstrations.
They must not be recorded as external-agent execution or outcome evidence.

The retained review scope and claim traces are documented in [Maintained reference evaluations](./reference-evaluations.md).
