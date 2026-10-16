import assert from "node:assert/strict";
import test from "node:test";
import { addToSelection, isRosterReady } from "./draw-selection.js";

test("adding a player keeps the current selection and never duplicates it", () => {
  assert.deepEqual(addToSelection(["a", "b"], "c"), ["a", "b", "c"]);
  assert.deepEqual(addToSelection(["a", "b"], "b"), ["a", "b"]);
});

test("the draw only becomes ready when all configured slots are filled", () => {
  assert.equal(isRosterReady(11, 2, 6), false);
  assert.equal(isRosterReady(12, 2, 6), true);
  assert.equal(isRosterReady(18, 3, 6), true);
});
