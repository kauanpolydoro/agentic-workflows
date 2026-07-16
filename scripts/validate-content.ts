import path from "node:path";
import process from "node:process";
import { validateCatalogContent } from "../packages/core/src/content-validation.js";

const recipesDirectory = path.resolve(process.argv[2] ?? "recipes");
const issues = await validateCatalogContent(recipesDirectory);

if (issues.length > 0) {
  for (const issue of issues)
    process.stderr.write(`${issue.recipe}/${issue.file} [${issue.code}] ${issue.message}\n`);
  process.stderr.write(`Content validation failed with ${issues.length} issue(s).\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Content validation passed.\n");
}
