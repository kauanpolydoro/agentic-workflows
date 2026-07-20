# Security model

The starting assumption is simple: recipes are untrusted data.
They are documentation and metadata, and the CLI never gives them a way to execute JavaScript.

## How the installer protects your project

The installer rejects absolute paths and path traversal, keeps every write inside the project root, checks parent directories for symlinks, and stages complete bundles before moving them into place.
Lifecycle operations are serialized with one lock per target, every installed file gets a SHA-256 hash, and failed mutations are rolled back when the filesystem reports an error.
It refuses to overwrite silently, and files you have modified are protected during update and removal.

## How the catalog loader protects itself

Catalog directories and files are treated as untrusted input.
The loader rejects symbolic links, bounds individual and aggregate file sizes, limits concurrency, disables YAML aliases, and enforces unique keys plus strict schemas.

## One honest limitation

Portable Node.js filesystem APIs cannot provide a watertight containment boundary against a privileged process acting concurrently (there is no universal `openat`-style API).
So use the CLI only in a project directory whose parent hierarchy you control, and review the target after any interrupted or suspicious concurrent operation.

## Installing is not approving

Review a workflow before installing it, because its prose may recommend commands for you or your agent to run later.
Installation is never approval to execute those commands.

## Reporting a vulnerability

Report vulnerabilities through the private process described in [SECURITY.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/SECURITY.md).
Never put secrets or exploit details in a public issue.
