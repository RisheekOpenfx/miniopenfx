import "dotenv/config";
import { Hono } from "hono";

import authRoutes from "./routes/auth/routes.js";
import quoteRoutes from "./routes/quotes/routes.js";
import tradeRoutes from "./routes/trades/routes.js";
import balanceRoutes from "./routes/balances/routes.js";
import devRoutes from "./routes/dev/routes.js";
import historyRoutes from "./routes/history/routes.js";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/quotes", quoteRoutes);
app.route("/trades", tradeRoutes);
app.route("/balances", balanceRoutes);
app.route("/dev", devRoutes);
app.route("/history", historyRoutes);

export default app;
