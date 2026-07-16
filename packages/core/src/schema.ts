import { z } from "zod";

export const agentIds = [
  "generic",
  "claude-code",
  "codex",
  "cursor",
  "gemini-cli",
  "opencode",
] as const;
export const supportStatuses = [
  "supported",
  "partial",
  "experimental",
  "unsupported",
  "unknown",
] as const;
export const bundleCompatibilityStatuses = [
  "compatible",
  "limited",
  "incompatible",
  "unknown",
] as const;
export const recipeCompatibilityStatuses = bundleCompatibilityStatuses;
export const capabilityStatuses = [
  "confirmed",
  "partial",
  "unknown",
  "missing",
  "not-applicable",
] as const;
export const capabilityIds = [
  "repository-read",
  "repository-write",
  "shell",
  "git",
  "github",
  "network",
  "browser",
  "test-execution",
  "database",
  "production-access",
] as const;
export const categoryIds = [
  "api",
  "architecture",
  "code-review",
  "database",
  "debugging",
  "documentation",
  "maintenance",
  "migration",
  "operations",
  "performance",
  "refactoring",
  "release",
  "security",
  "testing",
] as const;
export const maintainerIds = ["project-maintainers"] as const;
export const effectIds = [
  "writes_code",
  "writes_configuration",
  "writes_documentation",
  "changes_dependencies",
  "changes_database",
  "changes_issue_tracker",
  "changes_production_traffic",
  "deletes_state",
  "publishes_artifacts",
] as const;
export const verificationStatuses = ["passing", "failing", "untested", "not-applicable"] as const;

const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;

const nullableText = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), {
    message: "Text values cannot contain leading or trailing whitespace.",
  })
  .nullable();
const cleanText = (minimum = 1, maximum?: number) => {
  let schema = z.string().min(minimum);
  if (maximum !== undefined) schema = schema.max(maximum);
  return schema.refine((value) => value === value.trim(), {
    message: "Text values cannot contain leading or trailing whitespace.",
  });
};
const uniqueTextArray = (minimum = 0) =>
  z
    .array(cleanText())
    .min(minimum)
    .superRefine((items, context) => {
      const seen = new Set<string>();
      for (const [index, item] of items.entries()) {
        const key = item.toLocaleLowerCase("en-US");
        if (seen.has(key)) {
          context.addIssue({
            code: "custom",
            path: [index],
            message: `Duplicate value: ${item}.`,
          });
        }
        seen.add(key);
      }
    });

function duplicateValues(values: readonly string[]): Set<string> {
  return new Set(values.filter((value, index) => values.indexOf(value) !== index));
}
const recipeAgentSchema = z
  .object({
    bundle_compatibility: z
      .enum(bundleCompatibilityStatuses)
      .describe(
        "Whether the recipe bundle can be serialized for this adapter without semantic loss.",
      ),
    capability_status: z
      .enum(capabilityStatuses)
      .describe(
        "Evidence state for the external agent capabilities required to execute this recipe.",
      ),
    limitations: uniqueTextArray().describe(
      "Recipe-specific serialization or external capability limitations.",
    ),
  })
  .strict();

const recipeAgentsSchema = z
  .object({
    generic: recipeAgentSchema,
    "claude-code": recipeAgentSchema,
    codex: recipeAgentSchema,
    cursor: recipeAgentSchema,
    "gemini-cli": recipeAgentSchema,
    opencode: recipeAgentSchema,
  })
  .strict();

const sourceVerificationStageSchema = z
  .object({ status: z.enum(["untested", "not-applicable"]) })
  .strict();

const effectsSchema = z
  .object({
    writes_code: z.boolean(),
    writes_configuration: z.boolean(),
    writes_documentation: z.boolean(),
    changes_dependencies: z.boolean(),
    changes_database: z.boolean(),
    changes_issue_tracker: z.boolean(),
    changes_production_traffic: z.boolean(),
    deletes_state: z.boolean(),
    publishes_artifacts: z.boolean(),
  })
  .strict();

const semverSchema = z.string().regex(semverPattern);

export const recipeSchema = z
  .object({
    schema_version: z.literal(3),
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: cleanText(4, 100),
    summary: cleanText(20, 240),
    version: semverSchema,
    category: z.enum(categoryIds),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    risk_level: z.enum(["low", "medium", "high", "critical"]),
    estimated_duration: z.string().regex(/^[1-9]\d*(?:m|h)$/),
    tags: z
      .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
      .min(1)
      .superRefine((items, context) => {
        const seen = new Set<string>();
        for (const [index, item] of items.entries()) {
          if (seen.has(item)) {
            context.addIssue({ code: "custom", path: [index], message: `Duplicate tag: ${item}.` });
          }
          seen.add(item);
        }
      }),
    inputs: z
      .object({ required: uniqueTextArray(1), optional: uniqueTextArray() })
      .strict()
      .superRefine((inputs, context) => {
        const required = new Set(inputs.required.map((item) => item.toLocaleLowerCase("en-US")));
        for (const [index, item] of inputs.optional.entries()) {
          if (required.has(item.toLocaleLowerCase("en-US"))) {
            context.addIssue({
              code: "custom",
              path: ["optional", index],
              message: "An input cannot be both required and optional.",
            });
          }
        }
      }),
    outputs: uniqueTextArray(1),
    prerequisites: uniqueTextArray(1),
    safety: z
      .object({
        destructive: z.boolean(),
        requires_human_approval: uniqueTextArray(),
        forbidden_actions: uniqueTextArray(1),
      })
      .strict(),
    effects: effectsSchema,
    agent_requirements: z
      .object({
        capabilities: z
          .array(z.enum(capabilityIds))
          .min(1)
          .superRefine((items, context) => {
            const seen = new Set<string>();
            for (const [index, item] of items.entries()) {
              if (seen.has(item)) {
                context.addIssue({
                  code: "custom",
                  path: [index],
                  message: `Duplicate capability: ${item}.`,
                });
              }
              seen.add(item);
            }
          }),
        manual_invocation_required: z.literal(true),
      })
      .strict(),
    output_contract: z.object({ schema: z.literal("output.schema.json") }).strict(),
    canonical: z.object({ file: z.literal("workflow.md") }).strict(),
    agents: recipeAgentsSchema,
    verification: z
      .object({
        structural: z.object({ status: z.literal("derived") }).strict(),
        installation: sourceVerificationStageSchema,
        execution: sourceVerificationStageSchema,
        outcome: sourceVerificationStageSchema,
      })
      .strict(),
    maintainers: z
      .array(z.enum(maintainerIds))
      .min(1)
      .superRefine((items, context) => {
        const seen = new Set<string>();
        for (const [index, item] of items.entries()) {
          if (seen.has(item)) {
            context.addIssue({
              code: "custom",
              path: [index],
              message: `Duplicate maintainer identity: ${item}.`,
            });
          }
          seen.add(item);
        }
      }),
    license: z.literal("MIT"),
  })
  .strict()
  .superRefine((recipe, context) => {
    const mutableEffects = effectIds.filter((effect) => recipe.effects[effect]);
    if (mutableEffects.length > 0 && recipe.safety.requires_human_approval.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["safety", "requires_human_approval"],
        message: "Recipes with mutable effects require at least one human approval gate.",
      });
    }
    if (recipe.effects.deletes_state && !recipe.safety.destructive) {
      context.addIssue({
        code: "custom",
        path: ["safety", "destructive"],
        message: "A recipe that can delete state must be marked destructive.",
      });
    }
    if (
      (recipe.effects.changes_database ||
        recipe.effects.changes_production_traffic ||
        recipe.effects.deletes_state ||
        recipe.effects.publishes_artifacts) &&
      !["high", "critical"].includes(recipe.risk_level)
    ) {
      context.addIssue({
        code: "custom",
        path: ["risk_level"],
        message:
          "Database, production traffic, deletion, and publication effects require high or critical risk.",
      });
    }
    const requiredCapabilityByEffect = {
      writes_code: "repository-write",
      writes_configuration: "repository-write",
      writes_documentation: "repository-write",
      changes_dependencies: "repository-write",
      changes_database: "database",
      changes_issue_tracker: "github",
      changes_production_traffic: "production-access",
      deletes_state: "repository-write",
      publishes_artifacts: "network",
    } as const;
    for (const effect of effectIds) {
      const capability = requiredCapabilityByEffect[effect];
      if (recipe.effects[effect] && !recipe.agent_requirements.capabilities.includes(capability)) {
        context.addIssue({
          code: "custom",
          path: ["agent_requirements", "capabilities"],
          message: `${effect} requires the ${capability} capability.`,
        });
      }
    }
    if (recipe.agents.generic.capability_status !== "not-applicable") {
      context.addIssue({
        code: "custom",
        path: ["agents", "generic", "capability_status"],
        message: "Generic Markdown has no agent capability execution stage.",
      });
    }
    if (recipe.agents.generic.bundle_compatibility !== "compatible") {
      context.addIssue({
        code: "custom",
        path: ["agents", "generic", "bundle_compatibility"],
        message: "Generic Markdown is the lossless project-owned recipe bundle representation.",
      });
    }
    for (const id of agentIds.filter((agent) => agent !== "generic")) {
      if (recipe.agents[id].capability_status === "not-applicable") {
        context.addIssue({
          code: "custom",
          path: ["agents", id, "capability_status"],
          message: "External agents must declare a capability assessment status.",
        });
      }
    }
    for (const id of agentIds) {
      const declaration = recipe.agents[id];
      if (
        ["limited", "incompatible"].includes(declaration.bundle_compatibility) &&
        declaration.limitations.length === 0
      ) {
        context.addIssue({
          code: "custom",
          path: ["agents", id, "limitations"],
          message: `${declaration.bundle_compatibility} bundle compatibility requires a concrete limitation.`,
        });
      }
      if (
        ["partial", "missing"].includes(declaration.capability_status) &&
        declaration.limitations.length === 0
      ) {
        context.addIssue({
          code: "custom",
          path: ["agents", id, "limitations"],
          message: "A partial or missing required capability must identify the limitation.",
        });
      }
    }
  });

const managedRelativePath = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !value.startsWith("/") && !/^[a-z]:[\\/]/i.test(value), {
    message: "Managed paths must be relative.",
  })
  .refine((value) => !value.includes("\\"), {
    message: "Managed paths must use POSIX separators.",
  })
  .refine(
    (value) =>
      value.split("/").every((segment) => segment !== "" && segment !== "." && segment !== ".."),
    { message: "Managed paths must be normalized and cannot contain traversal." },
  )
  .refine((value) => !value.split("/").includes(".git"), {
    message: "Managed paths cannot target Git metadata.",
  });

export const manifestFileSchema = z
  .object({
    path: managedRelativePath,
    hash: z.string().regex(/^[a-f0-9]{64}$/),
    role: z.enum([
      "entrypoint",
      "checklist",
      "example-input",
      "example-output",
      "metadata",
      "output-schema",
      "policy",
    ]),
  })
  .strict();
const bundleMigrationSchema = z
  .object({
    from_schema_version: z.union([z.literal(1), z.literal(2)]),
    from_recipe_version: semverSchema,
    from_adapter: z.object({ id: z.enum(agentIds), version: semverSchema.nullable() }).strict(),
    created_files: z.array(managedRelativePath).superRefine((items, context) => {
      for (const value of duplicateValues(items)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate created migration path: ${value}.`,
        });
      }
    }),
    retired_files: z.array(managedRelativePath).superRefine((items, context) => {
      for (const value of duplicateValues(items)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate retired migration path: ${value}.`,
        });
      }
    }),
  })
  .strict();
export const legacyManifestSchema = z
  .object({
    schema_version: z.literal(1),
    recipe: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    recipe_version: semverSchema,
    agent: z.enum(agentIds),
    installed_at: z.iso.datetime({ offset: true }),
    target: z.literal("."),
    files: z
      .array(
        z.object({ path: managedRelativePath, hash: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
      )
      .length(1),
    cli_version: semverSchema,
  })
  .strict();
export const manifestSchema = z
  .object({
    schema_version: z.literal(2),
    recipe: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    recipe_version: semverSchema,
    adapter: z.object({ id: z.enum(agentIds), version: semverSchema }).strict(),
    entrypoint: managedRelativePath,
    invocation: z
      .object({
        mode: z.enum(["manual", "implicit"]),
        command: nullableText,
        implicit_invocation_control: z.enum(["enforced", "not-supported", "unknown"]),
        warning: nullableText,
      })
      .strict(),
    installed_at: z.iso.datetime({ offset: true }),
    target: z.literal("."),
    files: z.array(manifestFileSchema).min(1),
    migration: bundleMigrationSchema.nullable().default(null),
    cli_version: semverSchema,
  })
  .strict()
  .superRefine((manifest, context) => {
    const paths = new Set<string>();
    for (const [index, file] of manifest.files.entries()) {
      if (paths.has(file.path))
        context.addIssue({
          code: "custom",
          path: ["files", index, "path"],
          message: `Duplicate managed path: ${file.path}.`,
        });
      paths.add(file.path);
    }
    const entrypointFiles = manifest.files.filter(
      (file) => file.role === "entrypoint" && file.path === manifest.entrypoint,
    );
    if (entrypointFiles.length !== 1)
      context.addIssue({
        code: "custom",
        path: ["entrypoint"],
        message: "Manifest entrypoint must identify exactly one entrypoint file.",
      });
    for (const role of [
      "entrypoint",
      "checklist",
      "example-input",
      "example-output",
      "metadata",
      "output-schema",
    ] as const) {
      if (manifest.files.filter((file) => file.role === role).length !== 1) {
        context.addIssue({
          code: "custom",
          path: ["files"],
          message: `Manifest must contain exactly one ${role} file.`,
        });
      }
    }
    if (manifest.files.filter((file) => file.role === "policy").length > 1) {
      context.addIssue({
        code: "custom",
        path: ["files"],
        message: "Manifest cannot contain more than one adapter policy file.",
      });
    }
  });

const evidenceStageSchema = z.object({ status: z.enum(verificationStatuses) }).strict();
const evidenceArtifactIds = [
  "command_log",
  "stdout",
  "stderr",
  "installation_artifact",
  "input_file",
  "output_file",
  "outcome_review",
] as const;
const evidenceArtifactSchema = z
  .object({ path: managedRelativePath, sha256: z.string().regex(/^[a-f0-9]{64}$/) })
  .strict();
const evidenceCriterionSchema = z
  .object({
    id: cleanText(),
    description: cleanText(),
    status: z.enum(["passing", "failing", "not-reviewed"]),
    evidence: z.array(z.enum(evidenceArtifactIds)).superRefine((items, context) => {
      for (const value of duplicateValues(items)) {
        context.addIssue({
          code: "custom",
          message: `Criterion evidence reference is duplicated: ${value}.`,
        });
      }
    }),
  })
  .strict()
  .superRefine((criterion, context) => {
    if (criterion.status !== "not-reviewed" && criterion.evidence.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["evidence"],
        message: "A reviewed criterion must cite at least one retained evidence artifact.",
      });
    }
    if (criterion.status === "not-reviewed" && criterion.evidence.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["evidence"],
        message: "A criterion cannot cite conclusive evidence while it is not reviewed.",
      });
    }
  });
export const verificationEvidenceSchema = z
  .object({
    schema_version: z.literal(2),
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    supersedes: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .nullable()
      .optional(),
    recipe: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    recipe_version: semverSchema,
    recipe_content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    agent: z.enum(agentIds),
    adapter_version: semverSchema,
    agent_version: nullableText,
    fixture: nullableText,
    command: nullableText,
    exit_code: z.number().int().min(0).max(255).nullable(),
    started_at: z.iso.datetime({ offset: true }).nullable(),
    finished_at: z.iso.datetime({ offset: true }).nullable(),
    environment: z
      .object({
        runner_image: nullableText,
        os: nullableText,
        node_version: nullableText,
        pnpm_version: nullableText,
      })
      .strict(),
    source: z
      .object({
        repository_revision: z.string().regex(/^[a-f0-9]{40}$/),
        workflow_run_url: z.url().nullable(),
        runner: nullableText,
      })
      .strict(),
    installation: evidenceStageSchema,
    execution: evidenceStageSchema,
    outcome: evidenceStageSchema,
    evidence: z
      .object({
        command_log: evidenceArtifactSchema.nullable(),
        stdout: evidenceArtifactSchema.nullable(),
        stderr: evidenceArtifactSchema.nullable(),
        installation_artifact: evidenceArtifactSchema.nullable(),
        input_file: evidenceArtifactSchema.nullable(),
        output_file: evidenceArtifactSchema.nullable(),
        outcome_review: evidenceArtifactSchema.nullable(),
      })
      .strict(),
    reviewer: nullableText,
    reviewed_at: z.iso.datetime({ offset: true }).nullable(),
    criteria: z.array(evidenceCriterionSchema).superRefine((criteria, context) => {
      const seen = new Set<string>();
      for (const [index, criterion] of criteria.entries()) {
        if (seen.has(criterion.id)) {
          context.addIssue({
            code: "custom",
            path: [index, "id"],
            message: `Duplicate outcome criterion: ${criterion.id}.`,
          });
        }
        seen.add(criterion.id);
      }
    }),
    notes: uniqueTextArray(),
  })
  .strict()
  .superRefine((record, context) => {
    const observedInstallation = ["passing", "failing"].includes(record.installation.status);
    const observedExecution = ["passing", "failing"].includes(record.execution.status);
    const observedOutcome = ["passing", "failing"].includes(record.outcome.status);
    const observedAny = observedInstallation || observedExecution || observedOutcome;
    if (observedAny) {
      const environmentComplete = Object.values(record.environment).every(
        (value) => value !== null,
      );
      if (
        !record.command ||
        record.exit_code === null ||
        !record.started_at ||
        !record.finished_at ||
        !environmentComplete ||
        !record.evidence.command_log ||
        !record.evidence.stdout ||
        !record.evidence.stderr
      ) {
        context.addIssue({
          code: "custom",
          path: ["evidence"],
          message:
            "Observed verification requires command, exit code, start and finish times, a complete environment, and hashed command/stdout/stderr artifacts.",
        });
      }
    }
    if (
      record.started_at &&
      record.finished_at &&
      Date.parse(record.started_at) > Date.parse(record.finished_at)
    ) {
      context.addIssue({
        code: "custom",
        path: ["finished_at"],
        message: "Verification finish time cannot precede its start time.",
      });
    }
    if (record.installation.status === "passing") {
      if (record.exit_code !== 0 || !record.evidence.installation_artifact) {
        context.addIssue({
          code: "custom",
          path: ["installation"],
          message:
            "Passing installation requires exit code zero and a hashed installation artifact.",
        });
      }
    }
    if (observedExecution) {
      if (
        record.installation.status !== "passing" ||
        !record.agent_version ||
        !record.evidence.input_file ||
        !record.evidence.output_file
      ) {
        context.addIssue({
          code: "custom",
          path: ["execution"],
          message:
            "Observed agent execution requires passing installation, an agent version, and hashed input and output files.",
        });
      }
      if (record.execution.status === "passing" && record.exit_code !== 0) {
        context.addIssue({
          code: "custom",
          path: ["execution"],
          message: "Passing execution requires exit code zero.",
        });
      }
    } else if (record.agent_version !== null) {
      context.addIssue({
        code: "custom",
        path: ["agent_version"],
        message: "Agent version is a tested version only when external execution was observed.",
      });
    }
    if (observedOutcome) {
      if (
        record.execution.status !== "passing" ||
        !record.evidence.outcome_review ||
        !record.reviewer ||
        !record.reviewed_at ||
        record.criteria.length === 0 ||
        record.criteria.some((criterion) => criterion.status === "not-reviewed")
      ) {
        context.addIssue({
          code: "custom",
          path: ["outcome"],
          message:
            "Observed outcome review requires passing execution, reviewer identity, review time, reviewed criteria, and a hashed review artifact.",
        });
      }
      if (
        record.outcome.status === "passing" &&
        record.criteria.some((criterion) => criterion.status !== "passing")
      ) {
        context.addIssue({
          code: "custom",
          path: ["criteria"],
          message: "Passing outcome requires every criterion to pass.",
        });
      }
      if (
        record.outcome.status === "failing" &&
        !record.criteria.some((criterion) => criterion.status === "failing")
      ) {
        context.addIssue({
          code: "custom",
          path: ["criteria"],
          message: "Failing outcome requires at least one failing criterion.",
        });
      }
    } else if (record.reviewer || record.reviewed_at || record.criteria.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["outcome"],
        message: "Reviewer, review time, and criteria require an observed outcome stage.",
      });
    }
    if (
      !observedAny &&
      (record.command || record.exit_code !== null || record.started_at || record.finished_at)
    ) {
      context.addIssue({
        code: "custom",
        path: ["command"],
        message: "A record with no observed stage cannot claim command execution or timing.",
      });
    }
    if (
      record.execution.status === "not-applicable" &&
      record.outcome.status !== "not-applicable"
    ) {
      context.addIssue({
        code: "custom",
        path: ["outcome"],
        message: "Outcome must be not-applicable when execution is not-applicable.",
      });
    }
    const artifactPaths = Object.values(record.evidence)
      .filter((artifact): artifact is z.infer<typeof evidenceArtifactSchema> => artifact !== null)
      .map((artifact) => artifact.path);
    for (const pathValue of duplicateValues(artifactPaths)) {
      context.addIssue({
        code: "custom",
        path: ["evidence"],
        message: `Evidence artifact path is duplicated: ${pathValue}.`,
      });
    }
    for (const [criterionIndex, criterion] of record.criteria.entries()) {
      for (const evidenceId of criterion.evidence) {
        if (record.evidence[evidenceId] === null) {
          context.addIssue({
            code: "custom",
            path: ["criteria", criterionIndex, "evidence"],
            message: `Criterion references missing evidence artifact: ${evidenceId}.`,
          });
        }
      }
    }
    if (record.supersedes === record.id) {
      context.addIssue({
        code: "custom",
        path: ["supersedes"],
        message: "A verification record cannot supersede itself.",
      });
    }
  });

const generatedVerificationStageSchema = z
  .object({
    status: z.enum(verificationStatuses),
    evidence: z.array(managedRelativePath).superRefine((items, context) => {
      for (const value of duplicateValues(items)) {
        context.addIssue({
          code: "custom",
          message: `Generated evidence path is duplicated: ${value}.`,
        });
      }
    }),
    stale_records: z.number().int().nonnegative(),
  })
  .strict();

const generatedRecipeAgentSchema = recipeAgentSchema.extend({
  verification: z
    .object({
      installation: generatedVerificationStageSchema,
      execution: generatedVerificationStageSchema,
      outcome: generatedVerificationStageSchema,
    })
    .strict(),
});

const generatedRecipeAgentsSchema = z
  .object({
    generic: generatedRecipeAgentSchema,
    "claude-code": generatedRecipeAgentSchema,
    codex: generatedRecipeAgentSchema,
    cursor: generatedRecipeAgentSchema,
    "gemini-cli": generatedRecipeAgentSchema,
    opencode: generatedRecipeAgentSchema,
  })
  .strict();

export const generatedCatalogRecipeSchema = z
  .object({
    ...recipeSchema.shape,
    agents: generatedRecipeAgentsSchema,
    verification: z
      .object({
        structural: z
          .object({
            status: z.literal("passing"),
            source: z.literal("derived"),
            checks: z
              .array(
                z.enum([
                  "schema",
                  "required-files",
                  "content",
                  "evidence-ids",
                  "relative-links",
                  "output-contract",
                ]),
              )
              .min(1),
            recipe_content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
          })
          .strict(),
      })
      .strict(),
  })
  .strict()
  .superRefine((generated, context) => {
    const sourceCompatible = {
      ...generated,
      agents: Object.fromEntries(
        agentIds.map((agent) => {
          const declaration = generated.agents[agent];
          return [
            agent,
            {
              bundle_compatibility: declaration.bundle_compatibility,
              capability_status: declaration.capability_status,
              limitations: declaration.limitations,
            },
          ];
        }),
      ),
      verification: {
        structural: { status: "derived" },
        installation: { status: "untested" },
        execution: { status: "untested" },
        outcome: { status: "untested" },
      },
    };
    const sourceResult = recipeSchema.safeParse(sourceCompatible);
    if (!sourceResult.success) {
      for (const issue of sourceResult.error.issues) {
        context.addIssue({
          code: "custom",
          path: issue.path,
          message: `Generated catalog violates recipe metadata invariants: ${issue.message}`,
        });
      }
    }
  });

export type Recipe = z.infer<typeof recipeSchema>;
export type AgentId = (typeof agentIds)[number];
export type SupportStatus = (typeof supportStatuses)[number];
export type RecipeCompatibilityStatus = (typeof recipeCompatibilityStatuses)[number];
export type BundleCompatibilityStatus = (typeof bundleCompatibilityStatuses)[number];
export type CapabilityId = (typeof capabilityIds)[number];
export type CapabilityStatus = (typeof capabilityStatuses)[number];
export type CategoryId = (typeof categoryIds)[number];
export type EffectId = (typeof effectIds)[number];
export type MaintainerId = (typeof maintainerIds)[number];
export type Manifest = z.infer<typeof manifestSchema>;
export type LegacyManifest = z.infer<typeof legacyManifestSchema>;
export type VerificationEvidence = z.infer<typeof verificationEvidenceSchema>;
export type GeneratedCatalogRecipe = z.infer<typeof generatedCatalogRecipeSchema>;
