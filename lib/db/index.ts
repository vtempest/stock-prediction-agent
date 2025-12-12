
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Turso database client
// Clean up DATABASE_URL if it contains PostgreSQL parameters
let dbUrl = process.env.DATABASE_URL || "file:./local.db";

// If it's a PostgreSQL URL, use local file instead
if (dbUrl.includes("postgresql://") || dbUrl.includes("sslmode") || dbUrl.includes("channel_binding")) {
  console.warn("PostgreSQL URL detected, falling back to local SQLite database");
  dbUrl = "file:./local.db";
}

const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
