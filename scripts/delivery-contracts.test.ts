import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { changelogContainsVersion, releaseVersionFromTag } from "./release-artifacts.js";

const repository = path.resolve(import.meta.dirname, "..");

async function text(relative: string): Promise<string> {
  return readFile(path.join(repository, relative), "utf8");
}

interface PackageMetadata {
  bugs?: { url?: unknown };
  engines?: { node?: unknown };
  files?: unknown;
  homepage?: unknown;
  license?: unknown;
  name?: unknown;
  publishConfig?: { access?: unknown };
  repository?: { directory?: unknown; type?: unknown; url?: unknown };
  version?: unknown;
}

const completeValidationCommands = [
  "pnpm generate:check",
  "pnpm format:check",
  "pnpm lint",
  "pnpm typecheck",
  "pnpm test",
  "pnpm test:coverage",
  "pnpm build",
  "pnpm test:completion",
  "pnpm test:automation",
  "pnpm test:integration",
  "pnpm test:acceptance",
  "pnpm test:package",
  "pnpm validate:recipes",
  "pnpm validate:content",
  "pnpm audit:similarity",
  "pnpm test:fixtures",
  "pnpm docs:build",
  "pnpm check:links",
  "pnpm check:clean",
] as const;

function markdownHeadings(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => /^## /.test(line))
    .map((line) => line.slice(3));
}

async function packageMetadata(relative: string): Promise<PackageMetadata> {
  return JSON.parse(await text(relative)) as PackageMetadata;
}

describe("delivery contracts", () => {
  it("keeps architecture decision numbers unique", async () => {
    const files = (await readdir(path.join(repository, "docs/decisions"))).filter((file) =>
      /^\d{4}-.+\.md$/u.test(file),
    );
    const byNumber = new Map<string, string[]>();
    for (const file of files) {
      const number = file.slice(0, 4);
      byNumber.set(number, [...(byNumber.get(number) ?? []), file]);
    }
    const duplicates = [...byNumber.entries()]
      .filter(([, names]) => names.length > 1)
      .map(([number, names]) => `${number}: ${names.join(", ")}`);

    expect(duplicates).toEqual([]);
  });

  it("pins every external workflow action to an immutable commit", async () => {
    const directory = path.join(repository, ".github/workflows");
    for (const file of await readdir(directory)) {
      if (!file.endsWith(".yml") && !file.endsWith(".yaml")) continue;
      const workflow = await readFile(path.join(directory, file), "utf8");
      const actions = [...workflow.matchAll(/\buses:\s*([^\s#]+)/g)].map((match) => match[1]);
      expect(actions.length, `${file} contains no external actions`).toBeGreaterThan(0);
      for (const action of actions) {
        expect(action, `${file} uses a mutable action ref`).toMatch(/^[^@\s]+@[0-9a-f]{40}$/);
      }
    }
  });

  it("gates documentation deployment on the full quality job", async () => {
    const workflow = await text(".github/workflows/docs.yml");
    expect(workflow).toContain("needs: quality");
    expect(workflow).toContain("pnpm generate:check");
    expect(workflow).toContain("pnpm test:package");
    expect(workflow).toContain("pnpm check:links");
    expect(workflow).toContain("pnpm check:clean");
    expect(workflow.indexOf("needs: quality")).toBeLessThan(
      workflow.indexOf("actions/deploy-pages@"),
    );
  });

  it("keeps external link checks scheduled and separate from deterministic PR checks", async () => {
    const workflow = await text(".github/workflows/external-links.yml");
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("pnpm check:links:external");
    expect(await text(".github/workflows/ci.yml")).not.toContain("check:links:external");
  });

  it("documents the complete contributor validation suite", async () => {
    const contributing = await text("CONTRIBUTING.md");
    for (const command of completeValidationCommands) {
      expect(contributing, `CONTRIBUTING.md omits ${command}`).toContain(command);
    }
  });

  it("publishes one actionable private security channel without a fictional fallback", async () => {
    const security = await text("SECURITY.md");
    expect(security).toContain(
      "https://github.com/kauanpolydoro/agentic-workflows/security/advisories/new",
    );
    expect(security).toContain("primary and only published private reporting channel");
    expect(security).toContain("does not currently publish a security email address, PGP key");
    expect(security).not.toContain("contact the maintainer privately through the verified profile");
  });

  it("checks generated drift and untracked artifacts in every publishing gate", async () => {
    for (const workflowFile of ["ci.yml", "docs.yml", "release.yml", "validate-recipes.yml"]) {
      const workflow = await text(`.github/workflows/${workflowFile}`);
      expect(workflow, `${workflowFile} omits deterministic generation checking`).toContain(
        "pnpm generate:check",
      );
      expect(workflow, `${workflowFile} omits the complete worktree gate`).toContain(
        "pnpm check:clean",
      );
    }
    expect(await text("scripts/check-clean-worktree.ts")).toContain("--untracked-files=all");
    const artifactManifest = JSON.parse(await text("generated/artifact-manifest.json")) as {
      artifacts?: Array<{ path?: unknown; sha256?: unknown }>;
    };
    expect(artifactManifest.artifacts?.length).toBeGreaterThan(0);
    expect(artifactManifest.artifacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "generated/catalog.json" }),
        expect.objectContaining({ path: "generated/recipe.schema.json" }),
        expect.objectContaining({ path: "docs/catalog/index.md" }),
        expect.objectContaining({ path: "docs/compatibility.md" }),
      ]),
    );
  });

  it("keeps npm publication and release creation behind identity and supply-chain checks", async () => {
    const workflow = await text(".github/workflows/release.yml");
    const npmPublisher = await text("scripts/publish-npm-tarball.ts");
    const releaseSynchronizer = await text("scripts/sync-github-release.ts");
    for (const requirement of [
      "release-artifacts.ts prepare",
      "format: spdx-json",
      "actions/attest-build-provenance@",
      "release-artifacts.ts finalize",
      "pnpm test:package",
      "pnpm check:clean",
      "registry-url: https://registry.npmjs.org",
      "package-manager-cache: false",
      "publish-npm-tarball.ts",
      "pnpm check:links:external",
      "sync-github-release.ts",
      "--notes-file",
    ]) {
      expect(workflow, `release workflow is missing ${requirement}`).toContain(requirement);
    }
    for (const requirement of [
      '"view"',
      '"dist.integrity"',
      '"readme"',
      '"publish"',
      '"--access"',
      '"public"',
      '"--provenance"',
    ]) {
      expect(npmPublisher, `npm publisher is missing ${requirement}`).toContain(requirement);
    }
    for (const action of ["view", "create", "download", "upload", "edit"]) {
      expect(releaseSynchronizer, `release synchronizer is missing ${action}`).toMatch(
        new RegExp(`"release",\\s*"${action}"`),
      );
    }
    expect(releaseSynchronizer).toContain('"--draft"');
    expect(releaseSynchronizer).toContain('"--notes-file"');
    expect(releaseSynchronizer).toContain('"--verify-tag"');
    expect(releaseSynchronizer).not.toContain('"--generate-notes"');
    expect(npmPublisher).not.toContain("NODE_AUTH_TOKEN");
    expect(releaseSynchronizer).not.toContain("--clobber");
    expect(workflow.indexOf("pnpm check:clean")).toBeLessThan(
      workflow.indexOf("release-artifacts.ts prepare"),
    );
    expect(workflow).toContain("id-token: write");
    expect(workflow.indexOf("pnpm check:links:external")).toBeLessThan(
      workflow.indexOf("publish-npm-tarball.ts"),
    );
    expect(workflow.indexOf("publish-npm-tarball.ts")).toBeLessThan(
      workflow.indexOf("sync-github-release.ts"),
    );
    expect(workflow.match(/--readme/g)).toHaveLength(2);
  });

  it("keeps package versions, runtime floors, and project metadata consistent", async () => {
    const root = await packageMetadata("package.json");
    const packages = [
      ["packages/cli/package.json", "packages/cli"],
      ["packages/core/package.json", "packages/core"],
    ] as const;
    expect(typeof root.version).toBe("string");
    const version = String(root.version);
    expect(releaseVersionFromTag(`v${version}`)).toBe(version);
    expect(changelogContainsVersion(await text("CHANGELOG.md"), version)).toBe(true);
    for (const [file, directory] of packages) {
      const metadata = await packageMetadata(file);
      expect(metadata.version).toBe(version);
      expect(metadata.name).toBe(
        file === "packages/cli/package.json"
          ? "@kauanpolydoro/agentic-workflows"
          : "@kauanpolydoro/agentic-workflows-core",
      );
      expect(metadata.license).toBe("MIT");
      expect(metadata.publishConfig?.access).toBe("public");
      expect(metadata.engines?.node).toBe(">=22");
      expect(metadata.repository).toMatchObject({
        type: "git",
        directory,
      });
      expect(metadata.repository?.url).toMatch(/^git\+https:\/\//);
      expect(metadata.homepage).toMatch(/^https:\/\//);
      expect(metadata.bugs?.url).toMatch(/^https:\/\//);
    }
  });

  it("uses honest public claims and an HTTPS-first source installation", async () => {
    const english = await text("README.md");
    const portuguese = await text("README.pt-BR.md");
    const installation = await text("docs/guide/installation.md");
    const preview = await text("docs/public/social-preview.svg");
    for (const document of [english, portuguese, installation]) {
      expect(document).toContain(
        "git clone https://github.com/kauanpolydoro/agentic-workflows.git",
      );
    }
    expect(english).toContain("not evidence that an external agent executed the recipe");
    expect(english).toContain("npx --yes @kauanpolydoro/agentic-workflows@latest list");
    expect(portuguese).toContain("npx --yes @kauanpolydoro/agentic-workflows@latest list");
    expect(installation).toContain("npx --yes @kauanpolydoro/agentic-workflows@latest list");
    expect(portuguese).not.toContain("catálogo executável");
    for (const untranslated of [
      "As recipes",
      "workflows completos",
      "exports suportados",
      "fontes dos adapters",
      "Star the repository",
    ]) {
      expect(portuguese).not.toContain(untranslated);
    }
    expect(preview).not.toContain("Portable, testable");
  });

  it("documents a complete first-use journey in both landing pages", async () => {
    const english = await text("README.md");
    const portuguese = await text("README.pt-BR.md");
    for (const readme of [english, portuguese]) {
      for (const requirement of [
        "npm install --global @kauanpolydoro/agentic-workflows",
        "awf context",
        "awf --version",
        "awf init --agent codex",
        "awf show review-pull-request",
        "awf install review-pull-request --dry-run --show-content",
        "awf install review-pull-request",
        "awf status",
        "$review-pull-request",
        "/review-pull-request",
        ".agentic-workflows/config.yml",
        "awf --project-root <",
        "awf init --force",
        "awf update review-pull-request --dry-run --show-content",
        "No files were changed.",
        "Installed review-pull-request for codex:",
        "Invoke explicitly with: $review-pull-request",
        "healthy",
      ]) {
        expect(readme, `landing page omits ${requirement}`).toContain(requirement);
      }
      expect(
        readme.indexOf("awf install review-pull-request --dry-run --show-content"),
      ).toBeLessThan(readme.indexOf("awf install review-pull-request\n"));
    }
  });

  it("keeps README operational claims aligned with source and release contracts", async () => {
    const english = await text("README.md");
    const portuguese = await text("README.pt-BR.md");
    for (const readme of [english, portuguese]) {
      expect(readme).toContain("pnpm --filter @kauanpolydoro/agentic-workflows pack");
      expect(readme).toContain(".cursor/skills/<workflow-id>/SKILL.md");
      expect(readme).toContain("@kauanpolydoro/agentic-workflows/output-contract");
      expect(readme).toContain("not-applicable");
    }
    expect(english).toContain("active evidence");
    expect(portuguese).toContain("evidência ativa");
    expect(english).toContain("operating system's native document handler");
    expect(portuguese).toContain("manipulador nativo de documentos do sistema operacional");
    expect(english).not.toContain("tested browser opening");
    expect(english).not.toContain("produced with `pnpm pack`");
    expect(portuguese).not.toContain("produzido com `pnpm pack`");
    expect(english).not.toContain("belongs to a different package");
    expect(portuguese).not.toContain("pertence a outro pacote");
    expect(await text("packages/cli/README.md")).toBe(english);

    const metadata = await packageMetadata("packages/cli/package.json");
    expect(typeof metadata.version).toBe("string");
    expect(Array.isArray(metadata.files)).toBe(true);
    const rootReadmes = (metadata.files as unknown[]).filter(
      (file): file is string => typeof file === "string" && /^README(?:\.|$)/i.test(file),
    );
    expect(rootReadmes).toEqual(["README.md"]);
    const exactPackage = `@kauanpolydoro/agentic-workflows@${String(metadata.version)}`;
    expect(english).toContain(exactPackage);
    expect(portuguese).toContain(exactPackage);

    const recipeCount = (
      await readdir(path.join(repository, "recipes"), { withFileTypes: true })
    ).filter((entry) => entry.isDirectory()).length;
    expect(english).toContain(
      `v${String(metadata.version)} release candidate contains ${recipeCount} evidence-oriented workflow bundles`,
    );
    expect(portuguese).toContain(
      `candidato à release v${String(metadata.version)} contém ${recipeCount} pacotes de fluxos`,
    );
    expect(english).toContain(
      `Version \`${String(metadata.version)}\` introduces schema version 4`,
    );
    expect(portuguese).toContain(
      `versão \`${String(metadata.version)}\` introduz o schema versão 4`,
    );
  });

  it("keeps the English and Portuguese landing pages equivalent in scope", async () => {
    const english = await text("README.md");
    const portuguese = await text("README.pt-BR.md");
    const sectionPairs = [
      ["## Why use it", "## Por que usar"],
      ["## Quick start", "## Início rápido"],
      ["## Choose an agent", "## Escolha um agente"],
      ["## Try without a global installation", "## Experimente sem instalação global"],
      ["## Featured workflows", "## Fluxos em destaque"],
      ["## See a complete result", "## Veja um resultado completo"],
      ["## How it works", "## Como funciona"],
      ["## Safety and verification", "## Segurança e verificação"],
      ["## CLI reference", "## Referência da CLI"],
      ["## Develop and contribute", "## Desenvolvimento e contribuição"],
      ["## Documentation map", "## Mapa da documentação"],
      ["## Project status", "## Status do projeto"],
    ] as const;
    for (const [englishSection, portugueseSection] of sectionPairs) {
      expect(english).toContain(englishSection);
      expect(portuguese).toContain(portugueseSection);
    }
    expect(markdownHeadings(english)).toHaveLength(markdownHeadings(portuguese).length);
    for (const command of [
      "context",
      "list",
      "show",
      "install",
      "status",
      "update",
      "remove",
      "validate",
      "doctor",
      "init",
      "manifest",
      "completion",
    ]) {
      expect(english).toContain(`awf ${command}`);
      expect(portuguese).toContain(`awf ${command}`);
    }
    for (const command of completeValidationCommands) {
      expect(english).toContain(command);
      expect(portuguese).toContain(command);
    }
    for (const [englishClaim, portugueseClaim] of [
      ["not an executable plugin", "não um plugin executável"],
      ["never executes recipe instructions", "nunca executa as instruções das receitas"],
      ["Generic Markdown has no agent command", "Markdown genérico não possui comando de agente"],
      ["not active evidence", "não são evidências ativas"],
      ["registry README bytes", "bytes do README no registro"],
      ["only when a new package version", "só muda quando uma nova versão"],
    ] as const) {
      expect(english).toContain(englishClaim);
      expect(portuguese).toContain(portugueseClaim);
    }
    for (const sharedDestination of [
      "https://kauanpolydoro.github.io/agentic-workflows/catalog/write-release-notes#complete-example-input",
      "https://kauanpolydoro.github.io/agentic-workflows/catalog/write-release-notes#complete-expected-output",
      "https://kauanpolydoro.github.io/agentic-workflows/launch/reference-evaluations",
    ]) {
      expect(english).toContain(sharedDestination);
      expect(portuguese).toContain(sharedDestination);
    }
  });

  it("keeps linked onboarding guides on current recipe and pinning contracts", async () => {
    const authoring = await text("docs/guide/authoring.md");
    const installation = await text("docs/guide/installation.md");
    const cliMetadata = await packageMetadata("packages/cli/package.json");
    const exactPackage = `@kauanpolydoro/agentic-workflows@${String(cliMetadata.version)}`;
    expect(authoring).toContain("schema version 4");
    expect(authoring).not.toContain("schema version 2");
    expect(installation).toContain(`npm install --save-dev --save-exact ${exactPackage}`);
    expect(installation).toContain(`pnpm add --save-dev --save-exact ${exactPackage}`);
    expect(installation).toContain("Commit the resulting package manifest and lockfile.");
  });

  it("uses the native document-handler contract consistently", async () => {
    const cli = await text("packages/cli/src/index.ts");
    const english = await text("README.md");
    const reference = await text("docs/guide/cli-reference.md");
    for (const document of [cli, english, reference]) {
      expect(document).toMatch(/native (?:document )?handler/);
    }
    expect(cli).not.toContain("launch a browser");
    expect(cli).not.toContain("page in a browser");
  });

  it("keeps historical adapter records separate from active compatibility claims", async () => {
    const research = await text("docs/research/adapter-sources.md");
    const compatibility = await text("docs/compatibility.md");
    const recipeCount = (
      await readdir(path.join(repository, "recipes"), { withFileTypes: true })
    ).filter((entry) => entry.isDirectory()).length;
    expect(research).toContain("They are not active evidence");
    expect(research).toContain("review-pull-request-pre-history-reset.md");
    expect(research).not.toContain("Separate retained records now establish");
    for (const adapter of ["Claude Code", "OpenAI Codex"]) {
      const researchRow = research
        .split("\n")
        .find(
          (line) =>
            line.startsWith(`| ${adapter} |`) &&
            line.includes("| confirmed | implemented | passing |"),
        );
      const compatibilityRow = compatibility
        .split("\n")
        .find((line) => line.startsWith(`| ${adapter} |`));
      expect(researchRow).toContain("| untested | untested | untested | untested |");
      expect(compatibilityRow).toContain(
        `| untested | 0/${recipeCount} | 0/${recipeCount} | 0/${recipeCount} | untested |`,
      );
    }
  });

  it("keeps the primary demonstration outcome-oriented without overstating execution", async () => {
    const demonstration = await text("scripts/demo-cli.ts");
    const fixtureAgent = await text("scripts/demo-fixture-agent.ts");
    const evaluation = await text("docs/launch/reference-evaluations.md");
    for (const recipe of ["debug-failing-ci", "review-pull-request", "synchronize-documentation"]) {
      expect(demonstration).toContain(`"${recipe}"`);
      expect(evaluation).toContain(`recipes/${recipe}/examples/input.md`);
      expect(evaluation).toContain(`recipes/${recipe}/examples/expected-output.md`);
      expect(evaluation).toContain(`recipes/${recipe}/output.schema.json`);
    }
    expect(demonstration).toContain("validateExpectedOutput");
    expect(demonstration).toContain("demo-fixture-agent.ts");
    for (const flag of ["--workflow", "--input", "--reference", "--output"]) {
      expect(demonstration).toContain(flag);
    }
    expect(fixtureAgent).toContain('flag: "wx"');
    expect(evaluation).toContain("fake fixture agent");
    expect(evaluation).toContain(
      "not evidence that an external agent executed a recipe or that a human approved an agent-produced outcome",
    );
  });

  it("documents the complete seven-file recipe bundle with the real canonical field", async () => {
    const standard = await text("docs/quality/recipe-quality-standard.md");
    for (const required of [
      "recipe.yml",
      "workflow.md",
      "checklist.md",
      "README.md",
      "output.schema.json",
      "examples/input.md",
      "examples/expected-output.md",
    ]) {
      expect(standard).toContain(`\`${required}\``);
    }
    expect(standard).toContain("`canonical.file`");
    expect(standard).not.toContain("`canonical_file`");
  });

  it("publishes a complete PNG social preview contract", async () => {
    const preview = await readFile(path.join(repository, "docs/public/social-preview.png"));
    expect(preview.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(preview.readUInt32BE(16)).toBe(1200);
    expect(preview.readUInt32BE(20)).toBe(630);

    const config = await text("docs/.vitepress/config.ts");
    for (const requiredMetadata of [
      'property: "og:url"',
      'property: "og:type"',
      'property: "og:image:width"',
      'property: "og:image:height"',
      'property: "og:image:type"',
      'name: "twitter:card"',
      'name: "twitter:image"',
      'rel: "canonical"',
    ]) {
      expect(config).toContain(requiredMetadata);
    }
    expect(config).toContain("social-preview.png");

    const recipePage = await text("docs/catalog/write-release-notes.md");
    expect(recipePage).not.toContain("property: og:url");
    expect(recipePage).not.toContain("property: og:image");
    expect(recipePage).not.toContain("name: twitter");
    expect(recipePage).not.toContain("rel: canonical");
    expect(config).toContain("transformHead");
  });
});
