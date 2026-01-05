import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import {
  selfTradeController,
  otherTradeController,
} from "../../controllers/trade.controller.js";

const app = new Hono();

app.use("*", authMiddleware);

app.post("/self", selfTradeController);
app.post("/others", otherTradeController);

export default app;
