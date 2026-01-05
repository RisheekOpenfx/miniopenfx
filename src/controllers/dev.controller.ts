import { Context } from "hono";
import { devAddMoneyService } from "../services/dev.service";

export async function devAddMoneyController(c: Context) {
  const userId = c.get("userId");

  const { currency, amount, reciverId } = await c.req.json();

  devAddMoneyService(reciverId, currency, amount, userId);
  return c.json(
    {
      success: true,
      data: "Credited!",
    },
    201,
  );
}
