# Synthetic GitHub issue resolution ledger

**SYNTHETIC EXAMPLE - NOT A REAL PROJECT RECORD**

## Campaign status and autonomous contract

Terminal status: `backlog-exhausted` for autonomous campaign `SYN-Q-17`, which started at `2026-07-18T13:00:00Z`, released final repository ownership at `2026-07-18T16:00:02Z`, and materialized its final evidence ledger at `2026-07-18T16:00:03Z` without a mid-run human response. [E3, E14, E15]

| Control | Authorized value | Observed result | Evidence |
| --- | --- | --- | --- |
| Execution mode | Autonomous after explicit invocation and one upfront authorization | The controller completed every authorized transition without requesting new authority | E3, E15 |
| Finite intake | All open issues returned below limit 20 at the `2026-07-18T13:00:00Z` cutoff | Membership froze at `#310`, `#311`, and `#312`; later `#313` stayed outside scope | E1, E2, E14 |
| Runtime window | 30-minute maximum command timeout; latest safe direct-merge start `2026-07-18T18:30:00Z`; shutdown reserve starts `2026-07-18T20:00:00Z`; mutation cutoff `2026-07-18T20:30:00Z`; reconciliation deadline `2026-07-18T20:55:00Z`; hard deadline `2026-07-18T21:00:00Z` | The 90-minute integration budget covered merge, smoke, manual closure, cleanup, verification, and checkpointing, and the run finished before every boundary | E2, E3, E15 |
| Stop signal | Signed owner-bound record at canonical runtime path, monotonic revision, no-follow authenticated read, and 30-second maximum polling interval | Every path-identity and signature check returned revision `0` and state `continue`, including during waits and commands | E2, E3, E15 |
| Runtime capacity | Four total slots: one coordinator, at most two issue workers, and one reserved reviewer | Two workers ran without consuming fresh-review capacity | E2, E15 |
| Input integrity | Charter `3333333333333333333333333333333333333333333333333333333333333333`, policy `2222222222222222222222222222222222222222222222222222222222222222`, and snapshot `36a7e212379195c647c84f36c88f15e5c878d8e72eb76b6c39f794325730aa91` | The immutable terminalizing checkpoint bound the exact authorized records | E1, E2, E3, E15 |
| Terminal truth | `backlog-exhausted` only when every finite-scope issue is resolved, tracker-closed, terminal, cleanup-complete or not applicable, and integration-clear or absent | Three workflow-resolved, zero externally-resolved, zero unresolved, zero cleanup pending, and zero ambiguous integration | E2, E14, E15 |

## Run status and scope

Status: backlog exhausted for finite initial scope `SYN-Q-17` in fictional repository `octo-labs/atlas-notes` under policy `MAINT-4` revision `policy-4.3` and authorization `AUTH-17`. [E1, E2, E3, E14]

The run used default branch `main` at baseline `a111111111111111111111111111111111111111`, and its repository diff changed only the two authorized note-editor paths. [E3, E4, E7, E10]

Final reconciliation found only the retained GitHub mutations and check-only downstream automation across every authorized event, with no protected-domain or production action. [E4, E11, E12, E13, E14]

The cohort was captured at `2026-07-18T13:00:00Z` with an explicit limit of 20 and three returned records, so membership consists only of issues `#310`, `#311`, and `#312`. [E1]

Every per-issue nested collection reached a retained terminal page, matched its exposed total, and remained stable across before-and-after markers or consecutive connection digests, including dedicated linked-work reads rather than truncated nested CLI exports. [E1]

Fictional GitHub CLI `2.96.0` passed the required feature and pagination probes against the explicit repository, direct squash merge required no queue or auto-merge, and the complete downstream inventory showed no deployment, production, release, or migration effect. [E4]

Issue `#313` opened after the capture and remains outside this run rather than extending the completion boundary. [E2, E14]

## Runtime controls and checkpoints

| Checkpoint or control | Observed state | Evidence |
| --- | --- | --- |
| Orchestrator lease | Process instance `controller-instance-17a` held epoch `1` and token `campaign-e1` through the terminalizing checkpoint, then authenticated receipt `process-release-17` confirmed release at `2026-07-18T16:00:01Z` | E15 |
| Repository campaign lease | Shared CAS registry keyed by `github.example:R_kgDOAtlasNotes` granted the only active ownership under epoch `1` and token `repo-e1`; state then became `process-released/repository-release-pending`, and receipt `repo-release-17` confirmed repository release last at `2026-07-18T16:00:02Z` | E4, E15 |
| Durable checkpoint and receipts | Schema `awf.github-issue-resolution-checkpoint.v1` began with exclusive local creation plus backend pointer `absent -> v1`, advanced every successor pointer from its exact predecessor, ended at confirmed immutable `terminalizing` version `48`, and used append-only authenticated receipt lookup under `terminal-SYN-Q-17` | E15 |
| Local paths | Repository, Git common directory, issue and reviewer worktrees, body files, checkpoint, packages, receipts, and ledger remained in canonical no-symlink roots inside the project target; runtime evidence stayed Git-excluded and outside issue worktrees | E4, E15 |
| Capacity | Four slots reserved one coordinator and one reviewer beyond the maximum two issue workers | E2, E15 |
| Reviewer resources | One-checkout and 50 MiB active quotas; both checkouts were removed within two minutes after digested verdicts, peak retained evidence was 4 MiB, and the global resource circuit-breaker threshold was not crossed | E2, E15 |
| Atomic read-back | Initialization and every confirmed mutation passed local digest read-back plus predecessor-bound shared-backend pointer confirmation before the next mutation | E15 |
| Resume | No interruption occurred, so resume count was zero and no mutation replay was needed | E15 |
| Circuit breakers | No integrity, authorization, mutation, CI, reviewer, merge, rate-limit, secret, checkpoint, or post-merge breaker opened | E15 |

The immutable terminalizing checkpoint has fictional SHA-256 `99fd7652268f65962c24b2b5d06a4e16fe37c55406715c1570609e658ca7cc29`; its reservation-retirement operation was available only before a successor, its four terminal operations activated only against that digest, and authenticated process plus clean-repository release receipts were found by stable terminalization ID before final ledger materialization while retirement and both quarantine operations remained unused. [E15]

## Queue snapshot and priority

| Rank | Issue | Priority basis | Dependency state | Final state | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | `#310` | P1 because a supported creation flow silently rejected Save; lower number is the policy tie-breaker | Ready, with no dependency or linked work | Closed as completed by PR `#88` | E1, E2, E6, E11 |
| 2 | `#311` | P1 candidate for the same silent supported-flow failure, ordered after its lower-numbered canonical issue | Ready, with canonical ordering placing it after `#310` | Closed as duplicate of `#310` | E1, E2, E6, E12 |
| 3 | `#312` | P3 behavior dispute because the report requested a retry forbidden by the conflict contract | Ready, with no dependency or linked work | Closed as not planned after non-defect assessment | E1, E2, E5, E13 |

The ranking applies the supplied severity, canonical-ordering, dependency, and numeric tie-break rules to the observed contracts and reproductions without using creation time as an unstated priority. [E1, E2, E5, E6]

Structured reads refreshed every remaining issue before each selection, and no policy-relevant drift invalidated the displayed order. [E14]

## Issue disposition ledger

| Issue | Final disposition | Policy rule | Mutation | Verification | Evidence |
| --- | --- | --- | --- | --- | --- |
| `#310` | Real UX and accessibility defect corrected through one pull request | A silent supported-flow rejection is P1 and real experience harm is not a false positive | PR `#88` squash merged, post-merge smoke passed, then the coordinator manually closed the issue as completed | Original failure reproduced in two browsers; required local checks, CI, current independent review, smoke, and closure verification passed | E2, E5, E6, E10, E11 |
| `#311` | Duplicate of canonical issue `#310` | Same observable failure and code path with no distinguishing outcome meets the duplicate threshold | Firefox evidence preserved on `#310`; native duplicate relationship closed `#311` | Both browsers reproduced the same result and repository search found no browser branch | E2, E6, E12 |
| `#312` | Demonstrated non-defect | Contract-aligned behavior with no remaining functional, UX, accessibility, security, reliability, or compatibility harm may close as not planned | Evidence explanation posted and issue closed as not planned | One write returned `409`, no retry occurred, the conflict message appeared, and Reload received focus | E2, E5, E6, E13 |

Every frozen-cohort issue appears once, and each completed tracker mutation has a retained final-state record. [E11, E12, E13, E14]

| Issue | Delivery state | Delivery actor | Tracker state | Closure actor | Closure evidence | Work state | Cleanup state | Integration state | Resolution state | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `#310` | `merge-verified` | `workflow` | `closed` | `workflow` | `verified` | `terminal` | `complete` | `clear` | `workflow-resolved` | E11, E14 |
| `#311` | `none` | `none` | `closed` | `workflow` | `verified` | `terminal` | `complete` | `none` | `workflow-resolved` | E12, E14 |
| `#312` | `none` | `none` | `closed` | `workflow` | `verified` | `terminal` | `complete` | `none` | `workflow-resolved` | E13, E14 |

These orthogonal dimensions preserve delivery outcome, delivery actor, and closure actor separately while deriving one resolution partition per issue. [E2, E14]

## Mutation log

| Time | Actor role | Issue or PR | Operation | Record URL or commit | Result | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `2026-07-18T13:45:00Z` | Credential-free issue worker | `#310` | Create scoped local commit under repository token `repo-e1`, orchestrator token `campaign-e1`, and worker token `310-e1` | `b222222222222222222222222222222222222222` | Candidate awaited exact-OID validation before publication | E7, E15 |
| `2026-07-18T14:05:00Z` | Campaign coordinator as `atlas-maintainer` | `#310` | After E8 validation completed at `14:04`, verify all three fencing layers and push the exact worker head without force | `b222222222222222222222222222222222222222` | Remote head matched the authorized local head | E7, E8, E15 |
| `2026-07-18T14:20:00Z` | Campaign coordinator as `atlas-maintainer` | PR `#88` | Create pull request through explicit repository target and owned body file | `https://github.example/octo-labs/atlas-notes/pull/88` | PR targeted `main`, linked `#310`, and recorded the immutable boundary | E9 |
| `2026-07-18T14:25:00Z` | Credential-free issue worker | PR `#88` | Create scoped local correction under repository token `repo-e1`, orchestrator token `campaign-e1`, and replacement worker token `310-e2` | `c333333333333333333333333333333333333333` | Stale token `310-e1` became ineligible; exact-OID validation completed at `14:39` | E10, E15 |
| `2026-07-18T14:40:00Z` | Campaign coordinator as `atlas-maintainer` | PR `#88` | Verify all three fencing layers and push the exact validated correction | `c333333333333333333333333333333333333333` | Local, remote, and PR heads matched | E10, E15 |
| `2026-07-18T14:59:30Z` | Campaign coordinator as `atlas-maintainer` | PR `#88` | Direct squash merge exact approved head under integration token `integration-e1` | `https://github.example/octo-labs/atlas-notes/pull/88#event-merge` | Merged as `d444444444444444444444444444444444444444`; issue remained open for smoke | E11, E15 |
| `2026-07-18T15:00:30Z` | Campaign coordinator as `atlas-maintainer` | `#310` | Under integration token `integration-e1`, manually close as completed with PR linkage after smoke and fresh default-branch revalidation | `https://github.example/octo-labs/atlas-notes/issues/310#event-close` | Tracker closure was verified after delivery validation | E11, E15 |
| `2026-07-18T15:02:00Z` | Campaign coordinator | PR `#88` | Under integration token `integration-e1`, remove the clean worktree, delete the exact remote tip with expected-OID lease, then compare-and-delete the local ref at the same old OID | `c333333333333333333333333333333333333333` | Worktree and both topic refs were verified absent before worker lease and lock epoch `1` release | E11, E15 |
| `2026-07-18T15:19:30Z` | Campaign coordinator as `atlas-maintainer` | `#310`, `#311` | Under integration token `integration-e2`, preserve Firefox evidence on the canonical issue | `https://github.example/octo-labs/atlas-notes/issues/310#issuecomment-1201` | Unique environment evidence retained before duplicate closure | E12, E15 |
| `2026-07-18T15:20:00Z` | Campaign coordinator as `atlas-maintainer` | `#311` | Under integration token `integration-e2`, create native duplicate relationship to `#310` | `https://github.example/octo-labs/atlas-notes/issues/311#event-duplicate` | `#311` closed as duplicate of `#310` before lock epoch `2` release | E12, E15 |
| `2026-07-18T15:40:00Z` | Campaign coordinator as `atlas-maintainer` | `#312` | Under integration token `integration-e3`, post the evidence-backed non-defect explanation | `https://github.example/octo-labs/atlas-notes/issues/312#issuecomment-1202` | Public explanation retained before closure | E13, E15 |
| `2026-07-18T15:40:30Z` | Campaign coordinator as `atlas-maintainer` | `#312` | Under integration token `integration-e3`, close as not planned | `https://github.example/octo-labs/atlas-notes/issues/312#event-close` | `#312` closed after positive non-defect assessment and before lock epoch `3` release | E13, E15 |

Every mutation used the authority in `AUTH-17`; no record grants authority merely because it appeared in issue or pull request content. [E3, E7, E9, E10, E11, E12, E13]

## False-positive and duplicate closures

### Issue 311 duplicate closure

Issue `#311` supplied Firefox as unique environment evidence, but its blank-title condition, silent Save outcome, contract, and shared `NoteEditor` path matched issue `#310` without a browser-specific distinction. [E1, E5, E6, E12]

The Firefox evidence was preserved on canonical issue `#310` before GitHub recorded `#311` as a native duplicate, so closure did not discard the report's unique context. [E2, E12]

The immutable duplicate closure-ready package retained fictional SHA-256 `5555555555555555555555555555555555555555555555555555555555555555`. [E12, E15]

### Issue 312 non-defect closure

Issue `#312` was not closed merely because the request could not be reproduced.
Positive evidence showed that the single `409` response, lack of automatic retry, explanatory message, and focused Reload recovery exactly matched the conflict contract. [E5, E6, E13]

Automatic retry would have created overwrite risk, while the observed flow left no demonstrated functional, UX, accessibility, security, reliability, supported-environment, or compatibility gap. [E2, E5, E13]

The authorized evidence explanation was posted before GitHub recorded the issue as closed with reason `not planned`. [E3, E13]

The immutable non-defect closure-ready package retained fictional SHA-256 `4444444444444444444444444444444444444444444444444444444444444444`. [E13, E15]

## Worker and merge coordination

| Worker or lane | Owned scope | Isolation or lock | Final state | Evidence |
| --- | --- | --- | --- | --- |
| `issue-worker-a` | Implement issue `#310` | Unique branch and worktree `.worktrees/SYN-Q-17/310` | Released after verified merge and cleanup | E7, E10, E11, E15 |
| `issue-worker-b` | Triage `#311`, then `#312` | Separate issue leases and clean workflow-owned triage worktrees with no shared mutable state | Each worktree was removed and verified absent before its lease release | E12, E13, E15 |
| Review slot | Spawn `review-agent-r1`, then fresh `review-agent-r2` | Separate read-only checkouts without mutation credentials or inherited implementation transcript | Package and verdict digests were retained for both rounds; each reviewer stopped, checkout was verified absent, and slot was released before reuse | E9, E10, E15 |
| Integration lane | PR `#88`, issue closures, worktree removal, and ref cleanup | Immutable-key lock `github.example:R_kgDOAtlasNotes:integration`, held only by `campaign-controller-17` under epochs `1`, `2`, and `3` with tokens `integration-e1`, `integration-e2`, and `integration-e3` | Each epoch was released before the next acquisition, with final release at `2026-07-18T15:41:02Z` | E11, E12, E13, E15 |

The two issue workers never held conflicting paths or mutable resources concurrently, and only the coordinator performed merge, closure, and remote cleanup mutations. [E12, E13, E15]

## Delivery records

| Issue | Branch | Pull request | Reviewed base | Approved PR head | Checks | Integrated result | Closure | Cleanup | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `#310` | `fix/310-blank-title-feedback` from `a111111111111111111111111111111111111111` | `#88`, targeting `main` with non-closing `Refs #310` and a manual-closure plan | `a111111111111111111111111111111111111111` | `c333333333333333333333333333333333333333` | 19 focused tests, two-browser end-to-end check, lint, typecheck, 214-test suite, build, required CI, and post-merge smoke passed | Direct squash commit `d444444444444444444444444444444444444444` | Manually closed as completed after smoke and fresh default-branch revalidation | Clean isolated worktree removed first; remote expected-OID and local compare-and-delete operations used the approved head before lease and lock release | E4, E9, E10, E11, E15 |

Acceptance for `#310` required an operable Save control, no request for a blank title, inline announced feedback, title focus, and removal of the error after valid input. [E5]

The final change remained limited to `src/editor/NoteEditor.tsx` and `src/editor/NoteEditor.test.tsx`, and its tests covered pointer and keyboard submission plus error clearing. [E7, E10]

Full commit metadata inspection found the approved author and committer identity on both commits, no automatic issue-closing keyword, no `Co-authored-by` trailer, and no agent-identifying trailer. [E7, E10]

The baseline end-to-end reproduction failed in Chromium and Firefox because Save was disabled and supplied no feedback, while the final head passed the same declared flow in both browsers. [E6, E10]

## Adversarial review rounds

| Issue | Round | Reviewer context | Reviewed base | Reviewed head | Findings | Disposition | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `#310` | 1 of 3 | Fresh isolated read-only subagent `review-agent-r1` with no inherited transcript or mutation credential | `a111111111111111111111111111111111111111` | `b222222222222222222222222222222222222222` | One supported Medium, high-confidence problem: the required error remained after valid title input | Request changes; prior head not mergeable | E7, E8, E9, E15 |
| `#310` | 2 of 3 | Fresh isolated read-only subagent `review-agent-r2` with no inherited transcript or mutation credential | `a111111111111111111111111111111111111111` | `c333333333333333333333333333333333333333` | No finding after original failure, keyboard, focus, announcement, clearing, request, and scope checks | Approve exact base and PR head | E10, E15 |

The first finding was supported by both the diff and the missing clearing-path test, so the implementer corrected it rather than dismissing the independent review. [E7, E8, E9]

The neutral first-round package included the pull request body digest and `MAINT-4` rubric, and the finding recorded its exact `src/editor/NoteEditor.tsx` handler location, UX and accessibility impact, clearing recommendation, and focused-test verification path. [E9]

Round one retained package digest `9999999999999999999999999999999999999999999999999999999999999999` and verdict digest `8888888888888888888888888888888888888888888888888888888888888888`; round two retained package digest `7777777777777777777777777777777777777777777777777777777777777777` and verdict digest `6666666666666666666666666666666666666666666666666666666666666666`. [E9, E10, E15]

The coordinator's exact-OID push invalidated the first verdict, and the second reviewer evaluated the complete new head before merge. [E2, E10, E15]

## Merge and cleanup verification

| Item | Expected condition | Observed result | Evidence |
| --- | --- | --- | --- |
| Reviewed code boundary | Pull request base equals the independently reviewed base, and the PR, local, and remote heads equal the independently approved and CI-tested head | Base remained `a111111111111111111111111111111111111111`; PR, local, and remote heads identified `c333333333333333333333333333333333333333` | E9, E10, E11 |
| Pull request metadata | Body digest, non-closing reference, absence of auto-close linkage, closure plan, and changed-path inventory remain unchanged immediately before merge | The retained body digest, sole `Refs #310`, no closing keyword or active auto-merge, manual-closure plan, and two-path inventory were unchanged | E9, E10, E11 |
| Repository controls | Required checks pass, direct merge needs no queue, server-side branch deletion stays disabled, and no administrator bypass occurs | `unit`, `e2e`, and `lint` passed; direct squash merge used no queue, auto-merge, branch deletion, or administrator bypass | E4, E10, E11 |
| Squash merge | GitHub reports one direct merge result on `main` | PR `#88` is merged as `d444444444444444444444444444444444444444` | E11 |
| Post-merge baseline | The bounded smoke command passes on the new default-branch revision before another merge | The Chromium blank-title smoke check passed on `d444444444444444444444444444444444444444`, which became the global baseline; no other candidate needed invalidation | E11 |
| Issue linkage | Complete correction remains open during merge and smoke, then closes manually after fresh baseline verification | Issue `#310` stayed open through smoke and was then closed as completed with PR `#88` linkage | E9, E11 |
| Branch cleanup | Clean workflow-owned worktree is removed before remote expected-OID and local old-OID compare-and-delete | Worktree `.worktrees/SYN-Q-17/310`, remote branch, and local branch are absent, and no newer or unexpected content was lost | E11, E14, E15 |

The final reconciliation reconfirmed the merge commit on `main`, all three issue closures, and branch absence. [E14]

## Blockers and escalations

No frozen-cohort issue remains blocked, the run stayed within every review, drift, elapsed-time, and no-progress budget, and no external approval is pending. [E2, E9, E10, E14]

Budget consumption was two of three valid review rounds, zero of two failed reviewer starts, zero of two issue-drift invalidations, and zero of three consecutive no-progress transitions. [E2, E9, E10, E14]

The run consumed `3h00m03s` of eight authorized hours; issue `#310` consumed one hour and 52 minutes of its three-hour limit, `#311` consumed 10 minutes, and `#312` consumed 11 minutes. [E2, E3, E14, E15]

Final effect reconciliation found that no cohort issue or workflow action entered a protected domain, so security, database, authentication, infrastructure, deployment, permission, secret, production-traffic, and customer-data escalation remained non-applicable. [E3, E4, E7, E10, E12, E13, E14]

Issue `#313` is outside cohort `SYN-Q-17` and does not invalidate this cohort's completion; if processed, it requires a separately authorized bounded run. [E2, E14]

## Terminal reconciliation

| Terminal count | Value | Reconciliation basis | Evidence |
| --- | --- | --- | --- |
| Finite-scope issues | 3 | IDs `#310`, `#311`, and `#312` from the complete initial snapshot | E1, E14 |
| Workflow-resolved | 3 | One merged correction and two workflow-owned non-code closures | E11, E12, E13, E14 |
| Externally-resolved | 0 | No cohort outcome was resolved solely by an outside actor | E14, E15 |
| Unresolved | 0 | Every finite-scope issue met the derived resolution rule | E14, E15 |
| Delivery none | 2 | Issues `#311` and `#312` required no code delivery | E12, E13, E14 |
| Already-corrected verified delivery | 0 | No issue used an earlier default-branch correction | E14, E15 |
| Verified merge delivery | 1 | Issue `#310` passed post-merge smoke on its squash commit | E11, E14 |
| Unverified merge delivery | 0 | No confirmed merge lacked outcome verification | E14, E15 |
| Delivery actor workflow | 1 | The campaign's direct merge produced issue `#310`'s delivered outcome | E11, E14, E15 |
| Delivery actor external | 0 | No outside actor delivered a finite-scope correction | E14, E15 |
| Delivery actor none | 2 | Issues `#311` and `#312` used non-code dispositions | E12, E13, E14 |
| Workflow-owned non-code closures | 2 | Duplicate `#311` and demonstrated non-defect `#312` | E12, E13, E14 |
| Tracker closed | 3 | The final complete read found all three issues closed | E14 |
| Tracker open | 0 | No finite-scope issue remained open | E14 |
| Closure actor workflow | 3 | The coordinator performed every tracker closure | E11, E12, E13, E14 |
| Closure actor external | 0 | No outside actor closed a finite-scope issue | E14, E15 |
| Closure actor none | 0 | Every finite-scope issue was tracker-closed | E14, E15 |
| Verified closure evidence | 3 | All workflow closures had retained final-state evidence | E11, E12, E13, E14 |
| Unverified closure evidence | 0 | No closure lacked outcome evidence | E14, E15 |
| Closure evidence not applicable | 0 | Every issue had a closure requiring evidence | E14, E15 |
| Work terminal | 3 | Every issue completed its authorized work path | E14 |
| Deferred | 0 | No issue retained an objective blocker | E14, E15 |
| Active | 0 | No worker remained active | E14, E15 |
| Queued | 0 | No issue remained queued | E14, E15 |
| Unattempted | 0 | Every frozen issue was attempted | E14, E15 |
| Cleanup complete | 3 | Issue `#310` completed delivery cleanup, while `#311` and `#312` completed their triage-worktree cleanup | E11, E12, E13, E14, E15 |
| Cleanup not applicable | 0 | Every issue created a workflow-owned checkout requiring reconciliation | E12, E13, E14 |
| Cleanup pending | 0 | Topic refs and worktree were reconciled after the verified merge | E11, E14, E15 |
| Integration none | 2 | Issues `#311` and `#312` had no merge operation | E12, E13, E14 |
| Integration clear | 1 | Issue `#310` had one confirmed direct merge with no pending command | E11, E14, E15 |
| Pending integrations | 0 | No direct-merge command remained pending | E14, E15 |
| Ambiguous integrations | 0 | The direct merge and every remote mutation had confirmed outcomes | E14, E15 |
| Out of scope | 1 | Issue `#313` opened after the intake cutoff | E2, E14 |

Finite membership equals three workflow-resolved plus zero externally-resolved plus zero unresolved issues.
Rows named after state values are complete orthogonal breakdowns, while the non-code-closure and out-of-scope rows are additional outcome metrics rather than finite-scope members.
The terminalizing checkpoint, release receipts, final ledger, and released integration lock support terminal status `backlog-exhausted`. [E14, E15]

## Approvals and residual risk

| Approval or risk | Status | Basis | Evidence |
| --- | --- | --- | --- |
| Initial mutation authority | Approved before mutation for exactly cohort `SYN-Q-17` and policy `policy-4.3` | `AUTH-17` covers issue comments, allowed closures, branch, PR, qualified squash merge, and OID-bound merged-branch deletion | E3 |
| Direct squash merge | Applicable and satisfied for reviewed base `a111111111111111111111111111111111111111` and PR head `c333333333333333333333333333333333333333` | Required local checks, CI, strict base protection, independent approval, no queue or auto-merge, safe downstream automation, and no protected-domain change were present | E3, E4, E10, E11 |
| Protected-domain approval | Not applicable | The final two-file change did not enter any protected domain | E3, E7, E10 |
| Residual cohort risk | None retained as a blocker | Every cohort issue is closed and reconciled, with review and cleanup complete | E14 |
| External-agent verification of this recipe | Untested | The scenario is synthetic and does not prove a run by a named real agent or an outcome review | E15 |

The synthetic timestamps describe only this fictional record and establish no delivery forecast for another cohort. [E1, E14]

## Traceability

| Material conclusion | Evidence |
| --- | --- |
| Campaign `SYN-Q-17` used the autonomous contract, bounded controller, checkpoints, stop checks, deadlines, isolated workers, fresh review subagents, and one global integration lane | E2, E3, E15 |
| Cohort membership is finite, complete, and limited to issues `#310`, `#311`, and `#312` | E1 |
| Priority order follows the owner-approved deterministic policy applied to the supplied contracts and observations | E1, E2, E5, E6 |
| Issue `#310` is a real UX and accessibility defect rather than a false positive | E5, E6 |
| Issue `#311` meets the duplicate threshold and retains its unique Firefox evidence | E2, E6, E12 |
| Issue `#312` matches the conflict contract without a demonstrated experience gap | E2, E5, E6, E13 |
| Pull request `#88` changed only the authorized paths and passed required checks at the final head | E4, E7, E10 |
| Independent review rejected the first head and approved the corrected immutable head | E9, E10 |
| The approved pull request base and head produced a distinct recorded squash commit, issue `#310` closed, and both local and remote topic refs were safely removed | E10, E11, E14 |
| Every frozen-cohort issue is closed with no blocker or pending approval | E14 |
| Later issue `#313` is intentionally outside the frozen completion boundary | E2, E14 |
| Terminal status `backlog-exhausted` reconciles three workflow-resolved, zero externally-resolved, and zero unresolved issues, with every orthogonal work, cleanup, and integration dimension clear | E14, E15 |
