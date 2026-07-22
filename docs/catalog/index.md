---
layout: page
title: Workflow catalog
description: Browse every workflow in the catalog and see exactly what has been tested for each one.
---

<script setup>
import CatalogExplorer from '../.vitepress/theme/components/CatalogExplorer.vue'
import catalog from '../../generated/catalog.json'
</script>

# Workflow catalog

All 21 workflows are listed below.
Use the filters to narrow the list; they run entirely in your browser and send nothing anywhere.

This page reflects the v0.3.0 schema version 4 release candidate.
The historical schema version 3 editorial dispositions do not promote these migrated bundles automatically; the migration and the autonomous addition remain pending the human gates recorded in the [recipe audit](../quality/recipe-audit.md).

<CatalogExplorer :recipes="catalog" />

If JavaScript is disabled, you can still reach every workflow through the links below.

- [Review an API contract change](./api-contract-review) - Compare a released API contract with its proposed replacement, trace every wire-level difference to evidence, and deliver a compatibility report, a client-impact register, and a rollout decision.
- [Build an evidence-based codebase onboarding guide](./codebase-onboarding) - Turn a fixed repository snapshot into an onboarding guide a newcomer can trust, with verified setup, traced architecture, safe edit boundaries, and a bounded first task.
- [Review a database migration](./database-migration-review) - Assess a proposed database migration statement by statement for the exact engine version, then plan a staged rollout with approval gates and a rollback or roll-forward recovery package.
- [Diagnose and correct a failing CI job](./debug-failing-ci) - Turn one failing CI job into an evidence-backed diagnosis, a minimal causal patch, and a local and external CI verification matrix, without weakening the failed control.
- [Audit dependency risk](./dependency-audit) - Turn manifests, lockfiles, and dated advisories into a reproducible dependency inventory, a ranked finding register, and a plan that keeps affected versions separate from actual reachability.
- [Produce an evidence-backed API reference](./document-api) - Turn one approved public API contract revision and its matching handler, validator, and test evidence into a versioned reference, an example execution report, and a register of contract discrepancies.
- [Record an evidence-backed architecture decision](./generate-adr) - Write an ADR worth trusting, one that separates facts from assumptions, compares real options on the same criteria, records who approved it, and says when to revisit it.
- [Add behavior-focused regression tests](./generate-tests) - Write regression tests at observable boundaries for the highest-risk behaviors, then prove each test fails when its target behavior breaks, without coupling to private implementation.
- [Harden an untrusted TypeScript boundary](./improve-type-safety) - Replace unchecked type assumptions at an untrusted TypeScript boundary with runtime narrowing and verified state models, keeping documented public behavior and compatibility intact.
- [Produce an evidence-linked blameless incident postmortem](./incident-postmortem) - Build a bounded, blameless incident learning record from retained evidence, covering impact, timeline, causal confidence, organizational conditions, and corrective actions that can be verified.
- [Migrate a framework through controlled vertical slices](./migrate-framework) - Migrate a versioned application to a supported framework through coexisting slices, each held to contract checkpoints and measured traffic stages, with rollback retained throughout.
- [Measure and assess a performance change](./profile-performance) - Measure a performance change and produce a reproducible assessment when the evidence is complete, or an explicit blocked handoff when required measurement or profile records are missing.
- [Refactor a large module through reversible slices](./refactor-large-module) - Split one change-coupled module into cohesive boundaries, one reversible checkpoint at a time, preserving its evidenced public contract and capturing the work in a Markdown refactor delivery record.
- [Build a bounded bug reproduction](./reproduce-bug) - Turn a bug report into a sanitized repository-bound reproduction, a regression test that fails for the reported behavior, and a repeatability record, all without changing product behavior.
- [Run an autonomous GitHub issue resolution campaign](./resolve-github-issues) - Define an autonomous campaign for resolving the maximum safe number of authorized GitHub issues without mid-run input; human editorial review remains required before publication.
- [Review a pull request](./review-pull-request) - Review a pull request against a frozen diff and its stated intent, producing findings traceable to evidence, checks that actually ran, and a merge verdict you can defend.
- [Perform a defensive security review](./security-review) - Review authorized source, configuration, routes, and tests at one immutable revision, then deliver a defensive security assessment, a prioritized finding register, and a remediation and residual-risk plan.
- [Synchronize documentation with verified behavior](./synchronize-documentation) - Compare documentation claims with authoritative evidence at one immutable revision, then deliver a bounded patch, a claim-to-evidence drift register, and a verification report.
- [Triage a bounded repository issue queue](./triage-issues) - Turn a frozen snapshot of an issue queue into a policy-linked disposition for every issue, plus duplicate evidence, draft responses, and closure criteria.
- [Upgrade dependencies with provenance and rollback](./upgrade-dependencies) - Deliver a scoped dependency upgrade backed by a reviewed version-range contract, a deterministic lockfile diff, results across the supported environments, and a rollback that has been exercised.
- [Produce evidence-backed release notes](./write-release-notes) - Write release notes readers can rely on, split into a public Markdown file and an internal evidence package, with every shipped claim traced to an immutable, reviewed release boundary.
