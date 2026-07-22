import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parse as parseToml } from "smol-toml";
import { describe, expect, it } from "vitest";
import { parse as parseYaml, stringify } from "yaml";
import {
  AwfError,
  adapters,
  assertNoSymlink,
  bundleFingerprintHash,
  compareManifestFiles,
  createManifest,
  filterRecipes,
  generateAdapterBundle,
  generatedBundleFingerprint,
  hashContent,
  hashNamedContent,
  loadCatalog,
  loadRecipe,
  manifestBundleFingerprint,
  manifestSchema,
  readBoundedRegularFile,
  recipeSchema,
  resolveInside,
  sanitizeTerminal,
  verificationEvidenceSchema,
} from "./index.js";
import {
  validOutputContract,
  validRecipeMetadata,
  validRequiredFileContents,
} from "./valid-recipe.fixture.js";

const valid = validRecipeMetadata;

const bundleSources = {
  workflow:
    "# Workflow\n\n## Example\n\nSee [input](examples/input.md) and [output](examples/expected-output.md).\n",
  checklist: "# Checklist\n",
  exampleInput: "# Example input\n",
  exampleOutput: "# Expected output\n",
  metadata: "id: safe-review\n",
  outputSchema: validOutputContract,
};

async function recipeDirectory(raw: unknown = valid, name = "safe-review"): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "awf-core-"));
  const directory = path.join(root, name);
  await mkdir(path.join(directory, "examples"), { recursive: true });
  await writeFile(path.join(directory, "recipe.yml"), stringify(raw));
  for (const [file, content] of Object.entries(validRequiredFileContents))
    await writeFile(path.join(directory, file), content);
  return directory;
}

describe("recipe validation", () => {
  it("accepts a complete strict recipe", () =>
    expect(recipeSchema.parse(valid).id).toBe("safe-review"));
  it("rejects unknown fields", () =>
    expect(() => recipeSchema.parse({ ...valid, typo: true })).toThrow());
  it("rejects malformed slugs and enums", () => {
    expect(() => recipeSchema.parse({ ...valid, id: "../bad" })).toThrow();
    expect(() => recipeSchema.parse({ ...valid, risk_level: "severe" })).toThrow();
    expect(() => recipeSchema.parse({ ...valid, schema_version: 3 })).toThrow();
    expect(() => recipeSchema.parse({ ...valid, execution_mode: "background" })).toThrow();
  });
  it("rejects duplicate, untrimmed, and impossible metadata states", () => {
    expect(() => recipeSchema.parse({ ...valid, tags: ["review", "review"] })).toThrow();
    expect(() => recipeSchema.parse({ ...valid, title: " Review safe changes" })).toThrow();
    expect(() =>
      recipeSchema.parse({
        ...valid,
        verification: {
          ...valid.verification,
          execution: { status: "passing" },
        },
      }),
    ).toThrow();
  });
  it("loads required recipe files", async () =>
    expect((await loadRecipe(await recipeDirectory())).title).toContain("Review"));
  it("rejects directory and ID mismatches", async () =>
    expect(loadRecipe(await recipeDirectory(valid, "other"))).rejects.toBeInstanceOf(AwfError));
  it("rejects malformed YAML", async () => {
    const directory = await recipeDirectory();
    await writeFile(path.join(directory, "recipe.yml"), "[invalid");
    await expect(loadRecipe(directory)).rejects.toMatchObject({ code: "INVALID_RECIPE" });
  });
  it("rejects missing and oversized required files", async () => {
    const missing = await recipeDirectory();
    await rm(path.join(missing, "checklist.md"));
    await expect(loadRecipe(missing)).rejects.toMatchObject({ code: "MISSING_FILE" });
    const oversized = await recipeDirectory();
    await writeFile(path.join(oversized, "workflow.md"), "x".repeat(1024 * 1024 + 1));
    await expect(loadRecipe(oversized)).rejects.toMatchObject({ code: "FILE_TOO_LARGE" });
  });
  it("rejects incomplete scaffold markers", async () => {
    const directory = await recipeDirectory();
    await writeFile(path.join(directory, "README.md"), "Replace this marker.\n");
    await expect(loadRecipe(directory)).rejects.toMatchObject({ code: "INVALID_RECIPE" });
  });
  it("detects duplicate catalog IDs through directory mismatch", async () => {
    const directory = await recipeDirectory();
    const catalog = path.dirname(directory);
    await expect(loadCatalog(catalog)).resolves.toHaveLength(1);
  });
});

describe("security and manifests", () => {
  it("keeps relative paths inside root", () =>
    expect(resolveInside("/tmp/project", "nested/file")).toBe(
      path.resolve("/tmp/project/nested/file"),
    ));
  it("rejects traversal and absolute injection", () => {
    expect(() => resolveInside("/tmp/project", "../secret")).toThrow();
    expect(() => resolveInside("/tmp/project", "/etc/passwd")).toThrow();
  });
  it("removes terminal escape sequences", () =>
    expect(
      sanitizeTerminal(
        "safe\u001b[31mred\u001b]8;;https://example.invalid\u0007link\u001b]8;;\u0007\u202Espoof",
      ),
    ).toBe("saferedlinkspoof"));
  it("removes carriage-return rewrites, cursor controls, and C1 controls", () => {
    expect(
      sanitizeTerminal("alpha\rbravo\u001b[2Jclear\u001b[4Acursor\u009b31mcolor\u0085café\n\tend"),
    ).toBe("alphabravoclearcursorcolorcafé\n\tend");
  });
  it("accepts ordinary parents and rejects symlink parents", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-link-"));
    await mkdir(path.join(root, "real"));
    await expect(assertNoSymlink(root, path.join(root, "real", "file"))).resolves.toBeUndefined();
    await symlink(path.join(root, "real"), path.join(root, "linked"));
    await expect(assertNoSymlink(root, path.join(root, "linked", "file"))).rejects.toMatchObject({
      code: "INVALID_PATH",
    });
    await symlink(path.join(root, "real", "outside"), path.join(root, "destination-link"));
    await expect(assertNoSymlink(root, path.join(root, "destination-link"))).rejects.toMatchObject({
      code: "INVALID_PATH",
    });
    const linkedRoot = `${root}-linked-root`;
    await symlink(root, linkedRoot, process.platform === "win32" ? "junction" : "dir");
    await expect(assertNoSymlink(linkedRoot, path.join(linkedRoot, "file"))).rejects.toMatchObject({
      code: "INVALID_PATH",
    });
  });
  it("reads only bounded regular files without following symlinks", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-bounded-read-"));
    const source = path.join(root, "source.txt");
    await writeFile(source, "trusted\n");
    await expect(readBoundedRegularFile(source, 64, root)).resolves.toEqual(
      Buffer.from("trusted\n"),
    );
    const linked = path.join(root, "linked.txt");
    await symlink(source, linked);
    await expect(readBoundedRegularFile(linked, 64, root)).rejects.toMatchObject({
      code: "INVALID_PATH",
    });
    const oversized = path.join(root, "oversized.txt");
    await writeFile(oversized, "0123456789");
    await expect(readBoundedRegularFile(oversized, 4, root)).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
    });
  });
  it("rejects invalid, missing, non-file, and out-of-root bounded reads", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "awf-bounded-errors-"));
    const outside = path.join(path.dirname(root), `${path.basename(root)}-outside.txt`);
    await writeFile(outside, "outside\n");
    await expect(readBoundedRegularFile(outside, 64, root)).rejects.toMatchObject({
      code: "INVALID_PATH",
    });
    await expect(readBoundedRegularFile(path.join(root, "missing.txt"), 64)).rejects.toMatchObject({
      code: "MISSING_FILE",
    });
    await expect(readBoundedRegularFile(root, 64)).rejects.toMatchObject({ code: "INVALID_PATH" });
    await expect(readBoundedRegularFile(outside, 0)).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
    });
    await expect(readBoundedRegularFile(outside, 64)).resolves.toEqual(Buffer.from("outside\n"));
    await rm(outside);
  });
  it("creates stable hashes and valid manifests", () => {
    const hash = hashContent("abc");
    expect(hash).toHaveLength(64);
    expect(hashNamedContent({ b: "two", a: "one" })).toBe(hashNamedContent({ a: "one", b: "two" }));
    expect(hashNamedContent({ a: undefined })).toBe(hashNamedContent({ a: "" }));
    const recipe = recipeSchema.parse(valid);
    expect(
      manifestSchema.parse(
        createManifest(
          recipe,
          adapters.generic,
          {
            entrypoint: "a",
            invocation: adapters.generic.invocation(recipe),
            files: [
              { path: "a", content: "abc", role: "entrypoint" },
              { path: "checklist", content: "check", role: "checklist" },
              { path: "input", content: "input", role: "example-input" },
              { path: "output", content: "output", role: "example-output" },
              { path: "metadata", content: "metadata", role: "metadata" },
              { path: "output-schema", content: "{}", role: "output-schema" },
            ],
          },
          "0.1.0",
          new Date("2026-01-01T00:00:00Z"),
        ),
      ).installed_at,
    ).toContain("2026");
  });
  it("matches generated and installed bundle fingerprints exactly", () => {
    const recipe = recipeSchema.parse(valid);
    const bundle = generateAdapterBundle(recipe, bundleSources, "generic");
    const manifest = createManifest(
      recipe,
      adapters.generic,
      bundle,
      "0.2.2",
      new Date("2026-01-01T00:00:00Z"),
    );
    const generatedHash = bundleFingerprintHash(
      generatedBundleFingerprint(recipe, bundle, "generic"),
    );

    expect(bundleFingerprintHash(manifestBundleFingerprint(manifest))).toBe(generatedHash);
    expect(
      bundleFingerprintHash(
        manifestBundleFingerprint({
          ...manifest,
          installed_at: "2026-02-02T00:00:00.000Z",
          cli_version: "9.9.9",
          adapter: { version: manifest.adapter.version, id: manifest.adapter.id },
          files: [...manifest.files].reverse(),
        }),
      ),
    ).toBe(generatedHash);
    expect(
      bundleFingerprintHash(
        manifestBundleFingerprint({
          ...manifest,
          invocation: { ...manifest.invocation, command: "forged invocation" },
        }),
      ),
    ).not.toBe(generatedHash);
  });
  it("rejects incomplete or impossible retained verification evidence", () => {
    const base = {
      schema_version: 2,
      id: "safe-review-codex-untested",
      recipe: "safe-review",
      recipe_version: "1.0.0",
      recipe_content_sha256: "a".repeat(64),
      agent: "codex",
      adapter_version: "1.0.0",
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
        repository_revision: "b".repeat(40),
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
      notes: [],
    } as const;
    expect(verificationEvidenceSchema.parse(base).command).toBeNull();
    expect(() =>
      verificationEvidenceSchema.parse({
        ...base,
        execution: { status: "passing" },
      }),
    ).toThrow();
  });
  it("compares installed files against manifest hashes", () => {
    const recipe = recipeSchema.parse(valid);
    const expected = hashContent("expected");
    const manifest = createManifest(
      recipe,
      adapters.generic,
      {
        entrypoint: "same",
        invocation: adapters.generic.invocation(recipe),
        files: [
          { path: "same", content: "expected", role: "entrypoint" },
          { path: "changed", content: "expected", role: "checklist" },
          { path: "input", content: "expected", role: "example-input" },
          { path: "output", content: "expected", role: "example-output" },
          { path: "missing", content: "expected", role: "metadata" },
          { path: "output-schema", content: "expected", role: "output-schema" },
        ],
      },
      "0.1.0",
    );
    const states = compareManifestFiles(
      manifest,
      new Map([
        ["same", expected],
        ["changed", hashContent("changed")],
      ]),
    );
    expect(Object.fromEntries(states)).toEqual({
      same: "unmodified",
      changed: "modified",
      input: "missing",
      output: "missing",
      missing: "missing",
      "output-schema": "missing",
    });
  });
});

describe("catalog and adapters", () => {
  const recipe = recipeSchema.parse(valid);
  it("filters by category, tag, agent, and support status", () => {
    expect(
      filterRecipes([recipe], {
        category: "code-review",
        tag: "review",
        agent: "generic",
        support: "supported",
        compatibility: "compatible",
      }),
    ).toHaveLength(1);
    expect(filterRecipes([recipe], { category: "other" })).toHaveLength(0);
    expect(filterRecipes([recipe], { executionMode: "supervised" })).toHaveLength(1);
    expect(filterRecipes([recipe], { executionMode: "autonomous" })).toHaveLength(0);
    expect(filterRecipes([recipe], { tag: "other" })).toHaveLength(0);
    expect(filterRecipes([recipe], { agent: "cursor" })).toHaveLength(1);
    expect(filterRecipes([recipe], { agent: "generic", support: "partial" })).toHaveLength(0);
    expect(filterRecipes([recipe], { agent: "cursor", compatibility: "compatible" })).toHaveLength(
      1,
    );
    expect(
      filterRecipes([recipe], { agent: "cursor", compatibility: "incompatible" }),
    ).toHaveLength(0);
  });
  it("filters autonomous execution independently from domain category", () => {
    const autonomous = recipeSchema.parse({
      ...valid,
      execution_mode: "autonomous",
      agent_requirements: {
        ...valid.agent_requirements,
        capabilities: [...valid.agent_requirements.capabilities, "persistent-execution"],
      },
      autonomy: {
        unattended_execution: true,
        authorization: "upfront",
        mid_run_human_input: "not-required",
        user_stop_signal: "required",
        hard_deadline: "required",
        durable_checkpoints: "required",
        resume: "required",
        failure_policy: "defer-and-continue",
      },
    });

    expect(
      filterRecipes([recipe, autonomous], {
        category: "code-review",
        executionMode: "autonomous",
      }),
    ).toEqual([autonomous]);
  });
  it.each(Object.keys(adapters))("generates the %s adapter", (agent) => {
    const adapter = adapters[agent as keyof typeof adapters];
    const generated = generateAdapterBundle(recipe, bundleSources, agent as keyof typeof adapters);
    expect(generated.entrypoint).not.toContain("..");
    const entrypoint = generated.files.find((file) => file.role === "entrypoint");
    expect(entrypoint?.content).toContain("Workflow");
    expect(generated.files.map((file) => file.role)).toEqual(
      expect.arrayContaining([
        "entrypoint",
        "checklist",
        "example-input",
        "example-output",
        "metadata",
        "output-schema",
      ]),
    );
    expect(generated.files).toHaveLength(agent === "codex" ? 7 : 6);
    expect(adapter.exporterImplemented).toBe(true);
    expect(adapter.formatConfirmed).toBe(true);
    expect(adapter.destinationPattern).toContain("<recipe-id>");
    expect(generated.invocation.mode).toBe("manual");
    if (agent !== "generic" && generated.invocation.implicitInvocationControl !== "enforced") {
      expect(generated.invocation.command).not.toBeNull();
    }
    expect(generated.invocation.warning).toMatch(/approval gates remain advisory/i);
    if (agent === "gemini-cli") {
      const parsed = parseToml(entrypoint?.content ?? "");
      expect(parsed.description).toBe(recipe.summary);
      expect(parsed.prompt).toContain("{{args}}");
    } else if (agent !== "generic") {
      const frontmatter = entrypoint?.content.split("---")[1];
      expect(parseYaml(frontmatter ?? "")).toMatchObject({ description: recipe.summary });
      if (agent === "cursor" || agent === "claude-code")
        expect(parseYaml(frontmatter ?? "")).toMatchObject({
          "disable-model-invocation": true,
        });
      if (agent === "cursor" || agent === "claude-code" || agent === "codex")
        expect(parseYaml(frontmatter ?? "")).toMatchObject({ name: recipe.id });
      if (agent === "opencode") expect(entrypoint?.content).toContain("$ARGUMENTS");
      if (agent === "codex") {
        const policy = generated.files.find((file) => file.role === "policy");
        expect(parseYaml(policy?.content ?? "")).toEqual({
          policy: { allow_implicit_invocation: false },
        });
      }
    }
  });

  it.each([
    ["gemini-cli", "workflow", "Review !{git status} before reporting.", "!{...}"],
    ["gemini-cli", "checklist", "Inspect @{private.txt} before reporting.", "@{...}"],
    ["opencode", "workflow", "Review !`git status` before reporting.", "!`...`"],
    ["opencode", "workflow", "Review @src/private.txt before reporting.", "@path"],
    ["claude-code", "exampleInput", "Observed by !`git status`.", "!`...`"],
  ] as const)(
    "rejects %s adapter interpolation %s in untrusted bundle content",
    (agent, source, content, syntax) => {
      expect(() =>
        generateAdapterBundle(recipe, { ...bundleSources, [source]: content }, agent),
      ).toThrow(new RegExp(`${agent} adapter.*${syntax.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    },
  );
});
