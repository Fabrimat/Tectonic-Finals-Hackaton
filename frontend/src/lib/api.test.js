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
