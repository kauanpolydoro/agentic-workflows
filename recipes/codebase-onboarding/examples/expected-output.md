# Harbor Ledger domain contributor guide

## Audience, revision, and first outcome

This guide is for a TypeScript backend contributor who knows unit testing and is learning the synthetic `harbor-ledger` layered domain boundary at immutable commit `71c8e42000000000000000000000000000000000` (E1).
The first contribution is approved issue `START-12`, which adds the whitespace-only reference invariant within two domain files (E9).

HTTP schemas, persistence, generated files, dependencies, deployment, production systems, and shared data are outside this onboarding path (E1, E9).

## Prerequisites and access boundary

- Linux x64, matching the only executed setup environment (E6, E10).
- Node.js 22.11.0 and pnpm 9.15.4, matching the verified toolchain (E2, E6).
- TypeScript and unit-testing familiarity, matching the target role (E1).
- Repository read and local-write access only (E1).

No credential, production, Docker, PostgreSQL, or private-service access is required for the focused starter issue (E7, E9, E10).
Integration tests remain unavailable in the evidenced environment and are not reported as passing (E7).

## Verified clean-clone setup

At commit `71c8e42000000000000000000000000000000000`, run:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:unit
pnpm build
pnpm check:generated
```

On Node.js 22.11.0 with pnpm 9.15.4, these commands exited `0`, 73 unit tests passed, and the generated consistency check reported no diff (E6).
They created only ignored package-manager and build-cache directories (E6).

Do not run production, shared-database, or destructive setup commands during this onboarding path (E1).

## Architecture and ownership map

| Boundary | Role in the system | Dependency rule | Responsible reviewer role | Evidence |
| --- | --- | --- | --- | --- |
| `apps/api/src/main.ts` | composition and server startup | may assemble adapters and application | repository maintainer | E3, E5 |
| `packages/adapters-http` | HTTP parsing and response mapping | depends inward on application and domain | API maintainer | E3, E5 |
| `packages/application` | use-case orchestration | depends on domain ports and rules | repository maintainer | E3, E5 |
| `packages/domain` | ledger invariants and persistence ports | imports no application or adapter package | domain maintainer | E1, E3, E5 |
| `packages/adapters-postgres` | PostgreSQL implementation | depends on the domain repository port | data maintainer | E3, E5 |

The import report, not directory names alone, establishes the inward dependency direction (E3).

## Representative `POST /entries` flow

1. `apps/api/src/main.ts` assembles the PostgreSQL repository and create-entry use case (E4).
2. `packages/adapters-http/src/routes/entries.ts` parses the generated request type and calls the use case (E4).
3. `packages/application/src/create-entry.ts` constructs the domain value and invokes `EntryRepository.save` (E4).
4. `packages/domain/src/ledger-entry.ts` owns amount, account, and optional reference invariants (E4).
5. `packages/adapters-postgres/src/postgres-entry-repository.ts` performs the accepted persistence side effect (E4).

Domain error `ENTRY_REFERENCE_INVALID` is mapped to HTTP status 422 by the HTTP adapter, but the starter task changes only the domain condition and tests (E4, E9).

## Source and generated boundaries

`contracts/ledger-api.yml` is the source contract for `packages/adapters-http/src/generated/ledger-api-types.ts` (E5).
Use `pnpm generate:http` to regenerate that destination and `pnpm check:generated` to verify consistency (E2, E5).

Do not edit the generated destination directly (E1, E5).
The starter task does not change the contract or generated output (E9).

## Daily validation loop

For domain work, begin with the focused command and expand before review:

```sh
pnpm test:unit -- ledger-entry
pnpm typecheck
pnpm test:unit
pnpm build
```

The full unit, typecheck, and build commands passed in the clean-clone baseline (E6).
The focused starter-task command is required by E9 but has not been run against a future implementation, so no post-change result is claimed.

`pnpm test:integration` exists but is unexecuted in this evidence set because Docker and PostgreSQL are unavailable (E2, E7).
Do not infer integration readiness from the unit baseline (E6, E7).

## Safe first contribution: `START-12`

### Required behavior

- Keep undefined reference valid (E9).
- Return `ENTRY_REFERENCE_INVALID` when a supplied reference becomes empty after trimming (E9).
- Preserve the original supplied value for a nonblank reference (E9).

### Allowed files

- `packages/domain/src/ledger-entry.ts` (E9).
- `packages/domain/test/ledger-entry.test.ts` (E9).

Do not change HTTP schemas, generated types, application orchestration, repository adapters, dependencies, or deployment files (E9).

### Implementation and review sequence

1. Read the domain instruction file and existing ledger-entry tests (E1, E9).
2. Add the three focused cases from E9 before or with the bounded invariant change.
3. Keep adapter and transport mappings unchanged (E9).
4. Run the focused test, typecheck, all unit tests, and build in that order (E9).
5. Submit only the two allowed files to the domain maintainer role for review (E5, E9, E10).

### Closing criteria

- All three required reference cases have explicit tests (E9).
- The focused command passes (E9).
- Typecheck, all unit tests, and build pass (E9).
- The diff contains only the two allowed files (E9).
- No generated, HTTP, persistence, dependency, or deployment file changes (E9).
- The domain maintainer approves the behavior and scope (E9, E10).

If the change cannot meet these criteria, revert only the two allowed-file changes and require the E6 baseline commands to pass before another attempt (E6, E9).

## Troubleshooting

### Install reports an unsupported Node engine

Observed symptom: Node.js 20.17.0 caused `pnpm install --frozen-lockfile` to stop with `Unsupported engine: wanted node >=22` (E8).

Recovery: switch the disposable clone to Node.js 22.11.0 and rerun the same install command (E8).
That recovery exited `0` in the supplied record (E8).

Do not bypass the engine check because the verified baseline uses Node.js 22.11.0 (E6, E8).

### Integration tests need PostgreSQL

The repository guide names `pnpm dev:services`, but that procedure was not executed or approved in this evidence set (E7).
Treat integration validation as unavailable and ask the service owner for an approved local procedure if future work requires it (E7).

## Verification, approvals, and limitations

The repository maintainer approved this architecture, setup, ownership, and starter-task guide for commit `71c8e42000000000000000000000000000000000` (E10).
The domain maintainer approved the task boundary and remains the reviewer for the eventual code change (E9, E10).

Clean-clone installation, typecheck, 73 unit tests, build, and generated consistency passed only on Linux x64 with the declared toolchain (E6, E10).
Integration tests were not executed, and no starter-task implementation or post-change result exists yet (E7, E9).

This guide must be revalidated when the revision, manifests, commands, ownership, generated boundary, or issue scope changes.

## Evidence traceability

- Revision, contributor role, access boundary, and instructions: E1.
- Toolchain and scripts: E2.
- Package boundaries: E3.
- Representative flow: E4.
- Generated and ownership boundaries: E5.
- Executed baseline: E6.
- Integration limitation: E7.
- Reproduced setup recovery: E8.
- Starter issue: E9.
- Publication approval and declared limits: E10.
