/**
 * Launcher API client
 * Replaces local Postgres with centralized database in launcher
 */

export interface DonationMessage {
    id: number;
    donator_address: string;
    amount_usd: number;
    tokens_minted: number;
    name: string | null;
    message: string | null;
    created_at: Date;
}

const LAUNCHER_API_URL = process.env.LAUNCHER_API_URL || process.env.NEXT_PUBLIC_LAUNCHER_URL;
const LAUNCHER_API_KEY = process.env.LAUNCHER_API_KEY;
const TOKEN_MINT = process.env.TOKEN_MINT;

if (!LAUNCHER_API_URL) {
    console.warn('[DB] LAUNCHER_API_URL not configured - donations will not be recorded');
}

/**
 * Store a donation in the launcher's central database
 */
export async function storeDonation(
    donatorAddress: string,
    amountUsd: number,
    tokensMinted: number,
    name?: string,
    message?: string,
    transactionSignature?: string
): Promise<DonationMessage | null> {
    if (!LAUNCHER_API_URL || !TOKEN_MINT) {
        console.error('[DB] Cannot store donation - missing LAUNCHER_API_URL or TOKEN_MINT');
        return null;
    }

    try {
        const response = await fetch(`${LAUNCHER_API_URL}/api/donations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(LAUNCHER_API_KEY ? { 'X-API-Key': LAUNCHER_API_KEY } : {}),
            },
            body: JSON.stringify({
                tokenMint: TOKEN_MINT,
                donorAddress: donatorAddress,
                donorName: name,
                amountUsd,
                tokensMinted,
                message,
                transactionSignature,
            }),
        });

        if (!response.ok) {
            console.error('[DB] Failed to store donation:', await response.text());
            return null;
        }

        const result = await response.json();
        
        // Return a compatible format (even though ID might be different)
        return {
            id: result.donationId || 0,
            donator_address: donatorAddress,
            amount_usd: amountUsd,
            tokens_minted: tokensMinted,
            name: name || null,
            message: message || null,
            created_at: new Date(),
        };
    } catch (error) {
        console.error('[DB] Error storing donation:', error);
        return null;
    }
}

/**
 * Get paginated donations from launcher API
 */
export async function getDonations(
    page: number = 1,
    limit: number = 50,
    sortBy: "recent" | "top" = "recent"
): Promise<{ donations: DonationMessage[]; total: number }> {
    if (!LAUNCHER_API_URL || !TOKEN_MINT) {
        console.error('[DB] Cannot fetch donations - missing LAUNCHER_API_URL or TOKEN_MINT');
        return { donations: [], total: 0 };
    }

    try {
        const url = new URL(`${LAUNCHER_API_URL}/api/donations/${TOKEN_MINT}`);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('sort', sortBy);

        const response = await fetch(url.toString(), {
            headers: {
                ...(LAUNCHER_API_KEY ? { 'X-API-Key': LAUNCHER_API_KEY } : {}),
            },
        });

        if (!response.ok) {
            console.error('[DB] Failed to fetch donations:', await response.text());
            return { donations: [], total: 0 };
        }

        const result = await response.json();
        
        return {
            donations: result.donations || [],
            total: result.pagination?.total || 0,
        };
    } catch (error) {
        console.error('[DB] Error fetching donations:', error);
        return { donations: [], total: 0 };
    }
}

/**
 * Get donation stats from launcher API
 */
export async function getDonationStats(): Promise<{
    totalDonations: number;
    totalAmount: number;
    totalTokens: number;
}> {
    if (!LAUNCHER_API_URL || !TOKEN_MINT) {
        console.error('[DB] Cannot fetch stats - missing LAUNCHER_API_URL or TOKEN_MINT');
        return { totalDonations: 0, totalAmount: 0, totalTokens: 0 };
    }

    try {
        const url = `${LAUNCHER_API_URL}/api/donations/${TOKEN_MINT}`;
        const response = await fetch(url, {
            headers: {
                ...(LAUNCHER_API_KEY ? { 'X-API-Key': LAUNCHER_API_KEY } : {}),
            },
        });

        if (!response.ok) {
            console.error('[DB] Failed to fetch stats:', await response.text());
            return { totalDonations: 0, totalAmount: 0, totalTokens: 0 };
        }

        const result = await response.json();
        
        return {
            totalDonations: result.stats?.totalDonations || 0,
            totalAmount: result.stats?.totalAmount || 0,
            totalTokens: result.stats?.totalTokens || 0,
        };
    } catch (error) {
        console.error('[DB] Error fetching stats:', error);
        return { totalDonations: 0, totalAmount: 0, totalTokens: 0 };
    }
}

