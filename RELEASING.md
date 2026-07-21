# Releasing

Releases are tag-driven.
The release workflow publishes the two public npm packages through GitHub Actions trusted publishing.
The workflow uses npm OIDC authentication and does not require an npm token.

1. Confirm a clean `main` branch and update `CHANGELOG.md`.
2. Run `pnpm install --frozen-lockfile` and the complete validation suite.
3. Confirm generated schema, catalog, compatibility, and docs are current.
4. Create a signed or annotated `vX.Y.Z` tag.
5. Push the tag and let the release workflow rebuild artifacts.
6. Review the workflow logs and the generated npm package tarballs.
7. Review the draft GitHub release and promote it after the package publication succeeds.

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
