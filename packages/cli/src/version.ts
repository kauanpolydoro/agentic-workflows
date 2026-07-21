import { readFileSync } from "node:fs";

interface PackageMetadata {
  version?: unknown;
}

const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;

export function isValidCliVersion(value: unknown): value is string {
  return typeof value === "string" && semverPattern.test(value);
}

const metadata = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as PackageMetadata;

if (!isValidCliVersion(metadata.version)) {
  throw new Error("The CLI package version is missing or invalid.");
}

export const CLI_VERSION = metadata.version;
