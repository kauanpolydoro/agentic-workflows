import { rm } from "node:fs/promises";
import path from "node:path";

const repository = path.resolve(import.meta.dirname, "..");
const allowedDirectories = new Set(
  ["packages/cli/dist", "packages/core/dist"].map((relative) => path.join(repository, relative)),
);
const argument = process.argv[2];
if (!argument) throw new Error("Usage: clean-package-dist.ts <dist-directory>");
const target = path.resolve(process.cwd(), argument);
if (!allowedDirectories.has(target)) {
  throw new Error(`Refusing to clean an unexpected package directory: ${target}`);
}

await rm(target, { recursive: true, force: true });
process.stdout.write(`Cleaned ${path.relative(repository, target)}.\n`);
