# Review a pull request checklist

## Revision boundary

- [ ] Base and head resolve to immutable revisions and the comparison range is recorded.
- [ ] The changed-file inventory matches every path in the complete diff.
- [ ] Repository instructions applicable to each changed path are identified.
- [ ] A path with no nested instruction has an explicit no-additional-rule disposition rather than an assumed gap.
- [ ] PR intent, exclusions, linked requirements, and unresolved scope questions are recorded.
- [ ] Every changed path maps to the repository instructions that govern it.

## Review coverage

- [ ] Every changed branch, error path, side effect, and external write has been inspected.
- [ ] Public behavior and compatibility changes are distinguished from internal refactoring.
- [ ] Each finding identifies exact diff evidence, impact, confidence, and an actionable disposition.
- [ ] Severity follows the repository rubric or includes a reviewable rationale.
- [ ] Added tests exercise the changed behavior rather than only adjacent paths.
- [ ] Suspected defects without sufficient evidence are written as questions, not findings.
- [ ] Each severity and confidence rating includes a rationale that another reviewer can challenge.

## Merge controls

- [ ] No secret or sensitive value from the diff is reproduced in the review.
- [ ] Executed checks identify command, revision, result, and relevant environment.
- [ ] Checks not run are labeled unverified with the missing capability stated.
- [ ] Blocking behavior has a regression test or an explicit reason testing is unavailable.
- [ ] The final verdict follows from the highest unresolved finding and repository policy.
- [ ] Submission approval identifies the reviewer role and the exact review artifact.
- [ ] A changed head invalidates stale findings and triggers review of the new range.
- [ ] Specialist review is complete for security, database, or public-contract boundaries that exceed the supplied evidence.
- [ ] The delivered review satisfies every completion criterion.
