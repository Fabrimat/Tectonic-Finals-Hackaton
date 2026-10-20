import assert from "node:assert/strict";
import test from "node:test";
import { money, monthsLabel } from "./format.js";

test("money groups thousands", () => {
  assert.equal(money(1480), "EUR 1,480");
});

test("months from two years on read as rounded years", () => {
  assert.equal(monthsLabel(30), "about 3 years");
  assert.equal(monthsLabel(24), "about 2 years");
  assert.equal(monthsLabel(36), "about 3 years");
});

test("under two years keeps months, with the singular", () => {
  assert.equal(monthsLabel(23), "about 23 months");
  assert.equal(monthsLabel(6), "about 6 months");
  assert.equal(monthsLabel(1), "about 1 month");
  assert.equal(monthsLabel(0), "about 1 month");
});
