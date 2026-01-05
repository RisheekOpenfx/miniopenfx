import { Hono } from "hono";
import type { Variables } from "../../types/types.js";
import { authMiddleware } from "../../middleware/auth.js";
import { creditBalanceController } from "../../controllers/balance.controller.js";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);

app.get("/", creditBalanceController);

export default app;
