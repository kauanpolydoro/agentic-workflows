import { lstat, readdir } from "node:fs/promises";
import path from "node:path";
import {
  AwfError,
  type LegacyManifest,
  legacyManifestSchema,
  type Manifest,
  manifestSchema,
  readBoundedRegularFile,
} from "@kauanpolydoro/agentic-workflows-core";
import { parse } from "yaml";
import { validateInstallation as validateInstallationOnDisk } from "./install.js";

const MAX_INSTALLATION_MANIFEST_BYTES = 1024 * 1024;
const workflowIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type InstallationHealth = "healthy" | "drifted" | "invalid";

export interface InstallationStatus {
  id: string;
  status: InstallationHealth;
  agent: string | null;
  recipeVersion: string | null;
  files: number;
  issue: {
    code: string;
    message: string;
    files?: Array<{ file: string; state: string }>;
  } | null;
}

export interface InstallationStatusSummary {
  total: number;
  healthy: number;
  drifted: number;
  invalid: number;
}

export function summarizeInstallations(
  statuses: readonly InstallationStatus[],
): InstallationStatusSummary {
  return {
    total: statuses.length,
    healthy: statuses.filter((status) => status.status === "healthy").length,
    drifted: statuses.filter((status) => status.status === "drifted").length,
    invalid: statuses.filter((status) => status.status === "invalid").length,
  };
}

function errorCode(error: unknown): string {
  return error instanceof AwfError
    ? error.code
    : typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "UNKNOWN_ERROR";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function driftedFiles(error: unknown): Array<{ file: string; state: string }> | undefined {
  if (!(error instanceof AwfError) || !Array.isArray(error.details.files)) return undefined;
  const files = error.details.files.flatMap((candidate) => {
    if (typeof candidate !== "object" || candidate === null) return [];
    const file = "file" in candidate ? candidate.file : undefined;
    const state = "state" in candidate ? candidate.state : undefined;
    return typeof file === "string" && typeof state === "string" ? [{ file, state }] : [];
  });
  return files.length > 0 ? files : undefined;
}

function invalidStatus(id: string, error: unknown): InstallationStatus {
  return {
    id,
    status: "invalid",
    agent: null,
    recipeVersion: null,
    files: 0,
    issue: { code: errorCode(error), message: errorMessage(error) },
  };
}

async function optionalDirectory(directory: string, scope: string): Promise<boolean> {
  let information: Awaited<ReturnType<typeof lstat>>;
  try {
    information = await lstat(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw new AwfError("INVALID_PATH", `Cannot inspect ${scope}.`, {
      path: directory,
      causeCode: (error as NodeJS.ErrnoException).code,
    });
  }
  if (information.isSymbolicLink() || !information.isDirectory()) {
    throw new AwfError("INVALID_PATH", `${scope} must be a real directory.`, { path: directory });
  }
  return true;
}

async function parseManifest(
  target: string,
  file: string,
  id: string,
): Promise<Manifest | LegacyManifest> {
  const information = await lstat(file);
  if (information.isSymbolicLink() || !information.isFile()) {
    throw new AwfError(
      "INVALID_PATH",
      "Installation manifests must be regular files without symbolic links.",
      { path: file },
    );
  }
  let data: unknown;
  try {
    data = parse(
      (await readBoundedRegularFile(file, MAX_INSTALLATION_MANIFEST_BYTES, target)).toString(
        "utf8",
      ),
      { maxAliasCount: 0, uniqueKeys: true },
    );
  } catch (error) {
    if (error instanceof AwfError) throw error;
    throw new AwfError("INVALID_MANIFEST", `Cannot parse the installation manifest for ${id}.`);
  }
  const current = manifestSchema.safeParse(data);
  if (current.success && current.data.recipe === id) return current.data;
  const legacy = legacyManifestSchema.safeParse(data);
  if (legacy.success && legacy.data.recipe === id) return legacy.data;
  throw new AwfError("INVALID_MANIFEST", `The installation manifest for ${id} is invalid.`);
}

async function inspectInstallation(
  catalogDirectory: string,
  target: string,
  id: string,
  manifestFile: string,
  validateInstallation: typeof validateInstallationOnDisk,
): Promise<InstallationStatus> {
  if (!workflowIdPattern.test(id)) {
    return invalidStatus(
      id,
      new AwfError("INVALID_MANIFEST", "The installation manifest filename is not a workflow ID."),
    );
  }
  let manifest: Manifest | LegacyManifest;
  try {
    manifest = await parseManifest(target, manifestFile, id);
  } catch (error) {
    return invalidStatus(id, error);
  }
  const agent = manifest.schema_version === 1 ? manifest.agent : manifest.adapter.id;
  const base = {
    id,
    agent,
    recipeVersion: manifest.recipe_version,
    files: manifest.files.length,
  };
  try {
    await validateInstallation(path.join(catalogDirectory, id), target);
    return { ...base, status: "healthy", issue: null };
  } catch (error) {
    const files = driftedFiles(error);
    return {
      ...base,
      status: files ? "drifted" : "invalid",
      issue: {
        code: errorCode(error),
        message: errorMessage(error),
        ...(files ? { files } : {}),
      },
    };
  }
}

export async function inspectInstallations(
  catalogDirectory: string,
  target: string,
  workflowId?: string,
  dependencies: {
    validateInstallation?: typeof validateInstallationOnDisk;
  } = {},
): Promise<InstallationStatus[]> {
  const installationDirectory = path.join(target, ".agentic-workflows", "installations");
  if (!(await optionalDirectory(target, "The installation target"))) return [];
  const metadataDirectory = path.dirname(installationDirectory);
  if (!(await optionalDirectory(metadataDirectory, "The installation metadata directory"))) {
    return [];
  }
  if (!(await optionalDirectory(installationDirectory, "The installation manifest directory"))) {
    return [];
  }
  const entries = await readdir(installationDirectory, { withFileTypes: true });
  const selected = entries
    .filter((entry) => entry.name.endsWith(".yml"))
    .map((entry) => ({ entry, id: path.basename(entry.name, ".yml") }))
    .filter(({ id }) => workflowId === undefined || id === workflowId)
    .sort((left, right) => left.id.localeCompare(right.id));
  return Promise.all(
    selected.map(({ entry, id }) =>
      inspectInstallation(
        catalogDirectory,
        target,
        id,
        path.join(installationDirectory, entry.name),
        dependencies.validateInstallation ?? validateInstallationOnDisk,
      ),
    ),
  );
}
