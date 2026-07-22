import { createHash } from "node:crypto";
import { adapters, type GeneratedAdapterBundle } from "./adapters.js";
import { hashContent } from "./manifest.js";
import type { AgentId, Manifest, Recipe } from "./schema.js";

export interface BundleFingerprintMember {
  role: GeneratedAdapterBundle["files"][number]["role"];
  path: string;
  hash: string;
}

export interface BundleFingerprint {
  schemaVersion: 1;
  recipe: string;
  recipeVersion: string;
  adapter: { id: AgentId; version: string };
  entrypoint: string;
  invocation: Manifest["invocation"];
  members: BundleFingerprintMember[];
}

function sortedFingerprintMembers(
  members: readonly BundleFingerprintMember[],
): BundleFingerprintMember[] {
  return [...members].sort((left, right) => {
    for (const key of ["role", "path", "hash"] as const) {
      if (left[key] < right[key]) return -1;
      if (left[key] > right[key]) return 1;
    }
    return 0;
  });
}

export function manifestBundleFingerprint(manifest: Manifest): BundleFingerprint {
  // Lifecycle authority comes from complete managed bytes, paths, roles, identity, and invocation.
  // Timestamps, migration history, target metadata, and the recording CLI version are non-authoritative.
  return {
    schemaVersion: 1,
    recipe: manifest.recipe,
    recipeVersion: manifest.recipe_version,
    adapter: { id: manifest.adapter.id, version: manifest.adapter.version },
    entrypoint: manifest.entrypoint,
    invocation: {
      mode: manifest.invocation.mode,
      command: manifest.invocation.command,
      implicit_invocation_control: manifest.invocation.implicit_invocation_control,
      warning: manifest.invocation.warning,
    },
    members: sortedFingerprintMembers(
      manifest.files.map((file) => ({
        role: file.role,
        path: file.path,
        hash: file.hash,
      })),
    ),
  };
}

export function generatedBundleFingerprint(
  recipe: Recipe,
  bundle: GeneratedAdapterBundle,
  agent: AgentId,
): BundleFingerprint {
  return {
    schemaVersion: 1,
    recipe: recipe.id,
    recipeVersion: recipe.version,
    adapter: { id: agent, version: adapters[agent].version },
    entrypoint: bundle.entrypoint,
    invocation: {
      mode: bundle.invocation.mode,
      command: bundle.invocation.command,
      implicit_invocation_control: bundle.invocation.implicitInvocationControl,
      warning: bundle.invocation.warning,
    },
    members: sortedFingerprintMembers(
      bundle.files.map((file) => ({
        role: file.role,
        path: file.path,
        hash: hashContent(file.content),
      })),
    ),
  };
}

export function bundleFingerprintHash(fingerprint: BundleFingerprint): string {
  return createHash("sha256").update(JSON.stringify(fingerprint)).digest("hex");
}
