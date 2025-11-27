import { NextRequest, NextResponse } from "next/server";
import { storeDonation } from "@/lib/db";

export interface WriteMessageRequest {
  amount: number; // USD amount (minimum $0.01)
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

    // Parse request body
    const body = (await request.json()) as WriteMessageRequest;
    const { amount, name, message } = body;

    // Validate amount
    if (!amount || amount < 0.01) {
      return NextResponse.json(
        { success: false, error: "Amount must be at least $0.01" },
        { status: 400 }
      );
    }

    // Store donation record with message in launcher database
    const donation = await storeDonation(
      payerAddress,
      amount,
      name,
      message,
      transactionSignature || undefined
    );

    return NextResponse.json({
      success: true,
      message: `Thank you${
        name ? `, ${name},` : ""
      } for your $${amount} donation!`,
      data: {
        donator: payerAddress,
        amountUsd: amount,
        currency: donation?.currency || "USDC",
        transactionSignature: transactionSignature,
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
