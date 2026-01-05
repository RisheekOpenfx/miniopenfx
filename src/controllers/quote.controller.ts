import { Context } from "hono";
import { createQuoteService } from "../services/quote.service.js";

export async function quoteController(c: Context) {
  const userId = c.get("userId");
  const { pair, side } = await c.req.json();

  const quote = await createQuoteService(userId, pair, side);

  return c.json(
    {
      success: true,
      data: quote,
    },
    201,
  );
}
