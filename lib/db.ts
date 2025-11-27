/**
 * Database operations for donations
 * Users own their own Postgres database
 */

import { db } from "@/db";
import { donations } from "@/db/schema";
import { desc, count, sql } from "drizzle-orm";

export interface DonationMessage {
  id: number;
  donor_address: string;
  donor_name: string | null;
  amount_usd: number;
  currency: string;
  message: string | null;
  created_at: Date;
}

/**
 * Store a donation in the user's own database
 */
export async function storeDonation(
  donatorAddress: string,
  amountUsd: number,
  name?: string,
  message?: string,
  transactionSignature?: string,
  currency: string = "USDC"
): Promise<DonationMessage | null> {
  try {
    const result = await db
      .insert(donations)
      .values({
        donorAddress: donatorAddress,
        donorName: name || null,
        amountUsd: amountUsd.toFixed(2),
        currency,
        message: message || null,
        transactionSignature: transactionSignature || null,
      })
      .returning();

    const donation = result[0];

    return {
      id: donation.id,
      donor_address: donation.donorAddress,
      donor_name: donation.donorName,
      amount_usd: parseFloat(donation.amountUsd),
      currency: donation.currency || "USDC",
      message: donation.message,
      created_at: donation.createdAt,
    };
  } catch (error) {
    console.error("[DB] Error storing donation:", error);
    return null;
  }
}

/**
 * Get paginated donations from user's own database
 */
export async function getDonations(
  page: number = 1,
  limit: number = 50,
  sortBy: "recent" | "top" = "recent"
): Promise<{ donations: DonationMessage[]; total: number }> {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.select({ count: count() }).from(donations);
    const total = countResult[0].count;

    // Get donations with sorting
    const donationsList =
      sortBy === "top"
        ? await db
            .select()
            .from(donations)
            .orderBy(desc(donations.amountUsd), desc(donations.createdAt))
            .limit(limit)
            .offset(offset)
        : await db
            .select()
            .from(donations)
            .orderBy(desc(donations.createdAt))
            .limit(limit)
            .offset(offset);

    // Convert to DonationMessage format
    const formattedDonations: DonationMessage[] = donationsList.map((d) => ({
      id: d.id,
      donor_address: d.donorAddress,
      donor_name: d.donorName,
      amount_usd: parseFloat(d.amountUsd),
      currency: d.currency || "USDC",
      message: d.message,
      created_at: d.createdAt,
    }));

    return {
      donations: formattedDonations,
      total,
    };
  } catch (error) {
    console.error("[DB] Error fetching donations:", error);
    return { donations: [], total: 0 };
  }
}

/**
 * Get donation stats from user's own database
 */
export async function getDonationStats(): Promise<{
  totalDonations: number;
  totalAmount: number;
  biggestDonor: {
    donor_name: string | null;
    donor_address: string | null;
    amount_usd: number;
  } | null;
}> {
  try {
    const statsResult = await db
      .select({
        totalDonations: count(),
        totalAmount: sql<string>`COALESCE(SUM(${donations.amountUsd}), 0)`,
      })
      .from(donations);

    // Get the biggest donation (highest amount)
    const biggest = await db
      .select()
      .from(donations)
      .orderBy(desc(donations.amountUsd), desc(donations.createdAt))
      .limit(1);

    const biggestDonor = biggest.length
      ? {
          donor_name: biggest[0].donorName,
          donor_address: biggest[0].donorAddress,
          amount_usd: parseFloat(biggest[0].amountUsd),
        }
      : null;

    return {
      totalDonations: statsResult[0].totalDonations,
      totalAmount: parseFloat(statsResult[0].totalAmount),
      biggestDonor,
    };
  } catch (error) {
    console.error("[DB] Error fetching stats:", error);
    return { totalDonations: 0, totalAmount: 0, biggestDonor: null };
  }
}
