# Security policy

## Supported versions

Before the first stable release, security fixes target the current `main` branch.
Published support ranges will be added when versioned releases exist.

## Report a vulnerability

Use the [GitHub private vulnerability reporting form](https://github.com/kauanpolydoro/agentic-workflows/security/advisories/new) as the primary and only published private reporting channel.
Submitting the form requires a GitHub account, and GitHub keeps the resulting advisory discussion private between the reporter and repository security participants.

The project does not currently publish a security email address, PGP key, or other independently actionable private fallback.
If the GitHub form is unavailable, do not send vulnerability details through a public issue, discussion, profile, or unencrypted message.
Retain the report and retry the private form after GitHub access is restored; a maintainer must publish a verified replacement channel here before reports can be accepted elsewhere.

Do not open a public issue containing exploit details, tokens, repository secrets, `.env` content, or personal data.
Include affected version or commit, impact, safe reproduction conditions, and a proposed mitigation when possible.

## Response and disclosure

The security coordinator will make a best-effort acknowledgement within seven calendar days after a private report is successfully submitted.
The acknowledgement will establish a private channel, confirm scope, and identify the next validation step without requiring the reporter to disclose unnecessary secrets.

The maintainer and reporter should coordinate reproduction, severity, remediation, release timing, and public disclosure through the private report.
Public disclosure should occur only after affected users have a practical mitigation or fixed release, unless immediate disclosure is required to reduce active harm.
If the report is out of scope, the response should explain the disposition without publishing sensitive material.

## Scope and trust model

The CLI, recipe parser, generated adapters, manifests, and documentation build are in scope.
Recipes are untrusted YAML and Markdown data.
The project never treats a recipe as executable plugin code, but users must still review workflow instructions before an agent follows them.

Filesystem containment and rollback protect ordinary local lifecycle operations, not a project tree concurrently controlled by a privileged adversary.
Reports involving symlink races, manifest allowlist bypass, incomplete rollback, terminal control injection, or parser resource exhaustion are in scope.

The intentionally vulnerable fixture is artificial, local-only, and excluded from deployment support.
Do not aim security testing at systems you do not own or lack permission to assess.
