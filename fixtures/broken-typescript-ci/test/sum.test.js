import test from "node:test";
import assert from "node:assert/strict";
import { sum } from "../dist/sum.js";
test("adds two values", () => assert.equal(sum(2, 3), 5));
