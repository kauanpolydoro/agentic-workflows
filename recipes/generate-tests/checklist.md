# Add behavior-focused regression tests checklist

## Contract and risk selection

- [ ] Every expected value, error, boundary, and state transition cites an applicable source.
- [ ] Disputed behavior has repository-maintainer approval before a test encodes it.
- [ ] Each selected case protects a distinct user-visible or public-contract risk.
- [ ] Existing tests have been checked for equivalent behavior and mutation sensitivity.
- [ ] Coverage percentage is used only as discovery evidence, not as the reason to add a case.

## Test seam and fixture

- [ ] The selected unit, integration, contract, CLI, or end-to-end level matches the collaborators involved in the risk.
- [ ] Assertions observe public output, durable state, documented errors, or contract events.
- [ ] The unit under test is real and private call order is not treated as behavior.
- [ ] Time is injected or frozen without a wall-clock wait.
- [ ] Randomness is seeded or replaced at its public dependency seam.
- [ ] Files, databases, queues, and processes have disposable state and verified cleanup.
- [ ] No production service, shared account, credential, or customer payload can be reached.

## Regression sensitivity

- [ ] Each test has one named temporary mutation that breaks only its targeted behavior.
- [ ] The mutated run fails at the intended assertion rather than setup or an unrelated assertion.
- [ ] The implementation is restored after every challenge.
- [ ] A working-tree check confirms that no temporary mutation remains.
- [ ] Duplicate cases that detect the same mutation have been consolidated.

## Validation and delivery

- [ ] The immutable baseline and post-change environment are recorded.
- [ ] Focused command, exit code, test count, and retained result are recorded.
- [ ] Required project command, exit code, and retained result are recorded.
- [ ] Order sensitivity or recurrence checks are recorded when state or timing is involved.
- [ ] Every changed test path and test name appears in the risk-to-test matrix.
- [ ] Supplied, executed, and proposed validation states are visibly distinct.
- [ ] Assumptions, exclusions, approvals, and residual risks are stated.
- [ ] The final artifact satisfies every completion criterion.
