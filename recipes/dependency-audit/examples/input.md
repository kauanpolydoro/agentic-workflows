# Example input

This is a synthetic, self-contained scenario.
No external record should be consulted.

## Context

Synthetic Node.js service at immutable revision `d300000000000000000000000000000000000000`.
The audit is limited to the complete three-package runtime graph supplied below.

## Request

Audit runtime dependencies and recommend evidence-supported actions.

## Constraints

- Use only the evidence below.
- Treat commands as executed only when their evidence explicitly records a result.
- State assumptions and limitations.
- Do not contact a registry, run lifecycle scripts, or modify the supplied manifest and lockfile.

## Evidence inventory

### E1 - Immutable manifest and scope policy

- Type: Manifest excerpt and repository policy.
- Content: Revision `d300000000000000000000000000000000000000` contains this complete dependency declaration:

```json
{
  "dependencies": {
    "kleur": "4.1.5",
    "left-pad": "1.3.0",
    "lodash": "4.17.20"
  },
  "devDependencies": {}
}
```

- Content: The repository classifies entries under `dependencies` as direct runtime dependencies and contains no workspaces, optional dependencies, peer dependencies, or build-time dependency group.
- Integrity: The excerpt is from immutable revision `d300000000000000000000000000000000000000`.
- Establishes: Complete direct declarations and dependency-group classification.

### E2 - Matching lockfile graph

- Type: Lockfile parser record.
- Content: The complete synthetic resolution excerpt is:

```yaml
importers:
  .:
    dependencies:
      kleur: { specifier: 4.1.5, version: 4.1.5 }
      left-pad: { specifier: 1.3.0, version: 1.3.0 }
      lodash: { specifier: 4.17.20, version: 4.17.20 }
packages:
  kleur@4.1.5:
    resolution:
      integrity: sha512-d6WARGQ/CT335eCASLGn3xhwGwW5j0jilIeEuU2brOdBxWJi+HYsy5zjN66YA5AaCRmIOBN6QkPo/Rzlij4kDg==
  left-pad@1.3.0:
    resolution:
      integrity: sha512-9EwzZSPvj3frCmYXxxCGcx6xaxCj0LkuFUbVw8pSzOzd/qoru+5byLFcik38Wdm3A5XI8Bxj6wrpiw5Lj9eCZQ==
  lodash@4.17.20:
    resolution:
      integrity: sha512-20rm38VK80iYfygSgfmU/VXFfoqB3fRhO4AxKTXFHL9SUFa8+Vmw3P7uXOoCb1eHnYBAA5bb6HPdO7ax1XmXgQ==
```

- Content: The complete graph has those three package nodes, no transitive edges, and one distinct version of each package.
- Content: Each node is reached directly from root importer `.`, resolves from the approved public npm registry class, and has no operating-system, CPU, or other optional-platform condition.
- Content: Frozen resolution reports no manifest-lockfile drift at revision `d300000000000000000000000000000000000000`; this result was supplied, not executed during the example.
- Integrity: Immutable synthetic artifact identifier `lock-d300000000000000000000000000000000000000-v1` ties this excerpt to revision `d300000000000000000000000000000000000000`.
- Establishes: Exact resolved graph, direct status, parent paths, registry class, optional-platform disposition, integrity presence, and manifest correspondence.

### E3 - Runtime import inventory

- Type: Complete static and packaged usage inventory.
- Content: `src/read-config.ts` imports `get` from `lodash/get`; `src/format.ts` imports `kleur`; no source, generated file, build script, plugin declaration, or packaged module references `left-pad`.
- Content: The application has no runtime plugin loader, reflection-based module loading, or externally supplied module path.
- Content: The packaged-artifact inventory contains `lodash` and `kleur` but not `left-pad`.
- Integrity: The inventory was generated from revision `d300000000000000000000000000000000000000` and immutable synthetic package artifact `package-d300000000000000000000000000000000000000-v1`; both the source search record and packaged inventory identify that same revision and artifact.
- Establishes: Observed runtime uses, covered dynamic mechanisms, and absence of `left-pad` from the supplied artifact.

### E4 - Advisory snapshot

- Type: Retained synthetic advisory record.
- Content: Advisory `ADV-1` for the npm ecosystem affects `lodash >=4.0.0 <4.17.21` only when untrusted input reaches `lodash/template`.
- Content: The first version outside the supplied affected range is `4.17.21`.
- Content: The retained snapshot contains no advisory entry for `kleur@4.1.5` or `left-pad@1.3.0`.
- Content: The synthetic advisory source identity is `fixture://advisories/ADV-1`, captured `2026-01-10`.
- Integrity: This is the complete advisory record supplied for the example, not a current external lookup.
- Establishes: Affected range, vulnerable API condition, candidate fixed boundary, source identity, and timestamp.

### E5 - Call-site search

- Type: Static reachability record.
- Content: Exact-symbol and property-access searches find no import, require, re-export, or call of `lodash/template` or `_.template`; only `lodash/get` is referenced.
- Content: No supplied input reaches a dynamically selected lodash function.
- Integrity: The search covers source, generated code, build scripts, and the packaged artifact at revision `d300000000000000000000000000000000000000`.
- Establishes: The vulnerable API is not observed within the supplied static and packaged scope; no runtime experiment proves non-reachability.

### E6 - Audit context

- Type: Execution record.
- Content: No install script, package-manager command, registry request, dependency update, removal, build, test, or runtime command was executed for this example.
- Content: All resolution and usage records were supplied as synthetic evidence.
- Content: No license, maintainer, registry-provenance, or signature policy was supplied, so those concerns are outside this example's requested finding scope.
- Establishes: Static-only execution status and the boundary between evidence and proposed work.

### E7 - Action constraints

- Type: Repository dependency and severity policy.
- Content: An affected direct runtime version with the vulnerable API unobserved is Medium until the upgrade or an approved runtime validation closes the exposure question.
- Content: A direct package absent from source, dynamic loading, and the packaged artifact is Low, but removal still requires compatibility checks and repository-maintainer approval.
- Content: The repository maintainer owns dependency changes and requires lockfile review, build, unit tests, packaging comparison, and manifest-lockfile rollback evidence before merge.
- Content: The unit-test inventory at `d300000000000000000000000000000000000000` includes `test/advisory-match.test.ts`, which matches the resolved lodash version against retained snapshot `ADV-1` and fails if a `lodash/template` or `_.template` reference appears in the complete static scope, and `test/read-config.test.ts`, which exercises configuration reads through `lodash/get`.
- Content: The repository runbook supplies these exact commands for an isolated branch based on `d300000000000000000000000000000000000000`: `pnpm --config.ignore-scripts=true add --save-exact lodash@4.17.21`, `pnpm --config.ignore-scripts=true remove left-pad`, `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm test -- advisory-match`, `pnpm test -- read-config`, `pnpm build`, `pnpm test`, `pnpm pack --dry-run --json`, and `git diff -- package.json pnpm-lock.yaml`.
- Content: The rollback command is `git restore --source=d300000000000000000000000000000000000000 -- package.json pnpm-lock.yaml`, followed by `pnpm install --frozen-lockfile --ignore-scripts`; update and removal must use separate isolated branches.
- Content: Temporary acceptance of an affected runtime dependency requires security-owner approval, compensating controls, an owner, and an expiry.
- Establishes: Severity, action ownership, focused advisory, vulnerable-API, and configuration-read checks, exact proposed commands, exit evidence, rollback, and approval rules.

### E8 - Compatibility constraints

- Type: Supported runtime and API record.
- Content: The service supports Node.js 20, and both `lodash@4.17.20` and the proposed boundary `lodash@4.17.21` declare compatibility with that runtime in the supplied package records.
- Content: No public service contract is documented as depending on `left-pad`; the usage and packaging inventory in E3 remains the evidence required before removal.
- Establishes: Candidate target runtime compatibility and the limit of known removal impact.
