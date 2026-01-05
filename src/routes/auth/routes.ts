import { Hono } from "hono";
import {
  signupController,
  loginController,
} from "../../controllers/auth.controller.js";

const app = new Hono();

app.post("/signup", signupController);
app.post("/login", loginController);

export default app;
