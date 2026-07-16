# Build a bounded bug reproduction checklist

## Behavior and environment

- [ ] The expected result cites a contract or product-owner approval that applies to the affected version.
- [ ] The observed result records exact status, value, error, or visible state rather than a subjective description.
- [ ] Revision, runtime, operating system, dependency lock, flags, and persistent-service versions are recorded.
- [ ] The reproduction working tree contains no product fix or unrelated behavior change.

## Fixture minimization and safety

- [ ] Credentials, secrets, customer identifiers, and unrelated production values are absent from every artifact.
- [ ] Each remaining fixture field has a recorded minimization result showing why it matters.
- [ ] Each retained setup step is necessary to reach the targeted behavior.
- [ ] Persistent state is disposable and its reset is confirmed before each attempt.
- [ ] The protocol makes no production request, notification, charge, or destructive state change.

## Repeatability and test boundary

- [ ] The attempt count was chosen before execution and every attempt has a recorded result.
- [ ] Mixed outcomes are classified as intermittent with a measured recurrence rate.
- [ ] The chosen test seam reaches the reported behavior through the closest authorized boundary.
- [ ] Any lost browser, network, process, or persistence coverage is stated and approved.
- [ ] The regression test runs on the immutable affected revision.
- [ ] Setup, import, fixture, timeout, and unrelated assertion failures are excluded.
- [ ] The intended behavior assertion is the exact failing point.
- [ ] The test contains no hidden product fix and does not weaken the expected contract.

## Delivery and handoff

- [ ] The record names every required checkout, locked dependency, tool version, setup, reset, fixture, command, expected result, observed result, and per-attempt evidence item.
- [ ] Facts, trigger hypothesis, experiment, results, diagnostic exclusions, and recommendation are separate.
- [ ] Causal diagnosis and remediation remain outside this workflow rather than being implied by the trigger or failing assertion.
- [ ] Assumptions, boundary limitations, and residual uncertainty are explicit.
- [ ] Every material path, version, command, result, and contract claim cites evidence.
- [ ] The final reproduction satisfies every completion criterion.
