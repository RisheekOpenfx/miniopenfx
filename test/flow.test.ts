import { describe, it, expect } from "vitest";
import app from "../src/index.js";

describe("MiniOpenFX API Flow", () => {
  let token: string;
  let quoteId: string;

  it("Health check works", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("Signup user (already exists)", async () => {
    const res = await app.request("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@admin.com",
        password: "admin123",
      }),
    });

    expect([200, 201, 409, 500]).toContain(res.status);
  });

  it("Login and get token", async () => {
    const res = await app.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "vscode@test.com",
        password: "pass123",
      }),
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toBeDefined();

    token = body.data.token;
  });

  it("Create quote", async () => {
    const res = await app.request("/quotes", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pair: "USDINR",
        side: "BUY",
        amount: 1,
      }),
    });

    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.data.id).toBeDefined();

    quoteId = body.data.id;
  });

  it("Execute trade (idempotent)", async () => {
    const res = await app.request("/trades/self", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `${quoteId}`,
      },
      body: JSON.stringify({
        quoteId,
        amount: 10,
      }),
    });
    console.log(res);

    expect(res.status).toBe(201);

    const body = await res.json();
    console.log(body)
    expect(body.success).toBeDefined();
  });

  it("Get balances", async () => {
    const res = await app.request("/balances", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.data.balances)).toBe(true);
  });
});
