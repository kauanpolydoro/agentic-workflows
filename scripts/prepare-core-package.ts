import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const repository = path.resolve(import.meta.dirname, "..");
await writeFile(
  path.join(repository, "packages/core/LICENSE"),
  await readFile(path.join(repository, "LICENSE"), "utf8"),
);
process.stdout.write("Prepared core package metadata.\n");
