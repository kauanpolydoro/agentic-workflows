# Example input

This synthetic scenario triages issues `#12`, `#16`, and `#18` from read-only snapshot `S-204` under owner-approved policy revision `T-8`.
The audience is the repository maintainer who will decide whether to apply the proposals.
The objective is to classify the reports, evaluate a possible duplicate, and draft responses without posting, labeling, assigning, prioritizing, or closing any issue.

## Scope and environment

- Product: CLI `1.2.x`.
- Snapshot: `S-204`, containing exactly three open issues.
- Policy: `T-8`.
- Excluded work: source-code diagnosis, implementation, delivery planning, and tracker mutation.
- Attachment handling: only sanitized text inventories are available; no binary or private attachment is opened.

## Evidence inventory

### E1 - Owner-approved triage policy T-8

Allowed types are `bug`, `documentation`, and `question`.
Impact is high for reproducible data loss or inability to install on a supported platform, medium for another reproducible functional failure, and low for documentation gaps or questions without functional impact.
A duplicate requires the same observed behavior, environment, and reproduction command with at least high confidence.
When that threshold passes, the lower-numbered issue is canonical unless the repository maintainer records an evidence-backed exception.
Supported and unsupported environment status must be recorded separately from report validity.
Allowed proposed states are `accepted`, `needs-information`, `duplicate`, and `blocked`.
Available labels are `type:bug`, `type:documentation`, `type:question`, `impact:high`, `impact:medium`, `impact:low`, `state:accepted`, `state:needs-information`, `state:duplicate`, and `state:blocked`.
Public responses, labels, assignments, duplicate links, and closure require repository-maintainer approval.
Priority changes require product-owner approval, and policy forbids delivery-date promises without that approval.
Suspected vulnerabilities, secrets, customer data, and private reproduction details must be routed privately after security-owner approval.
A duplicate may close only after its unique evidence is preserved in the policy-selected canonical issue and the repository maintainer approves the relationship and response.
Low-information reports may not be mass-closed solely because required data is absent.

### E2 - Versioned support matrix

Support matrix revision `M-12` states that CLI `1.2.x` supports Windows 11 with Node 22.
It makes no claim about a root cause for path-related failures.

### E3 - Issue #12 record

Title: `Install rejects an existing target path with spaces`.
Current state: open with no labels and no comments.
Environment: CLI `1.2.1`, Windows 11, Node 22.
The sanitized transcript shows `Test-Path 'C:\Work Space'` returning `True`, followed by `awf install review-pull-request --target "C:\Work Space"` exiting `1` with `Target does not exist`.
The reporter expects installation into the existing target directory.
Attachment inventory: one sanitized text transcript and no binary attachment.

### E4 - Issue #16 record

Title: `Quoted target fails during install`.
Current state: open with no labels and one comment repeating the reproduction.
Environment: CLI `1.2.1`, Windows 11, Node 22.
The body and comment contain the same command, existing quoted target shape, and `Target does not exist` result as E3.
The reporter expects installation into the existing quoted target.
The reporter additionally records `awf list` exiting `0` in the same shell.
Attachment inventory: none.

### E5 - Issue #18 record

Title: `Install failed`.
Current state: open with no labels and no comments.
The body states only that installation failed.
CLI version, operating system, Node version, exact command, sanitized output, target-path shape, manifest state, and reproduction result are absent.
Attachment inventory: none.

### E6 - Snapshot integrity and authorization record

The read-only export identifies snapshot `S-204`, policy `T-8`, issue count `3`, issue IDs `#12`, `#16`, and `#18`, and the repository maintainer as the artifact audience.
It excludes source-code diagnosis, implementation, delivery planning, and tracker mutation.
The supplied records contain no suspected vulnerability, secret, customer data, or private attachment after sanitization review.
No public response, label, assignment, priority change, duplicate link, or closure is authorized or recorded as applied.

## Constraints

- Distinguish issue facts, reporter expectations, triager inference, and recommendations.
- Do not diagnose a technical root cause from the issue records.
- Do not post responses or mutate the tracker.
- Do not promise priority or delivery dates.
- Request only evidence needed for the next decision.
