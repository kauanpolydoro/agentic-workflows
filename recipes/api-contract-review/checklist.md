# Review an API contract change checklist

## Wire comparison

- [ ] Old and proposed contracts come from immutable released and candidate artifacts.
- [ ] Status codes, content types, schemas, nullability, defaults, headers, and errors are compared.
- [ ] Runtime implementation behavior is checked separately from generated schema declarations.
- [ ] Each runtime-only default and error branch maps to a stable wire-difference identifier.
- [ ] Producer ability to emit old and new forms is recorded.
- [ ] Consumer parsing expectations are mapped for every known client.
- [ ] Contract incompatibility, implementation-derived behavior, inferred impact, and observed runtime failure are labeled separately.
- [ ] Unknown client ownership remains a compatibility risk rather than assumed acceptance.

## Versioning decision

- [ ] Every wire difference is classified under the supplied protocol and versioning policy.
- [ ] The severity policy distinguishes a known parser-contract incompatibility from an executed client failure.
- [ ] Breaking changes identify the affected client, migration evidence, and API-owner decision.
- [ ] Deprecation removal has usage evidence, notice period, and owner approval.
- [ ] Defaults and internal errors are not changed or exposed silently.
- [ ] The selected compatibility path uses a routing capability that actually exists.
- [ ] Each client path adoption has owner approval and verification rather than an assumed gateway cohort.
- [ ] Contract tests cover both producer output and representative consumer parsing.
- [ ] Test records identify contract revisions, implementation revision, fixtures, and exact results.

## Rollout observation

- [ ] Version selection, baseline metric, abort threshold, and observation window are explicit.
- [ ] Monitoring avoids response bodies and personal data.
- [ ] Rollback routes only at a supported version or gateway boundary.
- [ ] Monitoring uses privacy-safe aggregate signals and retains no response body or internal error.
- [ ] Every material contract change has its own approved signal and threshold, or traffic remains blocked.
- [ ] The old handler remains available until client migration and observation gates pass.
- [ ] API-owner approval precedes release-manager traffic changes.
- [ ] Executed tests and proposed tests are clearly separated.
- [ ] The compatibility report satisfies every completion criterion.
