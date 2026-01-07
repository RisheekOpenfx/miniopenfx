import type { PriceEntry } from "../types/types.js";

const CACHE_TTL_MS = 3000;

const priceCache: Record<string, PriceEntry> = {};

export async function refreshPrice(pair: string): Promise<number> {
  const { base, quote } = parsePair(pair);
  const res: any = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${base},${quote}`,
  );
  const data: any = await res.json();
  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${data?.error || res.statusText}`);
  }
  const basecur: string = base.toLocaleLowerCase();
  const quotecur: string = quote.toLocaleLowerCase();
  if (
    !data?.tether ||
    typeof data.tether[basecur] !== "number" ||
    typeof data.tether[quotecur] !== "number"
  ) {
    throw new Error("Invalid CoinGecko response");
  }

  const rate: number = data["tether"][quotecur] / data["tether"][basecur];
  setPrice(pair, rate);
  return rate;
}

export function isFresh(pair: string): boolean {
  const entry: PriceEntry = priceCache[pair];
  if (!entry) return false;
  return Date.now() - entry.ts < CACHE_TTL_MS;
}

export function getPrice(pair: string): number | null {
  return priceCache[pair]?.rate ?? null;
}

export function setPrice(pair: string, rate: number): void {
  priceCache[pair] = {
    rate,
    ts: Date.now(),
  };
}

function parsePair(pair: string): { base: string; quote: string } {
  const symbol: string = pair.replace("/", "");
  if (symbol.length !== 6) {
    throw new Error(`Invalid pair: ${pair}`);
  }
  return {
    base: symbol.slice(0, 3).toLowerCase(),
    quote: symbol.slice(3).toLowerCase(),
  };
}
