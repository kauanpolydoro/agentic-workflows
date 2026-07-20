# Diagnose and correct a failing CI job

Use this recipe to turn one identified CI failure into a reproducible diagnosis, a minimal patch, and an honest local-versus-external verification record.
It is intended for repository maintainers and contributors diagnosing failed quality-control jobs, with an approximate duration of one hour for a bounded failure.

## Primary use cases

- Diagnose a deterministic compiler, test, lint, build, or packaging failure on an immutable CI revision.
- Explain why a command passes locally but fails under a known CI environment.
- Measure and classify a suspected flaky failure before changing retry or timeout behavior.

## When not to use

- The run identity, immutable commit, or complete first-failure evidence is unavailable.
- The requested outcome is to bypass a required check rather than explain its failure.
- Reproduction would deploy, publish, use production credentials, or mutate production state without an approved isolated path.
- The failure belongs entirely to unavailable provider infrastructure and no authorized substitute preserves the failing contract.

## Required evidence

- Provider, run ID, attempt, job name, and full commit SHA that agree with checkout output.
- Complete sanitized output and exit code from the first failing command.
- The workflow and package-script excerpts at the failing commit, including runner, runtime, dependency, cache, and generated-artifact configuration.
- A clean reproduction command sequence and an environment-parity table with recorded results.

## Produced artifacts

- An evidence-backed diagnosis that separates facts, hypotheses, experiments, and results.
- A minimal causal patch at named paths, or an explicitly unresolved failure handoff when causality cannot be established.
- A verification matrix distinguishing supplied baseline, local execution, external CI execution, and proposed follow-up checks.
- A safety, approval, rollback, limitation, and traceability record.

## Primary risks

- Treating a downstream error as the root cause and modifying unrelated code.
- Hiding the failure by weakening assertions, thresholds, compiler rules, or security controls.
- Leaking secrets through logs, environment dumps, or diagnostic artifacts.
- Claiming CI resolution from a local pass when the external job has not run.

## How to use this recipe

1. Confirm the exclusion conditions and preconditions in [workflow.md](workflow.md).
2. Gather one internally consistent evidence package for the failing run and commit.
3. Execute the workflow from failure anchoring through controlled experiments and minimal patching.
4. Use [checklist.md](checklist.md) while working, especially before external runs and delivery.
5. Compare the artifact with the [synthetic input](examples/input.md) and [complete diagnosis](examples/expected-output.md).
6. Obtain role-based approval before pushing workflow or release-behavior changes or launching repeated paid experiments.

## Files

- [recipe.yml](recipe.yml) declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical operating procedure and defines stop conditions, decisions, approvals, and recovery.
- [checklist.md](checklist.md) controls run integrity, causal reasoning, patch scope, and verification omissions.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a self-contained synthetic CI run, workflow, logs, experiment, and approval state.
- [examples/expected-output.md](examples/expected-output.md) is a complete, traceable diagnosis and patch record derived only from that input.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

The example demonstrates editorial derivability with synthetic evidence and does not prove that any external CI provider or coding agent executed the workflow.
Provider-specific incident investigation, production deployment, and broad flaky-test remediation require separate operational procedures.
Real executions must replace every synthetic run, revision, command result, approval, and environment record.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter source record](../../docs/research/adapter-sources.md).
