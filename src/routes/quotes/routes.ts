import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/types.js";
import { quoteController } from "../../controllers/quote.controller.js";

const app = new Hono<{ Variables: Variables }>();
app.use("*", authMiddleware);

app.post("/", quoteController);

export default app;
