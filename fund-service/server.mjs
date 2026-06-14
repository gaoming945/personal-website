import http from "node:http";
import { Buffer } from "node:buffer";

const PORT = Number(process.env.PORT || 3000);
const FUND_CODES = (process.env.FUND_CODES || "016664,017730,019347")
  .split(",")
  .map((code) => code.trim())
  .filter(Boolean);

const FUND_NAMES = {
  "016664": "天弘全球高端制造混合(QDII)A",
  "017730": "嘉实全球产业升级股票发起式(QDII)A",
  "019347": "富国匠心成长混合A",
};

const MARKET_ITEMS = [
  { id: "ixic", label: "纳指", sina: "gb_ixic" },
  { id: "ndx", label: "纳指100", sina: "gb_ndx" },
  { id: "spx", label: "标普500", sina: "gb_inx" },
  { id: "dji", label: "道琼斯", sina: "gb_dji" },
  { id: "usdcny", label: "美元人民币", sina: "fx_susdcny" },
];

const cache = new Map();

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function html(res, body) {
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

async function cached(key, ttlMs, loader) {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.time < ttlMs) return hit.value;
  const value = await loader();
  cache.set(key, { time: now, value });
  return value;
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      referer: "https://fund.eastmoney.com/",
      ...options.headers,
    },
    signal: AbortSignal.timeout(options.timeout || 8000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

function matchVar(source, name) {
  const match = source.match(new RegExp(`var\\s+${name}\\s*=\\s*([\\s\\S]*?);\\s*(?:\\/\\*|var\\s|$)`));
  if (!match) return null;
  return match[1].trim();
}

function parseJsString(source, name) {
  const raw = matchVar(source, name);
  if (!raw) return "";
  try {
    return JSON.parse(raw);
  } catch {
    return raw.replace(/^["']|["']$/g, "");
  }
}

function parseJsJson(source, name, fallback) {
  const raw = matchVar(source, name);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function loadFund(code) {
  const version = Date.now();
  const detailUrl = `https://fund.eastmoney.com/pingzhongdata/${encodeURIComponent(code)}.js?v=${version}`;
  const gzUrl = `https://fundgz.1234567.com.cn/js/${encodeURIComponent(code)}.js?rt=${version}`;

  const [detailSource, gzSource] = await Promise.allSettled([
    fetchText(detailUrl),
    fetchText(gzUrl, { headers: { referer: "https://fund.eastmoney.com/" } }),
  ]);

  if (detailSource.status !== "fulfilled") {
    throw detailSource.reason;
  }

  const source = detailSource.value;
  const trend = parseJsJson(source, "Data_netWorthTrend", []);
  const positions = parseJsJson(source, "Data_fundSharesPositions", []);
  const stockCodes = parseJsJson(source, "stockCodesNew", []);
  const latest = trend.at(-1) || {};
  const previous = trend.at(-2) || {};
  const latestNav = Number(latest.y || 0);
  const previousNav = Number(previous.y || 0);
  const dailyChangePct =
    Number.isFinite(Number(latest.equityReturn)) && latest.equityReturn !== 0
      ? Number(latest.equityReturn)
      : previousNav
        ? ((latestNav - previousNav) / previousNav) * 100
        : 0;

  let officialEstimate = null;
  if (gzSource.status === "fulfilled") {
    const match = gzSource.value.match(/jsonpgz\((.*)\);?/);
    if (match?.[1]) {
      try {
        officialEstimate = JSON.parse(match[1]);
      } catch {
        officialEstimate = null;
      }
    }
  }

  const holdingCodes = stockCodes.slice(0, 10).map((item) => {
    const [, codePart = item] = String(item).split(".");
    return codePart;
  });

  return {
    code,
    name: parseJsString(source, "fS_name") || FUND_NAMES[code] || code,
    latestNav,
    navDate: latest.x ? new Date(latest.x).toISOString().slice(0, 10) : "",
    dailyChangePct: Number(dailyChangePct.toFixed(2)),
    officialEstimate: officialEstimate
      ? {
          nav: Number(officialEstimate.gsz || 0),
          changePct: Number(officialEstimate.gszzl || 0),
          time: officialEstimate.gztime || "",
        }
      : null,
    returns: {
      month: parseJsString(source, "syl_1y"),
      quarter: parseJsString(source, "syl_3y"),
      halfYear: parseJsString(source, "syl_6y"),
      year: parseJsString(source, "syl_1n"),
    },
    position: positions.at(-1)?.[1] ?? null,
    holdingCodes,
    updatedAt: new Date().toISOString(),
    source: "东方财富基金公开数据",
  };
}

async function loadFunds() {
  return cached("funds", 5 * 60 * 1000, async () => {
    const results = await Promise.allSettled(FUND_CODES.map(loadFund));
    return results.map((result, index) => {
      if (result.status === "fulfilled") return result.value;
      const code = FUND_CODES[index];
      return {
        code,
        name: FUND_NAMES[code] || code,
        error: result.reason?.message || "数据源请求失败",
        source: "东方财富基金公开数据",
      };
    });
  });
}

function decodeGb18030(buffer) {
  try {
    return new TextDecoder("gb18030").decode(buffer);
  } catch {
    return Buffer.from(buffer).toString("binary");
  }
}

async function loadMarkets() {
  return cached("markets", 60 * 1000, async () => {
    const list = MARKET_ITEMS.map((item) => item.sina).join(",");
    const response = await fetch(`https://hq.sinajs.cn/list=${list}`, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        referer: "https://finance.sina.com.cn/",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} sina markets`);
    const source = decodeGb18030(await response.arrayBuffer());

    return MARKET_ITEMS.map((item) => {
      const match = source.match(new RegExp(`hq_str_${item.sina}="([^"]*)"`));
      const fields = match?.[1]?.split(",") || [];
      if (item.sina === "fx_susdcny") {
        return {
          id: item.id,
          label: item.label,
          value: Number(fields[1] || 0),
          changePct: Number(fields[10] || 0),
          updatedAt: `${fields[17] || ""} ${fields[0] || ""}`.trim(),
          source: "新浪财经实时行情",
        };
      }
      return {
        id: item.id,
        label: item.label,
        value: Number(fields[1] || 0),
        changePct: Number(fields[2] || 0),
        updatedAt: fields[3] || "",
        source: "新浪财经实时行情",
      };
    });
  });
}

async function loadSnapshot() {
  const [funds, markets] = await Promise.all([loadFunds(), loadMarkets()]);
  return {
    funds,
    markets,
    generatedAt: new Date().toISOString(),
    note: "基金净值、收益和持仓来自东方财富公开数据；若官方盘中估值接口为空，页面展示最新真实净值涨跌，不伪造估值。",
  };
}

function page() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>基金实时估值系统</title>
  <link rel="icon" href="data:," />
  <style>
    :root { color-scheme: dark; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #101010; color: #f5f5f5; }
    body { margin: 0; background: #101010; }
    header { position: sticky; top: 0; z-index: 2; border-bottom: 1px solid rgba(255,255,255,.1); background: rgba(16,16,16,.95); }
    .wrap { max-width: 1120px; margin: 0 auto; padding: 16px; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; }
    .sub { color: #8b8b8b; font-size: 12px; margin-top: 2px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    @media (min-width: 760px) { .grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
    .card { border-radius: 8px; background: #1d1d1d; padding: 14px; box-shadow: 0 0 0 1px rgba(255,255,255,.04); }
    .row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .muted { color: #8b8b8b; font-size: 12px; }
    .rise { color: #ff4655; }
    .fall { color: #20d67b; }
    .num { font-variant-numeric: tabular-nums; }
    h1 { font-size: 20px; margin: 22px 0 4px; }
    input, select { height: 42px; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; background: #1d1d1d; color: #f5f5f5; padding: 0 12px; outline: none; }
    input { width: 100%; box-sizing: border-box; margin: 12px 0; }
    .funds { display: grid; gap: 10px; }
    .fund-title { font-weight: 700; }
    .change { font-size: 24px; font-weight: 800; }
    .meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .pill { border-radius: 6px; background: rgba(0,0,0,.22); padding: 8px; font-size: 12px; min-height: 38px; }
    .tag { display: inline-flex; align-items: center; height: 22px; border-radius: 999px; padding: 0 8px; background: rgba(255,255,255,.08); color: #cfcfcf; font-size: 12px; margin: 6px 6px 0 0; }
    .warn { color: #ffd166; }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body>
  <header><div class="wrap brand"><span style="color:#ff4655">↯</span><div>基金实时估值<div class="sub">Real public data, no mock values</div></div></div></header>
  <main class="wrap">
    <section id="markets" class="grid"></section>
    <section>
      <div class="row">
        <div><h1>基金估值列表</h1><div class="muted">真实数据源；官方估值为空时显示最新净值涨跌</div></div>
        <select id="sort"><option value="code">代码</option><option value="change">涨跌</option><option value="nav">净值</option></select>
      </div>
      <input id="search" placeholder="搜索基金名称 / 代码" />
      <div id="funds" class="funds"></div>
    </section>
  </main>
  <script>
    let snapshot = { funds: [], markets: [] };
    const fmt = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 4 });
    const pct = (v) => (Number(v) >= 0 ? "+" : "") + Number(v || 0).toFixed(2) + "%";
    const cls = (v) => Number(v || 0) >= 0 ? "rise" : "fall";
    function renderMarkets() {
      document.querySelector("#markets").innerHTML = snapshot.markets.map(item => \`
        <div class="card">
          <div class="row"><strong>\${item.label}</strong><span class="muted">\${item.id.toUpperCase()}</span></div>
          <div class="change num \${cls(item.changePct)}">\${pct(item.changePct)}</div>
          <div class="muted num">\${fmt.format(item.value || 0)}</div>
          <div class="muted">更新 \${item.updatedAt || "-"}</div>
        </div>\`).join("");
    }
    function renderFunds() {
      const q = document.querySelector("#search").value.trim().toLowerCase();
      const sort = document.querySelector("#sort").value;
      const funds = snapshot.funds
        .filter(item => !q || item.code.includes(q) || item.name.toLowerCase().includes(q))
        .sort((a, b) => sort === "change" ? (b.dailyChangePct || 0) - (a.dailyChangePct || 0) : sort === "nav" ? (b.latestNav || 0) - (a.latestNav || 0) : a.code.localeCompare(b.code));
      document.querySelector("#funds").innerHTML = funds.map(item => {
        const changeValue = item.officialEstimate?.changePct ?? item.dailyChangePct ?? 0;
        const navValue = item.officialEstimate?.nav || item.latestNav || 0;
        const estimateText = item.officialEstimate ? "官方盘中估值" : "最新净值涨跌";
        return \`
          <a class="card" href="/fund/\${item.code}">
            <div class="row">
              <div>
                <div class="fund-title">\${item.name}</div>
                <div class="muted num">\${item.code}</div>
              </div>
              <div style="text-align:right">
                <div class="change num \${cls(changeValue)}">\${pct(changeValue)}</div>
                <div class="muted">净值 \${fmt.format(navValue)}</div>
              </div>
            </div>
            <div class="meta">
              <div class="pill"><div class="muted">口径</div><div>\${estimateText}</div></div>
              <div class="pill"><div class="muted">净值日期</div><div class="num">\${item.navDate || "-"}</div></div>
              <div class="pill"><div class="muted">仓位</div><div class="num">\${item.position ? item.position.toFixed(2) + "%" : "-"}</div></div>
            </div>
            <div>\${item.officialEstimate ? "" : '<span class="tag warn">官方盘中估值暂不可用</span>'}<span class="tag">\${item.source}</span>\${(item.holdingCodes || []).slice(0, 6).map(code => '<span class="tag num">' + code + '</span>').join("")}</div>
          </a>\`;
      }).join("");
    }
    function apiBase() {
      return window.location.pathname.startsWith("/fund") ? "/fund" : "";
    }
    async function refresh() {
      const res = await fetch(apiBase() + "/api/fund/snapshot", { cache: "no-store" });
      snapshot = await res.json();
      renderMarkets();
      renderFunds();
    }
    document.querySelector("#search").addEventListener("input", renderFunds);
    document.querySelector("#sort").addEventListener("change", renderFunds);
    refresh().catch(error => {
      document.querySelector("#funds").innerHTML = '<div class="card warn">真实数据源请求失败：' + error.message + '</div>';
    });
    setInterval(refresh, 5 * 60 * 1000);
  </script>
</body>
</html>`;
}

function normalizePath(req) {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/fund")) {
    return url.pathname.slice(5) || "/";
  }
  return url.pathname;
}

const server = http.createServer(async (req, res) => {
  try {
    const path = normalizePath(req);
    if (path === "/api/fund/snapshot") return json(res, 200, await loadSnapshot());
    if (path === "/health") return json(res, 200, { ok: true });
    if (path === "/favicon.ico") {
      res.writeHead(204, { "cache-control": "public, max-age=86400" });
      return res.end();
    }
    if (path === "/" || /^\/\d{6}$/.test(path)) return html(res, page());
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    json(res, 500, { error: error.message || "internal error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`fund service listening on ${PORT}`);
});
