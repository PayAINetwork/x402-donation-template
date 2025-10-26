import { NextRequest } from "next/server";
import { handleDonation } from "@/lib/donation-handler";

/**
 * POST /api/donate/10
 * 
 * Donate $10 USDC and receive tokens
 * Protected by x402 middleware - requires $10 payment
 */
export async function POST(request: NextRequest) {
    return handleDonation(request, { amountUsd: 10 });
}

