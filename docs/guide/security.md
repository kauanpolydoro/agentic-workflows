# Security model

Recipes are untrusted data and documentation.
They never gain JavaScript execution privileges through the CLI.

The installer rejects absolute paths and traversal, constrains targets to the project root, checks parent symlinks, stages complete bundles, serializes lifecycle operations with one target-level lock, records SHA-256 hashes, and rolls back failed mutations when local filesystem operations report an error.
It refuses silent overwrite and protects every modified managed file during update or removal.

Catalog loading treats directories and files as untrusted input, rejects symbolic links, bounds file and aggregate sizes, limits concurrency, disables YAML aliases, and enforces unique keys plus strict schemas.

Portable Node.js filesystem APIs cannot provide a universal `openat`-style containment boundary against a privileged concurrent process.
Use the CLI only in a project directory whose parent hierarchy is controlled by the current user, and review the target after any interrupted or hostile concurrent operation.

Review a workflow before installing it because its prose may recommend commands for an agent or human to run later.
Installation is not approval to execute those commands.

Report vulnerabilities through the private process described in [SECURITY.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/SECURITY.md).
Never place secrets or exploit details in a public issue.
