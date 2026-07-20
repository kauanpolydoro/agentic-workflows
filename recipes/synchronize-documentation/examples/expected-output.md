# Documentation synchronization package

Status: approved bounded patch [E7]

## Scope

| Boundary | Value | Evidence |
|---|---|---|
| Revision | `9ad102e000000000000000000000000000000000` | E1, E2, E3, E5 |
| Audience | Contributors installing and running the CLI from a repository checkout | E1 |
| File | `docs/install.md` | E1 |
| Included claims | Executable names in the list and install examples | E1, E2, E5 |
| Excluded claims | Package publication, npm installation, other files, and external-agent execution | E1, E4, E5, E7 |

## Approved patch

Target file: `docs/install.md` [E1]

```diff
diff --git a/docs/install.md b/docs/install.md
--- a/docs/install.md
+++ b/docs/install.md
@@ -3 +3 @@
-tool list
+awf list
@@ -5 +5 @@
-tool install review-pull-request
+awf install review-pull-request
```

The statement "The npm package will be published in a future release." remains unchanged. [E1, E5, E7]

## Drift register

| Claim ID | Previous text | Disposition | Evidence | Patch location |
|---|---|---|---|---|
| C1 | `tool list` | Contradicted and corrected to `awf list` | E2, E3, E4, E5 | `docs/install.md` list example |
| C2 | `tool install review-pull-request` | Contradicted and corrected to `awf install review-pull-request` | E2, E4, E5 | `docs/install.md` install example |
| C3 | npm publication is future work | Confirmed and preserved exactly | E1, E5, E7 | `docs/install.md` publication note |

The three rows reconcile with all three factual claims in complete snapshot `docs-install-9ad102e000000000000000000000000000000000-v1` [E1].
No factual claim from the supplied page remains unclassified.

## Verification report

| Check | Execution status | Result | Evidence |
|---|---|---|---|
| CLI help | Executed in isolated fixture | Exit `0`; usage names `awf` | E3 |
| Acceptance suite | Executed in isolated fixture | Exit `0`; `awf list` and dry-run install covered | E4 |
| Patch applicability | Executed in isolated fixture | `git apply --check --unidiff-zero docs-install.patch` exited `0` | E6 |
| Repository formatting | Executed after the proposed patch | Exit `0` | E6 |
| Repository relative links | Executed after the proposed patch | Exit `0`; no broken link in `docs/install.md` | E6 |
| Claim-inventory reconciliation | Reviewed against the complete snapshot | Three factual claims and three dispositions | E1 |
| npm installation | Unexecuted | Excluded because package publication remains out of scope | E4, E5 |
| External-agent execution | Unexecuted | Outside the fixed scope | E1 |

## Decision and approval record

The executable rename is established by the manifest, help output, acceptance result, and release decision, so claims C1 and C2 are corrected. [E2, E3, E4, E5]
The repository maintainer approved only this two-line patch after reviewing its evidence and validation results. [E7]
No approval exists to change the package-publication statement or add npm installation instructions, so those claims remain excluded. [E5, E7]

## Assumptions and limitations

- This artifact treats the retained synthetic command records as supplied evidence and does not claim that drafting the report reran them.
- Only `docs/install.md` at `9ad102e000000000000000000000000000000000` was audited. [E1]
- No conclusion is made about drift in other documentation files.
- No claim is made about npm installation, published-package availability, or external-agent execution. [E4, E5, E7]

## Follow-up

No out-of-scope drift was supplied for disposition. [E1]
If another page still uses `tool`, it requires a new bounded evidence record rather than an unreviewed expansion of this patch.

## Traceability summary

| Artifact element | Evidence |
|---|---|
| Existing wording, audience, and fixed scope | E1 |
| Implemented executable name | E2 |
| Help behavior | E3 |
| Acceptance behavior and npm-test exclusion | E4 |
| Intentional rename and publication exclusion | E5 |
| Patch formatting, links, and diff boundary | E6 |
| Merge approval and approval limits | E7 |
