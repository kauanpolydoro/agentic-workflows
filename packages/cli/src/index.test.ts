import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { adapterRegistry } from "@kauanpolydoro/agentic-workflows-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse, stringify } from "yaml";
import { createProgram } from "./index.js";

const repositoryRoot = path.resolve(".");
const originalCwd = process.cwd();
const originalCatalog = process.env.AWF_CATALOG_ROOT;
const originalGeneratedCatalog = process.env.AWF_GENERATED_CATALOG_PATH;
const originalNoColor = process.env.NO_COLOR;
let project: string;
let stdout = "";

function syntheticUntestedEvidence(options: {
  id: string;
  recipeVersion: string;
  recipeHash: string;
  repositoryRevision: string;
}) {
  return {
    schema_version: 2,
    id: options.id,
    recipe: "write-release-notes",
    recipe_version: options.recipeVersion,
    recipe_content_sha256: options.recipeHash,
    agent: "codex",
    adapter_version: adapterRegistry.codex.version,
    agent_version: null,
    fixture: null,
    command: null,
    exit_code: null,
    started_at: null,
    finished_at: null,
    environment: {
      runner_image: null,
      os: null,
      node_version: null,
      pnpm_version: null,
    },
    source: {
      repository_revision: options.repositoryRevision,
      workflow_run_url: null,
      runner: null,
    },
    installation: { status: "untested" },
    execution: { status: "untested" },
    outcome: { status: "untested" },
    evidence: {
      command_log: null,
      stdout: null,
      stderr: null,
      installation_artifact: null,
      input_file: null,
      output_file: null,
      outcome_review: null,
    },
    reviewer: null,
    reviewed_at: null,
    criteria: [],
    notes: ["Synthetic unobserved record used only for strict-validation regression coverage."],
  };
}

function testProgram(options: Parameters<typeof createProgram>[0] = {}) {
  return createProgram({ ...options, discoveryBoundary: project });
}

async function run(...args: string[]): Promise<void> {
  await testProgram().parseAsync(args, { from: "user" });
}

async function createVerificationRepository(): Promise<{
  repository: string;
  recipes: string;
  evidenceDirectory: string;
  recipe: {
    id: string;
    version: string;
    verification: { structural: { recipe_content_sha256: string } };
  };
  revision: string;
}> {
  const repository = path.join(project, "verification-repository");
  const recipes = path.join(repository, "recipes");
  await mkdir(recipes, { recursive: true });
  await cp(
    path.join(repositoryRoot, "recipes", "write-release-notes"),
    path.join(recipes, "write-release-notes"),
    { recursive: true },
  );
  for (const documentation of ["quality/recipe-quality-standard.md", "guide/verification.md"]) {
    const destination = path.join(repository, "docs", documentation);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(repositoryRoot, "docs", documentation), destination);
  }
  await cp(path.join(repositoryRoot, "package.json"), path.join(repository, "package.json"));
  await mkdir(path.join(repository, "scripts"));
  await cp(
    path.join(repositoryRoot, "scripts", "generate.ts"),
    path.join(repository, "scripts", "generate.ts"),
  );
  await mkdir(path.join(repository, "generated"));
  const catalog = JSON.parse(
    await readFile(path.join(repositoryRoot, "generated", "catalog.json"), "utf8"),
  ) as Array<{
    id: string;
    version: string;
    verification: { structural: { recipe_content_sha256: string } };
  }>;
  const recipe = catalog.find((candidate) => candidate.id === "write-release-notes");
  if (!recipe) throw new Error("The generated fixture recipe is unavailable.");
  await writeFile(
    path.join(repository, "generated", "catalog.json"),
    `${JSON.stringify([recipe])}\n`,
  );
  const evidenceDirectory = path.join(repository, "verification", "synthetic");
  await mkdir(evidenceDirectory, { recursive: true });

  execFileSync("git", ["init", "--quiet"], { cwd: repository });
  execFileSync("git", ["config", "user.email", "synthetic@example.invalid"], {
    cwd: repository,
  });
  execFileSync("git", ["config", "user.name", "Synthetic Test"], { cwd: repository });
  execFileSync("git", ["add", "recipes/write-release-notes"], { cwd: repository });
  execFileSync("git", ["commit", "--quiet", "-m", "test: retain recipe source"], {
    cwd: repository,
  });
  const revision = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repository,
    encoding: "utf8",
  }).trim();
  process.env.AWF_CATALOG_ROOT = recipes;
  process.env.AWF_GENERATED_CATALOG_PATH = path.join(repository, "generated", "catalog.json");
  return { repository, recipes, evidenceDirectory, recipe, revision };
}

async function replaceEvidenceRecords(
  evidenceDirectory: string,
  records: readonly Record<string, unknown>[],
): Promise<void> {
  await rm(evidenceDirectory, { force: true, recursive: true });
  await mkdir(evidenceDirectory, { recursive: true });
  for (const [index, record] of records.entries()) {
    await writeFile(
      path.join(evidenceDirectory, `${String(index + 1).padStart(2, "0")}.yml`),
      stringify(record),
    );
  }
}

beforeEach(async () => {
  project = await realpath(await mkdtemp(path.join(os.tmpdir(), "awf-cli-unit-")));
  await writeFile(path.join(project, "package.json"), "{}\n");
  process.chdir(project);
  process.env.AWF_CATALOG_ROOT = path.join(repositoryRoot, "recipes");
  process.env.AWF_GENERATED_CATALOG_PATH = path.join(repositoryRoot, "generated/catalog.json");
  stdout = "";
  vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    stdout += String(chunk);
    return true;
  });
  vi.spyOn(process.stderr, "write").mockImplementation(() => true);
});

afterEach(async () => {
  process.chdir(originalCwd);
  if (originalCatalog === undefined) delete process.env.AWF_CATALOG_ROOT;
  else process.env.AWF_CATALOG_ROOT = originalCatalog;
  if (originalGeneratedCatalog === undefined) delete process.env.AWF_GENERATED_CATALOG_PATH;
  else process.env.AWF_GENERATED_CATALOG_PATH = originalGeneratedCatalog;
  if (originalNoColor === undefined) delete process.env.NO_COLOR;
  else process.env.NO_COLOR = originalNoColor;
  process.exitCode = undefined;
  vi.restoreAllMocks();
  await rm(project, { force: true, recursive: true });
});

describe.sequential("CLI command contracts", () => {
  it("turns an empty invocation into actionable help with a successful parse", async () => {
    await run();

    expect(stdout).toContain("Usage: awf [options] [command]");
    expect(stdout).toContain("awf init --agent codex");
    expect(stdout).toContain("awf install review-pull-request --agent codex --dry-run");
    expect(stdout).toContain("awf status");
    expect(stdout).toContain("awf doctor");
    expect(stdout).toContain("awf completion zsh");
    expect(process.exitCode).toBeUndefined();
  });

  it("explains project-root selection for humans and automation", async () => {
    await run("--project-root", project, "context", "--json");
    expect(JSON.parse(stdout)).toEqual({
      schema_version: 1,
      project_root: project,
      selection_source: "explicit",
      project_root_fallback: false,
      reason: "Selected by the explicit --project-root option.",
    });

    stdout = "";
    await run("context");
    expect(stdout).toContain(`Project root: ${project}`);
    expect(stdout).toContain("Selection source: package");
    expect(stdout).toContain("Current-directory fallback: no");
  });

  it("generates completion for every supported shell", async () => {
    for (const shell of ["bash", "zsh", "fish", "pwsh"]) {
      stdout = "";
      await run("completion", shell);
      expect(stdout).toContain("review-pull-request");
      expect(stdout).toContain("agentic-workflows");

      stdout = "";
      await run("completion", shell, "--install-instructions");
      expect(stdout).toContain("will not edit");
      expect(stdout).toContain(`awf completion ${shell}`);
      expect(stdout).not.toContain("review-pull-request");
    }

    await expect(run("completion", "unsupported")).rejects.toMatchObject({ exitCode: 1 });
  });

  it("documents safety-relevant options in command help", async () => {
    await expect(run("install", "--help")).rejects.toMatchObject({ exitCode: 0 });

    expect(stdout).toContain("Preview the complete installation plan without changing");
    expect(stdout).toContain("Include proposed generated content in a dry run");
    expect(stdout).toContain("never overwrite unmanaged files");
  });

  it("separates adapter support and recipe compatibility filters", async () => {
    await run(
      "list",
      "--agent",
      "codex",
      "--adapter-status",
      "supported",
      "--compatibility",
      "compatible",
      "--category",
      "release",
      "--tag",
      "release",
      "--installation",
      "untested",
      "--execution",
      "untested",
      "--outcome",
      "untested",
      "--json",
    );
    const recipes = JSON.parse(stdout) as Array<{ id: string }>;
    expect(recipes.map((recipe) => recipe.id)).toContain("write-release-notes");
    await expect(run("list", "--adapter-status", "supported")).rejects.toMatchObject({
      exitCode: 2,
    });
    stdout = "";
    await run("list", "--category", "does-not-exist");
    expect(stdout).toContain("No workflows match the selected filters");
    expect(stdout).toContain("awf list --help");
    stdout = "";
    await run("list", "--category", "release");
    expect(stdout).toContain("write-release-notes");
    stdout = "";
    await run("list", "--execution-mode", "autonomous");
    expect(stdout).toContain("resolve-github-issues");
    expect(stdout).toContain("autonomous");
    expect(stdout).not.toContain("write-release-notes");
    stdout = "";
    await run("show", "resolve-github-issues");
    expect(stdout).toContain("Category: maintenance");
    expect(stdout).toContain("Execution mode: autonomous");
  });

  it("excludes catalog entries that fail each agent-specific filter", async () => {
    await run("list", "--tag", "synthetic-absent-tag", "--json");
    expect(JSON.parse(stdout)).toEqual([]);
    for (const filter of [
      ["--compatibility", "incompatible"],
      ["--adapter-status", "unsupported"],
      ["--installation", "failing"],
      ["--execution", "passing"],
      ["--outcome", "passing"],
    ]) {
      stdout = "";
      await run("list", "--agent", "cursor", ...filter, "--json");
      expect(JSON.parse(stdout)).toEqual([]);
    }
  });

  it("renders raw, structured, and human recipe details", async () => {
    await run("show", "write-release-notes", "--raw");
    expect(stdout).toContain("## Objective");
    stdout = "";
    await run("show", "write-release-notes", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ id: "write-release-notes" });
    stdout = "";
    await run("show", "write-release-notes");
    expect(stdout).toContain("Risk:");
    expect(stdout).toContain("Difficulty:");
    expect(stdout).toContain("Execution mode: supervised");
    expect(stdout).toContain("Required inputs:");
    expect(stdout).toContain("Agent compatibility:");
    expect(stdout).toContain("- codex: compatible; capability unknown");
    stdout = "";
    await run("show", "write-release-notes", "--agent", "codex");
    expect(stdout).toContain("- codex: compatible; capability unknown");
    expect(stdout).not.toContain("- cursor:");
    await expect(run("show", "write-release-notes", "--raw", "--json")).rejects.toMatchObject({
      exitCode: 2,
    });
    stdout = "";
    await run("show", "write-release-notes", "--location");
    expect(stdout).toContain(path.join("docs", "catalog", "write-release-notes.md"));
    await expect(run("show", "write-release-notes", "--location", "--open")).rejects.toMatchObject({
      exitCode: 2,
    });
    await expect(run("show", "write-release-notes", "--location", "--json")).rejects.toMatchObject({
      exitCode: 2,
    });
  });

  it("reports an actionable empty installation status", async () => {
    await run("status");
    expect(stdout).toContain("No workflows are installed");
    expect(stdout).toContain("awf install <workflow-id> --agent <agent> --dry-run");
    stdout = "";
    await run("status", "--json");
    expect(JSON.parse(stdout)).toMatchObject({
      schema_version: 1,
      project_context: {
        project_root: project,
        selection_source: "package",
        project_root_fallback: false,
      },
      installations: [],
    });
    await expect(run("status", "write-release-notes")).rejects.toMatchObject({
      code: "NOT_FOUND",
      details: {
        workflow: "write-release-notes",
        remediation: expect.stringContaining("awf install write-release-notes --dry-run"),
      },
    });
  });

  it("filters healthy status records while retaining complete summary counts", async () => {
    await run("init", "--agent", "codex", "--target", "status target");
    stdout = "";
    await run("install", "write-release-notes", "--json");
    const manifest = JSON.parse(stdout) as { files: Array<{ path: string }> };

    stdout = "";
    await run("status", "--failures-only", "--json");
    expect(JSON.parse(stdout)).toMatchObject({
      schema_version: 1,
      project_context: {
        project_root: project,
        selection_source: "config",
        project_root_fallback: false,
      },
      filter: "failures-only",
      summary: { total: 1, healthy: 1, drifted: 0, invalid: 0 },
      installations: [],
    });
    stdout = "";
    await run("status", "--failures-only");
    expect(stdout).toContain("No drifted or invalid workflows were found");
    expect(stdout).toContain("1 healthy, 0 drifted, 0 invalid");

    const managedFile = manifest.files[0]?.path;
    if (!managedFile) throw new Error("The installed fixture did not contain a managed file.");
    const installedPath = path.join(project, "status target", managedFile);
    await writeFile(installedPath, `${await readFile(installedPath, "utf8")}local edit\n`);

    stdout = "";
    await run("status", "--failures-only", "--json");
    expect(JSON.parse(stdout)).toMatchObject({
      filter: "failures-only",
      summary: { total: 1, healthy: 0, drifted: 1, invalid: 0 },
      installations: [{ id: "write-release-notes", status: "drifted" }],
    });
    expect(process.exitCode).toBe(1);
  });

  it("suggests nearby workflow IDs without weakening ID validation", async () => {
    await expect(run("show", "review-pull-reques")).rejects.toMatchObject({
      code: "MISSING_FILE",
      details: {
        suggestions: ["review-pull-request"],
        remediation: expect.stringContaining("awf list"),
      },
    });
    await expect(run("show", "Review-Pull-Request")).rejects.toMatchObject({
      code: "INVALID_RECIPE",
    });
  });

  it("prints a public documentation fallback when no local page or opener is available", async () => {
    const packagedCatalog = path.join(project, "catalog");
    await mkdir(packagedCatalog);
    await cp(
      path.join(repositoryRoot, "recipes", "write-release-notes"),
      path.join(packagedCatalog, "write-release-notes"),
      { recursive: true },
    );
    process.env.AWF_CATALOG_ROOT = packagedCatalog;
    await testProgram({ documentationOpener: async () => false }).parseAsync(
      ["show", "write-release-notes", "--open"],
      { from: "user" },
    );
    expect(stdout).toContain(
      "https://kauanpolydoro.github.io/agentic-workflows/catalog/write-release-notes",
    );
    expect(stdout).toContain("Could not open the documentation with the native handler");
  });

  it("waits for the documentation opener to report its real exit status", async () => {
    const documentationOpener = vi.fn().mockResolvedValue(false);
    await testProgram({ documentationOpener }).parseAsync(
      ["show", "write-release-notes", "--open"],
      { from: "user" },
    );
    expect(documentationOpener).toHaveBeenCalledOnce();
    expect(stdout).toContain("Could not open the documentation with the native handler");
    expect(stdout).not.toContain("Opened ");
  });

  it("reports a successful documentation opener only after exit zero", async () => {
    const documentationOpener = vi.fn().mockResolvedValue(true);
    await testProgram({ documentationOpener }).parseAsync(
      ["show", "write-release-notes", "--open"],
      { from: "user" },
    );
    expect(documentationOpener).toHaveBeenCalledOnce();
    expect(stdout).toContain("Opened ");
    expect(stdout).toContain(path.join("docs", "catalog", "write-release-notes.md"));

    stdout = "";
    await testProgram({ documentationOpener }).parseAsync(
      ["show", "write-release-notes", "--open", "--json"],
      { from: "user" },
    );
    expect(JSON.parse(stdout)).toEqual({
      schema_version: 1,
      target: path.join(repositoryRoot, "docs/catalog/write-release-notes.md"),
      opened: true,
    });
  });

  it("propagates cancellation while a documentation opener is active", async () => {
    const controller = new AbortController();
    const interruption = new Error("synthetic opener cancellation");
    interruption.name = "AbortError";
    let reportStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      reportStarted = resolve;
    });
    const documentationOpener = (_documentation: string, signal?: AbortSignal) =>
      new Promise<boolean>((_resolve, reject) => {
        reportStarted();
        if (signal?.aborted) {
          reject(signal.reason ?? new Error("Documentation opening was aborted."));
          return;
        }
        signal?.addEventListener(
          "abort",
          () => reject(signal.reason ?? new Error("Documentation opening was aborted.")),
          { once: true },
        );
      });
    const pending = testProgram({
      signal: controller.signal,
      documentationOpener,
    }).parseAsync(["show", "write-release-notes", "--open"], { from: "user" });
    await started;
    controller.abort(interruption);
    await expect(pending).rejects.toBe(interruption);
  });

  it("uses initialized defaults and completes the managed lifecycle", async () => {
    await run("init", "--agent", "codex", "--target", "managed path");
    const config = parse(
      await readFile(path.join(project, ".agentic-workflows/config.yml"), "utf8"),
    );
    expect(config).toEqual({
      schema_version: 1,
      default_agent: "codex",
      default_target: "managed path",
    });
    await mkdir(path.join(project, "managed path"));
    stdout = "";
    await run("install", "write-release-notes", "--json");
    const manifest = JSON.parse(stdout) as {
      adapter: { id: string };
      files: Array<{ path: string; role: string }>;
    };
    expect(manifest.adapter.id).toBe("codex");
    expect(manifest.files.some((file) => file.role === "policy")).toBe(true);
    stdout = "";
    await run("status", "--json");
    expect(JSON.parse(stdout)).toMatchObject({
      schema_version: 1,
      installations: [
        {
          id: "write-release-notes",
          status: "healthy",
          agent: "codex",
          issue: null,
        },
      ],
    });
    stdout = "";
    await run("manifest", "write-release-notes", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ adapter: { id: "codex" } });
    stdout = "";
    await run("manifest", "write-release-notes");
    expect(stdout).toContain("schema_version");
    stdout = "";
    await run("validate", path.join(project, "managed path"), "--strict", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, installations: 1, strict: true });
    stdout = "";
    await run("update", "write-release-notes", "--dry-run", "--json");
    const plan = JSON.parse(stdout) as {
      changes: { create: string[]; replace: string[]; unchanged: string[]; retire: string[] };
      plan: { schema_version: number; operation: string };
    };
    expect(plan.plan).toEqual(expect.objectContaining({ schema_version: 1, operation: "update" }));
    expect(plan.changes.create).toEqual([]);
    expect(plan.changes.retire).toEqual([]);
    expect(plan.changes.replace).toEqual([]);
    expect(plan.changes.unchanged.length).toBeGreaterThan(0);
    stdout = "";
    await run("update", "write-release-notes", "--dry-run");
    expect(stdout).toContain("Would update write-release-notes:");
    expect(stdout).toContain("Create:\n- none");
    expect(stdout).toContain("Unchanged:\n-");
    expect(stdout).toContain("No files were changed.");
    await run("update", "write-release-notes");
    stdout = "";
    await run("remove", "write-release-notes", "--dry-run");
    expect(stdout).toContain("Would remove write-release-notes:");
    expect(stdout).toContain("Remove:\n-");
    expect(stdout).toContain("No files were changed.");
    await expect(
      stat(path.join(project, "managed path/.agents/skills/write-release-notes/SKILL.md")),
    ).resolves.toBeDefined();
    stdout = "";
    await run("remove", "write-release-notes", "--dry-run", "--json");
    expect(JSON.parse(stdout)).toMatchObject({
      requiresForce: false,
      changes: { modifiedManagedFiles: [], missingManagedFiles: [] },
      plan: { schema_version: 1, operation: "remove", dry_run: true },
    });
    stdout = "";
    await run("remove", "write-release-notes");
    await expect(
      stat(path.join(project, "managed path/.agents/skills/write-release-notes/SKILL.md")),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("guides interactive init while flags and non-interactive use remain deterministic", async () => {
    const wizard = vi.fn().mockResolvedValue({ agent: "codex", target: "guided target" });
    await testProgram({ interactive: true, initWizard: wizard }).parseAsync(["init"], {
      from: "user",
    });
    expect(wizard).toHaveBeenCalledOnce();
    expect(
      parse(await readFile(path.join(project, ".agentic-workflows/config.yml"), "utf8")),
    ).toEqual({
      schema_version: 1,
      default_agent: "codex",
      default_target: "guided target",
    });
    expect(stdout).toContain("Default agent: codex");
    expect(stdout).toContain("Next: awf install <workflow-id> --dry-run");

    wizard.mockClear();
    await expect(
      testProgram({ interactive: true, initWizard: wizard }).parseAsync(["init"], {
        from: "user",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(wizard).not.toHaveBeenCalled();

    stdout = "";
    await testProgram({ interactive: true, initWizard: wizard }).parseAsync(
      ["init", "--force", "--agent", "generic", "--target", "."],
      { from: "user" },
    );
    expect(wizard).not.toHaveBeenCalled();
    expect(
      parse(await readFile(path.join(project, ".agentic-workflows/config.yml"), "utf8")),
    ).toMatchObject({ default_agent: "generic", default_target: "." });

    await testProgram({ interactive: true, initWizard: wizard }).parseAsync(
      ["init", "--force", "--no-interactive"],
      { from: "user" },
    );
    expect(wizard).not.toHaveBeenCalled();

    wizard.mockClear();
    stdout = "";
    await testProgram({ interactive: false, initWizard: wizard }).parseAsync(
      ["init", "--force", "--wizard"],
      { from: "user" },
    );
    expect(wizard).toHaveBeenCalledOnce();
    expect(
      parse(await readFile(path.join(project, ".agentic-workflows/config.yml"), "utf8")),
    ).toMatchObject({ default_agent: "codex", default_target: "guided target" });

    for (const conflicting of [
      ["--json"],
      ["--no-interactive"],
      ["--agent", "codex"],
      ["--target", "managed"],
    ]) {
      await expect(
        testProgram({ interactive: false, initWizard: wizard }).parseAsync(
          ["init", "--force", "--wizard", ...conflicting],
          { from: "user" },
        ),
      ).rejects.toMatchObject({
        code: "awf.conflictingInitialization",
        exitCode: 2,
      });
    }
    expect(wizard).toHaveBeenCalledOnce();

    wizard.mockClear();
    stdout = "";
    await testProgram({ interactive: true, initWizard: wizard }).parseAsync(
      ["init", "--force", "--json", "--agent", "codex", "--target", "machine target"],
      { from: "user" },
    );
    expect(wizard).not.toHaveBeenCalled();
    expect(JSON.parse(stdout)).toMatchObject({
      schema_version: 1,
      created: false,
      replaced: true,
      config_path: ".agentic-workflows/config.yml",
      project_context: { source: "config" },
      configuration: {
        schema_version: 1,
        default_agent: "codex",
        default_target: "machine target",
      },
    });
  });

  it("warns only human commands when project-root discovery falls back to the current directory", async () => {
    await rm(path.join(project, "package.json"));
    await run("init", "--agent", "generic");
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringContaining("no Git, AWF configuration, or package marker was found"),
    );

    vi.mocked(process.stderr.write).mockClear();
    await rm(path.join(project, ".agentic-workflows"), { recursive: true });
    stdout = "";
    await run("status", "--json");
    expect(process.stderr.write).not.toHaveBeenCalled();
    expect(JSON.parse(stdout)).toMatchObject({
      schema_version: 1,
      project_context: {
        project_root: project,
        selection_source: "cwd",
        project_root_fallback: true,
        reason: expect.stringContaining("invocation directory"),
      },
    });

    stdout = "";
    await run("context", "--json");
    expect(process.stderr.write).not.toHaveBeenCalled();
    expect(JSON.parse(stdout)).toMatchObject({
      project_root: project,
      selection_source: "cwd",
      project_root_fallback: true,
    });

    stdout = "";
    await run("doctor", "--json");
    expect(process.stderr.write).not.toHaveBeenCalled();
    expect(JSON.parse(stdout)).toMatchObject({
      projectContext: {
        root: project,
        source: "cwd",
        reason: expect.stringContaining("invocation directory"),
      },
    });
  });

  it("keeps dry-run colorless, non-mutating, and explicit about post-install use", async () => {
    process.env.NO_COLOR = "1";
    const target = "dry run path with spaces";
    await run(
      "install",
      "write-release-notes",
      "--agent",
      "codex",
      "--target",
      target,
      "--dry-run",
    );
    expect(stdout).toContain("Would install write-release-notes for codex:");
    expect(stdout).toContain("output.schema.json");
    expect(stdout).toContain("Invoke explicitly with: $write-release-notes");
    expect(stdout).toContain("Warning:");
    expect(stdout).toContain("does not prove agent execution or workflow outcome quality");
    expect(stdout).toContain("Create:\n-");
    expect(stdout).not.toContain("Proposed generated content:");
    expect(stdout).not.toContain("\u001b");
    await expect(stat(path.join(project, target))).rejects.toMatchObject({ code: "ENOENT" });

    stdout = "";
    await run(
      "install",
      "write-release-notes",
      "--agent",
      "codex",
      "--target",
      target,
      "--dry-run",
      "--json",
    );
    const manifest = JSON.parse(stdout) as { files: Array<{ role: string }> };
    expect(manifest.files.map((file) => file.role)).toContain("output-schema");
    expect(stdout).not.toContain("Would install");
    await expect(stat(path.join(project, target))).rejects.toMatchObject({ code: "ENOENT" });

    stdout = "";
    await run(
      "install",
      "write-release-notes",
      "--agent",
      "codex",
      "--target",
      target,
      "--dry-run",
      "--show-content",
    );
    expect(stdout).toContain("Proposed generated content:");
    expect(stdout).toContain("=== .agents/skills/write-release-notes/SKILL.md (entrypoint) ===");
    await expect(stat(path.join(project, target))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("rejects content previews outside dry-run mode", async () => {
    await expect(run("install", "write-release-notes", "--show-content")).rejects.toMatchObject({
      exitCode: 2,
      code: "awf.contentPreviewRequiresDryRun",
    });
    await expect(run("update", "write-release-notes", "--show-content")).rejects.toMatchObject({
      exitCode: 2,
      code: "awf.contentPreviewRequiresDryRun",
    });
  });

  it("renders declared effects and approval gates for a write-capable recipe", async () => {
    await run("install", "generate-tests", "--dry-run");
    expect(stdout).toContain("Declared workflow effects: writes_code");
    expect(stdout).toContain("Declared human approval gates remain advisory:");
  });

  it("detects strict installation drift and supports explicit forced recovery", async () => {
    await run("install", "write-release-notes", "--agent", "generic");
    const checklist = path.join(
      project,
      ".agentic-workflows/workflows/write-release-notes/checklist.md",
    );
    await writeFile(checklist, `${await readFile(checklist, "utf8")}local edit\n`);
    await expect(run("validate", project, "--json")).resolves.toBeUndefined();
    await expect(run("validate", project, "--strict")).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    await expect(run("manifest", "write-release-notes")).rejects.toMatchObject({
      code: "INVALID_MANIFEST",
    });
    await expect(run("update", "write-release-notes")).rejects.toMatchObject({
      code: "MODIFIED_FILE",
    });
    await run("update", "write-release-notes", "--force");
    await run("remove", "write-release-notes");
  });

  it("validates a catalog and a single recipe in strict mode", async () => {
    await run("validate", "--strict", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, recipes: 21 });
    stdout = "";
    await run("validate", path.join(repositoryRoot, "recipes"), "--strict", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, recipes: 21 });
    stdout = "";
    await run(
      "validate",
      path.join(repositoryRoot, "recipes/write-release-notes/recipe.yml"),
      "--strict",
      "--json",
    );
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, recipes: 1 });
    stdout = "";
    await run("validate", path.join(repositoryRoot, "recipes/write-release-notes"), "--strict");
    expect(stdout).toContain("Valid: 1 recipe(s), 0 installation(s); strict=true.");
  });

  it("validates manifest files and the internal installation directory", async () => {
    await run("install", "write-release-notes", "--agent", "generic");
    const manifest = path.join(project, ".agentic-workflows/installations/write-release-notes.yml");
    stdout = "";
    await run("validate", manifest, "--json");
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, installations: 1, strict: false });
    stdout = "";
    await run("validate", manifest, "--strict", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, installations: 1, strict: true });
    stdout = "";
    await run("validate", path.join(project, ".agentic-workflows"), "--strict", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, installations: 1, strict: true });
    stdout = "";
    await run("validate", path.dirname(manifest), "--strict", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, installations: 1, strict: true });
  });

  it("ignores non-manifest files in an installation directory", async () => {
    await run("init");
    const installations = path.join(project, ".agentic-workflows", "installations");
    await mkdir(installations, { recursive: true });
    await writeFile(path.join(installations, "README.txt"), "not a manifest\n");
    stdout = "";
    await run("validate", path.join(project, ".agentic-workflows"), "--strict", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ valid: true, installations: 0, strict: true });
  });

  it("rejects non-file entries that look like installation manifests", async () => {
    await run("init");
    const installations = path.join(project, ".agentic-workflows", "installations");
    await mkdir(path.join(installations, "broken.yml"), { recursive: true });

    await expect(
      run("validate", path.join(project, ".agentic-workflows"), "--strict", "--json"),
    ).rejects.toMatchObject({
      code: "INVALID_PATH",
      details: { issues: [expect.objectContaining({ code: "INVALID_PATH" })] },
    });
  });

  it("rejects unsupported validation files and malformed workflow IDs", async () => {
    const unsupported = path.join(project, "notes.txt");
    await writeFile(unsupported, "not a supported validation target\n");
    await expect(run("validate", unsupported, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_PATH",
      details: { issues: [expect.objectContaining({ code: "INVALID_PATH" })] },
    });
    await expect(run("show", "../outside")).rejects.toMatchObject({ code: "INVALID_RECIPE" });
    await expect(run("show", "Uppercase-ID")).rejects.toMatchObject({ code: "INVALID_RECIPE" });
  });

  it("does not classify a symlink-only recipe catalog as an empty project", async () => {
    const recipes = path.join(project, "recipes");
    await mkdir(recipes);
    await symlink(
      path.join(repositoryRoot, "recipes", "write-release-notes"),
      path.join(recipes, "write-release-notes"),
      "dir",
    );
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_PATH",
      details: { issues: [expect.objectContaining({ code: "INVALID_PATH" })] },
    });
  });

  it("accepts an initialized project with no installations", async () => {
    await run("init");
    stdout = "";
    await run("validate", project, "--strict", "--json");
    expect(JSON.parse(stdout)).toEqual({
      schema_version: 1,
      valid: true,
      recipes: 0,
      installations: 0,
      strict: true,
    });
  });

  it("reports doctor checks as structured records", async () => {
    await run("--project-root", project, "doctor", "--json");
    const result = JSON.parse(stdout) as {
      schema_version: number;
      status: string;
      healthy: boolean;
      exit_code: number;
      projectContext: { root: string; source: string; reason: string };
      summary: { total: number; pass: number; warn: number; fail: number };
      checks: Array<{
        schema_version: number;
        check: string;
        status: string;
        remediation: string | null;
        data: Record<string, unknown> | null;
      }>;
    };
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "node" }),
        expect.objectContaining({ check: "corepack" }),
        expect.objectContaining({ check: "pnpm" }),
        expect.objectContaining({ check: "project-root" }),
        expect.objectContaining({ check: "catalog" }),
        expect.objectContaining({ check: "generated-catalog" }),
        expect.objectContaining({ check: "generated-artifacts" }),
        expect.objectContaining({ check: "adapter-registry" }),
        expect.objectContaining({ check: "installations" }),
      ]),
    );
    expect(typeof result.healthy).toBe("boolean");
    expect(result.schema_version).toBe(1);
    expect(result.status).toBe(result.healthy ? "pass" : "fail");
    expect(result.exit_code).toBe(result.healthy ? 0 : 1);
    expect(result.summary.total).toBe(result.checks.length);
    expect(
      result.checks.every(
        (check) =>
          check.schema_version === 1 &&
          "remediation" in check &&
          "data" in check &&
          ["pass", "warn", "fail"].includes(check.status),
      ),
    ).toBe(true);
    expect(result.projectContext).toEqual({
      root: project,
      source: "explicit",
      reason: expect.stringContaining("--project-root"),
    });
    expect((await readdir(project)).some((entry) => entry.startsWith(".awf-doctor-"))).toBe(false);

    stdout = "";
    await run("--project-root", project, "doctor", "--failures-only", "--json");
    const filtered = JSON.parse(stdout) as {
      filter: string;
      summary: { pass: number; warn: number; fail: number };
      checks: Array<{ status: string }>;
    };
    expect(filtered.filter).toBe("failures-only");
    expect(filtered.summary.pass).toBeGreaterThan(0);
    expect(filtered.checks.every((check) => check.status !== "pass")).toBe(true);
  });

  it("reports an invalid configured target when it is a regular file", async () => {
    const target = path.join(project, "target-file");
    await writeFile(target, "not a directory\n");
    await mkdir(path.join(project, ".agentic-workflows"));
    await writeFile(
      path.join(project, ".agentic-workflows", "config.yml"),
      "schema_version: 1\ndefault_agent: generic\ndefault_target: target-file\n",
    );

    stdout = "";
    process.exitCode = undefined;
    await run("--project-root", project, "doctor", "--json");

    const result = JSON.parse(stdout) as {
      checks: Array<{ check: string; status: string }>;
    };
    expect(result.checks).toContainEqual(
      expect.objectContaining({ check: "default-target", status: "fail" }),
    );
    expect(result.checks).toContainEqual(
      expect.objectContaining({ check: "target-writable", status: "fail" }),
    );
    stdout = "";
    await run("--project-root", project, "doctor");
    expect(stdout).toContain("Unhealthy project");
  });

  it("handles an unset PATH while diagnosing command availability", async () => {
    const previousPath = process.env.PATH;
    delete process.env.PATH;
    try {
      await run("--project-root", project, "doctor", "--json");
      const result = JSON.parse(stdout) as {
        healthy: boolean;
        checks: Array<{ check: string; status: string }>;
      };
      expect(result.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ check: "corepack", status: "warn" }),
          expect.objectContaining({ check: "pnpm", status: "warn" }),
        ]),
      );
      expect(result.healthy).toBe(true);

      stdout = "";
      process.exitCode = undefined;
      await run("--project-root", project, "doctor", "--maintainer", "--json");
      const maintainerResult = JSON.parse(stdout) as {
        healthy: boolean;
        checks: Array<{ check: string; status: string }>;
      };
      expect(maintainerResult.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ check: "corepack", status: "fail" }),
          expect.objectContaining({ check: "pnpm", status: "fail" }),
        ]),
      );
      expect(maintainerResult.healthy).toBe(false);
    } finally {
      if (previousPath === undefined) delete process.env.PATH;
      else process.env.PATH = previousPath;
    }
  });

  it("reports repository site-base diagnostics in readable human output", async () => {
    stdout = "";
    process.exitCode = undefined;
    await run("--project-root", repositoryRoot, "doctor");
    expect(stdout).toContain("[PASS] project-root:");
    expect(stdout).toContain("[PASS] site-base:");
    expect(stdout).not.toContain("[object Object]");
    expect(process.exitCode).toBeUndefined();
  });

  it("makes doctor unhealthy when a managed installation is modified", async () => {
    await run("install", "write-release-notes", "--agent", "generic");
    const checklist = path.join(
      project,
      ".agentic-workflows/workflows/write-release-notes/checklist.md",
    );
    await writeFile(checklist, `${await readFile(checklist, "utf8")}local edit\n`);
    stdout = "";
    process.exitCode = undefined;

    await run("--project-root", project, "doctor", "--json");

    const result = JSON.parse(stdout) as {
      healthy: boolean;
      checks: Array<{ check: string; status: string; detail: string }>;
    };
    expect(result.healthy).toBe(false);
    expect(result.checks).toContainEqual(
      expect.objectContaining({ check: "installations", status: "fail" }),
    );
    expect(process.exitCode).toBe(1);
  });

  it("diagnoses installations and writability in the configured default target", async () => {
    const target = path.join(project, "managed target");
    await run("init", "--target", "managed target");
    await mkdir(target);
    await run("install", "write-release-notes", "--agent", "generic");
    const checklist = path.join(
      target,
      ".agentic-workflows/workflows/write-release-notes/checklist.md",
    );
    await writeFile(checklist, `${await readFile(checklist, "utf8")}local edit\n`);
    stdout = "";
    process.exitCode = undefined;

    await run("--project-root", project, "doctor", "--json");

    const result = JSON.parse(stdout) as {
      checks: Array<{ check: string; status: string; detail: string }>;
    };
    expect(result.checks).toContainEqual(
      expect.objectContaining({ check: "default-target", status: "pass", detail: target }),
    );
    expect(result.checks).toContainEqual(
      expect.objectContaining({ check: "target-writable", status: "pass", detail: target }),
    );
    const installations = result.checks.find((check) => check.check === "installations");
    expect(installations).toEqual(expect.objectContaining({ status: "fail" }));
    expect(installations?.detail).toContain("write-release-notes: [INVALID_MANIFEST]");
    expect(installations?.detail).toContain("checklist.md=modified");
    expect((await readdir(target)).some((entry) => entry.startsWith(".awf-doctor-"))).toBe(false);
  });

  it("reports a lifecycle lock without deleting it", async () => {
    await run("init");
    const lifecycleLock = path.join(project, ".agentic-workflows", "lifecycle.lock");
    await writeFile(
      lifecycleLock,
      '{"schema_version":1,"pid":123,"acquired_at":"2026-07-20T12:00:00.000Z","token":"must-not-leak"}\n',
    );
    stdout = "";
    process.exitCode = undefined;

    await run("--project-root", project, "doctor", "--json");

    const result = JSON.parse(stdout) as {
      checks: Array<{
        check: string;
        status: string;
        detail: string;
        remediation?: string;
        data?: Record<string, unknown>;
      }>;
    };
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        check: "lifecycle-lock",
        status: "fail",
        detail: expect.stringContaining(lifecycleLock),
        remediation: expect.stringContaining("PID 123"),
        data: {
          path: lifecycleLock,
          recordValid: true,
          owner: { pid: 123, acquiredAt: "2026-07-20T12:00:00.000Z" },
        },
      }),
    );
    expect(await readFile(lifecycleLock, "utf8")).toContain('"pid":123');
    expect(stdout).not.toContain("must-not-leak");
  });

  it("reports abandoned lifecycle transactions without deleting recovery state", async () => {
    await run("init");
    const transaction = path.join(
      project,
      ".agentic-workflows",
      "transactions",
      "abandoned-transaction",
    );
    await mkdir(transaction, { recursive: true });
    await writeFile(path.join(transaction, "0.staged"), "retained recovery state\n");
    stdout = "";
    process.exitCode = undefined;

    await run("--project-root", project, "doctor", "--json");

    const result = JSON.parse(stdout) as {
      checks: Array<{
        check: string;
        status: string;
        remediation?: string;
        data?: Record<string, unknown>;
      }>;
    };
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        check: "lifecycle-transactions",
        status: "fail",
        remediation: expect.stringContaining("remove only verified abandoned transaction"),
        data: {
          path: path.dirname(transaction),
          count: 1,
          entries: ["abandoned-transaction"],
        },
      }),
    );
    await expect(readFile(path.join(transaction, "0.staged"), "utf8")).resolves.toBe(
      "retained recovery state\n",
    );
    expect(process.exitCode).toBe(1);
  });

  it("keeps doctor structured when configuration prevents safe target resolution", async () => {
    const configurationDirectory = path.join(project, ".agentic-workflows");
    await mkdir(configurationDirectory);
    await writeFile(
      path.join(configurationDirectory, "config.yml"),
      "schema_version: 1\ndefault_agent: unknown\ndefault_target: ../outside\n",
    );
    stdout = "";
    process.exitCode = undefined;

    await run("--project-root", project, "doctor", "--json");

    const result = JSON.parse(stdout) as {
      healthy: boolean;
      checks: Array<{ check: string; status: string; detail: string }>;
    };
    expect(result.healthy).toBe(false);
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "config", status: "fail" }),
        expect.objectContaining({ check: "default-target", status: "fail" }),
        expect.objectContaining({ check: "target-writable", status: "fail" }),
        expect.objectContaining({ check: "lifecycle-lock", status: "fail" }),
        expect.objectContaining({ check: "lifecycle-transactions", status: "fail" }),
        expect.objectContaining({ check: "installations", status: "fail" }),
      ]),
    );
    expect(result.checks.find((check) => check.check === "installations")?.detail).toContain(
      "configured default target could not be resolved safely",
    );
    expect(process.exitCode).toBe(1);
  });

  it("distinguishes a not-yet-created default target from an unsafe target", async () => {
    await run("init", "--target", "future-target");
    stdout = "";
    process.exitCode = undefined;

    await run("--project-root", project, "doctor", "--json");

    const result = JSON.parse(stdout) as {
      checks: Array<{ check: string; status: string; detail: string }>;
    };
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "default-target", status: "warn" }),
        expect.objectContaining({ check: "target-writable", status: "warn" }),
        expect.objectContaining({ check: "lifecycle-lock", status: "pass" }),
        expect.objectContaining({ check: "lifecycle-transactions", status: "pass" }),
        expect.objectContaining({ check: "installations", status: "pass" }),
      ]),
    );
    expect(process.exitCode).toBeUndefined();
  });

  it("rejects unsafe targets, obsolete no-op flags, and conflicting init", async () => {
    await expect(
      run("install", "write-release-notes", "--target", "../outside"),
    ).rejects.toMatchObject({ code: "INVALID_PATH" });
    await expect(run("install", "write-release-notes", "--yes")).rejects.toMatchObject({
      exitCode: 1,
    });
    await run("init");
    await expect(run("init")).rejects.toMatchObject({ code: "CONFLICT" });
    await run("init", "--force", "--agent", "generic");
  });

  it("rejects absolute, empty, and whitespace-padded configured targets", async () => {
    for (const target of [path.join(project, "absolute"), "", " padded "]) {
      await expect(run("init", "--target", target)).rejects.toMatchObject({
        code: "INVALID_PATH",
      });
    }
  });

  it("honors an aborted command signal before lifecycle mutation", async () => {
    const controller = new AbortController();
    const interruption = new Error("synthetic interrupt");
    interruption.name = "AbortError";
    controller.abort(interruption);

    await expect(
      testProgram({ signal: controller.signal }).parseAsync(
        ["install", "write-release-notes", "--agent", "generic"],
        { from: "user" },
      ),
    ).rejects.toBe(interruption);
    await expect(
      stat(path.join(project, ".agentic-workflows/installations/write-release-notes.yml")),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("creates a standard AbortError when cancellation has no explicit reason", async () => {
    const signal = { aborted: true, reason: undefined } as AbortSignal;

    await expect(
      testProgram({ signal }).parseAsync(["list"], { from: "user" }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });

  it("returns a structured missing-target issue for validation", async () => {
    const missing = path.join(project, "missing-validation-target");
    await expect(run("validate", missing, "--strict", "--json")).rejects.toMatchObject({
      code: "MISSING_FILE",
      details: {
        issues: [
          expect.objectContaining({
            code: "MISSING_FILE",
            path: missing,
          }),
        ],
      },
    });
  });

  it("rejects symlinked and oversized generated catalogs", async () => {
    const source = process.env.AWF_GENERATED_CATALOG_PATH as string;
    const linked = path.join(project, "linked-catalog.json");
    await symlink(source, linked, "file");
    process.env.AWF_GENERATED_CATALOG_PATH = linked;
    await expect(run("list", "--json")).rejects.toMatchObject({ code: "INVALID_PATH" });

    const oversized = path.join(project, "oversized-catalog.json");
    await writeFile(oversized, Buffer.alloc(16 * 1024 * 1024 + 1));
    process.env.AWF_GENERATED_CATALOG_PATH = oversized;
    await expect(run("list", "--json")).rejects.toMatchObject({ code: "FILE_TOO_LARGE" });
  });

  it("rejects symlinked and oversized project configuration", async () => {
    const configurationDirectory = path.join(project, ".agentic-workflows");
    await mkdir(configurationDirectory);
    const external = path.join(project, "external-config.yml");
    await writeFile(external, "schema_version: 1\ndefault_agent: generic\ndefault_target: .\n");
    const configuration = path.join(configurationDirectory, "config.yml");
    await symlink(external, configuration, "file");
    await expect(run("install", "write-release-notes", "--dry-run")).rejects.toMatchObject({
      code: "INVALID_PATH",
    });

    await rm(configuration);
    await writeFile(configuration, Buffer.alloc(64 * 1024 + 1));
    await expect(run("install", "write-release-notes", "--dry-run")).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
    });
  });

  it("explains unsupported configuration schemas and supports explicit recreation", async () => {
    const directory = path.join(project, ".agentic-workflows");
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, "config.yml"),
      "schema_version: 2\ndefault_agent: generic\ndefault_target: .\n",
    );

    await expect(run("install", "write-release-notes", "--dry-run")).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      details: {
        schemaVersion: 2,
        supportedSchemaVersions: [1],
        remediation: expect.stringContaining("awf init --force --no-interactive"),
      },
    });

    stdout = "";
    await run("init", "--force", "--no-interactive", "--agent", "codex", "--target", "managed");
    expect(parse(await readFile(path.join(directory, "config.yml"), "utf8"))).toEqual({
      schema_version: 1,
      default_agent: "codex",
      default_target: "managed",
    });

    stdout = "";
    await run("install", "write-release-notes", "--dry-run", "--json");
    expect(JSON.parse(stdout)).toMatchObject({
      recipe: "write-release-notes",
      adapter: { id: "codex" },
    });
  });

  it.each([
    "schema_version: 1\ndefault_agent: unknown\ndefault_target: .\n",
    "schema_version: 1\ndefault_agent: generic\ndefault_target: ../outside\n",
    "schema_version: 1\ndefault_agent: generic\ndefault_target: .\nextra: true\n",
    "schema_version: [\n",
  ])("rejects invalid project configuration %#", async (configuration) => {
    const directory = path.join(project, ".agentic-workflows");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "config.yml"), configuration);
    await expect(run("install", "write-release-notes", "--dry-run")).rejects.toMatchObject({
      code: "INVALID_RECIPE",
    });
  });

  it("reports catalog and generated-catalog failures as doctor checks", async () => {
    process.env.AWF_CATALOG_ROOT = path.join(project, "missing-recipes");
    const invalidGenerated = path.join(project, "invalid-catalog.json");
    await writeFile(invalidGenerated, "not JSON\n");
    process.env.AWF_GENERATED_CATALOG_PATH = invalidGenerated;
    stdout = "";
    process.exitCode = undefined;
    await run("--project-root", project, "doctor", "--json");
    const result = JSON.parse(stdout) as {
      healthy: boolean;
      checks: Array<{ check: string; status: string }>;
    };
    expect(result.healthy).toBe(false);
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "catalog", status: "fail" }),
        expect.objectContaining({ check: "generated-catalog", status: "fail" }),
      ]),
    );
    expect(process.exitCode).toBe(1);
  });

  it("rejects malformed and schema-invalid generated catalog files", async () => {
    const generated = path.join(project, "catalog.json");
    process.env.AWF_GENERATED_CATALOG_PATH = generated;
    await writeFile(generated, "not JSON\n");
    await expect(run("list", "--json")).rejects.toMatchObject({ code: "MISSING_FILE" });
    await writeFile(generated, "[{}]\n");
    await expect(run("list", "--json")).rejects.toMatchObject({ code: "INVALID_RECIPE" });
  });

  it("rejects duplicate IDs in every generated-catalog consumer", async () => {
    const source = JSON.parse(
      await readFile(path.join(repositoryRoot, "generated", "catalog.json"), "utf8"),
    ) as Array<{ id: string }>;
    const duplicate = source.find((recipe) => recipe.id === "write-release-notes");
    expect(duplicate).toBeDefined();
    const generated = path.join(project, "catalog.json");
    await writeFile(generated, `${JSON.stringify(duplicate ? [duplicate, duplicate] : [])}\n`);
    process.env.AWF_GENERATED_CATALOG_PATH = generated;

    await expect(run("list", "--json")).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      details: {
        issues: [expect.objectContaining({ code: "DUPLICATE_GENERATED_RECIPE_ID" })],
      },
    });
  });

  it("detects a stale generated catalog during strict repository validation", async () => {
    const recipes = path.join(project, "recipes");
    await mkdir(recipes);
    await cp(
      path.join(repositoryRoot, "recipes", "write-release-notes"),
      path.join(recipes, "write-release-notes"),
      { recursive: true },
    );
    for (const documentation of ["quality/recipe-quality-standard.md", "guide/verification.md"]) {
      const destination = path.join(project, "docs", documentation);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(repositoryRoot, "docs", documentation), destination);
    }
    await mkdir(path.join(project, "scripts"));
    await writeFile(path.join(project, "scripts", "generate.ts"), "export {};\n");
    await mkdir(path.join(project, "verification"));
    await mkdir(path.join(project, "generated"));
    const catalog = JSON.parse(
      await readFile(path.join(repositoryRoot, "generated", "catalog.json"), "utf8"),
    ) as Array<{
      id: string;
      verification: { structural: { recipe_content_sha256: string } };
    }>;
    const releaseNotes = catalog.find((recipe) => recipe.id === "write-release-notes");
    expect(releaseNotes).toBeDefined();
    await writeFile(path.join(project, "generated", "catalog.json"), "[]\n");
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      details: {
        issues: [expect.objectContaining({ code: "MISSING_GENERATED_RECIPE" })],
      },
    });
    await writeFile(
      path.join(project, "generated", "catalog.json"),
      `${JSON.stringify(catalog)}\n`,
    );
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      details: {
        issues: expect.arrayContaining([
          expect.objectContaining({ code: "ORPHANED_GENERATED_RECIPE" }),
        ]),
      },
    });
    const staleMetadata = releaseNotes ? structuredClone(releaseNotes) : undefined;
    if (staleMetadata) {
      (staleMetadata as typeof staleMetadata & { summary: string }).summary =
        "Synthetic generated metadata drift.";
    }
    await writeFile(
      path.join(project, "generated", "catalog.json"),
      `${JSON.stringify(staleMetadata ? [staleMetadata] : [])}\n`,
    );
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      details: {
        issues: expect.arrayContaining([
          expect.objectContaining({ code: "STALE_GENERATED_METADATA" }),
        ]),
      },
    });
    const staleVerification = releaseNotes ? structuredClone(releaseNotes) : undefined;
    if (staleVerification) {
      const verification = (
        staleVerification as typeof staleVerification & {
          agents: {
            codex: {
              verification: {
                installation: { status: string; evidence: string[]; stale_records: number };
              };
            };
          };
        }
      ).agents.codex.verification.installation;
      verification.status = "passing";
      verification.evidence = ["verification/synthetic.yml"];
      verification.stale_records = 1;
    }
    await writeFile(
      path.join(project, "generated", "catalog.json"),
      `${JSON.stringify(staleVerification ? [staleVerification] : [])}\n`,
    );
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      details: {
        issues: expect.arrayContaining([
          expect.objectContaining({ code: "STALE_GENERATED_AGENT_VERIFICATION" }),
        ]),
      },
    });
    if (releaseNotes) releaseNotes.verification.structural.recipe_content_sha256 = "0".repeat(64);
    await writeFile(
      path.join(project, "generated", "catalog.json"),
      `${JSON.stringify(releaseNotes ? [releaseNotes] : [])}\n`,
    );

    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      details: {
        issues: [expect.objectContaining({ code: "STALE_GENERATED_RECIPE" })],
      },
    });
  });

  it("rejects ambiguous or inconsistent verification supersession graphs", async () => {
    const { recipes, evidenceDirectory, recipe, revision } = await createVerificationRepository();
    const base = syntheticUntestedEvidence({
      id: "write-release-notes-codex-base",
      recipeVersion: recipe.version,
      recipeHash: recipe.verification.structural.recipe_content_sha256,
      repositoryRevision: revision,
    });
    const record = (id: string, overrides: Record<string, unknown> = {}) => ({
      ...base,
      id,
      ...overrides,
    });
    const cases: Array<{
      records: Array<Record<string, unknown>>;
      message: string;
    }> = [
      {
        records: [record("duplicate-evidence"), record("duplicate-evidence")],
        message: "Duplicate verification evidence ID",
      },
      {
        records: [record("unknown-successor", { supersedes: "missing-predecessor" })],
        message: "supersedes unknown evidence record",
      },
      {
        records: [
          record("codex-predecessor"),
          record("claude-successor", {
            agent: "claude-code",
            adapter_version: adapterRegistry["claude-code"].version,
            supersedes: "codex-predecessor",
          }),
        ],
        message: "only for the same recipe and agent",
      },
      {
        records: [
          record("cycle-first", { supersedes: "cycle-second" }),
          record("cycle-second", { supersedes: "cycle-first" }),
        ],
        message: "supersession cycle",
      },
      {
        records: [record("duplicate-claim-first"), record("duplicate-claim-second")],
        message: "duplicates active verification claims",
      },
    ];

    for (const scenario of cases) {
      await replaceEvidenceRecords(evidenceDirectory, scenario.records);
      await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
        code: "INVALID_RECIPE",
        message: expect.stringContaining(scenario.message),
      });
    }
  });

  it("projects one current verification record after explicit supersession", async () => {
    const { recipes, evidenceDirectory, recipe, revision } = await createVerificationRepository();
    const base = syntheticUntestedEvidence({
      id: "write-release-notes-codex-original",
      recipeVersion: recipe.version,
      recipeHash: recipe.verification.structural.recipe_content_sha256,
      repositoryRevision: revision,
    });
    await replaceEvidenceRecords(evidenceDirectory, [
      base,
      {
        ...base,
        id: "write-release-notes-codex-recheck",
        supersedes: base.id,
      },
    ]);

    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      details: {
        issues: [
          expect.objectContaining({
            code: "STALE_GENERATED_AGENT_VERIFICATION",
            path: "generated/catalog.json#write-release-notes.agents.codex.verification",
          }),
        ],
      },
    });
  });

  it("aggregates observed verification statuses by precedence", async () => {
    const { repository, recipes, evidenceDirectory, recipe, revision } =
      await createVerificationRepository();
    const base = syntheticUntestedEvidence({
      id: "write-release-notes-codex-status",
      recipeVersion: recipe.version,
      recipeHash: recipe.verification.structural.recipe_content_sha256,
      repositoryRevision: revision,
    });
    const artifactDirectory = path.join(repository, "verification", "artifacts");
    await mkdir(artifactDirectory, { recursive: true });
    const retainedArtifact = async (name: string) => {
      const content = `synthetic ${name}\n`;
      await writeFile(path.join(artifactDirectory, name), content);
      return {
        path: `verification/artifacts/${name}`,
        sha256: createHash("sha256").update(content).digest("hex"),
      };
    };
    const commandLog = await retainedArtifact("command.txt");
    const stdoutArtifact = await retainedArtifact("stdout.txt");
    const stderrArtifact = await retainedArtifact("stderr.txt");
    const installationArtifact = await retainedArtifact("installation.txt");
    const inputFile = await retainedArtifact("input.md");
    const outputFile = await retainedArtifact("output.md");
    const observed = {
      ...base,
      command: "synthetic command",
      exit_code: 0,
      started_at: "2026-07-16T10:00:00Z",
      finished_at: "2026-07-16T10:00:01Z",
      environment: {
        runner_image: "synthetic",
        os: "synthetic",
        node_version: "24.13.1",
        pnpm_version: "10.28.2",
      },
      evidence: {
        ...base.evidence,
        command_log: commandLog,
        stdout: stdoutArtifact,
        stderr: stderrArtifact,
        installation_artifact: installationArtifact,
        input_file: inputFile,
        output_file: outputFile,
      },
    };
    const cases = [
      {
        id: "failing-installation",
        record: {
          ...observed,
          exit_code: 1,
          installation: { status: "failing" },
          execution: { status: "untested" },
          outcome: { status: "untested" },
        },
      },
      {
        id: "passing-execution",
        record: {
          ...observed,
          agent_version: "synthetic-agent 1.0.0",
          installation: { status: "passing" },
          execution: { status: "passing" },
          outcome: { status: "untested" },
        },
      },
      {
        id: "not-applicable-outcome",
        record: {
          ...base,
          installation: { status: "untested" },
          execution: { status: "untested" },
          outcome: { status: "not-applicable" },
        },
      },
    ] as const;

    for (const status of cases) {
      await replaceEvidenceRecords(evidenceDirectory, [
        {
          ...status.record,
          id: `write-release-notes-codex-${status.id}`,
        },
      ]);
      await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
        details: {
          issues: [expect.objectContaining({ code: "STALE_GENERATED_AGENT_VERIFICATION" })],
        },
      });
    }
  });

  it("rejects malformed, unknown, and unretained verification evidence", async () => {
    const { repository, recipes, evidenceDirectory, recipe, revision } =
      await createVerificationRepository();
    const base = syntheticUntestedEvidence({
      id: "write-release-notes-codex-artifact",
      recipeVersion: recipe.version,
      recipeHash: recipe.verification.structural.recipe_content_sha256,
      repositoryRevision: revision,
    });

    await rm(evidenceDirectory, { force: true, recursive: true });
    await mkdir(evidenceDirectory, { recursive: true });
    await writeFile(path.join(evidenceDirectory, "malformed.yml"), "record: [\n");
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      message: expect.stringContaining("Cannot parse verification evidence"),
    });

    await writeFile(path.join(evidenceDirectory, "malformed.yml"), stringify({ id: "invalid" }));
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      message: expect.stringContaining("Verification evidence is invalid"),
    });

    await replaceEvidenceRecords(evidenceDirectory, [{ ...base, recipe: "unknown-recipe" }]);
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      message: expect.stringContaining("references unknown recipe unknown-recipe"),
    });

    await replaceEvidenceRecords(evidenceDirectory, [
      {
        ...base,
        evidence: {
          ...base.evidence,
          command_log: {
            path: "outside-verification/log.txt",
            sha256: "0".repeat(64),
          },
        },
      },
    ]);
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_PATH",
      message: expect.stringContaining("must stay inside the verification tree"),
    });

    const artifact = path.join(repository, "verification", "artifacts", "log.txt");
    await mkdir(path.dirname(artifact), { recursive: true });
    await writeFile(artifact, "retained synthetic artifact\n");
    await replaceEvidenceRecords(evidenceDirectory, [
      {
        ...base,
        evidence: {
          ...base.evidence,
          command_log: {
            path: "verification/artifacts/log.txt",
            sha256: "0".repeat(64),
          },
        },
      },
    ]);
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      message: expect.stringContaining("does not match its retained hash"),
    });
  });

  it("rejects symbolic links in verification evidence groups and files", async () => {
    const { repository, recipes, evidenceDirectory, recipe, revision } =
      await createVerificationRepository();
    const external = path.join(repository, "external-evidence");
    await mkdir(external);
    await rm(evidenceDirectory, { force: true, recursive: true });
    await symlink(external, evidenceDirectory, "dir");
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_PATH",
      message: expect.stringContaining("entries must not be symbolic links"),
    });

    await rm(evidenceDirectory);
    await mkdir(evidenceDirectory);
    const externalRecord = path.join(external, "record.yml");
    await writeFile(
      externalRecord,
      stringify(
        syntheticUntestedEvidence({
          id: "write-release-notes-codex-symlink",
          recipeVersion: recipe.version,
          recipeHash: recipe.verification.structural.recipe_content_sha256,
          repositoryRevision: revision,
        }),
      ),
    );
    await symlink(externalRecord, path.join(evidenceDirectory, "record.yml"), "file");
    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_PATH",
      message: expect.stringContaining("files must not be symbolic links"),
    });
  });

  it("rejects verification evidence that cites an unavailable source revision", async () => {
    const repository = path.join(project, "repository");
    await mkdir(repository);
    for (const directory of ["docs", "generated", "recipes", "verification"]) {
      await cp(path.join(repositoryRoot, directory), path.join(repository, directory), {
        recursive: true,
      });
    }
    await cp(path.join(repositoryRoot, "package.json"), path.join(repository, "package.json"));
    await mkdir(path.join(repository, "scripts"));
    await cp(
      path.join(repositoryRoot, "scripts", "generate.ts"),
      path.join(repository, "scripts", "generate.ts"),
    );
    const catalog = JSON.parse(
      await readFile(path.join(repository, "generated", "catalog.json"), "utf8"),
    ) as Array<{
      id: string;
      version: string;
      verification: { structural: { recipe_content_sha256: string } };
    }>;
    const recipe = catalog.find((candidate) => candidate.id === "write-release-notes");
    expect(recipe).toBeDefined();
    const evidenceDirectory = path.join(repository, "verification", "synthetic");
    await mkdir(evidenceDirectory);
    await writeFile(
      path.join(evidenceDirectory, "forged-revision.yml"),
      stringify(
        syntheticUntestedEvidence({
          id: "write-release-notes-codex-forged-revision",
          recipeVersion: recipe?.version ?? "0.0.0",
          recipeHash: recipe?.verification.structural.recipe_content_sha256 ?? "0".repeat(64),
          repositoryRevision: "f".repeat(40),
        }),
      ),
    );
    process.env.AWF_CATALOG_ROOT = path.join(repository, "recipes");
    process.env.AWF_GENERATED_CATALOG_PATH = path.join(repository, "generated", "catalog.json");

    await expect(
      run("validate", path.join(repository, "recipes"), "--strict", "--json"),
    ).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      message: expect.stringContaining("unavailable source revision"),
    });
  });

  it("rejects verification evidence whose recipe hash does not match its cited commit", async () => {
    const repository = path.join(project, "repository");
    const recipes = path.join(repository, "recipes");
    await mkdir(recipes, { recursive: true });
    await cp(
      path.join(repositoryRoot, "recipes", "write-release-notes"),
      path.join(recipes, "write-release-notes"),
      { recursive: true },
    );
    for (const documentation of ["quality/recipe-quality-standard.md", "guide/verification.md"]) {
      const destination = path.join(repository, "docs", documentation);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(repositoryRoot, "docs", documentation), destination);
    }
    await cp(path.join(repositoryRoot, "package.json"), path.join(repository, "package.json"));
    await mkdir(path.join(repository, "scripts"));
    await cp(
      path.join(repositoryRoot, "scripts", "generate.ts"),
      path.join(repository, "scripts", "generate.ts"),
    );
    await mkdir(path.join(repository, "generated"));
    const catalog = JSON.parse(
      await readFile(path.join(repositoryRoot, "generated", "catalog.json"), "utf8"),
    ) as Array<{
      id: string;
      version: string;
      verification: { structural: { recipe_content_sha256: string } };
    }>;
    const recipe = catalog.find((candidate) => candidate.id === "write-release-notes");
    expect(recipe).toBeDefined();
    await writeFile(
      path.join(repository, "generated", "catalog.json"),
      `${JSON.stringify(recipe ? [recipe] : [])}\n`,
    );
    execFileSync("git", ["init", "--quiet"], { cwd: repository });
    execFileSync("git", ["config", "user.email", "synthetic@example.invalid"], {
      cwd: repository,
    });
    execFileSync("git", ["config", "user.name", "Synthetic Test"], { cwd: repository });
    execFileSync("git", ["add", "recipes/write-release-notes"], { cwd: repository });
    execFileSync("git", ["commit", "--quiet", "-m", "test: retain recipe source"], {
      cwd: repository,
    });
    const revision = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repository,
      encoding: "utf8",
    }).trim();
    const evidenceDirectory = path.join(repository, "verification", "synthetic");
    await mkdir(evidenceDirectory, { recursive: true });
    await writeFile(
      path.join(evidenceDirectory, "forged-hash.yml"),
      stringify(
        syntheticUntestedEvidence({
          id: "write-release-notes-codex-forged-hash",
          recipeVersion: recipe?.version ?? "0.0.0",
          recipeHash: "0".repeat(64),
          repositoryRevision: revision,
        }),
      ),
    );
    process.env.AWF_CATALOG_ROOT = recipes;
    process.env.AWF_GENERATED_CATALOG_PATH = path.join(repository, "generated", "catalog.json");

    await expect(run("validate", recipes, "--strict", "--json")).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      message: expect.stringContaining("does not match recipe content at its cited commit"),
    });
  });

  it("detects tampering across the complete generated artifact set", async () => {
    const repository = path.join(project, "repository");
    await mkdir(repository);
    for (const directory of ["docs", "generated", "recipes", "verification"]) {
      await cp(path.join(repositoryRoot, directory), path.join(repository, directory), {
        recursive: true,
      });
    }
    await cp(path.join(repositoryRoot, "package.json"), path.join(repository, "package.json"));
    await mkdir(path.join(repository, "scripts"));
    await cp(
      path.join(repositoryRoot, "scripts", "generate.ts"),
      path.join(repository, "scripts", "generate.ts"),
    );
    execFileSync("git", ["init", "--quiet"], { cwd: repository });
    execFileSync("git", ["fetch", "--quiet", repositoryRoot, "HEAD"], {
      cwd: repository,
    });
    execFileSync("git", ["reset", "--mixed", "--quiet", "FETCH_HEAD"], {
      cwd: repository,
    });
    process.env.AWF_CATALOG_ROOT = path.join(repository, "recipes");
    process.env.AWF_GENERATED_CATALOG_PATH = path.join(repository, "generated", "catalog.json");
    const generatedPage = path.join(repository, "docs", "catalog", "write-release-notes.md");
    await writeFile(generatedPage, `${await readFile(generatedPage, "utf8")}tampered\n`);

    await expect(
      run("validate", path.join(repository, "recipes"), "--strict", "--json"),
    ).rejects.toMatchObject({
      code: "INVALID_RECIPE",
      details: {
        issues: [
          expect.objectContaining({
            code: "STALE_GENERATED_ARTIFACT",
            path: "docs/catalog/write-release-notes.md",
          }),
        ],
      },
    });

    await writeFile(
      generatedPage,
      await readFile(
        path.join(repositoryRoot, "docs", "catalog", "write-release-notes.md"),
        "utf8",
      ),
    );
    const artifactManifestPath = path.join(repository, "generated", "artifact-manifest.json");
    const artifactManifest = JSON.parse(await readFile(artifactManifestPath, "utf8")) as {
      artifacts: Array<{ path: string; sha256: string }>;
    };
    artifactManifest.artifacts.reverse();
    await writeFile(artifactManifestPath, `${JSON.stringify(artifactManifest)}\n`);
    await expect(
      run("validate", path.join(repository, "recipes"), "--strict", "--json"),
    ).rejects.toMatchObject({
      details: {
        issues: [expect.objectContaining({ code: "UNSORTED_GENERATED_ARTIFACTS" })],
      },
    });

    artifactManifest.artifacts[0] = { path: "../invalid", sha256: "invalid" };
    await writeFile(artifactManifestPath, `${JSON.stringify(artifactManifest)}\n`);
    await expect(
      run("validate", path.join(repository, "recipes"), "--strict", "--json"),
    ).rejects.toMatchObject({
      details: {
        issues: [expect.objectContaining({ code: "INVALID_ARTIFACT_MANIFEST" })],
      },
    });

    await rm(artifactManifestPath);
    await expect(
      run("validate", path.join(repository, "recipes"), "--strict", "--json"),
    ).rejects.toMatchObject({
      details: {
        issues: [expect.objectContaining({ code: "MISSING_ARTIFACT_MANIFEST" })],
      },
    });

    await writeFile(artifactManifestPath, "not json\n");
    await expect(
      run("validate", path.join(repository, "recipes"), "--strict", "--json"),
    ).rejects.toMatchObject({
      message: expect.stringContaining("cannot be parsed"),
    });
  }, 30_000);
});
