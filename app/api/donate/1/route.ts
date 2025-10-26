import { NextRequest } from "next/server";
import { handleDonation } from "@/lib/donation-handler";

/**
 * POST /api/donate/1
 * 
 * Donate $1 USDC and receive tokens
 * Protected by x402 middleware - requires $1 payment
 */
export async function POST(request: NextRequest) {
    return handleDonation(request, { amountUsd: 1 });
}

