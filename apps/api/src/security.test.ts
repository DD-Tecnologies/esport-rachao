import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./security.js";
test("passwords are hashed and verified", async () => {
  const hash = await hashPassword("secret123");
  assert.ok(!hash.includes("secret123"));
  assert.equal(await verifyPassword("secret123", hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
});
