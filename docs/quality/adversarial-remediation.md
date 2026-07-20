# Adversarial remediation register

This page is a retained record of a corrective review: an adversarial pass over the whole project that tried to disprove its own claims, finding by finding.
Each row preserves the original finding, what changed, and the tests that now guard it.

The review was performed against baseline commit `cbe8c9dd7c48f945711f2cd52b9ef01748fccb1e`.

All findings have a final disposition supported by the evidence named in this register.

Final dispositions are limited to `fixed`, `not-reproducible`, `superseded`, `blocked-external`, and `accepted-risk`.

An `accepted-risk` entry must also record its technical rationale, impact, mitigation, accountable role, and future review criterion below the table.

| ID | Severity | Finding | Confirmed | Files changed | Tests | Final disposition |
| --- | --- | --- | --- | --- | --- | --- |
| AWF-001 | critical | Adapter exports omit recipe assets and leave relative links unresolved. | confirmed | `packages/core/src/adapters.ts`; `packages/core/src/manifest.ts`; `scripts/prepare-cli-package.ts` | `packages/core/src/core.test.ts` adapter bundle matrix; `packages/cli/src/install.integration.test.ts` complete-bundle lifecycle; `scripts/package-smoke.ts` packaged-link walk | fixed |
| AWF-002 | critical | The web catalog filters consume obsolete agent support metadata. | confirmed | `docs/.vitepress/theme/components/CatalogExplorer.vue`; `docs/.vitepress/theme/components/catalog-filter.ts`; `generated/catalog.d.ts` | `docs/.vitepress/theme/components/catalog-filter.test.ts` real-catalog, dimension-separation, reset, empty-state, and fallback cases | fixed |
| AWF-003 | high | CLI status filtering conflates adapter support and recipe compatibility. | confirmed | `packages/core/src/catalog.ts`; `packages/cli/src/index.ts`; `docs/guide/cli-reference.md` | `packages/cli/src/index.test.ts` separate support and compatibility filter case; `packages/core/src/core.test.ts` filter matrix | fixed |
| AWF-004 | high | Public positioning overstates execution and safety guarantees. | confirmed | `README.md`; `README.pt-BR.md`; `docs/index.md`; `docs/guide/introduction.md`; `docs/guide/security.md`; `docs/guide/verification.md` | `scripts/delivery-contracts.test.ts` honest-claims and source-installation contract | fixed |
| AWF-005 | high | Advisory safety declarations are presented without an explicit effects model. | confirmed | `packages/core/src/schema.ts`; all `recipes/*/recipe.yml`; `docs/quality/recipe-quality-standard.md` | `packages/core/src/schema-hardening.test.ts` effect, approval, risk, and capability invariants; `packages/core/src/core.test.ts` metadata rejection cases | fixed |
| AWF-006 | critical | Effectful workflows may be implicitly invoked without a confirmed adapter policy. | confirmed | `packages/core/src/adapters.ts`; `packages/core/src/schema.ts`; `packages/cli/src/index.ts`; `docs/research/adapter-sources.md` | `packages/core/src/core.test.ts` manual-invocation and policy generation matrix; `packages/cli/src/install.integration.test.ts` installed policy and link contract | fixed |
| AWF-007 | critical | Installation manifests are not constrained to the exact adapter bundle. | confirmed | `packages/cli/src/install.ts`; `packages/core/src/manifest.ts` | `packages/cli/src/install.integration.test.ts` exact bundle, forged role, hash, path, missing file, and unexpected file cases | fixed |
| AWF-008 | critical | Recipe catalogs are not fully treated as untrusted filesystem input. | confirmed | `packages/core/src/catalog.ts`; `packages/core/src/fs-security.ts`; `packages/core/src/content-validation.ts`; `packages/cli/src/index.ts` | `packages/core/src/catalog-security.test.ts`; `packages/core/src/content-validation.test.ts`; `packages/cli/src/index.test.ts` unsafe catalog cases | fixed |
| AWF-009 | high | Human terminal output is not comprehensively sanitized. | confirmed | `packages/cli/src/io.ts`; `packages/cli/src/index.ts`; `packages/core/src/fs-security.ts` | `packages/cli/src/io.test.ts`; `packages/cli/src/index.test.ts` terminal-control and JSON-output cases; `packages/core/src/core.test.ts` display sanitization cases | fixed |
| AWF-010 | critical | `validate --strict` does not perform strict content and installation validation. | confirmed | `packages/cli/src/index.ts`; `packages/core/src/content-validation.ts`; `packages/cli/src/install.ts` | `packages/cli/src/index.test.ts` strict source, generated, installation, and evidence validation cases; `packages/core/src/content-validation.test.ts` | fixed |
| AWF-011 | high | CLI flags and configuration surfaces contain no-op or incomplete behavior. | confirmed | `packages/cli/src/context.ts`; `packages/cli/src/index.ts` | `packages/cli/src/context.test.ts`; `packages/cli/src/index.test.ts` default target, dry-run, invalid configuration, and option-semantics cases | fixed |
| AWF-012 | medium | `doctor` does not diagnose installation and environment integrity deeply enough. | confirmed | `packages/cli/src/index.ts`; `scripts/docs-site.ts` | `packages/cli/src/index.test.ts` structured doctor, writable target, lifecycle lock, installation conflict, generated freshness, and site-base cases | fixed |
| AWF-013 | critical | Installation lifecycle writes are not transactional or lock protected. | confirmed | `packages/cli/src/install.ts` | `packages/cli/src/install.integration.test.ts` lock ownership, transaction fault stages, rollback, AbortSignal, and concurrent lifecycle cases | fixed |
| AWF-014 | high | Update does not model bundle composition migrations explicitly. | confirmed | `packages/cli/src/install.ts`; `packages/core/src/manifest.ts` | `packages/cli/src/install.integration.test.ts` registered v2 create, replace, and retire migration; unregistered v1 and v2 fail-closed cases | fixed |
| AWF-015 | critical | Filesystem containment leaves target-root and time-of-check gaps. | confirmed | `packages/cli/src/install.ts`; `packages/core/src/fs-security.ts`; `packages/core/src/catalog.ts` | `packages/cli/src/install.integration.test.ts` target and managed symlink, path traversal, immutable precondition, and TOCTOU cases; `packages/core/src/catalog-security.test.ts` | fixed |
| AWF-016 | medium | Post-install guidance does not explain adapter-specific invocation and validation. | confirmed | `packages/cli/src/index.ts`; `docs/guide/cli-reference.md`; `docs/guide/installation.md` | `packages/cli/src/index.test.ts` adapter-specific invocation guidance and manual-policy cases; `scripts/delivery-contracts.test.ts` installation guidance contract | fixed |
| AWF-017 | high | Adapter support is hardcoded instead of derived from retained evidence. | confirmed | `packages/core/src/adapter-registry.ts`; `scripts/generate.ts`; `docs/compatibility.md`; `docs/guide/verification.md` | `packages/core/src/adapter-registry.test.ts` evidence and fail-closed support cases; `packages/core/src/core.test.ts` serializer matrix | fixed |
| AWF-018 | high | Adapter contracts do not verify complete current vendor formats and discovery behavior. | confirmed | `packages/core/src/adapters.ts`; `packages/core/src/adapter-registry.ts`; `docs/research/adapter-sources.md`; `docs/compatibility.md` | `packages/core/src/core.test.ts` local YAML, TOML, asset, and policy contracts; `packages/cli/src/install.integration.test.ts` temporary installation contract | blocked-external |
| AWF-019 | high | Recipe compatibility models serialization instead of required agent capabilities. | confirmed | `packages/core/src/schema.ts`; all `recipes/*/recipe.yml`; `docs/guide/verification.md`; `generated/catalog.schema.json` | `packages/core/src/verification.test.ts` bundle-versus-capability cases; `packages/core/src/schema-hardening.test.ts` capability limitation invariants | fixed |
| AWF-020 | critical | Verification states are manually asserted and permit impossible combinations. | confirmed | `packages/core/src/schema.ts`; `scripts/generate.ts`; `docs/guide/verification.md`; `verification/schema.json` | `packages/core/src/verification.test.ts` stage-ordering cases; `scripts/verification-evidence.test.ts` aggregation, staleness, and supersession cases | fixed |
| AWF-021 | high | The compatibility matrix conflates local and external verification dates. | confirmed | `scripts/generate.ts`; `docs/compatibility.md`; `docs/guide/verification.md` | `pnpm exec tsx scripts/generate.ts compatibility --check`; generated matrix column review | fixed |
| AWF-022 | high | Verification evidence is not tamper-evident or sufficiently tied to source and CI. | confirmed | `packages/core/src/schema.ts`; `scripts/generate.ts`; `verification/schema.json`; `docs/guide/verification.md` | `scripts/verification-evidence.test.ts` artifact tampering, source digest, staleness, duplicates, supersession, and precedence cases | fixed |
| AWF-023 | high | CLI code and critical option semantics lack adequate coverage. | confirmed | `packages/cli/src/context.test.ts`; `packages/cli/src/index.test.ts`; `packages/cli/src/io.test.ts`; `packages/cli/src/install.integration.test.ts` | CLI unit and integration suites cover discovery, display safety, strict validation, doctor, lifecycle, signals, JSON, and `NO_COLOR` behavior | fixed |
| AWF-024 | medium | Editorial validation relies on length and checkbox-count proxies. | confirmed | `packages/core/src/content-validation.ts`; `packages/core/test-fixtures/content-validation/cases.json`; `docs/quality/recipe-quality-standard.md` | `packages/core/src/content-validation.test.ts` semantic structure, decision, recovery, output, evidence, and checklist fixtures | fixed |
| AWF-025 | high | Recipes do not declare machine-validatable output contracts. | confirmed | all `recipes/*/output.schema.json`; all `recipes/*/recipe.yml`; `packages/core/src/output-contract.ts` | `packages/core/src/output-contract.test.ts`; `packages/core/src/content-validation.test.ts` output-contract fixtures | fixed |
| AWF-026 | medium | Public release notes and internal evidence are mixed into one artifact. | confirmed | `recipes/write-release-notes/output.schema.json`; `recipes/write-release-notes/examples/expected-output.md`; `recipes/write-release-notes/workflow.md` | `packages/core/src/output-contract.test.ts` fenced-artifact boundaries; `packages/core/src/content-validation.test.ts` expected-output validation | fixed |
| AWF-027 | high | The twenty recipes retain editorial inconsistencies and excessive boilerplate. | confirmed | all seven required files across `recipes/**`; `docs/quality/recipe-audit.md`; `docs/quality/content-similarity.md` | `packages/core/src/content-validation.test.ts`; current 20-recipe disposition matrix; `pnpm audit:similarity` gate contract | fixed |
| AWF-028 | medium | The similarity report can imply stronger editorial assurance than it provides. | confirmed | `scripts/audit-similarity.ts`; `docs/quality/content-similarity-reviews.yml`; `docs/quality/content-similarity.md` | fail-closed review-currency path in `scripts/audit-similarity.ts`; generated 1,140-comparison report review | fixed |
| AWF-029 | critical | Release automation publishes directly and produces incomplete source artifacts. | confirmed | `.github/workflows/release.yml`; `scripts/release-artifacts.ts`; `scripts/check-clean-worktree.ts` | `scripts/release-artifacts.test.ts` identity, archive metadata, checksum, and provenance cases; `scripts/delivery-contracts.test.ts` draft-release gate | fixed |
| AWF-030 | critical | Pages publication is not explicitly gated on the complete quality pipeline. | confirmed | `.github/workflows/docs.yml`; `.github/workflows/ci.yml`; `.github/workflows/validate-recipes.yml` | `scripts/delivery-contracts.test.ts` Pages dependency and complete-quality-gate case | fixed |
| AWF-031 | high | Generator subcommands do not isolate their declared outputs. | confirmed | `scripts/generate.ts`; `scripts/generate.test.ts`; `generated/artifact-manifest.json`; `package.json` | `scripts/generate.test.ts` isolated targets, full artifact manifest, source digest, and fork-environment stability cases; target-specific generator checks | fixed |
| AWF-032 | high | Packaged CLI and catalog behavior are not smoke-tested from a tarball. | confirmed | `scripts/package-smoke.ts`; `scripts/prepare-cli-package.ts`; `packages/cli/package.json`; `packages/core/package.json` | `scripts/package-smoke.ts` installs both tarballs and exercises version, catalog, bundle install, conflicts, update, validation, links, metadata, and removal | fixed |
| AWF-033 | medium | The Node.js minimum version lacks an explicit necessity decision. | confirmed | `docs/decisions/0002-node-runtime-baseline.md`; `package.json`; `packages/cli/package.json`; `packages/core/package.json`; `.github/workflows/ci.yml` | `scripts/delivery-contracts.test.ts` runtime-floor consistency case; Node.js 22 compatibility job contract | fixed |
| AWF-034 | medium | Quick-start and public README paths are not optimized for verified onboarding. | confirmed | `README.md`; `README.pt-BR.md`; `docs/guide/installation.md`; `packages/cli/README.md`; `packages/core/README.md` | `scripts/delivery-contracts.test.ts` HTTPS-first and honest-claim onboarding case; `scripts/check-links.ts` | fixed |
| AWF-035 | high | The primary demonstration does not show an evaluated workflow outcome. | confirmed | `scripts/demo-cli.ts`; `scripts/demo-fixture-agent.ts`; `docs/launch/demo-script.md`; `docs/launch/reference-evaluations.md` | `scripts/demo-fixture-agent.test.ts`; `scripts/delivery-contracts.test.ts` explicit fixture-agent invocation, three-reference evaluation, and evidence-boundary cases; deterministic output-contract evaluation in `scripts/demo-cli.ts` | fixed |
| AWF-036 | medium | Link checking and site metadata do not cover anchors, exports, and fork configuration. | confirmed | `scripts/check-links.ts`; `scripts/check-external-links.ts`; `.github/workflows/external-links.yml`; `docs/.vitepress/config.ts`; `scripts/docs-site.ts`; `scripts/docs-site.test.ts`; `scripts/generate.ts`; package manifests | `scripts/check-external-links.test.ts`; `scripts/docs-site.test.ts` root and GitHub-fork URL cases; `scripts/generate.test.ts` fork-environment no-drift case; `scripts/delivery-contracts.test.ts`; `scripts/package-smoke.ts` packaged exports | fixed |
| AWF-037 | medium | Maintenance, localization, maintainer identity, and security guidance are inconsistent. | confirmed | `MAINTAINERS.md`; `packages/core/src/maintainer-registry.ts`; `CONTRIBUTING.md`; `SECURITY.md`; `README.md`; `README.pt-BR.md` | `scripts/delivery-contracts.test.ts` bilingual critical-claim contract; `packages/core/src/schema-hardening.test.ts` maintainer identity case; `scripts/check-links.ts` | fixed |
| AWF-038 | high | Schemas permit duplicate, untrimmed, or unresolved metadata values. | confirmed | `packages/core/src/schema.ts`; `generated/recipe.schema.json`; `generated/catalog.schema.json`; `packages/core/src/maintainer-registry.ts` | `packages/core/src/schema-hardening.test.ts` 36 schema cases; `packages/core/src/core.test.ts` duplicate, whitespace, and impossible-state cases | fixed |
| AWF-039 | medium | Recipe scaffolding is not transactional and omits current contracts. | confirmed | `scripts/new-recipe.ts`; `docs/guide/contributing.md`; `CONTRIBUTING.md` | `scripts/new-recipe.test.ts` complete v3 bundle, existing destination, and injected rollback cases | fixed |
| AWF-040 | high | Project-root discovery treats nested package manifests as authoritative roots. | confirmed | `packages/cli/src/context.ts`; `packages/cli/src/index.ts` | `packages/cli/src/context.test.ts` repository, workspace, initialized project, explicit root, package opt-in, and worktree cases | fixed |
| AWF-041 | high | Catalog size and concurrency are not bounded for untrusted input. | confirmed | `packages/core/src/catalog.ts`; `packages/core/src/catalog-concurrency.ts`; `packages/core/src/fs-security.ts`; `packages/core/src/content-validation.ts` | `packages/core/src/catalog-security.test.ts` recipe, file, byte, catalog, configuration, and peak-concurrency limits; `packages/core/src/content-validation.test.ts` aggregate size, symlink, and bounded-link cases | fixed |
| AWF-042 | low | Generated catalog pages may duplicate complete examples inefficiently. | confirmed | `scripts/generate.ts`; generated `docs/catalog/*.md` | target-specific documentation generation and current site-size review | accepted-risk |
| AWF-043 | high | Additional version, temp-file, config, manifest, and generated-drift defects remain. | confirmed | `packages/cli/src/version.ts`; `packages/cli/src/index.ts`; `packages/core/src/schema.ts`; `scripts/check-clean-worktree.ts`; `scripts/generate.ts`; `generated/artifact-manifest.json`; publishing workflows | `packages/cli/src/index.test.ts`; `packages/core/src/schema-hardening.test.ts`; `scripts/generate.test.ts`; `scripts/delivery-contracts.test.ts` version, temp-file, config, full generated-manifest, freshness, and drift contracts | fixed |

## Accepted risks

### AWF-042 retains complete examples in generated catalog pages

Technical rationale: each generated recipe page remains a self-contained static reference with its workflow, output contract, input, and expected output, without a runtime fetch or JavaScript dependency.

Impact: the generated documentation duplicates source text and increases repository, search-index, and Pages artifact size linearly with the catalog.

Mitigation: `recipes/` remains the only authored source, `scripts/generate.ts` owns every duplicated page, generated drift is gated, and the current 20-page catalog occupies approximately 648 KiB on disk.

Accountable role: `project-maintainers`.

Future review criterion: reopen this decision when the catalog reaches 40 recipes or a measured documentation build, search-index, or Pages-size regression is attributed to embedded examples.

## Editorial remediation notes

### AWF-018 is blocked externally

Local tests parse the repository's generated YAML and TOML, validate required frontmatter and policy fields, resolve complete bundle assets, reject unsafe interpolation, and exercise installation in temporary directories.
Those are project-owned serializer and installation contracts, not proof that a vendor consumer parsed or discovered the result.
Consumer parsing, fresh-session discovery, explicit-only invocation behavior, external execution, and outcome review require the corresponding vendor binaries, exact versions, and retained run artifacts.
Retained Claude Code and Codex runs now prove explicit discovery, parsing, and execution for `review-pull-request` at the recorded versions.
They do not prove implicit-invocation blocking, every recipe, future versions, Cursor, Gemini CLI, OpenCode, or any human outcome review.
AWF-018 therefore remains `blocked-external` for complete vendor coverage without weakening the passing local and recipe-specific external facts.

### AWF-021

The generated compatibility matrix now has distinct columns for local serializer and installation lifecycle dates, external execution dates, human outcome-review dates, and tested agent versions.
Missing local attestations are reported as `not retained` instead of borrowing an external date or inventing a timestamp.

### AWF-024

The content validator no longer uses the baseline 20-character section, 1,200-character example, 12-checkbox, or three-checklist-section thresholds as quality claims.
It now checks named non-empty sections, conditional decisions, paired failures and recoveries, non-copied checklist controls, self-contained evidence inventories, output contracts, evidence references, and concrete verification wording.
The remaining token-overlap check is explicitly a metadata representation heuristic rather than a semantic pass claim.

### AWF-025

Every recipe now declares an `output_contract` backed by `output.schema.json`.
The 20-recipe compatibility target check loaded the current catalog and validated each declared artifact, populated required heading, populated required table, literal, and evidence-cardinality contract before checking the generated matrix.

### AWF-026

`write-release-notes` uses a fenced-file contract with separate `release-notes.md` and `release-evidence.md` artifacts.
The public artifact forbids internal evidence references, while the internal artifact requires them.

### AWF-027

All 20 recipes were re-reviewed across their seven required source files.
The current maintainer self-assessment records the per-recipe disposition and remaining limitations without advancing execution or outcome status.

### AWF-028

Manual similarity reviews now require reviewer identity, review date, rationale, disposition, and a SHA-256 digest of the exact two current source surfaces.
A source change makes the retained review stale.
The command regenerates its report and fails when any row at or above the lexical threshold lacks a current review.
The report states explicitly that the heuristic is triage only and does not prove semantic quality or originality.

### AWF-035

The primary demonstration reproducibly evaluates the maintained reference outputs for `debug-failing-ci`, `review-pull-request`, and `synchronize-documentation` against their current output contracts.
The retained reference record traces a material claim in each output to its supplied input evidence.
The demonstration also invokes an explicit deterministic fixture agent to produce a new `review-pull-request` artifact and validates that artifact before exercising lifecycle protections.
These checks establish source-level editorial and contract quality only.
The fake-agent demonstration itself does not promote external execution or human outcome review.
Separate retained Claude Code and Codex records promote only the recipe-specific execution stage, while outcome remains `untested`.

## Focused verification for this re-evaluation

The following commands were executed against the mutable working tree during this re-evaluation.

- `pnpm exec vitest run packages/core/src/core.test.ts packages/core/src/adapter-registry.test.ts packages/core/src/verification.test.ts packages/core/src/content-validation.test.ts packages/core/src/output-contract.test.ts packages/core/src/schema-hardening.test.ts packages/core/src/catalog-security.test.ts packages/cli/src/context.test.ts docs/.vitepress/theme/components/catalog-filter.test.ts scripts/new-recipe.test.ts scripts/release-artifacts.test.ts scripts/delivery-contracts.test.ts scripts/check-external-links.test.ts scripts/verification-evidence.test.ts` passed 184 tests in 14 files.
- `pnpm exec tsx scripts/generate.ts schema --check` verified the schema target without reporting stale artifacts.
- `pnpm exec tsx scripts/generate.ts compatibility --check` verified the compatibility target for all 20 recipes without reporting stale artifacts.
- `pnpm check:links` checked paths and anchors in 50 Markdown files.

The table names additional existing test contracts where relevant, but this section is the complete command-execution claim for this re-evaluation.

## Final integrated verification

After external evidence integration and the two resulting CLI fixture corrections, the complete local matrix produced these results.

- Dependency preparation: `corepack enable` and `pnpm install --frozen-lockfile` passed.
- Static quality: format, lint, typecheck, and whitespace checks passed.
- Unit and coverage: 339 of 339 tests passed, with 88.60 percent statement and line coverage, 85.91 percent branch coverage, and 97.70 percent function coverage.
- Integration: 50 of 50 installation lifecycle and adapter contract tests passed.
- Recipe validation: all 20 recipes passed strict structural and content validation.
- Similarity: 1,140 recipe surfaces were compared with zero threshold warnings, stale reviews, or unresolved reviews.
- Generation: catalog, schema, full artifact generation, and the deterministic freshness check passed.
- Delivery: build, documentation build, CLI acceptance, fixture verification, package smoke tests, tarball smoke tests, and the deterministic demo passed.
- Links: all internal paths and anchors in 50 Markdown files passed, and all 16 allowlisted external links had fresh passing cache records.
- External execution: retained Claude Code 2.1.209 and Codex CLI 0.144.4 runs passed explicit `review-pull-request` execution and deterministic output-contract validation.
- Outcome review: every external outcome remains `untested`, and no compatibility claim was promoted from execution alone.

The documentation build retained a non-blocking chunk-size warning covered by accepted risk AWF-042.
