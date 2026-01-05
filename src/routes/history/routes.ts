import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/types.js";
import { historyController } from "../../controllers/history.controller.js";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);

app.get("/", historyController);

export default app;
