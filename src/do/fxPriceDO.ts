import { EnvBindings } from "../types/env";
import type { Quote } from "../types/types";


export class FxPricesDO {
  state: DurableObjectState;
  env: EnvBindings;
  ws?: WebSocket;
  prices: Record<string, Quote> = {};

  constructor(state: DurableObjectState, env: EnvBindings) {
    this.state = state;
    this.env = env;
  }

  async ensureConnected(symbols: string[]) {
    if (this.ws && this.ws.readyState === 1) return;

    const streams = symbols.map((s) => `${s.toLowerCase()}@bookTicker`).join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    this.ws = new WebSocket(url);

    this.ws.addEventListener("message", (evt) => {
      const msg = JSON.parse(String(evt.data));
      const data = msg.data; // combined stream payload
      const sym = String(data.s); // e.g. "EURUSDT"
      const bid = String(data.b);
      const ask = String(data.a);
      const mid = (Number(bid) + Number(ask)) / 2;

      this.prices[sym] = { bid, ask, mid: String(mid), ts: Date.now() };
    });

    this.ws.addEventListener("close", () => {
      this.ws = undefined;
    });
  }

  async fetch(req: Request) {
    const url = new URL(req.url);

    // example: /?symbols=EURUSDT,GBPUSDT
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
