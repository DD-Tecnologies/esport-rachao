import assert from "node:assert/strict";
import test from "node:test";
import { rotateScoreRotation } from "./score-rotation.js";

test("rotates the scoring team on every point, including consecutive points", () => {
  const firstPoint = rotateScoreRotation(["1", "2", "3", "4", "5", "6"]);
  const consecutivePoint = rotateScoreRotation(firstPoint);

  assert.deepEqual(firstPoint, ["6", "1", "2", "3", "4", "5"]);
  assert.deepEqual(consecutivePoint, ["5", "6", "1", "2", "3", "4"]);
});
