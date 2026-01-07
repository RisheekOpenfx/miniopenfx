import { HttpStatus } from "./http.js";
import { Context } from "hono";

export function success(
  c: Context,
  data: unknown,
  status: HttpStatus = HttpStatus.OK,
) {
  return c.json({ success: true, data: data }, status);
}
