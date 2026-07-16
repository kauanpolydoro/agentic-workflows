import { createHash } from "node:crypto";
import type { Adapter, GeneratedAdapterBundle } from "./adapters.js";
import { manifestSchema, type Manifest, type Recipe } from "./schema.js";

export function hashContent(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

export function hashNamedContent(files: Readonly<Record<string, string>>): string {
  const hash = createHash("sha256");
  for (const name of Object.keys(files).sort()) {
    hash.update(name);
    hash.update("\0");
    hash.update(files[name] ?? "");
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function createManifest(
  recipe: Recipe,
  adapter: Pick<Adapter, "id" | "version">,
  bundle: GeneratedAdapterBundle,
  cliVersion: string,
  now = new Date(),
  migration: Manifest["migration"] = null,
): Manifest {
  return manifestSchema.parse({
    schema_version: 2,
    recipe: recipe.id,
    recipe_version: recipe.version,
    adapter: { id: adapter.id, version: adapter.version },
    entrypoint: bundle.entrypoint,
    invocation: {
      mode: bundle.invocation.mode,
      command: bundle.invocation.command,
      implicit_invocation_control: bundle.invocation.implicitInvocationControl,
      warning: bundle.invocation.warning,
    },
    installed_at: now.toISOString(),
    target: ".",
    files: bundle.files.map((file) => ({
      path: file.path,
      hash: hashContent(file.content),
      role: file.role,
    })),
    migration,
    cli_version: cliVersion,
  });
}

export type InstalledFileState = "unmodified" | "modified" | "missing";

export function compareManifestFiles(
  manifest: Manifest,
  currentHashes: ReadonlyMap<string, string>,
): ReadonlyMap<string, InstalledFileState> {
  return new Map(
    manifest.files.map((file) => {
      const current = currentHashes.get(file.path);
      return [
        file.path,
        current === undefined ? "missing" : current === file.hash ? "unmodified" : "modified",
      ] as const;
    }),
  );
}
