# MiniOpenFX API

MiniOpenFX is a foreign exchange (FX) trading API built on **Cloudflare Workers** using the **Hono** framework.  
It provides authentication, balances, real-time pricing, quotes, trade execution, transaction history, and a development-only funding endpoint.

Generated on: 2026-01-14

---

## Base URL

All endpoints are relative to your deployed Worker URL:

```
https://miniopenfx.risheek.workers.dev
```

---

## Authentication

### Bearer Token
Most endpoints require a JWT bearer token.

**Header**
```
Authorization: Bearer <token>
```

### Public Endpoints
- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`

All other endpoints require authentication.

---

## Common Headers

For JSON requests:
```
Content-Type: application/json
Accept: application/json
```

---

## Idempotency

Trade execution supports idempotency to prevent duplicate execution.

**Header**
```
Idempotency-Key: <unique-string>
```

### Constraint
- Reusing the same idempotency key with the same request must not execute the trade twice.
- Reusing the same key with a different payload should result in a conflict error.

---

## Data Types & Constraints

| Field | Type | Constraints |
|-----|----|----|
| email | string | Valid email format |
| password | string | Minimum 3 characters |
| amount | number | Must be > 0 |
| currency | string | 3-character code (USD, EUR, BTC) |
| pair | string | 6–7 characters (e.g. USDINR, EURUSDT) |
| side | string | BUY or SELL |

---

## API Endpoints

### 1. Health Check
**GET** `/health` (Public)

Checks if the API is running.

**Response**
```json
{ "ok": true }
```

---

### 2. Signup
**POST** `/auth/signup` (Public)

**Body**
```json
{ "email": "user@example.com", "password": "pass123" }
```

**Responses**
- `201 Created` / `200 OK`
- `409 Conflict` if user already exists

---

### 3. Login
**POST** `/auth/login` (Public)

**Body**
```json
{ "email": "admin@admin.com", "password": "admin123" }
```

**Response**
```json
{ "success": true, "data": { "token": "<JWT>" } }
```

---

### 4. Get Balances
**GET** `/balances` (Protected)

**Response**
```json
{
  "success": true,
  "data": {
    "balances": [
      { "currency": "USD", "amount": 1000 }
    ]
  }
}
```

---

### 5. Get Price
**GET** `/price?symbols=<SYMBOLS>` (Protected)

**Query**
- `symbols`: one or more symbols (comma-separated)

**Response**
```json
{
  "success": true,
  "data": {
    "binance": {
      "EURUSDT": {
        "bid": "1.1653",
        "ask": "1.1655",
        "mid": "1.1654",
        "ts": 1768297905061
      }
    }
  }
}
```

---

### 6. Create Quote
**POST** `/quotes` (Protected)

**Body**
```json
{ "pair": "USDBTC", "side": "BUY", "amount": 1 }
```

**Response**
- Returns a quote object with `id`, `rate`, `side`, and `expires_at`.

---

### 7. Execute Trade
**POST** `/trades` (Protected, Idempotent)

**Body**
```json
{ "quoteId": "quote-id" }
```

**Response**
```json
{ "success": true, "data": "Executed" }
```

---

### 8. Transaction History
**GET** `/history` (Protected)

Returns an array of ledger entries.

---

### 9. Add Money (Dev Only)
**POST** `/dev/addMoney` (Protected)

**Body**
```json
{ "currency": "USD", "amount": 1000, "reciverEmail": "admin@admin.com" }
```

> ⚠️ This endpoint must not be enabled in production.

---

## Error Handling

Errors should return appropriate HTTP status codes:
- 400 – Invalid input
- 401 – Unauthorized
- 404 – Not found
- 409 – Conflict
- 422 – Invalid business state
- 500 – Internal server error

Recommended error format:
```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "Explanation" }
}
```
