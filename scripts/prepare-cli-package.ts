import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const repository = path.resolve(import.meta.dirname, "..");
const target = path.join(repository, "packages/cli/catalog");
const documentationTarget = path.join(repository, "packages/cli/docs");
const packagedDocumentation = [
  "compatibility.md",
  "quality/recipe-quality-standard.md",
  "research/adapter-sources.md",
  "guide/contributing.md",
  "guide/installation.md",
  "guide/cli-reference.md",
  "guide/output-contracts.md",
  "guide/verification.md",
  "guide/security.md",
  "decisions/0001-portable-core-and-data-only-recipes.md",
] as const;
await rm(target, { recursive: true, force: true });
await rm(documentationTarget, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const entry of await readdir(path.join(repository, "recipes"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  await cp(path.join(repository, "recipes", entry.name), path.join(target, entry.name), {
    recursive: true,
  });
  const catalogPageTarget = path.join(documentationTarget, "catalog", `${entry.name}.md`);
  await mkdir(path.dirname(catalogPageTarget), { recursive: true });
  await cp(path.join(repository, "docs", "catalog", `${entry.name}.md`), catalogPageTarget);
}

for (const relative of packagedDocumentation) {
  const destination = path.join(documentationTarget, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(repository, "docs", relative), destination);
}

await writeFile(
  path.join(repository, "packages/cli/LICENSE"),
  await readFile(path.join(repository, "LICENSE"), "utf8"),
);
await writeFile(
  path.join(repository, "packages/cli/README.md"),
  await readFile(path.join(repository, "README.md"), "utf8"),
);
await writeFile(
  path.join(repository, "packages/cli/catalog.json"),
  await readFile(path.join(repository, "generated/catalog.json"), "utf8"),
);
process.stdout.write("Prepared the packaged CLI catalog, README, and documentation.\n");
