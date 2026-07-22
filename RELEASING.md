# Releasing

Releases are tag-driven.
The release workflow publishes the two public npm packages through GitHub Actions trusted publishing.
The workflow uses npm OIDC authentication and does not require an npm token.

1. Choose an unused semantic version after reviewing the public compatibility impact, existing Git tags, and both npm package registries.
2. Confirm every changed recipe has completed the publication gate in `docs/quality/recipe-quality-standard.md`, with current digests and retained review evidence.
3. Update the root, core, and CLI `package.json` files to the same version.
4. Move shipped entries from `Unreleased` into a dated version section in `CHANGELOG.md` and leave an empty `Unreleased` section.
5. Add `release-notes/vX.Y.Z.md` with the exact heading `# Agentic Workflows vX.Y.Z`, upgrade guidance, breaking changes, and an honest verification boundary.
6. Update exact-version examples and version-scoped documentation without claiming publication before it occurs.
7. Regenerate schema, catalog, compatibility, and documentation artifacts through the generator.
8. Run `pnpm install --frozen-lockfile` and the complete validation suite on the final candidate.
9. Open a pull request, review its exact diff, and require all GitHub checks to pass before integration.
10. After integration, wait for the GitHub Pages deployment and rerun `pnpm check:links:external` against the public documentation before creating the tag.
11. Confirm a clean `main` branch at the integrated commit.
12. Create a signed or annotated `vX.Y.Z` tag at that exact commit.
13. Push the tag and let the release workflow rebuild artifacts.
14. Review the workflow logs, provenance, SBOM, checksums, and generated npm package tarballs.
15. Verify both immutable npm publications before promoting the draft GitHub release.

The published packages are:

- `@kauanpolydoro/agentic-workflows-core`, which contains the reusable TypeScript core.
- `@kauanpolydoro/agentic-workflows`, which contains the CLI and bundled catalog.

The core package is published before the CLI because the CLI depends on it.
The workflow packs both packages with pnpm before publishing them with npm so the released CLI tarball contains a resolved core version instead of the workspace protocol.
The npm package access is explicitly public in each package's `publishConfig`.
Each npm tarball must contain exactly one root README named `README.md`, because multiple root `README*` files make npm landing-page selection ambiguous.
The package smoke test enforces that rule and compares the CLI tarball's README byte for byte with the root `README.md` before publication.
Before publishing either package, the workflow audits every allowlisted public documentation link so a broken destination fails before an irreversible registry write.
The publisher then compares the registry `dist.integrity`, selected README filename, and registry README with the complete local package, so a resumed release cannot accept different README or runtime bytes under the same version.
The npm landing page receives README changes only when a new package version is published.
