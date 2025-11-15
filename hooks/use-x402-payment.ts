"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createX402Client } from "x402-solana/client";

type PaymentRequestBody = Record<string, unknown>;

export function useX402Payment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, signTransaction } = useWallet();

  // Create x402 client with wallet adapter
  const client = useMemo(() => {
    if (!publicKey || !signTransaction) {
      return null;
    }

    const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ||
      "solana-devnet") as "solana" | "solana-devnet";

    return createX402Client({
      wallet: {
        publicKey,
        signTransaction,
      },
      network,
    });
  }, [publicKey, signTransaction]);

  const initiatePayment = async <TResponse = unknown>(
    endpoint: string,
    body?: PaymentRequestBody
  ): Promise<TResponse> => {
    if (!client) {
      throw new Error("Wallet not connected");
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Call x402-protected endpoint with automatic payment handling
      const response = await client.fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const result = (await response.json()) as TResponse;
      setIsProcessing(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      setIsProcessing(false);
      throw err;
    }
  };

  return {
    initiatePayment,
    isProcessing,
    error,
  };
}
