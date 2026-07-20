import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tagPattern = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const assetNamePattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const MAX_RELEASE_ASSET_BYTES = 512 * 1024 * 1024;

export interface AssetSyncPlan {
  matching: string[];
  missing: string[];
  unexpected: string[];
}

export function planAssetSync(
  localNames: readonly string[],
  remoteNames: readonly string[],
): AssetSyncPlan {
  const local = new Set(localNames);
  const remote = new Set(remoteNames);
  if (local.size !== localNames.length || remote.size !== remoteNames.length) {
    throw new Error("Release asset names must be unique.");
  }
  return {
    matching: [...local].filter((name) => remote.has(name)).sort(),
    missing: [...local].filter((name) => !remote.has(name)).sort(),
    unexpected: [...remote].filter((name) => !local.has(name)).sort(),
  };
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`Missing required argument ${name}.`);
  return value;
}

function gh(
  args: string[],
  allowFailure = false,
): { status: number; stdout: string; stderr: string } {
  const result = spawnSync("gh", args, {
    encoding: "utf8",
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  const status = result.status ?? 1;
  if (!allowFailure && status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed with ${status}.\n${result.stderr}`);
  }
  return { status, stdout: result.stdout, stderr: result.stderr };
}

async function digest(file: string): Promise<string> {
  const information = await lstat(file);
  if (information.isSymbolicLink() || !information.isFile()) {
    throw new Error(`Release asset must be a regular file without symbolic links: ${file}`);
  }
  if (information.size > MAX_RELEASE_ASSET_BYTES) {
    throw new Error(`Release asset exceeds ${MAX_RELEASE_ASSET_BYTES} bytes: ${file}`);
  }
  return createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}

async function synchronize(): Promise<void> {
  const tag = requiredArgument("--tag");
  const directory = path.resolve(requiredArgument("--directory"));
  if (!tagPattern.test(tag)) throw new Error("Release tag must be a v-prefixed semantic version.");
  const directoryInformation = await lstat(directory);
  if (directoryInformation.isSymbolicLink() || !directoryInformation.isDirectory()) {
    throw new Error("Release asset directory must be a real directory.");
  }
  const entries = await readdir(directory, { withFileTypes: true });
  const assets = entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({ name: entry.name, file: path.join(directory, entry.name) }))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (assets.length === 0) throw new Error("Release asset directory is empty.");
  for (const asset of assets) {
    if (!assetNamePattern.test(asset.name))
      throw new Error(`Unsafe release asset name: ${asset.name}`);
    await digest(asset.file);
  }

  const viewed = gh(["release", "view", tag, "--json", "isDraft,assets"], true);
  if (viewed.status !== 0) {
    gh([
      "release",
      "create",
      tag,
      ...assets.map((asset) => asset.file),
      "--draft",
      "--generate-notes",
      "--verify-tag",
    ]);
    process.stdout.write(`Created draft release ${tag} with ${assets.length} verified assets.\n`);
    return;
  }

  let release: { isDraft?: unknown; assets?: Array<{ name?: unknown }> };
  try {
    release = JSON.parse(viewed.stdout) as typeof release;
  } catch {
    throw new Error("gh release view returned invalid JSON.");
  }
  if (typeof release.isDraft !== "boolean" || !Array.isArray(release.assets)) {
    throw new Error("gh release view returned an incomplete release record.");
  }
  const remoteNames = release.assets.map((asset) => {
    if (typeof asset.name !== "string") throw new Error("A remote release asset has no name.");
    return asset.name;
  });
  const plan = planAssetSync(
    assets.map((asset) => asset.name),
    remoteNames,
  );
  if (plan.unexpected.length > 0) {
    throw new Error(`Release contains unexpected assets: ${plan.unexpected.join(", ")}.`);
  }

  const temporary = await mkdtemp(path.join(os.tmpdir(), "awf-release-assets-"));
  try {
    for (const name of plan.matching) {
      const remote = path.join(temporary, name);
      gh(["release", "download", tag, "--pattern", name, "--output", remote]);
      const local = assets.find((asset) => asset.name === name);
      if (!local) throw new Error(`Missing local release asset ${name}.`);
      if ((await digest(local.file)) !== (await digest(remote))) {
        throw new Error(`Release asset ${name} already exists with different content.`);
      }
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }

  if (plan.missing.length > 0 && !release.isDraft) {
    throw new Error(`Published release ${tag} is missing assets: ${plan.missing.join(", ")}.`);
  }
  for (const name of plan.missing) {
    const local = assets.find((asset) => asset.name === name);
    if (!local) throw new Error(`Missing local release asset ${name}.`);
    gh(["release", "upload", tag, local.file]);
  }
  process.stdout.write(
    `Verified ${plan.matching.length} and uploaded ${plan.missing.length} release assets for ${tag}.\n`,
  );
}

const mainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (mainModule) {
  synchronize().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
