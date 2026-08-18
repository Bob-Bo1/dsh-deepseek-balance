// deepseek-balance — Host half.
//
// Resolves the existing DSH DEEPSEEK_API_KEY on the Node side, calls the
// official balance endpoint, and exposes only a sanitized result over a local
// DSH HTTP route. The browser half never receives the API key.

import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const BALANCE_ROUTE = "/api/deepseek-balance";
export const USAGE_ROUTE = "/api/deepseek-balance/usage";
export const BALANCE_CREDENTIAL_REF = "DEEPSEEK_API_KEY";
export const BALANCE_API_URL = "https://api.deepseek.com/user/balance";
export const BALANCE_CACHE_MS = 30_000;
export const BALANCE_TIMEOUT_MS = 8_000;
export const USAGE_CACHE_MS = 30_000;

const SHANGHAI_TIME_ZONE = "Asia/Shanghai";
const DEEPSEEK_PROVIDER = "deepseek-official";

// DeepSeek public pricing, CNY per 1M tokens. `input` is the cache-miss
// bucket; DSH's optional cacheWriteTokens are billed with cache misses.
export const USAGE_PRICING_CNY = Object.freeze({
  flash: Object.freeze({ cacheHit: 0.02, input: 1, output: 2 }),
  pro: Object.freeze({ cacheHit: 0.025, input: 3, output: 6 })
});

const EMPTY_RESULT = {
  ok: false,
  fetchedAt: null,
  errorCode: "not-fetched",
  message: "尚未获取余额"
};

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function normalizeBalanceInfo(item) {
  if (item === null || typeof item !== "object") return null;
  const currency = typeof item.currency === "string" ? item.currency.trim().toUpperCase() : "";
  if (!currency) return null;
  const text = (value) => typeof value === "string" ? value : value == null ? null : String(value);
  return {
    currency,
    totalBalance: text(item.total_balance),
    grantedBalance: text(item.granted_balance),
    toppedUpBalance: text(item.topped_up_balance)
  };
}

export function normalizeBalancePayload(payload) {
  const rows = Array.isArray(payload?.balance_infos)
    ? payload.balance_infos.map(normalizeBalanceInfo).filter(Boolean)
    : [];
  return {
    ok: true,
    fetchedAt: new Date().toISOString(),
    isAvailable: payload?.is_available === true,
    balances: rows
  };
}

function errorResult(errorCode, message) {
  return {
    ok: false,
    fetchedAt: new Date().toISOString(),
    errorCode,
    message
  };
}

function usageErrorResult(errorCode, message) {
  return {
    ok: false,
    fetchedAt: new Date().toISOString(),
    errorCode,
    message
  };
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function getShanghaiDate(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function classifyModel(model) {
  const normalized = typeof model === "string" ? model.trim().toLowerCase() : "";
  if (normalized.includes("pro")) return "pro";
  // DeepSeek's legacy deepseek-chat/deepseek-reasoner names map to V4 Flash.
  if (normalized.includes("flash") || normalized === "deepseek-chat" || normalized === "deepseek-reasoner") return "flash";
  return "other";
}

function createBucket() {
  return {
    amountCny: 0,
    requests: 0,
    inputTokens: 0,
    cacheHitTokens: 0,
    cacheWriteTokens: 0,
    outputTokens: 0
  };
}

function addUsage(bucket, usage, modelClass) {
  const inputTokens = finiteNumber(usage?.inputTokens);
  const cacheHitTokens = finiteNumber(usage?.cacheReadTokens);
  const cacheWriteTokens = finiteNumber(usage?.cacheWriteTokens);
  const outputTokens = finiteNumber(usage?.outputTokens);
  const pricing = USAGE_PRICING_CNY[modelClass];
  if (!pricing) return;
  bucket.requests += 1;
  bucket.inputTokens += inputTokens;
  bucket.cacheHitTokens += cacheHitTokens;
  bucket.cacheWriteTokens += cacheWriteTokens;
  bucket.outputTokens += outputTokens;
  bucket.amountCny += (
    cacheHitTokens * pricing.cacheHit
    + (inputTokens + cacheWriteTokens) * pricing.input
    + outputTokens * pricing.output
  ) / 1_000_000;
}

function mergeBucket(target, source) {
  for (const key of ["amountCny", "requests", "inputTokens", "cacheHitTokens", "cacheWriteTokens", "outputTokens"]) {
    target[key] += source[key] || 0;
  }
}

function serializeBucket(bucket) {
  return {
    amountCny: Number(bucket.amountCny.toFixed(8)),
    requests: bucket.requests,
    inputTokens: Math.round(bucket.inputTokens),
    cacheHitTokens: Math.round(bucket.cacheHitTokens),
    cacheWriteTokens: Math.round(bucket.cacheWriteTokens),
    outputTokens: Math.round(bucket.outputTokens)
  };
}

function createUsageSummary() {
  return {
    total: createBucket(),
    today: {
      total: createBucket(),
      byModel: {
        flash: createBucket(),
        pro: createBucket(),
        other: createBucket()
      }
    },
    byModel: {
      flash: createBucket(),
      pro: createBucket(),
      other: createBucket()
    }
  };
}

export async function readUsageFromSessions(sessionPersistence) {
  if (sessionPersistence === undefined || typeof sessionPersistence.list !== "function" || typeof sessionPersistence.readRaw !== "function") {
    return usageErrorResult("session-usage-unavailable", "当前 DSH 版本没有开放会话用量读取接口");
  }

  let sessions;
  try {
    sessions = await sessionPersistence.list();
  } catch {
    return usageErrorResult("session-usage-read-failed", "无法读取 DSH 会话用量");
  }

  const summary = createUsageSummary();
  const today = getShanghaiDate(Date.now());
  let usageRequests = 0;
  let sessionsRead = 0;
  let firstUsageAt = null;
  let lastUsageAt = null;
  const modelNames = new Set();

  for (const session of Array.isArray(sessions) ? sessions : []) {
    let raw;
    try {
      raw = await sessionPersistence.readRaw(session.id);
    } catch {
      continue;
    }
    if (!raw?.content) continue;
    sessionsRead += 1;
    const lines = raw.content.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }
      const source = event.data?.message?.source;
      if (event.type !== "assistant/message" || source?.provider !== DEEPSEEK_PROVIDER || event.data?.usage === undefined) continue;
      const model = source.model || "";
      const modelClass = classifyModel(model);
      if (modelClass === "other") {
        modelNames.add(model || "未知模型");
        continue;
      }
      addUsage(summary.total, event.data.usage, modelClass);
      addUsage(summary.byModel[modelClass], event.data.usage, modelClass);
      const at = Number(event.time);
      const timestamp = Number.isFinite(at) && at > 0 ? at : null;
      if (timestamp !== null && getShanghaiDate(timestamp) === today) {
        addUsage(summary.today.total, event.data.usage, modelClass);
        addUsage(summary.today.byModel[modelClass], event.data.usage, modelClass);
      }
      usageRequests += 1;
      if (timestamp !== null) {
        firstUsageAt = firstUsageAt === null ? timestamp : Math.min(firstUsageAt, timestamp);
        lastUsageAt = lastUsageAt === null ? timestamp : Math.max(lastUsageAt, timestamp);
      }
    }
  }

  return {
    ok: true,
    fetchedAt: new Date().toISOString(),
    source: "dsh-local-sessions",
    timezone: SHANGHAI_TIME_ZONE,
    note: "仅统计 DSH 已保存用量的 DeepSeek 请求；按当前公开人民币单价重算，不包含平台其他客户端或其他 API Key 的用量。",
    sessions: sessionsRead,
    requests: usageRequests,
    firstUsageAt: firstUsageAt === null ? null : new Date(firstUsageAt).toISOString(),
    lastUsageAt: lastUsageAt === null ? null : new Date(lastUsageAt).toISOString(),
    modelNames: [...modelNames].filter(Boolean).slice(0, 10),
    pricingCnyPerMillion: USAGE_PRICING_CNY,
    cumulative: {
      total: serializeBucket(summary.total),
      flash: serializeBucket(summary.byModel.flash),
      pro: serializeBucket(summary.byModel.pro),
      other: serializeBucket(summary.byModel.other)
    },
    today: {
      total: serializeBucket(summary.today.total),
      flash: serializeBucket(summary.today.byModel.flash),
      pro: serializeBucket(summary.today.byModel.pro),
      other: serializeBucket(summary.today.byModel.other)
    }
  };
}

function classifyHttpStatus(status) {
  if (status === 401) return ["auth-failed", "DeepSeek API Key 无效或已失效"];
  if (status === 429) return ["rate-limited", "请求过于频繁，请稍后再试"];
  if (status >= 500) return ["upstream-error", `DeepSeek 服务暂时不可用（HTTP ${status}）`];
  return ["http-error", `余额接口返回 HTTP ${status}`];
}

function stripYamlScalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function readLocalCredential(ref) {
  const dshHome = process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
  const file = path.join(dshHome, ".credentials.yaml");
  try {
    const text = readFileSync(file, "utf8");
    const pattern = new RegExp(`^${ref.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\s*:\\s*(.*)$`, "m");
    const match = text.match(pattern);
    return match && match[1] ? stripYamlScalar(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

async function resolveApiKey(credentials) {
  if (credentials !== undefined && typeof credentials.resolve === "function") {
    const resolved = await credentials.resolve(BALANCE_CREDENTIAL_REF);
    if (resolved?.value) return resolved.value;
  }
  return process.env[BALANCE_CREDENTIAL_REF] || readLocalCredential(BALANCE_CREDENTIAL_REF);
}

async function requestBalance(credentials) {
  const apiKey = await resolveApiKey(credentials);
  if (typeof apiKey !== "string" || apiKey.length === 0) {
    return errorResult("missing-credential", "未配置 DEEPSEEK_API_KEY，请先在 DSH 模型设置中配置 DeepSeek API Key");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BALANCE_TIMEOUT_MS);
  try {
    const response = await fetch(BALANCE_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal
    });
    if (!response.ok) {
      const [code, message] = classifyHttpStatus(response.status);
      return errorResult(code, message);
    }
    let payload;
    try {
      payload = await response.json();
    } catch {
      return errorResult("invalid-response", "余额接口返回了无法识别的数据");
    }
    return normalizeBalancePayload(payload);
  } catch (error) {
    if (error?.name === "AbortError") return errorResult("timeout", "余额查询超时，请稍后重试");
    return errorResult("network-error", "无法连接 DeepSeek 余额接口，请检查网络");
  } finally {
    clearTimeout(timer);
  }
}

/** Register the local balance route and its short-lived cache. */
export function apply(ctx) {
  ctx.inject(["webServer"], (serverCtx) => {
    const credentials = ctx.get("credentials");
    const sessionPersistence = ctx.get("sessionPersistence");
    let latest = EMPTY_RESULT;
    let expiresAt = 0;
    let inFlight = null;
    let latestUsage = usageErrorResult("not-fetched", "尚未读取 DSH 会话用量");
    let usageExpiresAt = 0;
    let usageInFlight = null;

    const load = async () => {
      if (inFlight !== null) return inFlight;
      inFlight = requestBalance(credentials)
        .then((result) => {
          latest = result;
          expiresAt = Date.now() + BALANCE_CACHE_MS;
          return result;
        })
        .finally(() => {
          inFlight = null;
        });
      return inFlight;
    };

    const loadUsage = async () => {
      if (usageInFlight !== null) return usageInFlight;
      usageInFlight = readUsageFromSessions(sessionPersistence)
        .then((result) => {
          latestUsage = result;
          usageExpiresAt = Date.now() + USAGE_CACHE_MS;
          return result;
        })
        .finally(() => {
          usageInFlight = null;
        });
      return usageInFlight;
    };

    const disposeRoute = serverCtx.webServer.register({
      kind: "exact",
      path: BALANCE_ROUTE,
      handler: async (_req, res) => {
        const result = Date.now() < expiresAt ? latest : await load();
        json(res, 200, result);
      }
    });

    const disposeUsageRoute = serverCtx.webServer.register({
      kind: "exact",
      path: USAGE_ROUTE,
      handler: async (_req, res) => {
        const result = Date.now() < usageExpiresAt ? latestUsage : await loadUsage();
        json(res, 200, result);
      }
    });

    ctx.effect(() => () => {
      disposeRoute();
      disposeUsageRoute();
    }, "deepseek-balance: route lifecycle");
  });
}
