---
layout: page
title: Workflow catalog
description: Browse evidence-oriented workflow bundles and their honest verification states.
---

<script setup>
import CatalogExplorer from '../.vitepress/theme/components/CatalogExplorer.vue'
import catalog from '../../generated/catalog.json'
</script>

# Workflow catalog

Browse all 20 structured workflows.
Filters run locally and send no data anywhere.

<CatalogExplorer :recipes="catalog" />

Without JavaScript, every workflow remains available through the links below.

- [Review an API contract change](./api-contract-review) - Produce a wire-level compatibility matrix, client-impact register, and evidence-based API rollout decision.
- [Build an evidence-based codebase onboarding guide](./codebase-onboarding) - Produce a role-specific guide from an immutable repository snapshot with verified setup, traced architecture, safe edit boundaries, and a bounded first contribution.
- [Review a database migration](./database-migration-review) - Produce an engine-specific migration risk assessment, staged rollout, approval package, and recovery guidance.
- [Diagnose and correct a failing CI job](./debug-failing-ci) - Produce an evidence-backed CI diagnosis, minimal causal patch, and verification matrix without weakening the failed control.
- [Audit dependency risk](./dependency-audit) - Produce a reproducible dependency inventory and risk plan separating affected versions from application reachability.
- [Produce an evidence-backed API reference](./document-api) - Produce a versioned API reference, executable-example status, and discrepancy register from a fixed public contract and matching evidence.
- [Record an evidence-backed architecture decision](./generate-adr) - Produce a reviewable ADR that separates facts from assumptions, compares viable options consistently, records accountable approval, and defines consequences and revisit triggers.
- [Add behavior-focused regression tests](./generate-tests) - Implement risk-ranked tests at observable boundaries and prove that each test detects its intended regression without coupling to private implementation.
- [Harden an untrusted TypeScript boundary](./improve-type-safety) - Replace unchecked type assumptions with runtime narrowing and verified state models while preserving documented public behavior and compatibility.
- [Produce an evidence-linked blameless incident postmortem](./incident-postmortem) - Produce a bounded incident learning record with impact, timeline, causal confidence, organizational conditions, and verifiable corrective actions.
- [Migrate a framework through controlled vertical slices](./migrate-framework) - Move a versioned application to a supported framework through coexistence, contract checkpoints, measured traffic stages, and retained rollback.
- [Measure and assess a performance change](./profile-performance) - Produce a reproducible performance assessment when evidence is complete or an explicit blocked handoff when required measurement or profile records are missing.
- [Refactor a large module through reversible slices](./refactor-large-module) - Decompose one change-coupled module into cohesive boundaries while preserving its evidenced public contract at every independently reversible checkpoint.
- [Build a bounded bug reproduction](./reproduce-bug) - Produce a sanitized repository-bound reproducer, behavior-specific failing regression test, and repeatability record without changing product behavior.
- [Review a pull request](./review-pull-request) - Produce an evidence-linked pull request review with prioritized findings, executed checks, and a defensible merge verdict.
- [Perform a defensive security review](./security-review) - Produce an authorized defensive security assessment with evidence-ranked findings, remediation, and residual risk.
- [Synchronize documentation with verified behavior](./synchronize-documentation) - Produce a bounded documentation patch and claim-to-evidence register for behavior that changed at an immutable revision.
- [Triage a bounded repository issue queue](./triage-issues) - Produce policy-linked issue dispositions, duplicate evidence, proposed responses, and closure criteria from an immutable queue snapshot.
- [Upgrade dependencies with provenance and rollback](./upgrade-dependencies) - Deliver a scoped dependency upgrade with a reviewed version-range contract, deterministic lockfile diff, supported-environment results, and exercised rollback.
- [Produce evidence-backed release notes](./write-release-notes) - Produce public Markdown release notes and a separate internal evidence package from an immutable, reviewed release evidence set.
