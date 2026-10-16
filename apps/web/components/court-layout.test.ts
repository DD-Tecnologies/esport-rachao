import assert from "node:assert/strict";
import test from "node:test";
import { courtPositionLabel, courtPositions } from "./court-layout.js";

test("court slots follow the shared 1-2-3 / 4-5-6 ordering", () => {
  assert.deepEqual(courtPositions, [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(courtPositions.slice(0, 3), [1, 2, 3]);
  assert.deepEqual(courtPositions.slice(3), [4, 5, 6]);
  assert.equal(courtPositionLabel(courtPositions[0]), "Posição 1");
});
