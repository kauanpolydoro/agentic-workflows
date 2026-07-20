import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageNamePattern = /^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/;
const versionPattern =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const MAX_TARBALL_BYTES = 128 * 1024 * 1024;

export interface PublishedVersion {
  version: string;
  integrity: string;
}

export function sha512Integrity(content: Uint8Array): string {
  return `sha512-${createHash("sha512").update(content).digest("base64")}`;
}

export function parsePublishedVersion(raw: string): PublishedVersion {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("npm view returned invalid JSON.");
  }
  if (typeof value !== "object" || value === null) {
    throw new Error("npm view returned an invalid package record.");
  }
  const record = value as Record<string, unknown>;
  if (typeof record.version !== "string" || typeof record["dist.integrity"] !== "string") {
    throw new Error("npm view omitted the published version or tarball integrity.");
  }
  return { version: record.version, integrity: record["dist.integrity"] };
}

export function assertMatchingPublication(
  expectedVersion: string,
  localIntegrity: string,
  published: PublishedVersion,
): void {
  if (published.version !== expectedVersion) {
    throw new Error(
      `Registry returned version ${published.version}, expected ${expectedVersion}. Refusing to continue.`,
    );
  }
  if (published.integrity !== localIntegrity) {
    throw new Error(
      "The npm version already exists with different tarball content. Published versions are immutable.",
    );
  }
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`Missing required argument ${name}.`);
  return value;
}

async function publish(): Promise<void> {
  const packageName = requiredArgument("--package");
  const version = requiredArgument("--version");
  const tarball = path.resolve(requiredArgument("--tarball"));
  if (!packageNamePattern.test(packageName)) throw new Error("Invalid scoped npm package name.");
  if (!versionPattern.test(version)) throw new Error("Invalid npm package version.");
  const information = await lstat(tarball);
  if (information.isSymbolicLink() || !information.isFile() || path.extname(tarball) !== ".tgz") {
    throw new Error("The npm tarball must be a regular .tgz file without symbolic links.");
  }
  if (information.size > MAX_TARBALL_BYTES) {
    throw new Error(`The npm tarball exceeds ${MAX_TARBALL_BYTES} bytes.`);
  }
  const integrity = sha512Integrity(await readFile(tarball));
  const spec = `${packageName}@${version}`;
  const viewed = spawnSync("npm", ["view", spec, "version", "dist.integrity", "--json"], {
    encoding: "utf8",
    shell: false,
    maxBuffer: 1024 * 1024,
  });
  if (viewed.error) throw viewed.error;
  if (viewed.status === 0) {
    assertMatchingPublication(version, integrity, parsePublishedVersion(viewed.stdout));
    process.stdout.write(`${spec} is already published with the exact expected tarball.\n`);
    return;
  }
  if (!/\bE404\b/.test(`${viewed.stdout}\n${viewed.stderr}`)) {
    throw new Error(
      `Could not determine whether ${spec} exists. npm view exited with ${viewed.status}.\n${viewed.stderr}`,
    );
  }

  const published = spawnSync("npm", ["publish", tarball, "--access", "public", "--provenance"], {
    encoding: "utf8",
    shell: false,
    stdio: "inherit",
  });
  if (published.error) throw published.error;
  if (published.status !== 0) {
    throw new Error(`npm publish failed for ${spec} with exit code ${published.status}.`);
  }
}

const mainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (mainModule) {
  publish().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
