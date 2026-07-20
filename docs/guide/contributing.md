# Contributing

Contributions are welcome, and three principles guide what gets merged: workflows stay portable, evidence stays honest, and local installation stays safe.

A good way to start is a focused issue or one of the suggested initial tasks.
Use Node.js 22 or newer with the pinned pnpm release, create a branch, and run the full local validation suite before opening a pull request.

What each kind of contribution needs:

- **Recipes** need original operational content, realistic examples, explicit approval gates, and no leftover scaffold markers.
- **Adapters** need a current official source for the format, deterministic serialization, and tests that install into temporary directories.
- **Verification evidence** must retain sanitized command output and must never promote an execution or outcome status beyond what actually happened.

Before submitting work, read the repository [contribution guide](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CONTRIBUTING.md), [code of conduct](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CODE_OF_CONDUCT.md), and [security policy](https://github.com/kauanpolydoro/agentic-workflows/blob/main/SECURITY.md).
