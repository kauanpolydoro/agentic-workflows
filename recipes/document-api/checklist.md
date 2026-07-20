# Produce an evidence-backed API reference checklist

## Scope and source alignment

- [ ] The API version, immutable revision, base URL shape, audience, included operations, and exclusions are fixed.
- [ ] Every operation identifier resolves in the approved public contract.
- [ ] Contract, handler, validator, and contract tests use the same immutable revision.
- [ ] Every evidence source records its path or identifier, provenance, and integrity check.
- [ ] Internal behavior is not treated as public contract without API owner disposition.

## Operation coverage

- [ ] Authentication, parameters, request bodies, response fields, status codes, headers, errors, limits, idempotency, and side effects each have evidence or an explicit non-applicable status.
- [ ] Required versus optional fields and validation constraints match the contract exactly.
- [ ] Every contract and implementation mismatch has an owner, compatibility impact, and disposition.
- [ ] No undocumented field or observed error has entered the public reference by inference.

## Examples and safety

- [ ] Example hosts, identifiers, tokens, payloads, and responses are synthetic and schema-valid.
- [ ] Every example is marked executed or unexecuted.
- [ ] Executed examples retain the target, exact command, exit status, response, and cleanup result.
- [ ] Unexecuted examples state the unavailable prerequisite and do not claim live verification.
- [ ] Mutating examples use an approved isolated target with rollback or cleanup evidence.
- [ ] Secrets, customer identifiers, private endpoints, and internal stack traces are absent.

## Approval and delivery

- [ ] New or expanded public behavior has API owner approval with the contract diff and compatibility impact.
- [ ] Examples derived from observations have security or privacy redaction approval.
- [ ] The reference includes version, scope, authentication, operation details, examples, errors, behavior notes, execution status, discrepancies, assumptions, limitations, and traceability.
- [ ] Links, source paths, operation identifiers, and code samples have been validated.
- [ ] The final artifact satisfies every completion criterion in `workflow.md`.
