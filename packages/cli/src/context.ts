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
  discoveryBoundary?: string;
}

export type ProjectRootSource = "explicit" | "git" | "config" | "package" | "cwd";

export interface ProjectContext {
  root: string;
  source: ProjectRootSource;
}

const projectRootSourceReasons: Record<ProjectRootSource, string> = {
  explicit: "Selected by the explicit --project-root option.",
  git: "Selected by the nearest enclosing .git marker because no nearer AWF configuration exists.",
  config:
    "Selected by the nearest enclosing .agentic-workflows/config.yml file before an outer Git marker.",
  package:
    "Selected by the nearest enclosing package.json file because no AWF configuration or Git marker exists.",
  cwd: "No enclosing Git, AWF configuration, or package marker was found, so the invocation directory was selected.",
};

export function explainProjectRootSource(source: ProjectRootSource): string {
  return projectRootSourceReasons[source];
}

async function explicitProjectRoot(candidate: string): Promise<string> {
  const absolute = path.resolve(candidate);
  const information = await lstat(absolute);
  if (!information.isDirectory() || information.isSymbolicLink()) {
    throw new Error("The explicit project root must be a real directory.");
  }
  return realpath(absolute);
}

export async function findProjectContext(
  start = process.cwd(),
  options: ProjectRootOptions = {},
): Promise<ProjectContext> {
  if (options.explicitRoot) {
    return { root: await explicitProjectRoot(options.explicitRoot), source: "explicit" };
  }
  const initial = path.resolve(start);
  const discoveryBoundary = options.discoveryBoundary
    ? path.resolve(options.discoveryBoundary)
    : path.parse(initial).root;
  const boundaryRelation = path.relative(discoveryBoundary, initial);
  if (
    boundaryRelation === ".." ||
    boundaryRelation.startsWith(`..${path.sep}`) ||
    path.isAbsolute(boundaryRelation)
  ) {
    throw new Error("The project discovery boundary must contain the invocation directory.");
  }
  let current = initial;
  let nearestPackage: string | null = null;
  while (true) {
    if (await exists(path.join(current, ".agentic-workflows", "config.yml"))) {
      return { root: current, source: "config" };
    }
    if (await exists(path.join(current, ".git"))) return { root: current, source: "git" };
    if (!nearestPackage && (await exists(path.join(current, "package.json")))) {
      nearestPackage = current;
    }
    const parent = path.dirname(current);
    if (current === discoveryBoundary || parent === current) {
      if (options.allowPackageRoot && nearestPackage) {
        return { root: nearestPackage, source: "package" };
      }
      return { root: initial, source: "cwd" };
    }
    current = parent;
  }
}

export async function findProjectRoot(
  start = process.cwd(),
  options: ProjectRootOptions = {},
): Promise<string> {
  return (await findProjectContext(start, options)).root;
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
