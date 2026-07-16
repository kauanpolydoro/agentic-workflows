# Audit dependency risk

Turn an immutable dependency graph and dated advisory snapshot into a reproducible inventory and action plan that keeps affected versions, reachable conditions, and demonstrated outcomes separate.

## Primary use cases

- A release needs a supply-chain risk snapshot.
- Runtime dependencies need removal, upgrade, license, provenance, or maintenance assessment.
- A specific advisory or unused direct dependency needs a bounded engineering disposition.

## When not to use

- The manifest and matching lockfile are unavailable.
- The dependency graph cannot be resolved without executing untrusted install scripts.
- The request requires a legal conclusion rather than an engineering risk assessment.
- The advisory source, affected range, condition, or snapshot time cannot be retained.

## Required evidence

- **Immutable declarations:** Revision, manifests, workspace boundaries, and policy for runtime, development, optional, peer, and build dependencies.
- **Complete resolution:** Matching lockfile importers, direct and transitive graph edges, exact versions, integrity records, and platform conditions.
- **Advisory snapshot:** Retained source identity, capture time, ecosystem, affected range, vulnerable condition, and fixed boundary when known.
- **Reachability evidence:** When available, imports, call sites, dynamic loading, plugins, generated code, packaged artifacts, and safe runtime records.

## Produced artifacts

- A reproducible direct and transitive dependency inventory with immutable scope and timestamp.
- A finding register separating affected status, reachability, impact, severity, confidence, verification, and disposition.
- A removal, exact-version upgrade, monitoring, or acceptance plan with owners, validation, rollback, and approvals.

## Primary risks

- Never run lifecycle scripts from unknown packages during audit.
- Never print registry tokens or copy private registry URLs into public output.
- Do not claim exploitability without reachability evidence.
- Perform experimental resolution only in a disposable directory.
- Do not modify the audited working tree or contact an unapproved private registry during the audit.
- Stop conclusions for an inaccessible private subtree, and continue elsewhere only when the supplied graph proves that subtree boundary.

## How to use this recipe

1. Freeze the revision, manifest-lockfile pairs, dependency-group policy, advisory snapshot, and exclusions.
2. Follow [workflow.md](workflow.md) to build the resolved graph, reconcile runtime and packaged scope, and assess advisories and reachability.
3. Use [checklist.md](checklist.md) to prevent lifecycle-script execution, secret disclosure, unsupported target versions, incomplete graph coverage, ambiguous private-subtree recovery, and non-copyable action commands.
4. Compare output structure with the synthetic [example input](examples/input.md) and [expected output](examples/expected-output.md), without treating its synthetic advisory as current data.
5. Obtain repository-maintainer approval before removing public capability and security-owner approval before temporary vulnerable-dependency acceptance.

## Files

- `recipe.yml` contains catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- `workflow.md` is the canonical operational procedure.
- `checklist.md` controls evidence, safety, approval, and delivery omissions.
- `output.schema.json` defines the machine-readable contract for the delivered artifact set.
- `examples/input.md` is a synthetic evidence package.
- `examples/expected-output.md` is a complete reference artifact.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

The example proves editorial derivability for a synthetic scenario, not execution through an external agent.
Domain evidence and approvals must be recollected for every real use.
Static non-use evidence cannot prove absence when plugins, reflection, runtime injection, or generated imports remain outside scope.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter sources](../../docs/research/adapter-sources.md).
