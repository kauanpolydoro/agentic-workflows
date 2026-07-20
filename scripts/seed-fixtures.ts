import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

async function put(relative: string, content: string): Promise<void> {
  const file = path.resolve("fixtures", relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}
const license = `MIT License\n\nCopyright (c) 2026 Agentic Workflows contributors\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n`;

await put(
  "broken-typescript-ci/package.json",
  JSON.stringify(
    {
      name: "awf-fixture-broken-typescript-ci",
      private: true,
      type: "module",
      scripts: {
        test: "node --test test/*.test.js",
        typecheck: "tsc --noEmit",
        lint: "node scripts/lint.js",
      },
      devDependencies: { typescript: "7.0.2" },
    },
    null,
    2,
  ),
);
await put(
  "broken-typescript-ci/src/sum.ts",
  `export function sum(left: number, right: number): number { return left - right; }\nexport const invalid: number = "separate typecheck failure";\n`,
);
await put(
  "broken-typescript-ci/test/sum.test.js",
  `import test from "node:test"; import assert from "node:assert/strict"; import { sum } from "../dist/sum.js"; test("adds two values",()=>assert.equal(sum(2,3),5));\n`,
);
await put(
  "broken-typescript-ci/scripts/lint.js",
  `import { readFile } from "node:fs/promises"; const source=await readFile(new URL("../src/sum.ts",import.meta.url),"utf8"); if(source.includes("invalid")){console.error("lint: forbidden fixture marker 'invalid'");process.exit(1);}\n`,
);
await put(
  "broken-typescript-ci/tsconfig.json",
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2023",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        rootDir: "src",
        outDir: "dist",
      },
      include: ["src"],
    },
    null,
    2,
  ),
);
await put(
  "broken-typescript-ci/README.md",
  `# Broken TypeScript CI fixture\n\nThis fixture intentionally contains three deterministic and separate failures: incorrect addition behavior, a type error, and a lint marker.\nIt exists only for local workflow exercises.\n\nRun \`pnpm exec tsc\`, then \`node --test\` after emitting, and \`node scripts/lint.js\`.\nEach command is expected to fail before a workflow applies a fix.\n`,
);
await put("broken-typescript-ci/LICENSE", license);

await put(
  "legacy-python-service/service.py",
  `"""Small legacy inventory service with intentionally weak typing."""\nITEMS = {"A-1": 4}\ndef get_quantity(item_id):\n    """Documentation intentionally claims missing items return None."""\n    return ITEMS.get(item_id, 0)\ndef reserve(item_id, quantity):\n    if quantity <= ITEMS.get(item_id, 0):\n        ITEMS[item_id] = ITEMS.get(item_id, 0) - quantity\n        return True\n    return False\n`,
);
await put(
  "legacy-python-service/test_service.py",
  `import unittest\nimport service\nclass ServiceTest(unittest.TestCase):\n    def setUp(self): service.ITEMS={"A-1":4}\n    def test_missing_is_zero(self): self.assertEqual(service.get_quantity("missing"),0)\n    def test_reserve(self): self.assertTrue(service.reserve("A-1",2)); self.assertEqual(service.get_quantity("A-1"),2)\nif __name__ == "__main__": unittest.main()\n`,
);
await put(
  "legacy-python-service/requirements-simulated.txt",
  `# Historical versions recorded for audit exercises only.\n# Do not install these packages. The fixture uses only the Python standard library.\nexample-web-framework==0.9.0\n`,
);
await put(
  "legacy-python-service/README.md",
  `# Legacy Python service fixture\n\nA standard-library-only service with weak annotations and documentation drift.\nThe dependency file is simulated data and must not be installed.\n\nRun \`python -m unittest -v\` locally.\n`,
);
await put("legacy-python-service/LICENSE", license);

await put(
  "vulnerable-node-api/package.json",
  JSON.stringify(
    {
      name: "awf-fixture-vulnerable-node-api",
      private: true,
      type: "module",
      scripts: { test: "node --test" },
    },
    null,
    2,
  ),
);
await put(
  "vulnerable-node-api/server.js",
  `import http from "node:http"; export function authorize(headers){ return headers["x-role"] === "admin"; } export function createServer(){ return http.createServer((request,response)=>{ if(request.url==="/admin/report"&&!authorize(request.headers)){response.writeHead(403,{"content-type":"application/json"});return response.end('{"error":"forbidden"}');} response.writeHead(200,{"content-type":"application/json"});response.end('{"items":[{"id":"fake-1"}]}'); }); } if(import.meta.url===\`file://\${process.argv[1]}\`) createServer().listen(0,"127.0.0.1");\n`,
);
await put(
  "vulnerable-node-api/server.test.js",
  `import test from "node:test";import assert from "node:assert/strict";import {authorize} from "./server.js";test("denies absent role",()=>assert.equal(authorize({}),false));test("documents insecure caller-controlled role",()=>assert.equal(authorize({"x-role":"admin"}),true));\n`,
);
await put(
  "vulnerable-node-api/README.md",
  `# Vulnerable Node API fixture\n\n> Warning: intentionally insecure artificial code. Never deploy it or expose it beyond localhost.\n\nThe fixture trusts a caller-controlled role header so defensive workflows have a safe, obvious authorization defect to identify.\nAll data is fake.\nRun \`node --test\`.\n`,
);
await put("vulnerable-node-api/LICENSE", license);

await put(
  "large-module-refactor/package.json",
  JSON.stringify(
    {
      name: "awf-fixture-large-module-refactor",
      private: true,
      type: "module",
      scripts: { test: "node --test" },
    },
    null,
    2,
  ),
);
await put(
  "large-module-refactor/report.js",
  `export function generateReport(rows, options={}) { const valid=[]; for(const row of rows){ if(typeof row.name!=="string"||typeof row.amount!=="number") continue; valid.push({name:row.name.trim(),amount:row.amount}); } valid.sort((a,b)=>a.name.localeCompare(b.name)); let total=0; const lines=[]; for(const row of valid){ total+=row.amount; // biome-ignore lint/style/useTemplate: Deliberately plain legacy style for refactoring exercises.\n lines.push(row.name+": "+row.amount.toFixed(2)); } // biome-ignore lint/style/useTemplate: Deliberately plain legacy style for refactoring exercises.\n if(options.includeTotal!==false) lines.push("Total: "+total.toFixed(2)); return {text:lines.join("\\n"),count:valid.length,total}; }\n`,
);
await put(
  "large-module-refactor/report.test.js",
  `import test from "node:test";import assert from "node:assert/strict";import {generateReport} from "./report.js";test("preserves report contract",()=>assert.deepEqual(generateReport([{name:" B ",amount:2},{name:"A",amount:1},{}]),{text:"A: 1.00\\nB: 2.00\\nTotal: 3.00",count:2,total:3}));\n`,
);
await put(
  "large-module-refactor/README.md",
  `# Large module refactor fixture\n\nThe single report module intentionally combines validation, normalization, sorting, aggregation, formatting, and result assembly.\nIts public \`generateReport\` contract is protected by characterization tests.\nRun \`node --test\`.\n`,
);
await put("large-module-refactor/LICENSE", license);

await put(
  "docs-drift-api/package.json",
  JSON.stringify(
    {
      name: "awf-fixture-docs-drift-api",
      private: true,
      type: "module",
      scripts: { test: "node --test" },
    },
    null,
    2,
  ),
);
await put(
  "docs-drift-api/api.js",
  `export function getItem(id){ if(id==="item-1") return {status:200,body:{id,name:"Synthetic item"}}; return {status:404,body:{error:{code:"ITEM_NOT_FOUND",message:"Item was not found"}}}; }\n`,
);
await put(
  "docs-drift-api/api.test.js",
  `import test from "node:test";import assert from "node:assert/strict";import {getItem} from "./api.js";test("returns item",()=>assert.equal(getItem("item-1").status,200));test("returns structured 404",()=>assert.equal(getItem("missing").body.error.code,"ITEM_NOT_FOUND"));\n`,
);
await put(
  "docs-drift-api/openapi.yml",
  `openapi: 3.1.0\ninfo: { title: Fixture Items API, version: 1.1.0 }\npaths:\n  /items/{id}:\n    get:\n      responses:\n        "200": { description: Item found }\n        "404": { description: Structured ITEM_NOT_FOUND error }\n`,
);
await put(
  "docs-drift-api/README.md",
  `# Docs drift API fixture\n\nThe implementation and tests return a structured error from \`GET /items/:id\`.\nThe intentionally stale guide in \`USAGE.md\` claims a plain-text response.\nRun \`node --test\`.\n`,
);
await put(
  "docs-drift-api/USAGE.md",
  `# API usage\n\nMissing items return HTTP 400 with the text \`missing\`.\nThis statement is intentionally stale for documentation workflows.\n`,
);
await put(
  "docs-drift-api/CHANGELOG.md",
  `# Fixture changelog\n\n## 1.1.0\n\n- Changed missing-item errors to a structured JSON response with HTTP 404.\n`,
);
await put("docs-drift-api/LICENSE", license);

console.log("Created five fixtures.");
