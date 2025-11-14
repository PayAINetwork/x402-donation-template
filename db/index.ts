import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString =
  process.env.STORAGE_URL_NON_POOLING ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.STORAGE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing database connection string. Set STORAGE_URL_NON_POOLING, STORAGE_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL, or DATABASE_URL."
  );
}

// Create Neon HTTP client
const sql = neon(connectionString);

// Create Drizzle instance with schema
export const db = drizzle(sql, { schema });

// Export schema for use in queries
export { schema };
