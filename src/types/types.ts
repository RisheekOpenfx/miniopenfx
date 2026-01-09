import { NeonHttpDatabase } from "drizzle-orm/neon-http";

export type DbLike = NeonHttpDatabase<any>;

export type Variables = {
  userId: string;
  userRole: string;
};

export type PriceEntry = {
  rate: number;
  ts: number;
};

export type userdata = {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
};

export type userBalanceType = {
  user_id: string;
  currency: string;
  amount: number;
};

export type LedgerEntryType = {
  id: string;
  user_id: string;
  currency: string;
  delta: number;
  reason: string;
  created_at: Date;
  receiver_id: string;
};

export type quoteType = {
  id: string;
  user_id: string;
  pair: string;
  side: string;
  quote: number;
  rate: number;
  status: string;
  expires_at: Date;
};

export type sessionType = {
  id: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
};

export type tradeType = {
  id: string;
  user_id: string;
  quote_id: string;
  idempotency_key: string;
  executed_at: Date;
};

export type userType = {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
};

export type Env = {
  FX_DO: DurableObjectNamespace;
  COINGECKO_API_KEY?: string;
};

export type Quote = { bid: string; ask: string; mid: string; ts: number };
