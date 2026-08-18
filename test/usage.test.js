import test from "node:test";
import assert from "node:assert/strict";

import { readUsageFromSessions } from "../lib/index.js";

function event(time, model, usage) {
  return JSON.stringify({
    type: "assistant/message",
    time,
    data: {
      message: { source: { provider: "deepseek-official", model } },
      usage
    }
  });
}

test("readUsageFromSessions separates cumulative and today's Flash/Pro costs", async () => {
  const now = Date.now();
  const sessions = new Map([
    ["today", [
      event(now - 1_000, "deepseek-v4-flash", {
        inputTokens: 1_000_000,
        cacheReadTokens: 500_000,
        outputTokens: 100_000
      }),
      event(now - 2_000, "unknown-model", {
        inputTokens: 1_000_000,
        outputTokens: 1_000_000
      }),
      "not-json"
    ].join("\n")],
    ["old", event(now - 3 * 86_400_000, "deepseek-v4-pro", {
      inputTokens: 1_000_000,
      outputTokens: 500_000
    })]
  ]);

  const result = await readUsageFromSessions({
    async list() {
      return [...sessions.keys()].map((id) => ({ id }));
    },
    async readRaw(id) {
      return { content: sessions.get(id) };
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.sessions, 2);
  assert.equal(result.requests, 2);
  assert.equal(result.cumulative.total.amountCny, 7.21);
  assert.equal(result.cumulative.flash.amountCny, 1.21);
  assert.equal(result.cumulative.pro.amountCny, 6);
  assert.equal(result.today.total.amountCny, 1.21);
  assert.equal(result.today.flash.amountCny, 1.21);
  assert.equal(result.today.pro.amountCny, 0);
  assert.deepEqual(result.modelNames, ["unknown-model"]);
});

test("readUsageFromSessions returns a clear result when DSH has no session API", async () => {
  const result = await readUsageFromSessions(undefined);

  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "session-usage-unavailable");
});

test("readUsageFromSessions does not treat an invalid timestamp as today's usage", async () => {
  const result = await readUsageFromSessions({
    async list() {
      return [{ id: "invalid-time" }];
    },
    async readRaw() {
      return {
        content: event("invalid-time", "deepseek-v4-flash", {
          inputTokens: 1_000_000,
          outputTokens: 1_000_000
        })
      };
    }
  });

  assert.equal(result.requests, 1);
  assert.equal(result.cumulative.flash.amountCny, 3);
  assert.equal(result.today.total.amountCny, 0);
  assert.equal(result.firstUsageAt, null);
  assert.equal(result.lastUsageAt, null);
});
