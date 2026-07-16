# Issue triage package

> Synthetic triage example derived only from the supplied issue snapshot and policy evidence.

Status: proposals only, with no tracker mutation authorized or applied. [E6]

## Scope and policy

| Boundary | Value | Evidence |
|---|---|---|
| Snapshot | `S-204` | E6 |
| Issues | `#12`, `#16`, `#18` | E6 |
| Policy revision | `T-8` | E1, E6 |
| Support matrix | `M-12` | E2 |
| Audience | Repository maintainer | E6 |
| Excluded work | Root-cause diagnosis, implementation, delivery planning, and tracker mutation | E6 |

Facts below come from the frozen records.
Reporter expectations are attributed separately.
Classifications, duplicate confidence, responses, and next actions are triage recommendations under E1.

## Disposition register

| Issue | Record facts | Reporter claim or expectation | Policy-linked classification | Proposed state and labels | Confidence | Owner role |
|---|---|---|---|---|---|---|
| `#12` | Supported CLI, OS, and Node versions; existing quoted-space target; install exits `1` with `Target does not exist` [E2, E3] | Installation should use the existing target directory [E3] | `bug`; impact is blocked because T-8 does not say whether one reproducible failing configuration on a supported platform is high-impact platform installation inability or another medium functional failure [E1, E2, E3] | `blocked`; `type:bug`, `state:blocked`; no impact label proposed | high for the report facts; impact unclassified pending policy clarification | repository maintainer |
| `#16` | Same version, environment, command shape, and error as `#12`; `awf list` exits `0` [E3, E4] | The quoted target should install successfully [E4] | `bug`; impact inherits the unresolved T-8 interpretation; high-confidence duplicate candidate of `#12` [E1, E2, E3, E4] | `duplicate`; `type:bug`, `state:duplicate`; no impact label proposed | high for duplicate evidence; impact unclassified | repository maintainer |
| `#18` | Install-failure statement lacks version, environment, command, output, target shape, manifest state, and reproduction [E5] | Installation failed | Type and impact remain unassigned because E1 cannot be applied to the missing facts | `needs-information`; `state:needs-information` | not applicable until evidence arrives | repository maintainer |

These are policy-based dispositions, not a diagnosis of why installation failed.

## Duplicate evidence map

| Candidate | Canonical issue | Shared evidence | Distinguishing evidence | Policy threshold | Confidence | Recommendation |
|---|---|---|---|---|---|---|
| `#16` | `#12` | CLI `1.2.1`, Windows 11, Node 22, quoted existing target shape, same install command, exit `1`, and same error [E3, E4] | `#16` adds a successful `awf list` result [E4] | Same behavior, environment, and reproduction command with at least high confidence; the lower-numbered issue is canonical [E1] | high | Preserve the successful-list observation in policy-selected canonical issue `#12`, then propose linking and closing `#16` after maintainer approval |

Issue `#18` is not a duplicate candidate because the supplied record lacks the behavior, environment, and command needed by the duplicate rule. [E1, E5]

## Proposed responses

### Issue #12

> Thank you for the sanitized reproduction.
> The supplied record shows an existing quoted target on a supported Windows and Node environment returning `Target does not exist`.
> We propose recording this as a bug and blocking its impact label until the maintainer clarifies whether policy T-8 treats this bounded supported-configuration failure as high or medium impact.

Evidence basis: E1, E2, E3.

### Issue #16

> Your environment, command, and observed error match issue #12.
> Your successful `awf list` result is additional evidence that should be preserved in #12.
> We propose linking this report as a duplicate only after maintainer review, without assigning an impact label while the canonical issue's policy interpretation remains unresolved.

Evidence basis: E1, E3, E4.

### Issue #18

> Please provide the CLI version, operating system, Node version, exact command, sanitized output, target-path shape, and whether an installation manifest was created.
> Do not include tokens, customer data, or private absolute paths.
> We will use those details to decide type, impact, support status, and whether this report matches an existing issue.

Evidence basis: E1, E5.

## Proposed next actions and closure criteria

| Issue | Proposed action | Owner role | Dependency | Exit or closure criterion | Approval and mutation status |
|---|---|---|---|---|---|
| `#12` | Record the bug type, retain the reproduction, and ask the repository maintainer to clarify T-8's high-versus-medium installation boundary or record an evidence-backed exception | repository maintainer | Review E1 through E3, the policy ambiguity, and the response draft | The policy interpretation is recorded, the corresponding impact and state labels are approved and applied, and the issue retains the sanitized reproduction | Approval and policy clarification pending; unapplied [E6] |
| `#16` | Copy the successful `awf list` observation to `#12`, link `#16` as a duplicate, and post the response without an impact label until the canonical disposition is resolved | repository maintainer | `#12` remains canonical, preserves E4's distinguishing evidence, and has a recorded T-8 impact interpretation | Unique evidence appears in `#12`, relationship and response are approved, the canonical impact is recorded, and the duplicate link is recorded before closure | Approval and canonical impact pending; unapplied [E6] |
| `#18` | Post the minimal information request and retriage after a complete reply | repository maintainer | Maintainer approves the response | Requested fields arrive and enable the next type, impact, support, and duplicate decision; absence alone is not a closure criterion | Approval pending; unapplied [E6] |

No priority or delivery date is proposed because no product-owner approval or roadmap evidence was supplied. [E1, E6]

## Approval and security state

The repository maintainer must approve every response, label, duplicate link, and closure before application. [E1]
No supplied issue requires the private security route after sanitization review. [E6]
No action has been applied. [E6]

## Assumptions and limitations

- Snapshot `S-204` is treated as the complete triage boundary because its integrity record lists exactly the three supplied issues. [E6]
- The issue records support classification and duplicate analysis but contain no source-code or experiment evidence for a technical root cause.
- Policy T-8 does not define whether a failure limited to one target-path shape on a supported platform meets its high-impact installation-inability rule, so no impact is assigned to `#12` or `#16`. [E1, E2, E3, E4]
- Confidence for `#18` is not assigned because the record cannot support the policy's type, impact, or duplicate rules. [E1, E5]
- This artifact does not assess issues outside `S-204` or apply any tracker mutation.

## Traceability

| Artifact element | Evidence |
|---|---|
| Classification, impact, labels, duplicate rule, approvals, and closure controls | E1 |
| Supported environment | E2 |
| Canonical reproduction for `#12` | E3 |
| Matching reproduction and unique evidence for `#16` | E4 |
| Missing information for `#18` | E5 |
| Snapshot boundary, sanitization result, authorization, and mutation status | E6 |
