import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../src/sum.ts", import.meta.url), "utf8");
if (source.includes("invalid")) {
  console.error("lint: forbidden fixture marker 'invalid'");
  process.exit(1);
}
