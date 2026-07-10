import type { Config } from "drizzle-kit";

import * as dotenv from "dotenv";
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || "";
export default {
  schema: "./src/db/schema",
  out: "./drizzle/yastream",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.DATABASE_WRITE_TOKEN,
  },
} satisfies Config;
