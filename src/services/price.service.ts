import { ErrorCode } from "../errors/error_codes.js";
import type { PriceEntry } from "../types/types.js";

const CACHE_TTL_MS: number = 60000;

const priceCache: Record<string, PriceEntry> = {};

export async function refreshPrice(pair: string, pricecache:KVNamespace, stub: any): Promise<number> {
  const { base, quote } = parsePair(pair);
  var coinGeko:boolean = true;
  var binancebool: boolean = true;
  const res: Response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${base},${quote}`,
  );
  const data: any = await res.json();
  if (!res.ok) {
    coinGeko = false
    // throw new Error(`CoinGecko API error: ${data?.error || res.statusText}`);
    console.log(`CoinGecko API error: ${data?.error || res.statusText}`);
  }
  const basecur: string = base.toLocaleLowerCase();
  const quotecur: string = quote.toLocaleLowerCase();
  if (
    !data?.tether ||
    typeof data.tether[basecur] !== "number" ||
    typeof data.tether[quotecur] !== "number"
  ) {
    coinGeko = false;
    // throw new Error("Invalid CoinGecko response");
    console.log("Invalid CoinGecko response");
  }
  let binanceBase: number;
  if(basecur.toUpperCase() === "USD"){
    binanceBase=1;
  }
  else{
    const {binance} = ((await getPriceMultiple("USDT"+basecur, stub)));
    const cur = "USDT" + basecur;
    if(binance[cur] === null ||binance[cur] === undefined){
      binancebool = false;
      console.log("Issue with binance");
    }
    else{
      binanceBase = Number(binance[cur].mid);
    }
  }

  let binanceQuote;

  if(quotecur.toUpperCase() === "USD"){
    binanceQuote = 1;
  }
  else{
    const {binance} = ((await getPriceMultiple(quotecur.toUpperCase()+"USDT", stub)));
    const cur = quotecur.toUpperCase() + "USDT";
    if(binance[cur] === null ||binance[cur] === undefined){
      binancebool = false;
      console.log("Issue with binance", binance, cur, binance[cur]);
    }
    else{
      binanceQuote = Number(binance[cur].mid);
    }
  }
  let rate;
  if(binancebool && coinGeko){
    const binancerate = binanceQuote!/binanceBase!;
    const coingekkorate: number = data["tether"][quotecur] / data["tether"][basecur];
    rate = binancerate>coingekkorate ? binancerate : coingekkorate;
  }
  else if(binancebool){
    rate = binanceQuote!/binanceBase!;
  }
  else if(coinGeko){
    rate = data["tether"][quotecur] / data["tether"][basecur];
  }
  else{
    throw new Error();
  }

  await setPrice(pair, rate, pricecache);
  console.log(rate)
  return rate;
}

export async function isFresh(pair: string, pricecache:KVNamespace): Promise<boolean> {
  console.log("isfresh", pair)
  const entry: PriceEntry|null = await getPrice(pair, pricecache);
  if (!entry) return false;
  console.log(false);
  return Date.now() - entry.ts < CACHE_TTL_MS;
}

export async function getPrice(pair: string, pricecache: KVNamespace): Promise<PriceEntry | null> {
  const raw = await pricecache.get(pair);
  if (!raw) return null;

  const parsed = JSON.parse(raw) as unknown;

  if (
    typeof parsed !== "object" || parsed === null ||
    typeof (parsed as any).rate !== "number" ||
    typeof (parsed as any).ts !== "number"
  ) {
    return null; // corrupted cache
  }

  return parsed as PriceEntry;
}

export async function setPrice(pair: string, rate: number, pricecache: KVNamespace): Promise<void> {
  const payload: PriceEntry = { rate, ts: Date.now() };

  await pricecache.put(pair, JSON.stringify(payload), {
    expirationTtl: Math.ceil(CACHE_TTL_MS / 1000),
  });
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

export async function getPriceMultiple(
  bookTicker: string | undefined,
  stub: any,
) {
  let symbols = bookTicker;
  type BinanceQuote = { bid: string; ask: string; mid: string; ts: number };
  let binance: Record<string, BinanceQuote | null> = {};
  if (symbols !== undefined) {
    symbols = symbols.toUpperCase();

    const binanceRes = await stub.fetch(`https://do.local/?symbols=${symbols}`);
    binance = await binanceRes.json();
  }

  const cgUrl = new URL("https://api.coingecko.com/api/v3/simple/price");
  cgUrl.searchParams.set("ids", "tether");
  cgUrl.searchParams.set("vs_currencies", "eur,gbp,usd");
  cgUrl.searchParams.set("include_last_updated_at", "true");

  const headers: Record<string, string> = { accept: "application/json" };

  const cgRes = await fetch(cgUrl.toString(), { headers });
  const coingecko = await cgRes.json();

  return { symbols, binance, coingecko };
}
