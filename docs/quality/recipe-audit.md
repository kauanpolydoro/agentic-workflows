# Maintainer self-assessment of recipe quality

This page is a retained audit record.
It preserves the exact claims, hashes, and command results of one specific review, so its wording is deliberately precise rather than introductory.
If you want the newcomer-friendly explanation of what these checks mean, start with the [verification model](../guide/verification.md).

## Assessment identity and limits

This document is a maintainer-authored source review, not an independent external-agent execution or outcome review.
It distinguishes the historical baseline at commit `cbe8c9dd7c48f945711f2cd52b9ef01748fccb1e` from the current editorial working tree.

The assessed original 20-recipe schema version 3 corpus has SHA-256 `3d414fcc60481236b9002a22cbd5f036b1315fd68522e896fb488a12a476449a`.
It was calculated from the ordered `sha256sum` records for every file under that retained corpus after its final editorial changes.
The repository commit containing this report binds that exact historical corpus snapshot to an immutable source revision.
Repository publication still requires the complete quality pipeline to pass against the integrated revision.

This assessment does not advance installation, external-agent execution, or outcome-review status.
Those states require separate retained evidence and must not be inferred from a maintainer editorial review.

## Working-tree addition after the retained assessment

The retained corpus hash, matrices, and integrated verification below cover the original 20-recipe schema version 3 assessment snapshot.
The current working tree migrates those 20 bundles to schema version 4 and adds `resolve-github-issues` as the twenty-first recipe bundle, with seven-file recipe-content SHA-256 `08937a53ed476ca574a716b62832872f8ddd65466da30125c17348db9396fb09`.
That digest uses the repository's `hashNamedContent` contract over sorted relative filenames and their UTF-8 contents with null separators.

Multiple independent agent reviews challenged the new bundle, but they did not substitute for the human editorial gate in the recipe quality standard.
On 2026-07-22, the repository maintainer completed both required human reviews against this frozen working tree.
The retained attestation confirms that every original-recipe migration is limited to the schema version, recipe patch version, and correct conservative `supervised` classification without an `autonomy` contract.
It also confirms a complete domain review of all seven `resolve-github-issues` source files at recipe-content SHA-256 `08937a53ed476ca574a716b62832872f8ddd65466da30125c17348db9396fb09`, with no remaining publication-blocking editorial finding.
This attestation establishes editorial readiness only and does not imply installation, external-agent execution, or outcome verification.

The frozen working tree passed the complete local automated pipeline on 2026-07-22.
`pnpm build`, strict validation for all 21 recipes, content validation, deterministic generation check, lint, formatting, typecheck, link checking, documentation build, CLI automation, fixtures, acceptance, shell completion, package smoke, and the exact v0.2.2 lifecycle upgrade smoke all completed successfully.
The unit suite passed 472 tests in 30 files, coverage passed the same 472 tests with 91.97 percent statements, 85.65 percent branches, 95.09 percent functions, and 92.57 percent lines, and the integration suite passed 58 tests.
Similarity review compared 1,260 recipe surfaces with no threshold crossing, stale review, or unresolved current-content review.
The documentation build retained the known non-blocking VitePress chunk-size warning.
These automated results establish structural and repository-level validation only.
The separate maintainer attestation closes the two human editorial gates without advancing installation, external-agent execution, or outcome evidence.

| Recipe | Adversarial findings | Primary files changed | Current decision | Remaining limitation and status justification | Status |
| --- | --- | --- | --- | --- | --- |
| Original 20 recipes, current schema version 4 variants | The mechanical migration changes bundle identity and adds a semantic `supervised` classification that the retained schema version 3 review did not assess | The 20 `recipe.yml` files | Require schema version 4, bump each recipe patch version, and use the conservative `supervised` mode without an `autonomy` contract | The repository maintainer completed the cross-cutting review on 2026-07-22 and confirmed the migrations are limited to the reviewed fields with the correct classification | pass |
| `resolve-github-issues` | The initial design needed finite intake, complete pagination, durable distributed ownership, bounded retries and deadlines, safe remote-content handling, exact review boundaries, UX-aware triage, post-merge outcome verification, and race-safe closure plus cleanup | All seven recipe source files | Freeze one explicitly authorized finite cohort; coordinate through shared fenced compare-and-swap leases; treat remote content as untrusted evidence; exhaust nested API records; separate delivery state, delivery actor, tracker, closure, work, cleanup, and integration state; support direct squash merge only; use non-closing issue references; run smoke before manual closure; isolate workers and fresh reviewers; and use exact-OID cleanup | The repository maintainer completed the human domain review on 2026-07-22 against the recorded digest with no publication-blocking editorial finding; installation, external-agent execution, and outcome review remain untested | pass |

The historical schema version 3 dispositions remain `pass` for their retained digest only.
The current schema version 4 variants and the autonomous bundle are editorially ready for publication at the recorded working-tree identities.
If a recipe source file changes, this addendum's digest must be refreshed and the affected human review repeated before publication.

## Historical baseline at `cbe8c9d`

Commit `cbe8c9d` already contained the result of an evidence-quality remediation under the subject `feat: enforce evidence-based recipe quality`.
It therefore cannot also serve as evidence for the undocumented pre-remediation state described by the former audit narrative.

The baseline tree contained 20 recipe directories.
Its loader required six files per recipe: `recipe.yml`, `workflow.md`, `README.md`, `checklist.md`, `examples/input.md`, and `examples/expected-output.md`.
All 120 files required by that six-file contract were present.

The current seven-file contract additionally requires `output.schema.json`.
Measured against that final contract, the baseline was missing exactly 20 files, one `output.schema.json` in every recipe directory.

The affected recipe IDs were:

- `api-contract-review`;
- `codebase-onboarding`;
- `database-migration-review`;
- `debug-failing-ci`;
- `dependency-audit`;
- `document-api`;
- `generate-adr`;
- `generate-tests`;
- `improve-type-safety`;
- `incident-postmortem`;
- `migrate-framework`;
- `profile-performance`;
- `refactor-large-module`;
- `reproduce-bug`;
- `review-pull-request`;
- `security-review`;
- `synchronize-documentation`;
- `triage-issues`;
- `upgrade-dependencies`; and
- `write-release-notes`.

This difference was evolutionary rather than a violation of the baseline loader, because the baseline repository instructions still limited recipe content to YAML and Markdown.

## Baseline editorial shape

The baseline examples were not one-sentence scaffolds.
Inputs ranged from 29 to 131 lines, expected outputs ranged from 25 to 92 lines, workflows ranged from 93 to 158 lines, READMEs ranged from 37 to 66 lines, and checklists ranged from 22 to 37 lines.

Every workflow contained the 15 canonical sections.
Every README contained the eight required orientation sections.
Every input defined between four and nine evidence IDs, and every expected output referenced exactly the set defined by its input.

Those structural strengths did not establish evidence completeness.
Nineteen of the 20 inputs contained no explicit evidence-type or integrity field, and only `write-release-notes` used full 40-character source identities.
Eighteen inputs contained no fenced source artifact, so contracts, logs, diffs, and command records were commonly represented by summaries rather than complete retained material.

The baseline metadata also overstated support.
All 20 recipes declared structural status manually as `passing`, one recipe declared installation as `passing`, and the corpus contained 120 agent compatibility declarations marked `compatible` with 120 empty limitation lists.
No recipe declared an effects model or a machine-validatable output contract.

The baseline used standardized prose in clusters rather than one identical short template.
Several README, workflow, and checklist sentences were repeated across seven or more recipes, while domain-specific sections and examples still differed.
The former claim that every README was the same pointer and every checklist copied its workflow was therefore too broad.

No separate retained artifact records a complete initial `needs-work` matrix before the changes already present in `cbe8c9d`.
The former claim that all recipes initially received that status cannot be independently reconstructed from this baseline tree.

## Baseline validator limits

The baseline content validator enforced useful structure but relied heavily on proxies.
It accepted a workflow section after 20 characters, considered metadata represented when 50 percent of normalized tokens appeared, required 12 checklist items and three checklist sections, and treated 1,200 characters plus three output sections as completeness signals.

The baseline similarity audit compared three whole-file surfaces across 570 pairs.
It retained only the top 30 rows, used a 0.250 lexical threshold, did not fail on an unresolved warning, and did not bind a manual review to reviewer identity, date, or current-content digest.
Rows below the threshold were labeled `acceptable` even though the heuristic could not determine semantic quality.

These validators could establish formatting, minimum structure, evidence-ID consistency, and some metadata-to-document token overlap.
They could not prove derivability, provenance, operational completeness, originality, or outcome quality.

## Baseline command evidence

The baseline tree retains bounded evidence for `pnpm test:integration` in the adapter installation record, which reports 10 passing integration tests on Linux with Node.js 24.13.1.
It also retains a generic installation record for `pnpm build` and `pnpm test:acceptance`, with the acceptance script reporting success in a disposable directory.
That generic record names recipe version 1.0.0 while the baseline recipe metadata is version 1.1.0, so it proves only the bounded run it describes.

The baseline audit stated that recipe validation, unit tests, and integration tests passed globally.
The tree does not retain a global command log, CI run identifier, environment record, or result artifact for `pnpm validate:recipes` or `pnpm test`.
GitHub workflow definitions show that commands were configured, but configuration is not proof that a run succeeded.

The materialized similarity report records 570 comparisons and no threshold warning.
It does not retain enough execution provenance to serve as an independent global command result.

The honest baseline statement is therefore limited to the two bounded verification records above.
No complete baseline quality-pipeline pass can be claimed from the retained tree alone.

## Retained 20-recipe review method and status semantics

The retained review covers the seven source artifacts in each of the original 20 recipe bundles.
It traces expected-output claims to input evidence, reviews workflow actions and decisions, checks failure and recovery pairing, challenges approvals and safety boundaries, and reconciles metadata effects with output contracts.

The retained adversarial remediation added output schemas, stronger evidence provenance, explicit effects, honest verification-state separation, complete or explicitly blocked examples, and domain-specific decision records.
The similarity process now treats lexical overlap as triage and requires any threshold review to match the exact current pair content.

The working tree changed after intermediate validation runs, so this report does not present those runs as final immutable verification.
The final integrator must run the complete required command set after source generation and bind the results to the final revision.

`pass` below means that the assessed recipe-source contract had no known unresolved editorial blocker after the recorded adversarial decision.
It does not mean the generated catalog is current, an adapter was installed, an external agent executed the workflow, or an outcome passed independent review.

## Retained 20-recipe quality matrix

| Recipe | Input complete | Output derivable | Workflow operational | Decisions explicit | Safety adequate | Checklist useful | README complete | Adapter metadata valid | Historical final status (schema version 3) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `api-contract-review` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `codebase-onboarding` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `database-migration-review` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `debug-failing-ci` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `dependency-audit` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `document-api` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `generate-adr` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `generate-tests` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `improve-type-safety` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `incident-postmortem` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `migrate-framework` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `profile-performance` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `refactor-large-module` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `reproduce-bug` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `review-pull-request` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `security-review` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `synchronize-documentation` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `triage-issues` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `upgrade-dependencies` | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| `write-release-notes` | pass | pass | pass | pass | pass | pass | pass | pass | pass |

Each `pass` in this summary uses the source-level status semantics above.
The detailed matrix below records the primary problem, reviewed files, decision, remaining limitation, and justification for each final status.

## Retained 20-recipe disposition matrix

All seven source files were changed in every recipe during this remediation.
The file column below identifies the primary changed files that carry each recorded decision.

| Recipe | Baseline or adversarial problem | Primary files changed | Current decision | Remaining limitation and pass justification | Status |
| --- | --- | --- | --- | --- | --- |
| `api-contract-review` | Contract fragments, unsupported client conclusions, and an underspecified rollout baseline | `workflow.md`; `examples/input.md`; `examples/expected-output.md`; `output.schema.json` | Require complete released and candidate contracts, distinguish parser contracts from executed failures, and bind the 404 threshold to its exact interval, sample, formula, and signal | Null-email monitoring remains absent, so traffic stays blocked; the endpoint and 1.5 percent value are now described consistently as the versioned 404 parse-failure rate | pass |
| `codebase-onboarding` | Architecture, ownership, setup results, and starter-task facts lacked per-item provenance | `examples/input.md`; `examples/expected-output.md`; `workflow.md`; `README.md` | Tie each evidence item to the repository revision, retained origin, execution environment, covered scope, and explicit limitation | Integration testing remains unexecuted because Docker and PostgreSQL are unavailable; the guide reports that boundary instead of inventing access | pass |
| `database-migration-review` | DDL, engine context, workload, coexistence, lock behavior, abort conditions, and recovery evidence were incomplete | all seven recipe files | Require exact migration artifacts, mixed-version behavior, rehearsal controls, monitoring queries, owner gates, and reversible stages | Production execution remains prohibited; rehearsal evidence is sufficient only for the bounded review artifact | pass |
| `debug-failing-ci` | The causal error, producer command, rerun boundary, and external-CI state were previously conflated | all seven recipe files | Separate the raw first causal error, controlled clean reproduction, adjacent checks, and proposed external confirmation | The result is bounded to the retained clean sequence and does not claim an external CI rerun | pass |
| `dependency-audit` | Package identity and reachability classification were incomplete, proposed verification exceeded the command inventory, and the immutable revision was abbreviated | `workflow.md`; `examples/input.md`; `examples/expected-output.md`; `output.schema.json` | Bind the packaged inventory to a full 40-character revision, use explicit reachability values, and include the advisory-match and static-template checks in the proposed command sequence | No runtime experiment proves non-reachability; the finding remains an affected-version observation with `Not observed` reachability | pass |
| `document-api` | Response media types and follow-up ownership were not completely derived from supplied evidence, and the immutable revision was abbreviated | `examples/input.md`; `examples/expected-output.md`; `workflow.md`; `output.schema.json` | Bind the reference to a full 40-character revision, state `application/json` for success and error responses, and assign the optional sandbox action to the supplied API owner | The direct curl request remains unexecuted and is not conflated with the passing contract fixture | pass |
| `generate-adr` | A resource revisit trigger was qualitative rather than measurable, and the synthetic repository snapshot used an abbreviated revision | `examples/input.md`; `examples/expected-output.md`; `workflow.md` | Bind the snapshot to a full 40-character revision and define reopening after three consecutive runs exceed 60 seconds wall-clock or 1 GiB peak RSS on the pinned runner | The approval date and amendment procedure remain unavailable and are disclosed | pass |
| `generate-tests` | Target behavior, source, seam, test patch, and mutation evidence were insufficiently attributable | all seven recipe files | Require target code, observable contract, framework seam, named test changes, mutation challenge, and exact command evidence | Disputed behavior remains excluded until the responsible maintainer approves the contract | pass |
| `improve-type-safety` | Compile-time narrowing and a bounded token search risked being presented as complete runtime and syntax analysis | all seven recipe files | Preserve exact runtime fixtures and patches, derive implicit-any status from strict typecheck, and name each lexical inventory result by the exact searched pattern | The example remains synthetic and makes no claim beyond its retained compiler, behavior, and bounded lexical-search results | pass |
| `incident-postmortem` | Timeline, impact, causal confidence, contributing conditions, and action closure were not independently traceable | all seven recipe files | Separate observed chronology, causal inference, organizational conditions, approvals, and measurable corrective-action gates | Causal isolation remains incomplete and is labeled as uncertainty rather than certainty | pass |
| `migrate-framework` | Baseline and target observations did not prove like-for-like measurement, and the source and artifact identity used an abbreviated revision | `examples/input.md`; `examples/expected-output.md`; `workflow.md` | Use a full 40-character identity plus the same node class, runtime, request generator, load, distribution, metric definitions, telemetry query, and concurrent-work boundary across Express and Fastify | Only staging S0 is observed; production traffic and full migration remain blocked by named gates | pass |
| `profile-performance` | Raw stability samples and a complete attributable profiler capture are unavailable | `recipe.yml`; `README.md`; `workflow.md`; `checklist.md`; `examples/expected-output.md`; `output.schema.json` | Contract the example as an F6 evidence-gap handoff and prohibit accept, reject, merge, or tradeoff recommendations until recovery evidence exists | Timing calculations remain provisional; the recipe passes because the blocked artifact is complete and honest | pass |
| `refactor-large-module` | Metadata promised a code change set that a Markdown-only output contract did not serialize, and caller search was too narrow | `recipe.yml`; `README.md`; `workflow.md`; `checklist.md`; `examples/input.md`; `examples/expected-output.md`; `output.schema.json` | Treat code and tests as version-control effects, contract one Markdown delivery record, require immutable checkpoint diff identities, and search repository-wide callers and exports | External consumers remain unknown, so the compatibility facade cannot be removed | pass |
| `reproduce-bug` | A three-attempt sample was promoted to universal deterministic recurrence, and the supplied environment was called fully identified | `recipe.yml`; `README.md`; `workflow.md`; `checklist.md`; `examples/expected-output.md` | Classify the result as consistently reproduced in the bounded 3-of-3 clean sample and name only the recorded environment fields | The record does not establish future recurrence, root cause, browser behavior, a fix, Linux distribution, kernel, or pnpm version | pass |
| `review-pull-request` | Revision IDs were abbreviated and confidence values lacked reviewable rationale | `workflow.md`; `examples/input.md`; `examples/expected-output.md`; `output.schema.json` | Use complete 40-character commit IDs and tie confidence to the complete diff, contract, and changed-file inventory | The passing narrow test does not cover the required idempotency safety property, so the blocking finding remains open | pass |
| `security-review` | The review revision was not a valid immutable commit identity | `examples/input.md`; `examples/expected-output.md`; `workflow.md` | Bind authorization, inspected paths, route evidence, tests, and remediation to one valid full commit | Exposure remains a static inference and no exploit or deployed-runtime result is claimed | pass |
| `synchronize-documentation` | The proposed edit was not a complete applicable patch, formatting and links lacked an explicit post-application boundary, and the revision was abbreviated | `examples/input.md`; `examples/expected-output.md`; `workflow.md`; `output.schema.json` | Use a full 40-character revision, provide a complete zero-context unified diff, retain a clean-copy applicability result, and identify the separate patched fixture used for formatting and link checks | Package publication and external-agent execution remain outside the bounded documentation scope | pass |
| `triage-issues` | Impact classification risked inventing a platform-wide threshold, and priority risked being implied without approval | `examples/input.md`; `examples/expected-output.md`; `workflow.md`; `output.schema.json` | Keep impact for issues `#12` and `#16` unclassified until policy clarifies whether one quoted-path configuration constitutes supported-platform installation inability, and propose no priority or delivery date without product-owner approval | The policy ambiguity is explicit, duplicate evidence remains high-confidence, and no tracker mutation or unsupported priority is claimed | pass |
| `upgrade-dependencies` | Vendor compatibility claims and lifecycle-script safety lacked complete source records, and the baseline revision was abbreviated | `examples/input.md`; `examples/expected-output.md`; `workflow.md` | Bind the baseline to a full 40-character revision, record unchanged constructors in signed vendor evidence, and bind lifecycle inventories to complete package manifests and install event logs | No security benefit is claimed because no advisory is supplied, and supported-environment evidence remains Linux x64 only | pass |
| `write-release-notes` | Public notes and internal evidence were mixed, allowing internal notation or unsupported claims to leak | `output.schema.json`; `examples/input.md`; `examples/expected-output.md`; `workflow.md` | Declare separate public release notes and internal evidence artifacts with opposite evidence-reference rules | Release-manager approval remains pending and the public artifact stays Draft | pass |

All 20 retained schema version 3 recipe-source dispositions are `pass` under the definition above.
The `profile-performance` example passes as a contracted blocked handoff rather than as a completed performance decision.

## Retained 20-recipe cross-cutting disposition

At the retained 20-recipe assessment snapshot, all 20 recipes used schema version 3 and declared an `output_contract` backed by `output.schema.json`.
The current v0.3.0 candidate migrates those recipes to schema version 4 and assigns an explicit execution mode, but that later migration is outside the retained historical pipeline below.
Recipe effects, adapter serialization, capability assessment, installation, external execution, and outcome review are modeled as separate states.

Structural status is derived from current source and validators rather than manually promoted to an outcome claim.
Installation, external-agent execution, and outcome status remain `untested` unless separate retained evidence supports the specific state.

Historical artifacts record installation and external execution for `review-pull-request` on Claude Code 2.1.209 and Codex CLI 0.144.4.
Their source revision left the repository history during the intentional reset, so they no longer promote current verification claims.
All recipes and external consumers remain externally untested in the current history, and no artifact has a retained human outcome review.

The current similarity gate provides lexical review currency, not semantic proof.
The current maintainer matrix provides editorial disposition, not independent outcome approval.

## Final integrated verification

The final integrator ran the complete local quality pipeline after the externally executed `review-pull-request` bundle was frozen, retained records were added, and the final adversarial changes to other recipes were integrated.

- `corepack enable` and `pnpm install --frozen-lockfile` completed successfully.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `git diff --check` completed successfully.
- `pnpm test` passed 339 tests in 21 files.
- `pnpm test:coverage` passed 339 tests with 88.60 percent statement and line coverage, 85.91 percent branch coverage, and 97.70 percent function coverage.
- `pnpm test:integration` passed 50 lifecycle and adapter-contract tests.
- `pnpm validate`, `pnpm validate:recipes`, and `pnpm validate:content` accepted all 20 recipes with no content issue.
- `pnpm audit:similarity` compared 1,140 surfaces with no threshold warning, stale review, or unresolved review.
- `pnpm generate:catalog`, `pnpm generate:schema`, and `pnpm generate:check` completed successfully, and the all-target generator reported 20 recipes.
- `pnpm build` and `pnpm docs:build` completed successfully.
- `pnpm check:links` checked paths and anchors in 50 Markdown files, and `pnpm check:links:external` checked all 16 allowlisted external links from fresh cache records.
- `pnpm test:acceptance` passed JSON, `NO_COLOR`, spaced-path, and lifecycle-safety checks.
- `pnpm test:fixtures` matched every documented passing and intentionally failing fixture outcome.
- `pnpm test:package` and `pnpm pack:smoke` passed for the two installed tarballs, the 20 bundled recipes, and the managed installation lifecycle.
- `pnpm demo` completed with a deterministic fake agent, three maintained reference contracts, protected update and remove behavior, and explicit disclosure that the fake run is not external execution or human outcome review.

The first unit-test attempt after retaining the external records exposed two obsolete CLI fixture assumptions.
One assumption treated Codex execution as universally untested, and the other copied source-bound verification evidence without the cited Git history.
The fixtures were corrected without weakening production validation, and the targeted 45-test CLI suite passed.

The first complete unit run then exposed one missing documentation dependency in the generator's isolated repository fixture.
Both failing assertions reported the same valid `review-pull-request` compatibility link, so the fixture was corrected to copy the generated compatibility document rather than changing the frozen recipe.
The targeted generator suite passed four of four tests, and the final 339-test unit run passed.

The first CLI acceptance run then found that the packaged catalog omitted `docs/compatibility.md`, even though the frozen recipe linked to it.
The package preparer was corrected to retain that document, preserving the recipe digest, and both the repeated acceptance run and tarball package smoke test passed.

The first Claude evidence candidate passed the deterministic output contract but violated the repository punctuation rule, so it was rejected and rerun with that constraint made explicit.
The verification schema also rejected the initial attempt to reuse one artifact path for both stdout and the produced artifact, so distinct retained files were created before the passing record was generated.
Neither rejected candidate was promoted to outcome status.

The documentation build emitted one non-blocking VitePress warning for a minified chunk larger than 500 kB.
That warning is consistent with accepted risk AWF-042 and does not change any recipe-source disposition.
