# Example input

This synthetic scenario covers documentation drift after the command-line executable was renamed from `tool` to `awf` at immutable commit `9ad102e000000000000000000000000000000000`.
The audience is contributors installing and running the CLI from a repository checkout.
The objective is to update only `docs/install.md` without changing the package-publication statement or implying that npm installation was tested.

## Scope and environment

- Documentation file: `docs/install.md` at `9ad102e000000000000000000000000000000000`.
- Product surface: executable names in the list and install examples.
- Excluded surfaces: package publication, npm installation, files outside `docs/install.md`, and external-agent execution.
- Verification environment: isolated repository fixture at `9ad102e000000000000000000000000000000000` with no production credentials or customer data.

## Evidence inventory

### E1 - Existing documentation snapshot and fixed scope

The retained synthetic artifact `docs-install-9ad102e000000000000000000000000000000000-v1` is the complete content of `docs/install.md` at `9ad102e000000000000000000000000000000000`:

```markdown
# Install from a repository checkout

tool list

tool install review-pull-request

The npm package will be published in a future release.
```

The snapshot path, immutable commit, artifact identifier, and complete content were checked against the scenario scope.
The snapshot contains exactly three factual claims: the list command, the install command, and the future-publication statement.
No other factual claim or line is omitted from the supplied snapshot.
Only the two command claims are proposed for change.
The intended audience is contributors installing and running the CLI from a repository checkout.
The fixed scope excludes package publication, npm installation, files outside `docs/install.md`, and external-agent execution.
No out-of-scope drift observation was supplied for this example.

### E2 - Package manifest

The retained `packages/cli/package.json` at `9ad102e000000000000000000000000000000000` maps the executable name `awf` to `dist/index.js` and contains no `tool` executable.
The file comes from the same immutable commit as E1.

### E3 - Recorded help command

In the isolated fixture at `9ad102e000000000000000000000000000000000`, `node packages/cli/dist/index.js --help` exited `0` and displayed `Usage: awf [options] [command]`.
The retained command record identifies the fixture commit, exact command, exit status, and relevant output.

### E4 - Acceptance result

In the same isolated fixture, `pnpm test:acceptance` exited `0`.
The retained output includes successful `awf list` and `awf install review-pull-request --dry-run` cases and contains no npm installation case.

### E5 - Release decision R-17

The approved synthetic release record `R-17` states that the executable rename is included at `9ad102e000000000000000000000000000000000` and that npm publication remains out of scope.
Its revision matches E1 through E4.

### E6 - Documentation validation

The retained patch artifact `docs-install.patch` contains this complete zero-context unified diff:

```diff
diff --git a/docs/install.md b/docs/install.md
--- a/docs/install.md
+++ b/docs/install.md
@@ -3 +3 @@
-tool list
+awf list
@@ -5 +5 @@
-tool install review-pull-request
+awf install review-pull-request
```

The diff includes file headers, valid hunk headers, exact original lines, and only the two executable-name substitutions.
On a clean isolated fixture based at `9ad102e000000000000000000000000000000000`, `git apply --check --unidiff-zero docs-install.patch` exited `0`.
The exact retained patch was then applied to a separate isolated fixture based at `9ad102e000000000000000000000000000000000`, where `pnpm format:check` and `pnpm check:links` each exited `0` against the patched worktree.
The retained diff contains only the two substitutions, and the link-check output reports no broken relative link in `docs/install.md`.

### E7 - Maintainer approval

The repository maintainer reviewed the proposed two-line patch for contributors using a repository checkout, E2 through E6, and the unchanged publication statement.
The maintainer approved this bounded patch for merge and did not approve any npm installation or package-publication claim.

## Constraints

- Change only `docs/install.md`.
- Preserve the future-publication statement exactly.
- Do not claim npm installation or external-agent execution was tested.
- Do not add commands, URLs, or behavior absent from the evidence inventory.
