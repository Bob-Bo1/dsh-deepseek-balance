// deepseek-balance — browser half.

window.__ModuleLoader__.load({
  id: "deepseek-balance",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    let react = require("react");

    const css = [
      "._dsb_btn{box-sizing:border-box;width:36px;height:36px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);cursor:pointer;justify-content:center;align-items:center;padding:0;display:inline-flex;position:relative}",
      "._dsb_btn:hover{background:var(--dsw-alias-interactive-bg-hover-accent)}",
      "._dsb_btn[data-active=true]{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-module-platform)}",
      "._dsb_panel{box-sizing:border-box;overflow-y:auto;display:flex;flex-direction:column;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l3);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.28);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;padding:12px 0 8px}",
      "._dsb_head{padding:0 14px 10px;border-bottom:1px solid var(--dsw-alias-border-l2)}",
      "._dsb_title{font-size:14px;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:8px}",
      "._dsb_status{font-size:11px;font-weight:500}",
      "._dsb_ok{color:var(--dsw-alias-state-success-primary)}",
      "._dsb_bad{color:var(--dsw-alias-state-error-primary)}",
      "._dsb_meta{color:var(--dsw-alias-label-tertiary);font-size:11px;margin-top:4px}",
      "._dsb_usage{padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l2)}",
      "._dsb_sectionTitle{font-size:12px;font-weight:600;margin-bottom:7px}",
      "._dsb_local{font-size:10px;color:var(--dsw-alias-label-tertiary);font-weight:400;margin-left:4px}",
      "._dsb_stats{display:grid;grid-template-columns:1fr 1fr;gap:7px}",
      "._dsb_stat{background:var(--dsw-alias-bg-module-platform);border-radius:8px;padding:7px 8px;min-width:0}",
      "._dsb_statLabel{display:block;color:var(--dsw-alias-label-tertiary);font-size:10px}",
      "._dsb_statValue{display:block;font-size:14px;font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      "._dsb_models{margin-top:8px;display:flex;flex-direction:column;gap:4px}",
      "._dsb_model{display:flex;justify-content:space-between;align-items:center;color:var(--dsw-alias-label-secondary);font-size:11px}",
      "._dsb_modelValue{color:var(--dsw-alias-label-primary);font-weight:600;font-variant-numeric:tabular-nums}",
      "._dsb_usageNote{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:15px;margin-top:7px}",
      "._dsb_row{padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1)}",
      "._dsb_row:last-child{border-bottom:none}",
      "._dsb_currency{font-weight:600;margin-bottom:5px}",
      "._dsb_line{display:flex;justify-content:space-between;align-items:baseline;color:var(--dsw-alias-label-secondary);font-size:11px}",
      "._dsb_value{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600;font-variant-numeric:tabular-nums}",
      "._dsb_error{padding:14px;color:var(--dsw-alias-state-error-primary);font-size:12px;text-align:center}",
      "._dsb_loading{padding:20px 14px;color:var(--dsw-alias-label-tertiary);font-size:12px;text-align:center}",
      "._dsb_foot{padding:8px 14px 0;color:var(--dsw-alias-label-tertiary);font-size:11px;display:flex;justify-content:space-between;align-items:center;gap:8px}",
      "._dsb_refresh{border:0;border-radius:12px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:2px 8px;font:inherit;font-size:11px}",
      "._dsb_refresh:hover{background:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-label-primary)}"
    ].join("");
    const tagId = "deepseek-balance/panel.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "deepseek-balance";
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    const NS = "deepseekBalance";
    const zh = {
      title: "DeepSeek 余额与费用",
      available: "可用",
      unavailable: "不可用",
      total: "总余额",
      granted: "赠金余额",
      toppedUp: "充值余额",
      spending: "消费统计",
      local: "本地统计",
      cumulative: "累计消费",
      today: "今日消费",
      flash: "Flash 费用",
      pro: "Pro 费用",
      noUsage: "暂无 DSH 会话用量记录",
      usageLoading: "正在读取消费记录…",
      usageError: "消费记录读取失败",
      usageNote: "仅统计 DSH 已保存的 DeepSeek 请求，按当前公开单价计算",
      loading: "正在读取余额…",
      refresh: "刷新",
      updated: "更新于",
      error: "余额读取失败",
      btnAria: "DeepSeek 余额与费用"
    };
    const en = {
      title: "DeepSeek Balance & Usage",
      available: "Available",
      unavailable: "Unavailable",
      total: "Total",
      granted: "Granted",
      toppedUp: "Topped up",
      spending: "Usage cost",
      local: "Local",
      cumulative: "Cumulative",
      today: "Today",
      flash: "Flash cost",
      pro: "Pro cost",
      noUsage: "No DSH session usage yet",
      usageLoading: "Loading usage…",
      usageError: "Failed to load usage",
      usageNote: "DSH DeepSeek requests only, calculated at current public rates",
      loading: "Loading balance…",
      refresh: "Refresh",
      updated: "Updated",
      error: "Failed to load balance",
      btnAria: "DeepSeek balance and usage"
    };

    const { useState, useEffect, useCallback, useRef } = react;
    const ROUTE = "/api/deepseek-balance";
    const USAGE_ROUTE = "/api/deepseek-balance/usage";

    async function fetchBalance() {
      const response = await fetch(ROUTE, { credentials: "omit", cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    }

    async function fetchUsage() {
      const response = await fetch(USAGE_ROUTE, { credentials: "omit", cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    }

    function useBalance() {
      const [state, setState] = useState({ data: null, loading: true, error: false });
      const request = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
          const data = await fetchBalance();
          setState({ data, loading: false, error: !data.ok });
        } catch {
          setState((prev) => ({ ...prev, loading: false, error: true }));
        }
      }, []);

      useEffect(() => {
        request();
        const id = setInterval(() => {
          if (document.visibilityState === "visible") request();
        }, 60_000);
        const onVisible = () => {
          if (document.visibilityState === "visible") request();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => {
          clearInterval(id);
          document.removeEventListener("visibilitychange", onVisible);
        };
      }, [request]);

      return { ...state, request };
    }

    function useUsage() {
      const [state, setState] = useState({ data: null, loading: true, error: false });
      const request = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
          const data = await fetchUsage();
          setState({ data, loading: false, error: !data.ok });
        } catch {
          setState((prev) => ({ ...prev, loading: false, error: true }));
        }
      }, []);

      useEffect(() => {
        request();
        const id = setInterval(() => {
          if (document.visibilityState === "visible") request();
        }, 60_000);
        return () => clearInterval(id);
      }, [request]);

      return { ...state, request };
    }

    function formatAmount(value, currency) {
      if (value === null || value === undefined || value === "") return "—";
      const number = Number(value);
      if (!Number.isFinite(number)) return String(value);
      try {
        return new Intl.NumberFormat("zh-CN", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 8
        }).format(number);
      } catch {
        return String(value);
      }
    }

    function formatCny(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) return "—";
      return new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "CNY",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number);
    }

    function UsageSection({ t, state }) {
      if (state.loading && state.data === null) {
        return react.createElement("div", { className: "_dsb_usage" },
          react.createElement("div", { className: "_dsb_sectionTitle" }, t("spending"), react.createElement("span", { className: "_dsb_local" }, t("local"))),
          react.createElement("div", { className: "_dsb_loading" }, t("usageLoading"))
        );
      }
      if (state.data?.ok === false || state.error) {
        return react.createElement("div", { className: "_dsb_usage" },
          react.createElement("div", { className: "_dsb_sectionTitle" }, t("spending"), react.createElement("span", { className: "_dsb_local" }, t("local"))),
          react.createElement("div", { className: "_dsb_error" }, state.data?.message || t("usageError"))
        );
      }
      const cumulative = state.data?.cumulative || {};
      const today = state.data?.today || {};
      return react.createElement("div", { className: "_dsb_usage" },
        react.createElement("div", { className: "_dsb_sectionTitle" }, t("spending"), react.createElement("span", { className: "_dsb_local" }, t("local"))),
        react.createElement("div", { className: "_dsb_stats" },
          react.createElement("div", { className: "_dsb_stat" },
            react.createElement("span", { className: "_dsb_statLabel" }, t("cumulative")),
            react.createElement("span", { className: "_dsb_statValue" }, formatCny(cumulative.total?.amountCny || 0))
          ),
          react.createElement("div", { className: "_dsb_stat" },
            react.createElement("span", { className: "_dsb_statLabel" }, t("today")),
            react.createElement("span", { className: "_dsb_statValue" }, formatCny(today.total?.amountCny || 0))
          )
        ),
        state.data?.requests > 0 ? react.createElement("div", { className: "_dsb_models" },
          react.createElement("div", { className: "_dsb_model" },
            react.createElement("span", null, t("flash")),
            react.createElement("span", { className: "_dsb_modelValue" }, formatCny(cumulative.flash?.amountCny || 0))
          ),
          react.createElement("div", { className: "_dsb_model" },
            react.createElement("span", null, t("pro")),
            react.createElement("span", { className: "_dsb_modelValue" }, formatCny(cumulative.pro?.amountCny || 0))
          )
        ) : react.createElement("div", { className: "_dsb_loading" }, t("noUsage")),
        react.createElement("div", { className: "_dsb_usageNote" }, state.data?.note || t("usageNote"))
      );
    }

    function BalancePanel({ t, onClose, anchor }) {
      const balance = useBalance();
      const usage = useUsage();
      const { data, loading, error } = balance;
      const panelRef = useRef(null);
      const [rect, setRect] = useState(anchor);

      useEffect(() => {
        const update = () => setRect(anchor());
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
          window.removeEventListener("resize", update);
          window.removeEventListener("scroll", update, true);
        };
      }, [anchor]);

      useEffect(() => {
        const onDown = (event) => {
          if (event.target?.closest?.("._dsb_btn")) return;
          if (panelRef.current && !panelRef.current.contains(event.target)) onClose();
        };
        const onKey = (event) => {
          if (event.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
          document.removeEventListener("mousedown", onDown);
          document.removeEventListener("keydown", onKey);
        };
      }, [onClose]);

      let balanceBody;
      if (loading && data === null) {
        balanceBody = react.createElement("div", { className: "_dsb_loading" }, t("loading"));
      } else if (data?.ok === false || error) {
        balanceBody = react.createElement("div", { className: "_dsb_error" }, data?.message || t("error"));
      } else {
        const rows = Array.isArray(data?.balances) ? data.balances.map((balance) =>
          react.createElement("div", { className: "_dsb_row", key: balance.currency },
            react.createElement("div", { className: "_dsb_currency" }, balance.currency),
            react.createElement("div", { className: "_dsb_line" },
              react.createElement("span", null, t("total")),
              react.createElement("span", { className: "_dsb_value" }, formatAmount(balance.totalBalance, balance.currency))
            ),
            react.createElement("div", { className: "_dsb_line" },
              react.createElement("span", null, t("granted")),
              react.createElement("span", null, formatAmount(balance.grantedBalance, balance.currency))
            ),
            react.createElement("div", { className: "_dsb_line" },
              react.createElement("span", null, t("toppedUp")),
              react.createElement("span", null, formatAmount(balance.toppedUpBalance, balance.currency))
            )
          )
        ) : [];
        balanceBody = react.createElement(react.Fragment, null,
          react.createElement("div", { className: "_dsb_head" },
            react.createElement("div", { className: "_dsb_title" },
              react.createElement("span", null, t("title")),
              react.createElement("span", { className: "_dsb_status " + (data?.isAvailable ? "_dsb_ok" : "_dsb_bad") },
                data?.isAvailable ? t("available") : t("unavailable")
              )
            ),
            react.createElement("div", { className: "_dsb_meta" }, data?.fetchedAt ? t("updated") + " " + new Date(data.fetchedAt).toLocaleTimeString("zh-CN", { hour12: false }) : "—")
          ),
          rows.length > 0 ? rows : react.createElement("div", { className: "_dsb_loading" }, "暂无余额数据")
        );
      }

      const body = react.createElement(react.Fragment, null,
        react.createElement(UsageSection, { t, state: usage }),
        balanceBody
      );
      const PANEL_W = 320;
      const GAP = 8;
      const style = { position: "fixed", zIndex: 1200, width: PANEL_W, maxHeight: "calc(100vh - 84px)" };
      if (rect) {
        style.left = Math.max(GAP, Math.min(rect.right - PANEL_W, window.innerWidth - PANEL_W - GAP));
        style.bottom = Math.max(GAP, window.innerHeight - rect.top + GAP);
      } else {
        style.left = GAP;
        style.bottom = 52;
      }

      return react.createElement("div", {
        className: "_dsb_panel",
        style,
        ref: panelRef,
        role: "dialog",
        "aria-label": t("title")
      },
        body,
        react.createElement("div", { className: "_dsb_foot" },
          react.createElement("span", null, "DeepSeek API"),
          react.createElement("button", { type: "button", className: "_dsb_refresh", onClick: () => { balance.request(); usage.request(); } }, t("refresh"))
        )
      );
    }

    function BalanceButton({ t }) {
      const [open, setOpen] = useState(false);
      const btnRef = useRef(null);
      const toggle = useCallback(() => setOpen((value) => !value), []);
      const close = useCallback(() => setOpen(false), []);
      const anchor = useCallback(() => {
        const element = btnRef.current;
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }, []);
      return react.createElement("div", { style: { position: "relative" } },
        react.createElement("button", {
          ref: btnRef,
          type: "button",
          className: "_dsb_btn",
          "data-active": open,
          "aria-label": t("btnAria"),
          title: t("title"),
          onClick: toggle
        }, "💰"),
        open ? react.createElement(BalancePanel, { t, onClose: close, anchor }) : null
      );
    }

    const inject = ["slots", "locale"];

    function apply(ctx) {
      const slots = ctx.get("slots");
      if (slots === undefined) return;
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "deepseek-balance: dictionaries");
      ctx.slots.inject("sidebar.footer.action", () => slots.register({
        name: "sidebar.footer.action",
        id: "deepseek-balance",
        locale: NS
      }, BalanceButton));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
