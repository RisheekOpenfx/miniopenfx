import { describe, it, expect } from "vitest";

const BASE_URL = process.env.API_BASE_URL!;

describe("MiniOpenFX API – deployed", () => {
  let token: string;
  let quoteId: string;

  it("Health check", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    expect(res.status).toBe(200);
  });

  it("Login", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@admin.com",
        password: "admin123",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    token = body.data.token;
  });

  it("Create quote", async () => {
    const res = await fetch(`${BASE_URL}/quotes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pair: "USDEUR",
        side: "BUY",
        amount: 1,
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    quoteId = body.data.id;
  });
});
