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

See [example input](examples/input.md) and [expected output](examples/expected-output.md).
