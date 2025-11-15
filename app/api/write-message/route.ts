import { NextRequest, NextResponse } from "next/server";
import {
  getTokenConfig,
  calculateTokensForDonation,
  transferTokens,
} from "@/lib/token";
import { storeDonation } from "@/lib/db";

export interface WriteMessageRequest {
  amount: number; // USD amount (minimum $1)
  name?: string; // Optional donor name
  message?: string; // Optional message
}

/**
 * POST /api/write-message
 *
 * Donate custom amount with optional name and message
 * Protected by x402 middleware - requires minimum $1 payment
 *
 * Body:
 * {
 *   "amount": 25.50,        // USD amount
 *   "name": "John Doe",     // optional
 *   "message": "To the moon!" // optional
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get payment details from middleware
    const paymentResponse = request.headers.get("X-PAYMENT-RESPONSE");
    if (!paymentResponse) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 402 }
      );
    }

    let payerAddress: string;
    try {
      const decoded = JSON.parse(
        Buffer.from(paymentResponse, "base64").toString()
      );
      payerAddress = decoded.payer;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid payment response" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = (await request.json()) as WriteMessageRequest;
    const { amount, name, message } = body;

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, error: "Amount must be at least $1" },
        { status: 400 }
      );
    }

    // Get token configuration
    const tokenConfig = getTokenConfig();

    // Calculate tokens to mint
    const tokensToMint = calculateTokensForDonation(
      amount,
      tokenConfig.dollarToTokenRatio
    );

    if (tokensToMint <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid donation amount" },
        { status: 400 }
      );
    }

    // Transfer tokens to donor
    const signature = await transferTokens(payerAddress, tokensToMint);

    // Store donation record with message in launcher database
    await storeDonation(
      payerAddress,
      amount,
      tokensToMint,
      name,
      message,
      signature
    );

    return NextResponse.json({
      success: true,
      message: `Thank you${
        name ? `, ${name},` : ""
      } for your $${amount} donation!`,
      data: {
        donator: payerAddress,
        amountUsd: amount,
        tokensMinted: tokensToMint,
        tokenSymbol: tokenConfig.symbol,
        transactionSignature: signature,
        name: name || null,
        message: message || null,
      },
    });
  } catch (error) {
    console.error("Write message error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process donation",
      },
      { status: 500 }
    );
  }
}
