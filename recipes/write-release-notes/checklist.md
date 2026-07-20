# Evidence-backed release notes checklist

## Release boundary

- [ ] The requested version, previous version, audience, publication status, and responsible roles are recorded.
- [ ] Full base and release commit identifiers are recorded instead of mutable branch names.
- [ ] The ancestry check confirms that the base commit is an ancestor of the release commit.
- [ ] Every publishable artifact reports the release commit and has a syntactically valid checksum.

## Change disposition

- [ ] Every candidate change has exactly one included, excluded, reverted, or unresolved disposition.
- [ ] Every included change is inside the immutable comparison range.
- [ ] Reverted, excluded, out-of-range, and unresolved changes are absent from shipped claims.
- [ ] Internal implementation work appears only when it has relevant impact for the stated audience.

## Claim evidence

- [ ] Every material claim cites at least one unique evidence ID defined in the input.
- [ ] User-impact wording does not exceed the behavior established by tests, documentation, and artifact records.
- [ ] Names, versions, paths, commands, checksums, measurements, dates, and test states match the evidence exactly.
- [ ] Observations, inferences, recommendations, and execution results are labeled distinctly.
- [ ] Pull request descriptions are corroborated rather than treated as sufficient shipping evidence.

## Upgrade and disclosure risk

- [ ] Each breaking change appears before ordinary change lists and states its concrete impact.
- [ ] Each required upgrade action has repository maintainer approval, prerequisites, sequence, and a stop condition.
- [ ] Upgrade instructions do not imply that a proposed user action was executed during drafting.
- [ ] Security wording stays within the security owner's approved disclosure scope.
- [ ] Secrets, private issue text, exploit instructions, customer identifiers, and embargoed details are absent.

## Draft completeness

- [ ] Highlights describe concrete audience impact rather than implementation activity.
- [ ] Added, Changed, Fixed, Deprecated, Security, and Known limitations contain only supported entries.
- [ ] Known limitations describe constraints of the shipped release rather than unrelated excluded features.
- [ ] Scope exclusions are recorded separately when readers could otherwise infer that excluded work shipped.
- [ ] Empty optional sections are omitted or explicitly marked according to the repository release policy.
- [ ] The upgrade checklist preserves the approved action order and stop conditions.

## Approval state

- [ ] Repository maintainer approval is recorded for every required upgrade instruction.
- [ ] Security owner approval is recorded for every security-sensitive public statement.
- [ ] Release manager review includes the comparison boundary, artifact identity, traceability table, limitations, exclusions, and unresolved items.
- [ ] Draft is not changed to Final before release manager approval is recorded.

## Delivery review

- [ ] `release-notes.md` contains no evidence IDs, internal approval commentary, private paths, or private source records.
- [ ] `release-evidence.md` records the immutable boundary, artifact verification, exclusions, approvals, assumptions, and unresolved items.
- [ ] Every internal traceability row identifies the public claim, evidence, inclusion basis, and verification basis.
- [ ] Assumptions and unresolved items are explicit and do not conceal missing evidence.
- [ ] Relative links and referenced file paths resolve within the intended publication context.
- [ ] The drafting workflow did not modify tags, artifacts, release state, or publication systems.
- [ ] The final artifact satisfies every completion criterion in `workflow.md`.
