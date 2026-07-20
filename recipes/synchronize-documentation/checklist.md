# Synchronize documentation with verified behavior checklist

## Scope and source integrity

- [ ] The immutable commit, exact documentation paths, audience, evidence cutoff, and exclusions are recorded.
- [ ] Every scoped path resolves at the recorded commit.
- [ ] Every factual statement in scope has a stable claim ID.
- [ ] Each evidence source records provenance, revision, execution status, and redaction status.
- [ ] Support reports are sanitized and are not treated as the public contract.

## Claim disposition

- [ ] Every claim is classified as confirmed, contradicted, ambiguous, or unverifiable.
- [ ] Conflicting authoritative sources are blocked pending a recorded contract decision.
- [ ] Each proposed edit maps to one or more claim IDs and an exact patch location.
- [ ] Unverifiable content is labeled or removed according to an approved disposition rather than guessed.
- [ ] Out-of-scope drift has a separate owner and does not expand the current patch.

## Command verification and safety

- [ ] Every command is marked executed or unexecuted.
- [ ] Executed commands retain the environment, exact command, exit status, and relevant output.
- [ ] Unexecuted commands state why execution was unsafe or unavailable and identify their non-runtime evidence.
- [ ] Synthetic values replace credentials, customer data, private paths, and secret-bearing output.
- [ ] No edit expands product behavior, compatibility, support, pricing, or security claims without approval.

## Validation and approval

- [ ] Formatting, relative-link, and applicable documented-command checks have retained results.
- [ ] The final diff contains no line absent from the claim and evidence register.
- [ ] Changed public commitments include before-and-after text, compatibility impact, and repository-maintainer approval.
- [ ] Material derived from support reports includes security or privacy redaction approval.
- [ ] Known limitations, blocked claims, decisions, and responsible roles are stated.

## Delivery

- [ ] The patch, drift register, verification report, approval state, assumptions, limitations, and owned follow-ups are included.
- [ ] No check is described as executed unless the evidence inventory contains its result.
- [ ] Every relative link and referenced file path in the artifact has been validated.
- [ ] The final artifact satisfies every completion criterion in `workflow.md`.
