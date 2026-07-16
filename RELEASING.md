# Releasing

Releases are tag-driven and do not publish to npm automatically.

1. Confirm a clean `main` branch and update `CHANGELOG.md`.
2. Run `pnpm install --frozen-lockfile` and the complete validation suite.
3. Confirm generated schema, catalog, compatibility, and docs are current.
4. Create a signed or annotated `vX.Y.Z` tag.
5. Push the tag and let the release workflow rebuild artifacts.
6. Review generated release notes and attached package archives before publication.

Package-registry publication remains manual and unavailable until package names, access controls, provenance, and trusted publishing are configured explicitly.
No release job requires an npm token.
