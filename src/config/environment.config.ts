// src/config/environment.ts
import { config } from "dotenv";

// Load environment variables
config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_KEY: process.env.API_KEY,
};
