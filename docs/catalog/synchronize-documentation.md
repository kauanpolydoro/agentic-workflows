---
title: "Synchronize documentation with verified behavior"
description: "Produce a bounded documentation patch and claim-to-evidence register for behavior that changed at an immutable revision."
---

# Synchronize documentation with verified behavior

## Objective

Transform a fixed set of documentation claims and authoritative product evidence into a bounded patch, a claim-to-evidence drift register, and a verification report.
The primary quality constraint is that every changed factual claim must be supported at the same immutable revision and every unexecuted example must be labeled as such.

## When to use

Use this workflow after a command, configuration key, public behavior, supported version, or file layout changed and one or more identified documentation pages may describe the previous state.
Use it when a release review or support report identifies a concrete contradiction that can be checked against versioned source, tests, configuration, or safe runtime evidence.

## When not to use

Do not use when the source revision or documentation file set cannot be fixed, when current behavior cannot be inspected without production credentials or customer data, or when the requested prose would establish new behavior rather than describe an approved implementation.
Use a product-design or contract-decision workflow instead when authoritative sources intentionally disagree and no owner has chosen the public contract.

## Required inputs

- **Documentation scope:** provide repository-relative file paths, intended audience, explicit exclusions, and an immutable commit such as `9ad102e000000000000000000000000000000000`; this bounds the patch, and integrity is valid only when every path resolves at that commit.
- **Claim evidence:** provide a source file and line range, configuration record, exact help output, test result, or sanitized runtime observation for every claim class; this establishes current behavior, and integrity requires provenance, revision, execution status, and redaction status where applicable.

## Optional inputs

- **Approved release records:** use a release decision tied to the same revision to distinguish intentional changes from accidental drift and to preserve declared exclusions.
- **Sanitized support reports:** use attributed reports to find ambiguous wording, but never treat them as the public contract; record their origin and redaction review.
- **Documentation ownership map:** use it to route approvals and follow-up work without inventing an owner.

## Preconditions

- The comparison revision resolves to an immutable commit.
- Every documentation file in scope exists at that revision.
- At least one authoritative source is available for every claim type selected for correction.
- Commands selected for execution are safe in an isolated, non-production environment with synthetic data.
- Required credentials can be omitted or replaced with synthetic values.

## Workflow

1. **Freeze scope:** record the commit, exact files, audience, product version, evidence cutoff, and exclusions; advance when every path resolves at the commit, and stop if any boundary is unresolved.
2. **Inventory claims:** assign a stable claim ID to every command, path, default, output, link, compatibility statement, and version qualification in scope; the intermediate result is a complete claim inventory whose count is reconciled with the source pages before advancing.
3. **Attach evidence:** map each claim to authoritative evidence at the frozen revision and record provenance, execution status, and redaction status; classify the claim as confirmed, contradicted, ambiguous, or unverifiable, and stop editing any claim whose sources conflict.
4. **Verify executable material:** run safe commands in an isolated fixture and retain the exact command, environment, exit status, and relevant output; mark commands that cannot be run as unexecuted and do not advance them to verified status.
5. **Draft bounded changes:** correct contradicted claims, qualify ambiguous claims, and retain or remove unverifiable text according to an approved disposition; advance when every changed line maps to a claim ID and no edit changes product behavior, and stop on an unmapped or behavior-changing line.
6. **Inspect scoped relationships:** check relative links and directly referenced pages within the declared boundary; advance when every scoped relationship has a result and out-of-scope drift has an owned follow-up, and stop if a required in-scope relationship cannot be evaluated.
7. **Validate the patch:** run the repository's formatter, link checker, and applicable documented-command tests; compare the resulting diff with the drift register and stop if an unexplained line or unsupported claim remains.
8. **Obtain approval:** submit public-commitment changes with before-and-after text, evidence, compatibility impact, and verification results to the responsible maintainer; advance when every applicable approval is recorded or explicitly non-applicable, and stop publication while a required approval is pending or denied.
9. **Deliver:** provide the bounded patch, final drift register, verification table, decisions, assumptions, limitations, and owned follow-up items; complete only when every completion criterion maps to the package, and stop handoff if a criterion remains unsupported.

## Decision points

- If code, tests, configuration, and the declared public contract disagree, stop editing that claim and request a contract decision from the repository maintainer.
- If a command cannot be run safely, retain it only when authoritative non-runtime evidence supports it and label it unexecuted.
- If drift is found outside the frozen file set, create a separately owned follow-up and keep the current patch bounded.
- If an edit changes compatibility, support, pricing, security, or another public commitment, withhold publication until the responsible maintainer approves the evidence and impact.
- If validation changes or invalidates a claim classification, return that claim to evidence mapping before updating the patch.

## Safety guardrails

- Never invent commands, URLs, outputs, supported versions, or execution results.
- Never use fake URLs as if they were validated destinations.
- Never claim an example was run when the evidence records it as unexecuted.
- Run examples only in an isolated non-production target with synthetic data and least privilege.
- Do not expose credentials, tokens, customer data, private support content, or unredacted logs.
- Do not modify product behavior to make existing prose true or silently broaden the approved file set.
- Stop when evidence cannot distinguish implemented behavior from aspirational design.

## Human approval gates

- Before publishing a change to a documented public commitment, the repository maintainer must review the claim ID, before-and-after text, authoritative evidence, compatibility impact, and validation results.
- Before using material derived from a support report, the security or privacy owner must review the sanitized excerpt, provenance, intended audience, and redaction record.
- Before accepting an unresolved validation failure, the documentation owner and repository maintainer must approve the limitation, follow-up owner, and publication impact.

## Expected output

Produce a Markdown package containing a scope summary, bounded documentation patch, claim-to-evidence drift register, verification report that distinguishes executed and unexecuted checks, approval record, decisions, assumptions, limitations, and owned follow-up items.
Every drift-register row must identify the claim, previous wording, disposition, evidence IDs, and patch location.

## Completion criteria

- Every scoped factual claim has a disposition and authoritative evidence or an explicit unverifiable status.
- Every changed line maps to a drift-register claim ID and patch location.
- Every documented command has retained execution evidence or an unexecuted label with the reason.
- Formatting and relative-link checks pass, or each failure has a documented owner, impact, and approved disposition.
- No diff line broadens scope or changes product behavior.
- Required approvals accompany every changed public commitment.
- The delivered artifact records assumptions, limitations, and out-of-scope findings.

## Failure modes

- **F1:** The immutable revision or a scoped file cannot be resolved.
- **F2:** Authoritative sources conflict about public behavior.
- **F3:** A command requires unsafe production access or unavailable credentials.
- **F4:** Validation exposes drift outside the approved scope.
- **F5:** The patch contains a line that has no claim or evidence mapping.

## Recovery procedure

- **R1:** Obtain a resolvable commit and corrected file inventory, verify both, and restart from scope freezing.
- **R2:** Preserve each conflicting source with provenance, mark the claim blocked, obtain a maintainer contract decision, and resume at evidence mapping only after the decision is recorded.
- **R3:** Use a representative isolated fixture when one is approved; otherwise mark the command unexecuted, state the verification gap, and resume with non-runtime evidence only.
- **R4:** Keep the current patch unchanged, create an owned follow-up with the new claim and evidence, and resume validation inside the original boundary.
- **R5:** Remove or revert the unmapped line, update the claim inventory if the line is genuinely required, and rerun patch validation before delivery.

## Example

The complete synthetic example corrects two obsolete executable names in `docs/install.md` at commit `9ad102e000000000000000000000000000000000` while preserving an unchanged package-publication statement.
The result includes a patch, claim dispositions, executed validation evidence, an explicit approval state, and scope limitations.

See [example input](#complete-example-input) and [expected output](#complete-expected-output).

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/synchronize-documentation/1.0.0",
  "title": "Documentation synchronization output contract",
  "description": "Validates the bounded documentation patch, claim drift register, verification report, decision and approval record, limitations, follow-up, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "documentation-synchronization-package.md",
        "audience": "Documentation maintainers and repository reviewers",
        "requires_title": true,
        "required_headings": [
          "Scope",
          "Approved patch",
          "Drift register",
          "Verification report",
          "Decision and approval record",
          "Assumptions and limitations",
          "Follow-up",
          "Traceability summary"
        ],
        "required_literals": [
          "| Boundary | Value | Evidence |",
          "| Claim ID | Previous text | Disposition | Evidence | Patch location |",
          "| Check | Execution status | Result | Evidence |",
          "| Artifact element | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This synthetic scenario covers documentation drift after the command-line executable was renamed from `tool` to `awf` at immutable commit `9ad102e000000000000000000000000000000000`.
The audience is contributors installing and running the CLI from a repository checkout.
The objective is to update only `docs/install.md` without changing the package-publication statement or implying that npm installation was tested.

## Scope and environment

- Documentation file: `docs/install.md` at `9ad102e000000000000000000000000000000000`.
- Product surface: executable names in the list and install examples.
- Excluded surfaces: package publication, npm installation, files outside `docs/install.md`, and external-agent execution.
- Verification environment: isolated repository fixture at `9ad102e000000000000000000000000000000000` with no production credentials or customer data.

## Evidence inventory

### E1 - Existing documentation snapshot and fixed scope

The retained synthetic artifact `docs-install-9ad102e000000000000000000000000000000000-v1` is the complete content of `docs/install.md` at `9ad102e000000000000000000000000000000000`:

```markdown
# Install from a repository checkout

tool list

tool install review-pull-request

The npm package will be published in a future release.
```

The snapshot path, immutable commit, artifact identifier, and complete content were checked against the scenario scope.
The snapshot contains exactly three factual claims: the list command, the install command, and the future-publication statement.
No other factual claim or line is omitted from the supplied snapshot.
Only the two command claims are proposed for change.
The intended audience is contributors installing and running the CLI from a repository checkout.
The fixed scope excludes package publication, npm installation, files outside `docs/install.md`, and external-agent execution.
No out-of-scope drift observation was supplied for this example.

### E2 - Package manifest

The retained `packages/cli/package.json` at `9ad102e000000000000000000000000000000000` maps the executable name `awf` to `dist/index.js` and contains no `tool` executable.
The file comes from the same immutable commit as E1.

### E3 - Recorded help command

In the isolated fixture at `9ad102e000000000000000000000000000000000`, `node packages/cli/dist/index.js --help` exited `0` and displayed `Usage: awf [options] [command]`.
The retained command record identifies the fixture commit, exact command, exit status, and relevant output.

### E4 - Acceptance result

In the same isolated fixture, `pnpm test:acceptance` exited `0`.
The retained output includes successful `awf list` and `awf install review-pull-request --dry-run` cases and contains no npm installation case.

### E5 - Release decision R-17

The approved synthetic release record `R-17` states that the executable rename is included at `9ad102e000000000000000000000000000000000` and that npm publication remains out of scope.
Its revision matches E1 through E4.

### E6 - Documentation validation

The retained patch artifact `docs-install.patch` contains this complete zero-context unified diff:

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

The diff includes file headers, valid hunk headers, exact original lines, and only the two executable-name substitutions.
On a clean isolated fixture based at `9ad102e000000000000000000000000000000000`, `git apply --check --unidiff-zero docs-install.patch` exited `0`.
The exact retained patch was then applied to a separate isolated fixture based at `9ad102e000000000000000000000000000000000`, where `pnpm format:check` and `pnpm check:links` each exited `0` against the patched worktree.
The retained diff contains only the two substitutions, and the link-check output reports no broken relative link in `docs/install.md`.

### E7 - Maintainer approval

The repository maintainer reviewed the proposed two-line patch for contributors using a repository checkout, E2 through E6, and the unchanged publication statement.
The maintainer approved this bounded patch for merge and did not approve any npm installation or package-publication claim.

## Constraints

- Change only `docs/install.md`.
- Preserve the future-publication statement exactly.
- Do not claim npm installation or external-agent execution was tested.
- Do not add commands, URLs, or behavior absent from the evidence inventory.

## Complete expected output

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
