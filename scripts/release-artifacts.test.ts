import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  changelogContainsVersion,
  type ReleaseIdentity,
  releaseVersionFromTag,
  verifyReleaseIdentity,
  writeReleaseManifest,
} from "./release-artifacts.js";

const identity: ReleaseIdentity = {
  tag: "v1.2.3",
  version: "1.2.3",
  sourceCommit: "a".repeat(40),
  packages: {
    "agentic-workflows": "1.2.3",
    "@agentic-workflows/core": "1.2.3",
    "@agentic-workflows/cli": "1.2.3",
  },
};

function git(repository: string, ...args: string[]): string {
  const result = spawnSync("git", args, {
    cwd: repository,
    encoding: "utf8",
    shell: false,
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

describe("release artifact contracts", () => {
  it("accepts strict SemVer tags and rejects loose release names", () => {
    expect(releaseVersionFromTag("v1.2.3")).toBe("1.2.3");
    expect(releaseVersionFromTag("v1.2.3-rc.1")).toBe("1.2.3-rc.1");
    expect(() => releaseVersionFromTag("1.2.3")).toThrow(/start with v/);
    expect(() => releaseVersionFromTag("v01.2.3")).toThrow(/strict SemVer/);
    expect(() => releaseVersionFromTag("vrelease")).toThrow(/strict SemVer/);
  });

  it("requires an exact level-two changelog version", () => {
    expect(changelogContainsVersion("## 1.2.3\n\nPrepared.\n", "1.2.3")).toBe(true);
    expect(changelogContainsVersion("## [1.2.3] - Prepared\n", "1.2.3")).toBe(true);
    expect(changelogContainsVersion("### 1.2.3\n", "1.2.3")).toBe(false);
    expect(changelogContainsVersion("## 1.2.30\n", "1.2.3")).toBe(false);
  });

  it("accepts only an annotated tag on the authorized branch with matching package versions", async () => {
    const repository = await mkdtemp(path.join(os.tmpdir(), "awf-release-identity-"));
    await Promise.all([
      mkdir(path.join(repository, "packages/cli"), { recursive: true }),
      mkdir(path.join(repository, "packages/core"), { recursive: true }),
    ]);
    for (const relative of [
      "package.json",
      "packages/cli/package.json",
      "packages/core/package.json",
    ]) {
      const name =
        relative === "package.json"
          ? "agentic-workflows"
          : `@agentic-workflows/${path.basename(path.dirname(relative))}`;
      await writeFile(path.join(repository, relative), JSON.stringify({ name, version: "1.2.3" }));
    }
    await writeFile(path.join(repository, "CHANGELOG.md"), "# Changelog\n\n## 1.2.3\n");
    git(repository, "init", "--initial-branch=main");
    git(repository, "config", "user.email", "release-test@example.invalid");
    git(repository, "config", "user.name", "Release Test");
    git(repository, "add", ".");
    git(repository, "commit", "-m", "prepare release");
    git(repository, "tag", "-a", "v1.2.3", "-m", "v1.2.3");
    git(repository, "update-ref", "refs/remotes/origin/main", "HEAD");

    await expect(verifyReleaseIdentity(repository, "v1.2.3")).resolves.toMatchObject({
      tag: "v1.2.3",
      version: "1.2.3",
      sourceCommit: git(repository, "rev-parse", "HEAD"),
    });

    await writeFile(
      path.join(repository, "packages/cli/package.json"),
      JSON.stringify({ name: "@agentic-workflows/cli", version: "1.2.4" }),
    );
    await expect(verifyReleaseIdentity(repository, "v1.2.3")).rejects.toThrow(
      /does not match package versions/,
    );
    await writeFile(
      path.join(repository, "packages/cli/package.json"),
      JSON.stringify({ name: "@agentic-workflows/cli", version: "1.2.3" }),
    );
    git(repository, "tag", "--delete", "v1.2.3");
    git(repository, "tag", "v1.2.3");
    await expect(verifyReleaseIdentity(repository, "v1.2.3")).rejects.toThrow(/annotated tag/);
  });

  it("writes deterministic artifact metadata and checksums", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "awf-release-artifacts-"));
    const base = `agentic-workflows-${identity.tag}`;
    const files = [`${base}.tar.gz`, `${base}.zip`, `${base}.sbom.spdx.json`];
    for (const file of files) {
      const content = file.endsWith(".spdx.json")
        ? JSON.stringify({ spdxVersion: "SPDX-2.3" })
        : file;
      await writeFile(path.join(directory, file), content);
    }
    const sourceDirectory = path.join(directory, "source");
    await mkdir(sourceDirectory);
    const bundle = path.join(sourceDirectory, "attestation-source.json");
    await writeFile(
      bundle,
      JSON.stringify({ mediaType: "application/vnd.dev.sigstore.bundle+json" }),
    );

    const manifest = await writeReleaseManifest(
      directory,
      identity,
      "https://github.com/example/project/attestations/1",
      bundle,
    );

    expect(manifest.release).toMatchObject({ tag: "v1.2.3", source_commit: "a".repeat(40) });
    expect(manifest.artifacts.map((artifact) => artifact.file)).toEqual([
      `${base}.provenance.json`,
      `${base}.sbom.spdx.json`,
      `${base}.tar.gz`,
      `${base}.zip`,
    ]);
    const checksums = await readFile(path.join(directory, `${base}.sha256`), "utf8");
    const expected = createHash("sha256").update(`${base}.tar.gz`).digest("hex");
    expect(checksums).toContain(`${expected}  ${base}.tar.gz`);
    expect(checksums).toContain(`${base}.artifact-manifest.json`);
  });

  it("rejects unverifiable provenance locations and malformed bundles", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "awf-release-invalid-"));
    await expect(
      writeReleaseManifest(directory, identity, "http://github.com/example/attestations/1"),
    ).rejects.toThrow(/GitHub HTTPS URL/);
    const bundle = path.join(directory, "invalid-provenance.json");
    await writeFile(bundle, "not JSON");
    await expect(
      writeReleaseManifest(
        directory,
        identity,
        "https://github.com/example/project/attestations/1",
        bundle,
      ),
    ).rejects.toThrow(/provenance bundle is not valid JSON/);
  });
});
