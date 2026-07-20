import test from "node:test";
import assert from "node:assert/strict";
import { generateReport } from "./report.js";
test("preserves report contract", () =>
  assert.deepEqual(generateReport([{ name: " B ", amount: 2 }, { name: "A", amount: 1 }, {}]), {
    text: "A: 1.00\nB: 2.00\nTotal: 3.00",
    count: 2,
    total: 3,
  }));
