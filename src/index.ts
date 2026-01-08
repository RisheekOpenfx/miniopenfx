
import { createApp } from "./app.js";
import { FxPricesDO } from "./do/fxPriceDO.js";
export { FxPricesDO };

import authRoutes from "./routes/auth/routes.js";
import quoteRoutes from "./routes/quotes/routes.js";
import tradeRoutes from "./routes/trades/routes.js";
import balanceRoutes from "./routes/balances/routes.js";
import devRoutes from "./routes/dev/routes.js";
import historyRoutes from "./routes/history/routes.js";

const app = createApp();

app.get("/v1/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/quotes", quoteRoutes);
app.route("/trades", tradeRoutes);
app.route("/balances", balanceRoutes);
app.route("/dev", devRoutes);
app.route("/history", historyRoutes);

app.get("/fx", async (c) => {
  const symbols = (c.req.query("symbols") ?? "EURUSDT").toUpperCase();

  // 1) Binance (from DO)
  const id = c.env.FX_DO.idFromName("binance-fx");
  const stub = c.env.FX_DO.get(id);
  const binanceRes = await stub.fetch(`https://do.local/?symbols=${symbols}`);
  const binance = await binanceRes.json();

  // 2) CoinGecko (fallback/reference) — example uses tether pricing
  const cgUrl = new URL("https://api.coingecko.com/api/v3/simple/price");
  cgUrl.searchParams.set("ids", "tether");
  cgUrl.searchParams.set("vs_currencies", "eur,gbp,usd");
  cgUrl.searchParams.set("include_last_updated_at", "true");

  const headers: Record<string, string> = { accept: "application/json" };
  if (c.env.COINGECKO_API_KEY) headers["x-cg-pro-api-key"] = c.env.COINGECKO_API_KEY;

  const cgRes = await fetch(cgUrl.toString(), { headers });
  const coingecko = await cgRes.json(); // per /simple/price :contentReference[oaicite:6]{index=6}

  return c.json({ symbols, binance, coingecko });
});

export default app;
