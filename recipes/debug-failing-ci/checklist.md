# Diagnose and correct a failing CI job checklist

## Run and evidence integrity

- [ ] The provider, run ID, attempt, job name, and full commit SHA agree across metadata and checkout output.
- [ ] The retained log contains the exact first failing command, its complete relevant output, and exit code.
- [ ] Secret redaction has been reviewed without removing filenames, error codes, or causal ordering.
- [ ] The workflow excerpt comes from the failing commit rather than the current branch.
- [ ] Required checks, assertions, compiler rules, coverage thresholds, and security controls are recorded before editing.

## Reproduction and diagnosis

- [ ] The clean reproduction records command order, runtime, operating system, lockfile state, cache state, and generated files.
- [ ] Each local result identifies the commit and exit code.
- [ ] Every local-to-CI difference is marked matched, different, or unknown.
- [ ] Each hypothesis has a prediction, one controlled experiment, and a falsification condition.
- [ ] Negative experiments remain in the diagnosis rather than being discarded.
- [ ] Intermittent results include a predeclared sample size and pass-to-fail frequency.
- [ ] The proposed root cause explains the first causal error, not only a downstream symptom.

## Patch and safety

- [ ] The patch names every changed path and contains only the supported causal change.
- [ ] No required check, assertion, threshold, compiler rule, or security scan is weakened.
- [ ] No production deploy, publish, migration, credential, or customer-data path was used.
- [ ] Diagnostic-only instrumentation has been removed or explicitly excluded from delivery.
- [ ] Repeated external runs remain within the approved count, cost, and abort condition.

## Verification and delivery

- [ ] The original failing command has a post-patch clean result on the patched revision.
- [ ] Adjacent checks list exact commands, revisions, exit codes, and retained outputs.
- [ ] External CI has a run ID and result or is labeled pending with an owner.
- [ ] A release-behavior or workflow push has repository-maintainer approval and rollback evidence.
- [ ] Facts, hypotheses, results, recommendations, and residual uncertainty are visibly separated.
- [ ] Every material path, version, command, result, and root-cause claim cites evidence.
- [ ] The final diagnosis satisfies every completion criterion.
