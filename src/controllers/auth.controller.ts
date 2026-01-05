import { success } from "../utilities/response.js";
import { HttpStatus } from "../types/http.js";
import { Context } from "hono";
import { signupUserService, loginService } from "../services/auth.service.js";

export async function signupController(c: Context) {
  const { email, password } = await c.req.json();

  signupUserService(email, password);

  return success(c, { message: "User created" }, HttpStatus.CREATED);
}

export async function loginController(c: Context) {
  const { email, password } = await c.req.json();

  const token = await loginService(email, password);

  return success(c, { token: token }, HttpStatus.OK);
}
