import test from "node:test";
import assert from "node:assert/strict";
import { getItem } from "./api.js";
test("returns item", () => assert.equal(getItem("item-1").status, 200));
test("returns structured 404", () =>
  assert.equal(getItem("missing").body.error.code, "ITEM_NOT_FOUND"));
