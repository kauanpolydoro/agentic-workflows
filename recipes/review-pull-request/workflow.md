# Review a pull request

## Objective

Take an immutable pull request diff, the intent behind it, and the recorded verification evidence, and turn them into an evidence-linked review report, a finding register, and a merge recommendation.
Two rules keep the review defensible: every finding must be reproducible from the reviewed revision, and uncertainty must never be dressed up as a defect.

## When to use

- A pull request is ready for pre-merge review.
- A focused diff needs correctness, regression, security, compatibility, or test analysis before a merge decision.
- A previously reviewed pull request has a new immutable head and needs a fresh review boundary.

## When not to use

- The immutable base or head revision cannot be resolved; without a fixed boundary there is nothing stable to review.
- The diff, changed-file inventory, intent, or applicable repository instructions are incomplete.
- The request is really to implement changes, not to review them.
- The change needs a specialist security, database, or API review that has not been requested or authorized.

## Required inputs

- **Immutable base revision, head revision, and merge base:** Supply full commit IDs or immutable archive identifiers, for example base `a100000000000000000000000000000000000000`, head `b200000000000000000000000000000000000000`, and merge base `a100000000000000000000000000000000000000`.
  These identifiers keep the review boundary from moving under you.
  Resolve every identifier, recompute the merge base, and stop if any value differs from the supplied record.
- **Complete unified diff and changed-file inventory:** Supply the diff from merge base to head plus the exact list of added, modified, renamed, and deleted paths.
  This evidence defines what the review covers and anchors line-specific findings.
  Recompute both artifacts from the immutable range and confirm that their paths agree.
- **Pull request intent, acceptance criteria, and repository instructions:** Supply the requested behavior, explicit exclusions, linked acceptance criteria, and every instruction file that governs a changed path.
  These records are how you tell a defect from an intentional change, and they define the project-specific constraints.
  Confirm the intent has an owner, and map each changed path to the instruction files that apply to it.

## Optional inputs

- **CI run IDs, commands, logs, and test results:** These increase confidence when they identify the reviewed head, environment, exit status, and relevant failures.
- **Architecture decisions and public compatibility contracts:** These add constraints for module boundaries, public behavior, data formats, and supported consumers.
- **Safe reproduction artifacts:** A suspected defect becomes a demonstrated result when the artifact runs locally without modifying external systems.

## Preconditions

- The base, head, and merge-base identifiers resolve and reproduce the supplied comparison range.
- The changed-file inventory contains every path in the complete diff and no additional path.
- The pull request intent and acceptance criteria are specific enough to classify the changed behavior.
- Applicable repository instructions have been identified for every changed path.
- Review activity can stay read-only, except for separately approved local verification artifacts.

## Workflow

1. **Freeze the review boundary.**
   Resolve the supplied base and head, compute the merge base, and record all three immutable identifiers in the review worksheet.
   Recreate the changed-file inventory and compare it with the supplied one.
   Advance only when the revisions and path sets agree; otherwise stop under F1 or F2.
2. **Establish intent and governing rules.**
   Break the acceptance criteria into observable behaviors, and map each changed path to its applicable repository instructions.
   Record exclusions and unresolved intent questions instead of inferring answers to them.
   Advance when every changed path has an intent or an explicit scope concern; stop if a rule or acceptance criterion needed for classification is missing.
3. **Build a change map.**
   For every diff hunk, record the affected public behavior, callers, data flow, side effects, error paths, and associated tests.
   Check renames and deletions as carefully as added lines; a removed protection is easy to miss.
   Advance when every changed hunk has a review disposition, such as behavior change, test, documentation, generated artifact, or no-op formatting.
4. **Analyze consequential behavior.**
   Trace inputs through validation, authorization, state changes, external writes, concurrency boundaries, and error handling, wherever those concerns apply.
   Compare each observation with the supplied intent and project rules.
   Stop and request specialist review when the change crosses a boundary whose risk cannot be assessed from the supplied evidence.
5. **Evaluate verification coverage.**
   Map each changed branch and failure path to an existing or changed test.
   For every supplied CI result, verify that the run ID or command is tied to the reviewed head, and record its exact result.
   Mark checks without retained results as proposed, never as passing.
6. **Validate candidate findings.**
   For each candidate, state the exact observation, the cited diff or rule, the user or system impact, the severity rationale, a confidence level, and a falsifiable verification step.
   Then try to disprove the candidate against the surrounding code and the supplied tests.
   Keep it as a finding only when the evidence survives; otherwise convert it into a question or drop it.
7. **Derive the merge recommendation.**
   Apply the repository's severity and merge policy to the unresolved dispositions.
   Record `approve`, `comment`, or `request changes` only when that verdict follows from the supplied policy and findings.
   If no merge policy is supplied, report the findings without inventing a verdict rule.
8. **Package and approve the report.**
   Produce the scope summary, finding register, verification record, assumptions, limitations, residual risks, and traceability table.
   Recheck the head immediately before submission.
   Submit only after the repository maintainer approves the report package at the documented gate.

## Decision points

- If the diff or intent is incomplete, stop and request the missing evidence.
- If the recomputed changed-file inventory differs from the supplied inventory, invalidate the supplied diff and restart from a newly generated immutable comparison.
- If a suspected defect cannot be supported by the diff or a reproduction, report it as a question.
- If a CI result does not identify the reviewed head, label it unrelated and do not use it as verification evidence.
- If a change affects authentication, production data, or a public wire contract beyond the reviewer's evidence, require the relevant specialist review before merge approval.
- If a blocking finding remains open, recommend changes rather than approval.
- If the head changes before submission, discard the verdict and review the new comparison range.

## Safety guardrails

- Never change unrelated files.
- Never approve a change with unverified blocking behavior.
- Do not modify files while performing the review.
- Do not expose secrets found in the diff; reference only a redacted location.
- Do not run commands that write to production, shared infrastructure, external services, or user data.
- Limit local checks to the reviewed repository, and record every created artifact for cleanup.
- Do not treat a passing broad test command as proof of an unexercised changed branch.
- Stop when the reviewed head no longer matches the supplied diff.

## Human approval gates

- Before submitting the final review or merge recommendation, the repository maintainer approves the immutable range, path inventory, finding dispositions, executed and proposed checks, and residual risks.
- If specialist review is required, the relevant owner, such as the security owner, database owner, or API owner, approves the boundary-specific evidence before the repository maintainer approves merge.

## Expected output

- **Evidence-linked pull request review report:** Markdown containing the immutable comparison range, intent, changed-file coverage, verdict, assumptions, and limitations.
- **Prioritized finding register with dispositions:** Each row contains the finding, evidence, impact, severity, confidence, recommendation, verification, and disposition.
- **Verification record and merge recommendation:** Separate the executed checks from the proposed checks, state residual risk, identify required approvals, and map material conclusions to evidence IDs.

The artifact must keep observations, inferences, and recommendations distinguishable.
It must not claim that a check ran unless the input records its command, reviewed revision, and result.

## Completion criteria

- Every changed file and material behavior is accounted for.
- Every finding cites supplied evidence and has an objective disposition.
- Every severity and confidence rating has a rationale a reviewer can inspect.
- Executed checks identify the command, reviewed revision, and result, while unexecuted checks are labeled proposed.
- The final verdict follows from the unresolved finding severities.
- Assumptions, limitations, specialist-review needs, and residual risks are explicit.
- The repository maintainer has approved the exact report submitted for the recorded head.

## Failure modes

- **F1:** The comparison range cannot be resolved.
- **F2:** The recreated diff and changed-file inventory do not agree.
- **F3:** A required check cannot run in the available environment.
- **F4:** The pull request head changes during review or before submission.
- **F5:** Pull request intent, acceptance criteria, or governing instructions are incomplete for a changed path.

## Recovery procedure

- **R1:** Obtain resolvable immutable base and head revisions, recompute the merge base, retain the new identifiers, and restart at workflow step 1.
- **R2:** Regenerate both artifacts from the same merge-base-to-head range, retain their path comparison, and restart at workflow step 1; escalate if they still disagree.
- **R3:** Record the missing capability and environment, run only a safe narrower check when it tests the same claim, leave the original check unverified, and resume at workflow step 6.
- **R4:** Discard the stale verdict and the findings whose lines changed, capture the new immutable head and diff, and restart the entire review at workflow step 1.
- **R5:** Stop classification for the affected path, obtain the missing owner-confirmed intent, acceptance criterion, or complete instruction map, invalidate the conclusions that depended on the gap, and restart at workflow step 2.

## Example

The complete synthetic example is in [examples/input.md](examples/input.md), with its complete artifact in [examples/expected-output.md](examples/expected-output.md).
It demonstrates evidence traceability without relying on external sources.
