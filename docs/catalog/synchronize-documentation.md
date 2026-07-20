---
title: "Synchronize documentation with verified behavior"
description: "Compare documentation claims with authoritative evidence at one immutable revision, then deliver a bounded patch, a claim-to-evidence drift register, and a verification report."
---

# Synchronize documentation with verified behavior

## Objective

Take a fixed set of documentation claims plus the authoritative evidence for what the product actually does, and turn them into three artifacts: a bounded patch, a claim-to-evidence drift register, and a verification report.
The quality bar has two parts.
Every factual claim you change must be supported by evidence at the same immutable revision, and every example you did not run must be labeled as unexecuted.

## When to use

Use this workflow after a command, configuration key, public behavior, supported version, or file layout has changed, and one or more identified documentation pages may still describe the previous state.
It also fits when a release review or a support report points to a concrete contradiction, one you can check against versioned source, tests, configuration, or safe runtime evidence.

## When not to use

Skip this workflow when the source revision or the documentation file set cannot be fixed.
Skip it as well when current behavior cannot be inspected without production credentials or customer data, or when the requested prose would establish new behavior rather than describe an approved implementation.
When authoritative sources intentionally disagree and no owner has chosen the public contract, reach for a product-design or contract-decision workflow instead.

## Required inputs

- **Documentation scope:** the exact repository-relative file paths, the intended audience, any explicit exclusions, and an immutable source revision, such as commit `9ad102e000000000000000000000000000000000`.
  This scope is what bounds the patch, and it only holds when every listed path resolves at that commit.
- **Claim evidence:** an authoritative source for every claim class, such as a source file with a line range, a configuration record, exact help output, a test result, or a sanitized runtime observation.
  This evidence establishes current behavior, so each piece must carry its provenance, revision, execution status, and, where applicable, redaction status.

## Optional inputs

- **Approved release records:** a release decision tied to the same revision lets you tell intentional changes from accidental drift, and it preserves any declared exclusions.
- **Sanitized support reports:** attributed reports are useful for finding ambiguous wording, but never treat them as the public contract.
  Record each report's origin and its redaction review.
- **Documentation ownership map:** use it to route approvals and follow-up work without inventing an owner.

## Preconditions

- The comparison revision resolves to an immutable commit.
- Every documentation file in scope exists at that revision.
- At least one authoritative source is available for every claim type selected for correction.
- Any command selected for execution is safe to run in an isolated, non-production environment with synthetic data.
- Required credentials can be omitted or replaced with synthetic values.

## Workflow

1. **Freeze the scope.**
   Record the commit, the exact files, the audience, the product version, the evidence cutoff, and the exclusions.
   Advance once every path resolves at the commit, and stop if any boundary stays unresolved.
2. **Inventory the claims.**
   Assign a stable claim ID to every command, path, default, output, link, compatibility statement, and version qualification in scope.
   The intermediate result is a complete claim inventory, and its count must be reconciled with the source pages before you advance.
3. **Attach evidence.**
   Map each claim to authoritative evidence at the frozen revision, recording provenance, execution status, and redaction status.
   Classify every claim as confirmed, contradicted, ambiguous, or unverifiable, and stop editing any claim whose sources conflict.
4. **Verify executable material.**
   Run the safe commands in an isolated fixture and retain the exact command, the environment, the exit status, and the relevant output.
   Mark any command you cannot run as unexecuted, and never advance it to verified status.
5. **Draft bounded changes.**
   Correct contradicted claims, qualify ambiguous ones, and retain or remove unverifiable text according to an approved disposition.
   Advance when every changed line maps to a claim ID and no edit changes product behavior, and stop on any unmapped or behavior-changing line.
6. **Inspect scoped relationships.**
   Check relative links and directly referenced pages within the declared boundary.
   Advance when every scoped relationship has a result and any out-of-scope drift has an owned follow-up, and stop if a required in-scope relationship cannot be evaluated.
7. **Validate the patch.**
   Run the repository's formatter, its link checker, and the applicable documented-command tests.
   Compare the resulting diff with the drift register, and stop if an unexplained line or an unsupported claim remains.
8. **Obtain approval.**
   Submit public-commitment changes to the responsible maintainer with the before-and-after text, the evidence, the compatibility impact, and the verification results.
   Advance when every applicable approval is recorded or explicitly non-applicable, and hold publication while any required approval is pending or denied.
9. **Deliver.**
   Hand over the bounded patch, the final drift register, the verification table, and the decisions, assumptions, limitations, and owned follow-up items.
   Complete only when every completion criterion maps to the package, and stop the handoff if any criterion remains unsupported.

## Decision points

- If code, tests, configuration, and the declared public contract disagree, stop editing that claim and request a contract decision from the repository maintainer.
- If a command cannot be run safely, retain it only when authoritative non-runtime evidence supports it, and label it unexecuted.
- If drift appears outside the frozen file set, create a separately owned follow-up and keep the current patch bounded.
- If an edit changes compatibility, support, pricing, security, or another public commitment, withhold publication until the responsible maintainer approves the evidence and the impact.
- If validation changes or invalidates a claim classification, return that claim to evidence mapping before updating the patch.

## Safety guardrails

- Never invent commands, URLs, outputs, supported versions, or execution results.
- Never use fake URLs as if they were validated destinations.
- Never claim an example was run when the evidence records it as unexecuted.
- Run examples only in an isolated, non-production target with synthetic data and least privilege.
- Do not expose credentials, tokens, customer data, private support content, or unredacted logs.
- Do not modify product behavior to make existing prose true, and do not silently broaden the approved file set.
- Stop when the evidence cannot distinguish implemented behavior from aspirational design.

## Human approval gates

- Before publishing a change to a documented public commitment, the repository maintainer must review the claim ID, the before-and-after text, the authoritative evidence, the compatibility impact, and the validation results.
- Before using material derived from a support report, the security or privacy owner must review the sanitized excerpt, its provenance, the intended audience, and the redaction record.
- Before accepting an unresolved validation failure, the documentation owner and the repository maintainer must approve the limitation, the follow-up owner, and the publication impact.

## Expected output

The deliverable is one Markdown package.
It contains a scope summary, the bounded documentation patch, the claim-to-evidence drift register, a verification report that separates executed checks from unexecuted ones, the approval record, and the decisions, assumptions, limitations, and owned follow-up items.
Every row of the drift register identifies the claim, the previous wording, the disposition, the evidence IDs, and the patch location.

## Completion criteria

- Every scoped factual claim has a disposition, plus either authoritative evidence or an explicit unverifiable status.
- Every changed line maps to a drift-register claim ID and a patch location.
- Every documented command has retained execution evidence, or an unexecuted label with the reason.
- Formatting and relative-link checks pass, or each failure has a documented owner, impact, and approved disposition.
- No diff line broadens the scope or changes product behavior.
- Required approvals accompany every changed public commitment.
- The delivered artifact records its assumptions, limitations, and out-of-scope findings.

## Failure modes

- **F1:** The immutable revision, or one of the scoped files, cannot be resolved.
- **F2:** Authoritative sources conflict about public behavior.
- **F3:** A command needs unsafe production access or credentials that are not available.
- **F4:** Validation exposes drift outside the approved scope.
- **F5:** The patch contains a line with no claim or evidence mapping.

## Recovery procedure

- **R1:** Obtain a resolvable commit and a corrected file inventory, verify both, and restart from the scope freeze.
- **R2:** Preserve each conflicting source with its provenance, mark the claim blocked, and obtain a contract decision from the maintainer; resume at evidence mapping only after that decision is recorded.
- **R3:** Use a representative isolated fixture when one is approved; otherwise mark the command unexecuted, state the verification gap, and resume with non-runtime evidence only.
- **R4:** Leave the current patch unchanged, create an owned follow-up with the new claim and its evidence, and resume validation inside the original boundary.
- **R5:** Remove or revert the unmapped line, update the claim inventory if the line is genuinely required, and rerun patch validation before delivery.

## Example

The bundled synthetic example corrects two obsolete executable names in `docs/install.md` at commit `9ad102e000000000000000000000000000000000`, while leaving an unchanged package-publication statement untouched.
The result includes a patch, the claim dispositions, executed validation evidence, an explicit approval state, and the scope limitations.
See the [example input](#complete-example-input) and the [expected output](#complete-expected-output).

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
