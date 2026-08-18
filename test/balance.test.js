import test from "node:test";
import assert from "node:assert/strict";

import { normalizeBalancePayload } from "../lib/index.js";

test("normalizeBalancePayload keeps valid balance rows and normalizes currency", () => {
  const result = normalizeBalancePayload({
    is_available: true,
    balance_infos: [
      {
        currency: " usd ",
        total_balance: 12.5,
        granted_balance: "2.00",
        topped_up_balance: null
      },
      { currency: "" },
      null,
      { total_balance: "missing currency" }
    ]
  });

  assert.equal(result.ok, true);
  assert.equal(result.isAvailable, true);
  assert.equal(result.balances.length, 1);
  assert.deepEqual(result.balances[0], {
    currency: "USD",
    totalBalance: "12.5",
    grantedBalance: "2.00",
    toppedUpBalance: null
  });
  assert.match(result.fetchedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("normalizeBalancePayload handles a missing balance list", () => {
  const result = normalizeBalancePayload({ is_available: false });

  assert.deepEqual(result.balances, []);
  assert.equal(result.isAvailable, false);
});
