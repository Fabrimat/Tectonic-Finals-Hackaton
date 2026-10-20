import assert from "node:assert/strict";
import test from "node:test";

globalThis.window = { location: { search: "?scenario=bakery-leuven&stage=ready" } };
const { actions, getState } = await import("./store.js");
const { initial } = await import("./reducer.js");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("a deep link state ignores other tabs until the user acts", async () => {
  const other = new BroadcastChannel("ripple-sync");
  try {
    assert.equal(getState().scenarioId, "bakery-leuven");
    other.postMessage(initial());
    await wait(50);
    assert.equal(getState().scenarioId, "bakery-leuven");

    actions.selectStage("forming");
    assert.equal(getState().stage, "forming");

    other.postMessage({ ...initial(), scenarioId: "household-maes" });
    await wait(50);
    assert.equal(getState().scenarioId, "household-maes");
  } finally {
    other.close();
    setTimeout(() => process.exit(process.exitCode ?? 0), 100).unref();
  }
});
