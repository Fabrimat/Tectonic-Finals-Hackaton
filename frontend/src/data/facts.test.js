import assert from "node:assert/strict";
import test from "node:test";
import { facts, factLine, clockRemaining, clockLabel } from "./facts.js";
import { scenarios } from "./scenarios.js";

function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

const risky = /EUR\s?\d|\u20ac|\d[\s-]*years?\b/i;

test("an unconfirmed fact renders only its generic line", () => {
  assert.equal(factLine({ text: "precise", generic: "soft", confirmed: false }), "soft");
  assert.equal(factLine({ text: "precise", generic: "soft", confirmed: true }), "precise");
});

test("every shipped fact is unconfirmed and has a generic line", () => {
  for (const [name, fact] of Object.entries(facts)) {
    assert.equal(fact.confirmed, false, name);
    assert.ok(fact.generic.length > 0, name);
  }
});

test("no unconfirmed precise fact text reaches scenario copy", () => {
  const copy = strings(scenarios).join("\n");
  for (const fact of Object.values(facts)) {
    if (!fact.confirmed && fact.text !== fact.generic) assert.ok(!copy.includes(fact.text));
  }
});

test("scenario copy and fact lines hold no euro amount and no number of years", () => {
  for (const line of [...strings(scenarios), ...Object.values(facts).map((f) => f.generic)]) {
    assert.ok(!risky.test(line), line);
  }
});

test("whisper and forming copy never names the label letters or the six year rule", () => {
  for (const base of scenarios) {
    for (const key of ["whisper", "forming"]) {
      const copy = strings(base.stages[key]).join(" ");
      assert.ok(!/label E or F|label D|six years/i.test(copy), `${base.id} ${key}`);
    }
  }
});

test("clock counts down from a fixed date and clamps at zero", () => {
  const clock = { purchaseDate: "2024-06-15", periodYears: 6 };
  const mid = clockRemaining(clock, "2026-10-20");
  assert.equal(mid.days, 1334);
  assert.ok(mid.fraction > 0.6 && mid.fraction < 0.62);
  assert.equal(clockLabel(mid), "about 4 years left");
  assert.equal(clockRemaining(clock, "2024-06-15").fraction, 1);
  const end = clockRemaining(clock, "2030-06-15");
  assert.equal(end.days, 0);
  assert.equal(clockLabel(end), "Time is up");
  const past = clockRemaining(clock, "2035-01-01");
  assert.equal(past.days, 0);
  assert.equal(past.fraction, 0);
  assert.equal(clockLabel(clockRemaining(clock, "2030-03-15")), "about 3 months left");
  assert.equal(clockLabel(clockRemaining(clock, "2030-05-20")), "about 1 month left");
});

test("clock rejects bad dates and periods", () => {
  assert.equal(clockRemaining({ purchaseDate: "15/06/2024", periodYears: 6 }), null);
  assert.equal(clockRemaining({ purchaseDate: "2024-02-31", periodYears: 6 }), null);
  assert.equal(clockRemaining({ purchaseDate: "2024-06-15", periodYears: 0 }), null);
  assert.equal(clockRemaining({ purchaseDate: "2024-06-15", periodYears: 6 }, "nope"), null);
  assert.equal(clockRemaining(undefined), null);
  assert.equal(clockLabel(null), "");
});

test("the shipped clock is valid and the fact is unconfirmed", () => {
  assert.ok(clockRemaining(facts.renovationRule.clock));
});
