import { sql } from "@vercel/postgres";

export interface DonationMessage {
    id: number;
    donator_address: string;
    amount_usd: number;
    tokens_minted: number;
    name: string | null;
    message: string | null;
    created_at: Date;
}

/**
 * Initialize the database schema
 * Creates the donations table if it doesn't exist
 */
export async function initDatabase(): Promise<void> {
    await sql`
    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      donator_address VARCHAR(44) NOT NULL,
      amount_usd DECIMAL(10, 2) NOT NULL,
      tokens_minted BIGINT NOT NULL,
      name VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

    // Create index on created_at for efficient sorting
    await sql`
    CREATE INDEX IF NOT EXISTS donations_created_at_idx 
    ON donations (created_at DESC)
  `;
}

/**
 * Store a donation message in the database
 */
export async function storeDonation(
    donatorAddress: string,
    amountUsd: number,
    tokensMinted: number,
    name?: string,
    message?: string
): Promise<DonationMessage> {
    const result = await sql<DonationMessage>`
    INSERT INTO donations (donator_address, amount_usd, tokens_minted, name, message)
    VALUES (${donatorAddress}, ${amountUsd}, ${tokensMinted}, ${name || null}, ${message || null})
    RETURNING *
  `;

    return result.rows[0];
}

/**
 * Get paginated donation messages
 */
export async function getDonations(
    page: number = 1,
    limit: number = 50,
    sortBy: "recent" | "top" = "recent"
): Promise<{ donations: DonationMessage[]; total: number }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await sql`
    SELECT COUNT(*) as count FROM donations
  `;
    const total = parseInt(countResult.rows[0].count);

    // Get donations
    let donations;
    if (sortBy === "top") {
        donations = await sql<DonationMessage>`
      SELECT * FROM donations
      ORDER BY amount_usd DESC, created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    } else {
        donations = await sql<DonationMessage>`
      SELECT * FROM donations
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    }

    return {
        donations: donations.rows,
        total,
    };
}

/**
 * Get total donation stats
 */
export async function getDonationStats(): Promise<{
    totalDonations: number;
    totalAmount: number;
    totalTokens: number;
}> {
    const result = await sql`
    SELECT 
      COUNT(*) as total_donations,
      COALESCE(SUM(amount_usd), 0) as total_amount,
      COALESCE(SUM(tokens_minted), 0) as total_tokens
    FROM donations
  `;

    return {
        totalDonations: parseInt(result.rows[0].total_donations),
        totalAmount: parseFloat(result.rows[0].total_amount),
        totalTokens: parseInt(result.rows[0].total_tokens),
    };
}

