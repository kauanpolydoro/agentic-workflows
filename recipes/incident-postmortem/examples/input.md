# Example input

This synthetic scenario covers incident `INC-204`, queue-processing degradation in service `queue-consumer` on 2026-06-18 UTC.
The incident is stable, and the requested artifact is an internal engineering draft for learning and corrective-action review.
No individual names, customer identifiers, secrets, or production payloads are included.

## Scope and environment

- Incident boundary: deployment start at `14:02 UTC` through declared stability at `15:05 UTC`.
- Evidence cutoff: `15:30 UTC` on the incident date.
- Production shape: four `queue-consumer` containers with a 32-connection database pool per container.
- Audience: internal engineering reviewers only.
- Exclusions: individual customer count, individual performance assessment, final public publication, and action due dates.

## Evidence inventory

### E1 - Queue metrics export

The retained one-minute UTC metrics export for `queue-consumer` shows backlog crossing 5,000 jobs at `14:10`, peaking at 12,400 at `14:28`, falling below 5,000 at `14:51`, and returning to the normal range below 500 at `15:05`.
During `14:10-15:05`, 31,000 jobs were submitted and 8,200 completed more than ten minutes after submission.
The sanitized export contains aggregate job counts only and no customer identifiers.

### E2 - Deployment and change ledger

The retained UTC deployment record shows release `consumer-3.8.0` starting at `14:02` and completing at `14:08`.
The release replaced fixed worker concurrency `8` with a value derived from visible CPU count.
The change ledger records no other application deployment during the incident boundary, but it does not establish whether workload composition changed.

### E3 - Runtime configuration and log sample

From `14:09`, each of four production containers reported 64 visible CPUs and opened 64 consumers.
Each container retained a 32-connection database pool, and the sanitized logs repeatedly recorded pool-acquisition timeouts until `14:45`.
The log sample uses UTC and contains no payload, credential, customer identifier, or individual name.

### E4 - Rollback and recovery record

The incident commander approved rollback to `consumer-3.7.4` at `14:36`, and the deployment system recorded completion at `14:44`.
Pool-acquisition timeouts stopped at `14:45`, backlog fell below 5,000 at `14:51`, and it returned below 500 at `15:05`.

### E5 - Alert configuration snapshot

At the incident revision, the queue backlog alert paged after backlog remained above 5,000 jobs for five minutes.
No alert existed for database pool-acquisition timeouts or for the ratio of consumers to pool connections.
The snapshot came from the monitored production configuration and contains no notification recipient names.

### E6 - Change review and staging record

Release `consumer-3.8.0` passed unit tests and a 30-minute staging load test in containers that exposed 8 CPUs.
The change-review template did not require recording production CPU visibility, consumer count, database-pool capacity, or their ratio.
The review record identifies roles only and contains no individual names.

### E7 - Incident response record

The queue alert was acknowledged at `14:16`, responders correlated degradation with the deployment at `14:24`, and rollback was proposed at `14:31`.
The retained UTC response record uses role labels and contains no private chat content or individual names.

### E8 - Incident boundary and approval record

The incident commander classified `INC-204` on 2026-06-18 as `SEV-2` under the supplied policy rule for more than 20% of jobs delayed over ten minutes for longer than 30 minutes.
The incident commander confirmed stability at `15:05`, fixed the evidence cutoff at `15:30`, and approved an internal engineering draft.
The sensitive-data owner approved the sanitized evidence set for that internal audience only.
The approved draft excludes individual customer counts, individual performance assessment, public distribution, and action due dates.
The service owner, database owner, and repository maintainer have not approved the proposed corrective actions or any due dates.
Final publication and distribution outside internal engineering have not been approved.

### E9 - Isolated concurrency reproduction

After the incident, `pnpm test:load -- queue-concurrency` ran for 30 minutes in an isolated fixture that exposed 64 CPUs and replayed the retained aggregate workload shape.
With 64 consumers and a 32-connection pool, the fixture recorded repeated pool-acquisition timeouts and median throughput of 142 jobs per second.
With concurrency capped at 32 and the same pool and workload shape, it recorded zero pool-acquisition timeouts and median throughput of 506 jobs per second.
The command exited `0`; these fixture measurements support the failure-mechanism analysis but are not production measurements.

### E10 - Independent impact calculation review

A reliability reviewer reproduced `8,200 / 31,000 x 100 = 26.4516...%`, rounded to 26.45%, and confirmed that `14:10-15:05` is 55 minutes.
The review used only the aggregate values in E1.

### E11 - Draft action validation constraints

The incident commander approved the following constraints for drafting actions, not as committed work: test concurrency changes for 30 minutes with 64 visible CPUs; require zero pool-acquisition timeouts; page on pool-acquisition timeouts sustained for five minutes; and verify that the paging route receives a staging test.
For this draft, the incident commander proposes the service owner for the concurrency action, the database owner for the pool-timeout alert, and the repository maintainer for the review-template action.
The incident commander proposes High priority for the concurrency and alert actions and Medium priority for the template action because the first two address the observed contention and detection gaps, while the third addresses the contributing review-control condition.
Owner approval is still required before any threshold, action, or schedule becomes committed.

## Constraints and approvals

- Use UTC and cite every timestamp.
- Keep observation, inference, open hypothesis, technical cause, contributing factor, and organizational condition distinct.
- Use blameless language and roles rather than individual names.
- Do not invent customer counts, workload changes, owners, due dates, approvals, or production measurements.
- Keep every corrective action proposed until its owner approves it.
- Do not distribute the draft outside internal engineering.
