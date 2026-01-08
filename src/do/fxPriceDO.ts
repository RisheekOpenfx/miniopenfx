import { ErrorCode } from "../errors/error_codes";
import { EnvBindings } from "../types/env";
import type { Quote } from "../types/types";

export class FxPricesDO {
  state: DurableObjectState;
  env: EnvBindings;

  ws?: WebSocket;
  prices: Record<string, Quote> = {};

  private subscribedSymbolsKey = "";
  private reconnecting = false;

  constructor(state: DurableObjectState, env: EnvBindings) {
    this.state = state;
    this.env = env;
  }

  private buildUrl(symbols: string[]) {
    const streams = symbols
      .map((s) => `${s.toLowerCase()}@bookTicker`)
      .join("/");
    return `wss://stream.binance.com:9443/stream?streams=${encodeURIComponent(streams)}`;
  }

  async ensureConnected(symbols: string[]) {
    const key = symbols
      .map((s) => s.toUpperCase())
      .sort()
      .join(",");

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING) &&
      this.subscribedSymbolsKey === key
    ) {
      return;
    }

    if (this.ws) {
      try {
        this.ws.close(1000, "resubscribe");
      } catch {
        console.log("ws coudlnt be closed");
      }
      this.ws = undefined;
    }

    this.subscribedSymbolsKey = key;
    const url = this.buildUrl(symbols);

    const ws = new WebSocket(url);
    this.ws = ws;

    ws.addEventListener("open", () => {
      this.state.storage.setAlarm(Date.now() + 30_000).catch(() => {});
    });

    ws.addEventListener("message", (evt) => {
      const msg = JSON.parse(String(evt.data));

      const data = msg.data ?? msg;

      const sym = String(data.s);
      const bid = String(data.b);
      const ask = String(data.a);
      const mid = (Number(bid) + Number(ask)) / 2;

      this.prices[sym] = { bid, ask, mid: String(mid), ts: Date.now() };
    });

    ws.addEventListener("close", () => {
      if (this.ws === ws) this.ws = undefined;
      this.scheduleReconnect(symbols);
    });

    ws.addEventListener("error", () => {
      try {
        ws.close();
      } catch {
        console.log("ws couldnt be closed");
      }
      if (this.ws === ws) this.ws = undefined;
      this.scheduleReconnect(symbols);
    });
  }

  private scheduleReconnect(symbols: string[]) {
    if (this.reconnecting) return;
    this.reconnecting = true;

    const delayMs = 1000;

    this.state.storage.setAlarm(Date.now() + delayMs).catch(() => {});
    this.subscribedSymbolsKey = symbols
      .map((s) => s.toUpperCase())
      .sort()
      .join(",");
  }

  async alarm() {
    this.reconnecting = false;

    const symbols = this.subscribedSymbolsKey
      ? this.subscribedSymbolsKey.split(",").filter(Boolean)
      : ["EURUSDT"];

    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      await this.ensureConnected(symbols);
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      await this.state.storage.setAlarm(Date.now() + 30_000);
    }
  }

  async fetch(req: Request) {
    const url = new URL(req.url);

    const symbols = (url.searchParams.get("symbols") ?? "EURUSDT")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    await this.ensureConnected(symbols);

    const out: Record<string, Quote | null> = {};
    for (const s of symbols) out[s] = this.prices[s] ?? null;

    return new Response(JSON.stringify(out), {
      headers: { "content-type": "application/json" },
    });
  }
}
