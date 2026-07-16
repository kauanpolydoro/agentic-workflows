# INC-204 queue-processing degradation postmortem

> Synthetic postmortem example derived only from the supplied incident evidence.

Status: draft approved for internal engineering review only. [E8]

Severity: `SEV-2` under the supplied delayed-job policy. [E8, E10]

## Executive summary

Release `consumer-3.8.0` completed deployment at `14:08 UTC`, each of four containers opened 64 consumers against a 32-connection pool at `14:09 UTC`, and the queue backlog crossed 5,000 jobs at `14:10 UTC`. [E1, E2, E3]
During the 55-minute interval ending at declared stability, 8,200 of 31,000 submitted jobs completed more than ten minutes after submission, which is 26.45% when rounded to two decimal places. [E1, E8, E10]
The high-confidence technical-cause inference is that CPU-derived concurrency exceeded pool capacity and produced connection contention; it is not treated as exclusive proof because the retained change ledger does not establish whether workload composition changed. [E2, E3, E4, E9]
Rollback completed at `14:44 UTC`, pool-acquisition timeouts stopped at `14:45 UTC`, backlog fell below 5,000 at `14:51 UTC`, and the incident commander declared stability when backlog returned below 500 at `15:05 UTC`. [E1, E4, E8]
The corrective actions in this draft remain proposed, have no approved due dates, and require owner review before they become commitments. [E8, E11]

## Scope and impact

| Boundary | Value | Evidence |
|---|---|---|
| Service | `queue-consumer` | E1, E2 |
| Review window | `14:02-15:05 UTC` on 2026-06-18 | E1, E2, E8 |
| Evidence cutoff | `15:30 UTC` | E8 |
| Audience | Internal engineering reviewers | E8 |
| Excluded | Individual customer count, individual performance assessment, public distribution, action due dates | E8 |

Backlog remained above 5,000 jobs from `14:10` until `14:51 UTC` and returned below the normal-range boundary of 500 at `15:05 UTC`. [E1]
During the 55-minute interval from `14:10` through `15:05 UTC`, 8,200 of 31,000 submitted jobs completed more than ten minutes after submission. [E1, E10]
The calculated delayed-job share is `8,200 / 31,000 x 100 = 26.45%`, rounded to two decimal places. [E10]
No customer-count impact is stated because the evidence contains aggregate jobs only. [E1]

## UTC timeline

| Time | Event | Evidence |
|---|---|---|
| `14:02-14:08` | `consumer-3.8.0` deployed | E2 |
| `14:09` | Four containers reported 64 visible CPUs, opened 64 consumers each, and began recording pool-acquisition timeouts | E3 |
| `14:10` | Backlog crossed 5,000 jobs | E1 |
| `14:16` | Responders acknowledged the queue alert | E7 |
| `14:24` | Responders correlated degradation with the deployment | E7 |
| `14:28` | Backlog peaked at 12,400 jobs | E1 |
| `14:31` | Responders proposed rollback | E7 |
| `14:36` | Incident commander approved rollback | E4 |
| `14:44` | Rollback to `consumer-3.7.4` completed | E4 |
| `14:45` | Pool-acquisition timeouts stopped | E3, E4 |
| `14:51` | Backlog fell below 5,000 jobs | E1, E4 |
| `15:05` | Backlog returned below 500 and the incident commander declared stability | E1, E8 |

No conflicting timestamp is present in the supplied records. [E1, E2, E3, E4, E7, E8]

## Trigger and technical-cause assessment

Observed trigger: release `consumer-3.8.0` replaced fixed concurrency `8` with CPU-derived concurrency immediately before each production container opened 64 consumers. [E2, E3]

Observed failure mechanism: 64 consumers competed for a 32-connection pool in each container while pool-acquisition timeouts and queue backlog were present. [E1, E3]

High-confidence technical-cause inference: CPU-derived concurrency exceeded available database-pool capacity, producing connection contention that reduced queue processing throughput. [E1, E3, E4, E9]
Confidence is high because timeouts ended one minute after rollback completed and the isolated workload replay reproduced timeouts and lower throughput at 64 consumers while the 32-consumer case recorded no timeout and higher throughput. [E4, E9]
This remains an inference rather than proof that no other factor contributed because the change ledger does not establish whether workload composition changed. [E2]

## Contributing factors

- Staging exposed 8 CPUs, so its 30-minute load test did not exercise the 64-consumer production configuration. [E3, E6]
- Monitoring paged on queue backlog but had no pool-acquisition-timeout or consumer-to-pool signal. [E5]
- The production database pool remained at 32 connections per container while concurrency rose to 64. [E3]

## Organizational conditions

The change-review template did not require reviewers to record production CPU visibility, consumer count, database-pool capacity, or their ratio. [E6]
Inference: this control gap allowed staging and production capacity assumptions to remain implicit. [E6]
The condition is described as a system and review-control issue, not an individual failure. [E6]

## Detection, response, and recovery

The backlog alert surfaced the degradation and was acknowledged at `14:16 UTC`. [E1, E5, E7]
Responders correlated the release, proposed rollback, obtained incident commander approval, and completed rollback at `14:44 UTC`. [E4, E7]
Pool-acquisition timeouts stopped one minute later, backlog fell below the alert boundary seven minutes later, and backlog returned to the normal range at `15:05 UTC`. [E1, E4]

What worked:

- Aggregate queue monitoring exposed prolonged processing delay. [E1, E5]
- Role-based response records preserved acknowledgement, correlation, and rollback decisions without retaining individual names. [E7]
- Rollback was available and was followed by timeout cessation and backlog recovery. [E4]
- The isolated reproduction provided comparative evidence for the suspected failure mechanism. [E9]

## Proposed corrective actions

| Action | Risk and evidence | Owner role | Priority | Dependency | Exit criterion | Verification signal | Safe-stop or rollback | Status |
|---|---|---|---|---|---|---|---|---|
| Cap worker concurrency at 32 consumers per container until a higher value passes the approved validation | Consumer count exceeded pool capacity [E3, E9] | service owner, proposed by incident commander [E11] | high, proposed by incident commander [E11] | Owner approval and configurable concurrency cap | Every deployed container reports no more than 32 consumers | A 30-minute isolated run with 64 visible CPUs records zero pool-acquisition timeouts [E11] | Restore fixed concurrency `8` if the cap causes an unexpected regression [E2, E4] | proposed; approval pending [E8, E11] |
| Page on pool-acquisition timeouts sustained for five minutes | Existing monitoring omitted the timeout signal [E5] | database owner, proposed by incident commander [E11] | high, proposed by incident commander [E11] | Timeout metric and staging paging route | The monitored configuration contains the five-minute rule | A staging threshold test reaches the paging route [E11] | Disable the new paging rule if validation shows uncontrolled false paging while retaining the backlog alert | proposed; approval pending [E8, E11] |
| Require CPU visibility, consumer count, pool capacity, and their ratio in concurrency-change review | Review template omitted capacity alignment [E6] | repository maintainer, proposed by incident commander [E11] | medium, proposed by incident commander [E11] | Approved template change | The review template requires all four values before a concurrency change can be approved | A template validation fixture rejects a change record missing any required value | Keep the template change unmerged if the validation fixture fails | proposed; approval pending [E8, E11] |

No action is counted as committed, and no due date is assigned. [E8, E11]

## Open questions and uncertainty

| Question | Evidence gap | Owner role | Required evidence | Disposition |
|---|---|---|---|---|
| Did workload composition change during the incident boundary? | The change ledger covers deployments but not workload mix [E2] | service owner | Aggregate workload-composition comparison for the review window | open; does not lower the current technical-cause inference below high confidence |
| Can concurrency above 32 be safe for this pool and workload shape? | E9 compares only 64 and 32 consumers | service owner | Approved comparative load tests for each proposed higher value | open; retain the proposed cap until validated |
| When should actions be due? | Action owners have not approved schedules [E8] | each action owner role | Feasibility and dependency review | unresolved; no dates assigned |

## Assumptions and limitations

- The impact calculation uses the aggregate metrics exactly as supplied and does not infer individual customer impact. [E1, E10]
- The isolated reproduction supports the failure mechanism but is not a production measurement. [E9]
- The deployment ledger excludes another application deployment but does not exclude an unrecorded workload-composition change. [E2]
- Internal draft approval does not authorize public distribution, commit corrective actions, or approve due dates. [E8]

## Approval record

| Review | Status | Evidence |
|---|---|---|
| Incident stability and evidence cutoff | approved by incident commander | E8 |
| Aggregate impact arithmetic | independently reproduced | E10 |
| Sanitized evidence for internal engineering | approved by sensitive-data owner | E8 |
| Corrective-action ownership and dates | pending | E8 |
| Final publication or wider distribution | pending | E8 |

## Traceability

| Artifact element | Evidence |
|---|---|
| Impact, backlog recovery, and aggregate population | E1, E10 |
| Trigger and deployment boundary | E2 |
| Production consumer-to-pool configuration and timeouts | E3 |
| Rollback and recovery sequence | E4 |
| Detection coverage and gaps | E5 |
| Staging difference and review-control condition | E6 |
| Response decisions | E7 |
| Severity, scope, audience, and approvals | E8 |
| Comparative failure-mechanism reproduction | E9 |
| Draft action validation constraints | E11 |
