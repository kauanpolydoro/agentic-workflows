import test from "node:test";
import assert from "node:assert/strict";
import { authorize } from "./server.js";
test("denies absent role", () => assert.equal(authorize({}), false));
test("documents insecure caller-controlled role", () =>
  assert.equal(authorize({ "x-role": "admin" }), true));
