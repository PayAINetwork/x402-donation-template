"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface DonationSuccessProps {
  amountUsd: number;
  tokensMinted: number;
  tokenSymbol: string;
  name?: string | null;
  message?: string | null;
  transactionSignature?: string;
  theme?: "dark" | "light";
  onConfirm?: () => void;
}

export function DonationSuccess({
  amountUsd,
  tokensMinted,
  tokenSymbol,
  name,
  message,
  transactionSignature,
  theme = "light",
  onConfirm,
}: DonationSuccessProps) {
  const formatTokens = (num: number) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  const formatTxHash = (hash: string) => {
    if (!hash) return "Pending...";
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const copyTxHash = () => {
    if (transactionSignature) {
      navigator.clipboard.writeText(transactionSignature);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        background: "transparent",
      }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background:
                theme === "dark"
                  ? "rgba(34, 191, 145, 1)"
                  : "rgba(34, 191, 145, 1)",
            }}
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center space-y-2">
          <h1
            className="text-3xl font-bold"
            style={{
              color:
                theme === "dark"
                  ? "rgba(255, 255, 255, 1)"
                  : "rgba(9, 9, 11, 1)",
            }}
          >
            Thank you for supporting us!
          </h1>
          <p
            className="text-base"
            style={{
              color:
                theme === "dark"
                  ? "rgba(156, 163, 175, 1)"
                  : "rgba(113, 113, 122, 1)",
            }}
          >
            Your contribution helps us grow, create, and keep building together.
          </p>
        </div>

        {/* Donation Details Card */}
        <div
          className="rounded-2xl p-2 shadow-lg"
          style={{
            background:
              theme === "dark" ? "transparent" : "rgba(250, 250, 250, 1)",
            boxShadow:
              theme === "dark"
                ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
            border:
              theme === "dark"
                ? "1px solid rgba(255, 255, 255, 0.16)"
                : "1px solid rgba(228, 228, 231, 1)",
          }}
        >
          <div className="space-y-4">
            {/* Donation Amount */}
            <div className="flex justify-between items-center">
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    theme === "dark"
                      ? "rgba(156, 163, 175, 1)"
                      : "rgba(113, 113, 122, 1)",
                }}
              >
                Donation Amount
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    theme === "dark"
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(9, 9, 11, 1)",
                }}
              >
                ${amountUsd} USDC
              </span>
            </div>

            {/* Tokens Received */}
            <div className="flex justify-between items-center">
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    theme === "dark"
                      ? "rgba(156, 163, 175, 1)"
                      : "rgba(113, 113, 122, 1)",
                }}
              >
                Tokens Received
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    theme === "dark"
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(9, 9, 11, 1)",
                }}
              >
                {formatTokens(tokensMinted)} {tokenSymbol}
              </span>
            </div>

            {/* Name */}
            {name && (
              <div className="flex justify-between items-center">
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(156, 163, 175, 1)"
                        : "rgba(113, 113, 122, 1)",
                  }}
                >
                  Name
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                  }}
                >
                  {name}
                </span>
              </div>
            )}

            {/* Transaction Hash */}
            {transactionSignature && (
              <>
                <div className="flex justify-between items-center">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        theme === "dark"
                          ? "rgba(156, 163, 175, 1)"
                          : "rgba(113, 113, 122, 1)",
                    }}
                  >
                    TxHash
                  </span>
                  <button
                    onClick={copyTxHash}
                    className="text-sm font-semibold underline cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      color:
                        theme === "dark"
                          ? "rgba(34, 191, 145, 1)"
                          : "rgba(22, 163, 74, 1)",
                    }}
                  >
                    {formatTxHash(transactionSignature)}
                  </button>
                </div>

                {/* Separator */}
                {message && (
                  <div
                    className="h-px my-4"
                    style={{
                      background:
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.16)"
                          : "rgba(228, 228, 231, 1)",
                    }}
                  />
                )}
              </>
            )}

            {/* Message */}
            {message && (
              <div className="pt-2">
                <p
                  className="text-sm font-medium mb-2"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(156, 163, 175, 1)"
                        : "rgba(113, 113, 122, 1)",
                  }}
                >
                  Message
                </p>
                <p
                  className="text-sm"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                  }}
                >
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          onClick={onConfirm}
          className="w-full py-6 rounded-full font-bold text-base shadow-lg"
          style={{
            background: "linear-gradient(to right, #744AC9, #22EBAD)",
            color: "rgba(255, 255, 255, 1)",
            border: "none",
          }}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}
