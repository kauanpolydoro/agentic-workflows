# Perform a defensive security review checklist

## Authorization boundary

- [ ] Written authorization names the repository paths, environment, techniques, and review period.
- [ ] The immutable revision and complete security-relevant file inventory are retained.
- [ ] Protected assets, trust boundaries, attacker capabilities, and excluded systems are explicit.
- [ ] Every active validation, including a local fixture, has explicit security-owner approval for the exact target and method.
- [ ] Sensitive evidence has an approved redaction and disclosure route.

## Finding discipline

- [ ] Each finding identifies the vulnerable decision or data flow in supplied code or configuration.
- [ ] Reachability is demonstrated or clearly classified as an unconfirmed hypothesis.
- [ ] Severity states asset impact, required attacker position, and repository rubric.
- [ ] Confidence distinguishes static observation from runtime validation.
- [ ] Recommendations preserve authentication, authorization, confidentiality, and audit controls.
- [ ] Negative and positive security tests are defined at the protected boundary.
- [ ] Every impact statement names attacker prerequisites and separates observation from inference.

## Disclosure and closure

- [ ] No credential, personal record, exploit payload, or secret value appears in the artifact.
- [ ] Unexpected network access stops the review and is reported to the security owner.
- [ ] Active testing has written security-owner approval covering revision, target, traffic, data, network boundary, stop conditions, cleanup, and rollback.
- [ ] External disclosure has an approved audience, channel, timing, and redacted evidence set.
- [ ] Every blocking finding has an owner role, remediation evidence, and disposition.
- [ ] Every remediation identifies rollback or recovery and objective closure evidence.
- [ ] Every remediation records positive and negative tests plus its deployment dependency.
- [ ] Residual risk and untested attack paths remain visible.
- [ ] Security-owner and release-manager gates are complete before deployment.
- [ ] The defensive assessment satisfies every completion criterion.
