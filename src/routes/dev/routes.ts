import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/types.js";
import { devAddMoneyController } from "../../controllers/dev.controller.js";

const app = new Hono<{ Variables: Variables }>();
app.use("*", authMiddleware);
app.post("/addMoney", devAddMoneyController);

export default app;
