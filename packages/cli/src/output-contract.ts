import { z } from "zod";

const projectRootSourceSchema = z.enum(["explicit", "git", "config", "package", "cwd"]);
const nonNegativeIntegerSchema = z.number().int().nonnegative();

export const projectContextOutputSchema = z
  .object({
    schema_version: z.literal(1),
    project_root: z.string().min(1),
    selection_source: projectRootSourceSchema,
    project_root_fallback: z.boolean(),
    reason: z.string().min(1),
  })
  .strict();

export const lifecyclePlanOutputSchema = z
  .object({
    schema_version: z.literal(1),
    operation: z.enum(["install", "update", "remove"]),
    dry_run: z.literal(true),
    requires_force: z.boolean(),
    changes: z.record(z.string(), z.array(z.string())),
    proposed_files: z
      .array(
        z
          .object({
            path: z.string().min(1),
            role: z.string().min(1),
            content: z.string(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

const statusIssueSchema = z
  .object({
    code: z.string().min(1),
    message: z.string().min(1),
    files: z
      .array(z.object({ file: z.string().min(1), state: z.string().min(1) }).strict())
      .optional(),
  })
  .strict();

const installationStatusSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(["healthy", "drifted", "invalid"]),
    agent: z.string().min(1).nullable(),
    recipeVersion: z.string().min(1).nullable(),
    files: nonNegativeIntegerSchema,
    issue: statusIssueSchema.nullable(),
  })
  .strict();

export const installationStatusOutputSchema = z
  .object({
    schema_version: z.literal(1),
    target: z.string().min(1),
    project_context: projectContextOutputSchema.omit({ schema_version: true }),
    filter: z.enum(["all", "failures-only"]),
    summary: z
      .object({
        total: nonNegativeIntegerSchema,
        healthy: nonNegativeIntegerSchema,
        drifted: nonNegativeIntegerSchema,
        invalid: nonNegativeIntegerSchema,
      })
      .strict(),
    installations: z.array(installationStatusSchema),
  })
  .strict();

const doctorCheckSchema = z
  .object({
    schema_version: z.literal(1),
    check: z.string().min(1),
    status: z.enum(["pass", "warn", "fail"]),
    detail: z.string().min(1),
    remediation: z.string().min(1).nullable(),
    data: z.record(z.string(), z.unknown()).nullable(),
  })
  .strict();

export const doctorOutputSchema = z
  .object({
    schema_version: z.literal(1),
    status: z.enum(["pass", "fail"]),
    healthy: z.boolean(),
    exit_code: z.union([z.literal(0), z.literal(1)]),
    projectRoot: z.string().min(1),
    filter: z.enum(["all", "failures-only"]),
    projectContext: z
      .object({
        root: z.string().min(1),
        source: projectRootSourceSchema,
        reason: z.string().min(1),
      })
      .strict(),
    summary: z
      .object({
        total: nonNegativeIntegerSchema,
        pass: nonNegativeIntegerSchema,
        warn: nonNegativeIntegerSchema,
        fail: nonNegativeIntegerSchema,
      })
      .strict(),
    checks: z.array(doctorCheckSchema),
  })
  .strict();

export const initOutputSchema = z
  .object({
    schema_version: z.literal(1),
    created: z.boolean(),
    replaced: z.boolean(),
    config_path: z.literal(".agentic-workflows/config.yml"),
    project_context: z
      .object({
        root: z.string().min(1),
        source: projectRootSourceSchema,
        reason: z.string().min(1),
      })
      .strict(),
    configuration: z
      .object({
        schema_version: z.literal(1),
        default_agent: z.string().min(1),
        default_target: z.string().min(1),
      })
      .strict(),
    next: z.string().min(1),
  })
  .strict();

export const validationOutputSchema = z
  .object({
    schema_version: z.literal(1),
    valid: z.literal(true),
    recipes: nonNegativeIntegerSchema,
    installations: nonNegativeIntegerSchema,
    strict: z.boolean(),
  })
  .strict();

export const documentationOpenOutputSchema = z
  .object({
    schema_version: z.literal(1),
    target: z.string().min(1),
    opened: z.boolean(),
  })
  .strict();

export const errorOutputSchema = z
  .object({
    schema_version: z.literal(1),
    error: z.string().min(1),
    message: z.string().min(1),
    code: z.string().min(1),
    command: z.string().min(1),
    retryable: z.boolean(),
    help_url: z.url(),
    remediation: z.string().min(1),
    details: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const cliOutputSchemas = {
  context: projectContextOutputSchema,
  lifecycle_plan: lifecyclePlanOutputSchema,
  status: installationStatusOutputSchema,
  doctor: doctorOutputSchema,
  init: initOutputSchema,
  validation: validationOutputSchema,
  documentation_open: documentationOpenOutputSchema,
  error: errorOutputSchema,
} as const;

export type CliOutputContract = keyof typeof cliOutputSchemas;
export type CliOutputByContract = {
  [Contract in CliOutputContract]: z.infer<(typeof cliOutputSchemas)[Contract]>;
};

export function parseCliOutput<Contract extends CliOutputContract>(
  contract: Contract,
  value: unknown,
): CliOutputByContract[Contract] {
  return cliOutputSchemas[contract].parse(value) as CliOutputByContract[Contract];
}
