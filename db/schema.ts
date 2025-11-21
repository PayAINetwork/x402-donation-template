import {
  pgTable,
  serial,
  timestamp,
  text,
  decimal,
  index,
} from "drizzle-orm/pg-core";

// Donations table: tracks direct USDC donations and optional messages
export const donations = pgTable(
  "donations",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),

    // Donor
    donorAddress: text("donor_address").notNull(),
    donorName: text("donor_name"),

    // Amounts
    amountUsd: decimal("amount_usd", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USDC"),

    // Message
    message: text("message"),

    // Transaction
    transactionSignature: text("transaction_signature"),
  },
  (table) => [
    index("idx_donations_donor").on(table.donorAddress),
    index("idx_donations_created_at").on(table.createdAt),
  ]
);

// TypeScript types for inserts and selects
export type InsertDonation = typeof donations.$inferInsert;
export type SelectDonation = typeof donations.$inferSelect;
