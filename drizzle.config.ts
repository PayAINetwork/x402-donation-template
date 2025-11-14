import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "drizzle-kit";

// Lightweight .env loader so drizzle-kit can run outside Next.js runtime.
const loadedFromFile = new Set<string>();

const parseAndAssign = (filePath: string, overrideLoaded: boolean) => {
  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    if (!key) continue;

    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    const alreadySet = process.env[key] !== undefined;
    const setByFile = loadedFromFile.has(key);

    if (!alreadySet || (overrideLoaded && setByFile)) {
      process.env[key] = value;
      loadedFromFile.add(key);
    }
  }
};

for (const file of [".env", ".env.local"]) {
  const filePath = resolve(process.cwd(), file);
  if (!existsSync(filePath)) continue;
  parseAndAssign(filePath, file.endsWith(".local"));
}

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

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
