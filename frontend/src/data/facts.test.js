import assert from "node:assert/strict";
import test from "node:test";
import { facts, factLine } from "./facts.js";
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
