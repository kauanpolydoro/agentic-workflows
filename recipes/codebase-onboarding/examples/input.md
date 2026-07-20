# Synthetic Harbor Ledger onboarding evidence

This example describes a fictional repository.
Every version, path, command result, owner, and task fact used by the expected guide is supplied below.

## Contributor objective

The audience is a TypeScript backend contributor who knows unit testing but has not worked in a layered domain application.
Their first outcome is to implement approved issue `START-12`, which rejects an optional ledger-entry reference containing only whitespace.

The task must not change HTTP schemas, persistence, generated files, dependencies, deployment, or production data.

## Evidence inventory

### E1 - Immutable repository, contributor, access, and instruction state

- Repository: synthetic `harbor-ledger` workspace.
- Commit: `71c8e42000000000000000000000000000000000`.
- Starting working tree: clean.
- Target contributor: a TypeScript backend contributor who knows unit testing but is new to layered domain applications.
- Available access: repository read and local-write access in the clean clone only, with no production, shared-database, credential, or private-service access.
- Root `AGENTS.md`: domain rules belong in `packages/domain`; HTTP and PostgreSQL adapters depend inward; generated files must not be edited directly; no production or shared-database commands are allowed during onboarding.
- `packages/domain/AGENTS.md`: domain code must remain independent of HTTP, database, framework, and environment imports; behavior changes require focused unit tests.

`git rev-parse HEAD` returned `71c8e42000000000000000000000000000000000`, and `git status --short` returned no entries.

### E2 - Toolchain and workspace manifests

`package.json` requires Node.js 22 and declares pnpm 9.15.4.
`pnpm-workspace.yaml` includes `packages/*` and `apps/*`.
Both retained manifest records come from commit `71c8e42000000000000000000000000000000000`, and the inventory is complete for the workspace globs, required tool versions, and root scripts used by this guide.

Root scripts are:

- `pnpm build` for all workspace builds;
- `pnpm typecheck` for project references;
- `pnpm test:unit` for unit tests;
- `pnpm test:integration` for PostgreSQL integration tests;
- `pnpm generate:http` for HTTP types; and
- `pnpm check:generated` to compare generated HTTP types with their source contract.

### E3 - Package and entry-point inventory

| Path | Observed responsibility |
| --- | --- |
| `apps/api/src/main.ts` | composition root and HTTP server startup |
| `packages/adapters-http/src/routes/entries.ts` | `POST /entries` transport parsing and response mapping |
| `packages/application/src/create-entry.ts` | create-entry use-case orchestration |
| `packages/domain/src/ledger-entry.ts` | ledger-entry invariants and construction |
| `packages/domain/src/entry-repository.ts` | persistence port |
| `packages/adapters-postgres/src/postgres-entry-repository.ts` | PostgreSQL implementation of the port |

The supplied import report shows adapters depend on application and domain, application depends on domain, and domain imports no adapter or application package.
The retained report was generated from commit `71c8e42000000000000000000000000000000000` and is complete for every package, entry point, and dependency edge named in the onboarding scope.

### E4 - Representative request flow

For `POST /entries`:

1. `apps/api/src/main.ts` constructs the PostgreSQL repository and `createEntry` use case.
2. `packages/adapters-http/src/routes/entries.ts` parses the generated request type and calls `createEntry`.
3. `packages/application/src/create-entry.ts` calls `LedgerEntry.create` and then `EntryRepository.save`.
4. `packages/domain/src/ledger-entry.ts` enforces amount, account, and optional reference invariants.
5. `packages/adapters-postgres/src/postgres-entry-repository.ts` writes the accepted entry.

The HTTP adapter maps the domain code `ENTRY_REFERENCE_INVALID` to status `422`.
The retained request-flow inspection covers the complete `POST /entries` path at commit `71c8e42000000000000000000000000000000000`; it establishes source structure and mapping behavior, not an executed request.

### E5 - Source, generated, and ownership boundaries

- Source contract: `contracts/ledger-api.yml`.
- Generated destination: `packages/adapters-http/src/generated/ledger-api-types.ts`.
- Generator: `pnpm generate:http`.
- Consistency check: `pnpm check:generated`.
- `CODEOWNERS` assigns `packages/domain/**` to the domain maintainer role, HTTP contract and adapter paths to the API maintainer role, PostgreSQL adapter paths to the data maintainer role, and application plus composition-root paths to the repository maintainer role.

The generated file header says it is generated from `contracts/ledger-api.yml` and must not be edited directly.
The contract, generated-file header, generator script, consistency check, and `CODEOWNERS` record were all inspected at commit `71c8e42000000000000000000000000000000000` and are complete for the paths named in this section.

### E6 - Clean-clone setup and baseline results

In a clean clone at `71c8e42000000000000000000000000000000000` on Linux x64 with Node.js 22.11.0 and pnpm 9.15.4:

- `pnpm install --frozen-lockfile` exited `0`.
- `pnpm typecheck` exited `0`.
- `pnpm test:unit` exited `0` with 73 tests passing.
- `pnpm build` exited `0`.
- `pnpm check:generated` exited `0` with no diff.

These commands created only ignored package-manager and build-cache directories.
Each retained command record identifies commit `71c8e42000000000000000000000000000000000`, Linux x64, Node.js 22.11.0, pnpm 9.15.4, the exact command, exit status, and relevant result.

### E7 - Integration-test access limitation

`pnpm test:integration` was not executed because the onboarding environment has no Docker daemon and no PostgreSQL service.
The repository contributor guide says integration tests require the local Compose service started by `pnpm dev:services`.

No service-owner approval or executed result for that local service procedure is supplied.
The starter issue in E9 changes only domain code and does not require a database to meet its focused acceptance criteria.
The integration-test limitation is retained for commit `71c8e42000000000000000000000000000000000` and is complete for the unavailable Docker and PostgreSQL prerequisites known to the supplied contributor guide.

### E8 - Observed toolchain troubleshooting record

An earlier disposable clone used Node.js 20.17.0.
`pnpm install --frozen-lockfile` stopped before package installation with `Unsupported engine: wanted node >=22`.

After switching that clone to Node.js 22.11.0, the same install command exited `0`.
No file outside ignored package-manager state was changed by the failed attempt.
The troubleshooting record identifies the disposable clone at commit `71c8e42000000000000000000000000000000000`, both runtime versions, the exact command, and both observed results.

### E9 - Approved starter issue

Issue `START-12` is approved by the domain maintainer role.

Current behavior accepts `reference: "   "` because `LedgerEntry.create` checks only string length.
Required behavior is to return domain error code `ENTRY_REFERENCE_INVALID` when a supplied reference becomes empty after trimming.
Undefined reference remains valid, and a nonblank reference retains its original stored value.

Allowed files:

- `packages/domain/src/ledger-entry.ts`;
- `packages/domain/test/ledger-entry.test.ts`.

Required focused cases:

- undefined reference remains accepted;
- whitespace-only reference returns `ENTRY_REFERENCE_INVALID`;
- nonblank reference preserves its supplied value.

Forbidden scope includes HTTP schemas, generated types, application orchestration, repositories, dependencies, and deployment files.

Required validation is `pnpm test:unit -- ledger-entry`, `pnpm typecheck`, `pnpm test:unit`, and `pnpm build`.
Rollback is reverting only the two allowed-file changes and rerunning the E6 baseline commands.
The retained `START-12` approval snapshot is tied to repository commit `71c8e42000000000000000000000000000000000` and is complete for acceptance criteria, allowed files, forbidden scope, validation, reviewer role, and rollback.

### E10 - Publication approval and limitations

The repository maintainer reviewed E1 through E9 and approved publication of architecture, setup, ownership, and starter-task guidance for commit `71c8e42000000000000000000000000000000000`.
The domain maintainer remains the required reviewer for the eventual `START-12` code change.

No privileged access procedure is included or approved.
The guide must state that integration validation is unexecuted and that the clean-clone evidence applies only to Linux x64.
The publication approval identifies the repository-maintainer role, commit `71c8e42000000000000000000000000000000000`, reviewed evidence range E1 through E9, approved audience, and explicit limitations.
