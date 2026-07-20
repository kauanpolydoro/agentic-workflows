# Upgrade dependencies with provenance and rollback

Use this recipe to move a named dependency or tightly coupled package group to exact target versions without losing supply-chain, compatibility, or recovery evidence.
It produces the code and lockfile change plus a reviewable record of why every transitive package changed and what passed before and after the upgrade.

## Primary use cases

- Apply planned maintenance to one direct dependency with complete vendor migration guidance.
- Deliver a supported security fix while preserving an attributable affected-to-fixed version boundary.
- Cross a major version with explicit approval, local usage mapping, supported-environment checks, and an exercised rollback.

## When not to use

- The registry, integrity, target version, complete vendor guidance, or current baseline is unknown.
- The request combines unrelated upgrades, a package-manager migration, a runtime-policy change, and application feature work in one run.

## Required evidence

Provide the immutable manifest and lockfile, package-manager version, configured registries, integrity fields, exact resolved tree, scripts, patches, and overrides.

Provide official release and migration records for the entire current-to-target range, including runtime, security, and license information that applies to the selected artifacts.

Provide repository usage search results, the public behavior contract, supported environment matrix, exact permitted file paths, reproducible baseline commands, approval state, and the exact prior-version rollback pin.

## Produced artifacts

The workflow produces a scoped manifest, lockfile, source, and test change set with an exact final path inventory.

It also produces a Markdown upgrade record with the direct and transitive diff, provenance review, breaking-change dispositions, compatibility matrix, command results, approvals, rollback drill, limitations, and evidence traceability.

## Primary risks

The principal risks are registry or integrity drift, unexpected install scripts, missed breaking usage, accidental runtime-support reduction, license-policy conflict, public behavior regression, and an untested rollback.

The workflow stops on incomplete official guidance, unexplained lockfile changes, unsupported environments, missing applicable approvals, and recovery that cannot reproduce the previous tree.

## How to use this recipe

1. Freeze one dependency group, its exact version range, supported environments, and changed-file boundary.
2. Follow [workflow.md](workflow.md) to establish provenance, map vendor changes to local usage, and capture the baseline.
3. Obtain applicable approvals before modifying a major version, runtime requirement, or license disposition.
4. Regenerate and inspect the entire lockfile through the declared package manager.
5. Use [checklist.md](checklist.md) during implementation, matrix validation, rollback, and delivery.
6. Compare the result with the [synthetic evidence package](examples/input.md) and [complete upgrade record](examples/expected-output.md).

The `4h` metadata duration is an approximate window for one well-bounded package group and must be revised for large transitive trees or expensive environment matrices.

## Files

- [recipe.yml](recipe.yml) defines catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical source-provenance, migration, validation, and rollback procedure.
- [checklist.md](checklist.md) controls supply-chain, compatibility, lockfile, environment, approval, and recovery omissions.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a self-contained synthetic package-upgrade evidence set.
- [examples/expected-output.md](examples/expected-output.md) demonstrates the complete upgrade and rollback artifact.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

This procedure cannot establish authenticity when the selected ecosystem provides no trustworthy provenance mechanism or attributable release record.

It cannot prove behavior on an environment omitted from the supplied support matrix, and it cannot substitute for legal or security review.

Deployment observation is optional and does not erase the need for deterministic pre-merge checks and rollback evidence.

See the [recipe quality standard](../../docs/quality/recipe-quality-standard.md), [security guidance](../../docs/guide/security.md), and [verification model](../../docs/guide/verification.md).
