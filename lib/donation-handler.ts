import { NextRequest, NextResponse } from "next/server";
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
    let transactionSignature: string | null = null;
    try {
      const decoded = JSON.parse(
        Buffer.from(paymentResponse, "base64").toString()
      );
      payerAddress = decoded.payer;
      transactionSignature = decoded.transaction || null;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid payment response" },
        { status: 500 }
      );
    }

    // Store donation record in launcher database
    const donation = await storeDonation(
      payerAddress,
      amountUsd,
      undefined,
      undefined,
      transactionSignature || undefined
    );

    return NextResponse.json({
      success: true,
      message: `Thank you for your $${amountUsd} donation!`,
      data: {
        donator: payerAddress,
        amountUsd,
        currency: donation?.currency || "USDC",
        transactionSignature: transactionSignature,
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
