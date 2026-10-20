import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function sources(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) sources(path, out);
    else if (/\.(js|jsx)$/.test(name) && !/\.test\./.test(name)) out.push(path);
  }
  return out;
}

test("only the plan board imports postIntent, so nothing is sent before the ready stage", () => {
  const users = sources(root)
    .filter((file) => !file.endsWith(join("lib", "api.js")))
    .filter((file) => readFileSync(file, "utf8").includes("postIntent"))
    .map((file) => file.slice(root.length).replaceAll("\\", "/"));
  assert.deepEqual(users, ["apps/customer/PlanBoard.jsx"]);
});

test("forgetSent lets a new run post the same step again", async () => {
  const { postIntent, forgetSent } = await import("./api.js");
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return { ok: true };
  };
  try {
    const step = { id: "solar", intent: { service: "s", region: "r", timeframe: "t", budgetBand: "A" } };
    assert.equal(await postIntent("household-maes", step), "sent");
    assert.equal(await postIntent("household-maes", step), "sent");
    assert.equal(calls, 1);
    forgetSent();
    assert.equal(await postIntent("household-maes", step), "sent");
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = realFetch;
  }
});
