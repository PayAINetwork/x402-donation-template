import { NextRequest } from "next/server";
import { handleDonation } from "@/lib/donation-handler";

/**
 * POST /api/donate/5
 * 
 * Donate $5 USDC and receive tokens
 * Protected by x402 middleware - requires $5 payment
 */
export async function POST(request: NextRequest) {
    return handleDonation(request, { amountUsd: 5 });
}

