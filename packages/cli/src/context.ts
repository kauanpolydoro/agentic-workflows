import { access, lstat, realpath } from "node:fs/promises";
import path from "node:path";

async function exists(candidate: string): Promise<boolean> {
  try {
    await access(candidate);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export interface ProjectRootOptions {
  explicitRoot?: string;
  allowPackageRoot?: boolean;
}

async function explicitProjectRoot(candidate: string): Promise<string> {
  const absolute = path.resolve(candidate);
  const information = await lstat(absolute);
  if (!information.isDirectory() || information.isSymbolicLink()) {
    throw new Error("The explicit project root must be a real directory.");
  }
  return realpath(absolute);
}

export async function findProjectRoot(
  start = process.cwd(),
  options: ProjectRootOptions = {},
): Promise<string> {
  if (options.explicitRoot) return explicitProjectRoot(options.explicitRoot);
  const initial = path.resolve(start);
  let current = initial;
  let nearestConfig: string | null = null;
  let nearestPackage: string | null = null;
  while (true) {
    if (await exists(path.join(current, ".git"))) return current;
    if (!nearestConfig && (await exists(path.join(current, ".agentic-workflows", "config.yml")))) {
      nearestConfig = current;
    }
    if (!nearestPackage && (await exists(path.join(current, "package.json")))) {
      nearestPackage = current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return nearestConfig ?? (options.allowPackageRoot ? nearestPackage : null) ?? initial;
    }
    current = parent;
  }
}

export function catalogRoot(): string {
  return process.env.AWF_CATALOG_ROOT
    ? path.resolve(process.env.AWF_CATALOG_ROOT)
    : path.resolve(import.meta.dirname, "../catalog");
}

export function generatedCatalogPath(): string {
  return process.env.AWF_GENERATED_CATALOG_PATH
    ? path.resolve(process.env.AWF_GENERATED_CATALOG_PATH)
    : path.resolve(import.meta.dirname, "../catalog.json");
}
