import { NextRequest, NextResponse } from "next/server";
import {
  getTokenConfig,
  calculateTokensForDonation,
  transferTokens,
} from "./token";
import { storeDonation } from "./db";

export interface DonationHandlerOptions {
  amountUsd: number;
}

/**
 * Shared handler for processing donations
 * Called by all donation endpoints after payment is verified by middleware
 */
export async function handleDonation(
  request: NextRequest,
  options: DonationHandlerOptions
): Promise<NextResponse> {
  const { amountUsd } = options;

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

    // Get token configuration
    const tokenConfig = getTokenConfig();

    // Calculate tokens to mint
    const tokensToMint = calculateTokensForDonation(
      amountUsd,
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

    // Store donation record in launcher database
    await storeDonation(
      payerAddress,
      amountUsd,
      tokensToMint,
      undefined,
      undefined,
      signature
    );

    return NextResponse.json({
      success: true,
      message: `Thank you for your $${amountUsd} donation!`,
      data: {
        donator: payerAddress,
        amountUsd,
        tokensMinted: tokensToMint,
        tokenSymbol: tokenConfig.symbol,
        transactionSignature: signature,
      },
    });
  } catch (error) {
    console.error("Donation processing error:", error);
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
