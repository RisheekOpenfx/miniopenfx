#  MiniOpenFX

MiniOpenFX is a backend-first foreign exchange (FX) trading platform built with modern serverless and TypeScript technologies.  
It focuses on clean architecture, strong type safety, and production-ready patterns.

> Built for learning, experimentation, and real-world backend engineering practices.

---

##  Features

- User authentication and authorization
- Quote generation with buy/sell spreads
- Balance management with atomic updates
- FX price fetching and caching
- Serverless deployment on Cloudflare Workers
- Strong runtime validation and type safety


---

##  Tech Stack

- **Language:** TypeScript  
- **Framework:** Hono  
- **Database:** PostgreSQL (Neon – serverless)  
- **ORM:** Drizzle ORM  
- **Validation:** Zod  
- **Caching:** Cloudflare KV  
- **Background State:** Durable Objects  
- **Deployment:** Cloudflare Workers  
- **Testing:** Vitest  
- **Linting & Formatting:** ESLint + Prettier  

---

##  Architecture Overview

MiniOpenFX follows a layered backend architecture:

- **Controllers** – Handle HTTP requests and responses
- **Services** – Contain all business logic
- **Models** – Database access via Drizzle ORM
- **Middleware** – Auth, logging, and error handling
- **Infrastructure** – Cloudflare Workers, KV, Durable Objects

This separation keeps the codebase scalable and testable.

---

##  Project Structure

```txt
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── models/          # Database queries
├── middleware/      # Auth, logging, error handling
├── database/        # DB client & config
├── types/           # Shared TypeScript types
├── errors/          # Error codes & mappings
├── utilities/       # Helpers & response utils
└── index.ts         # App entry point
