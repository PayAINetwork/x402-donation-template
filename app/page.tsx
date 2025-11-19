"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletOverlay } from "@/components/wallet-overlay-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useX402Payment } from "@/hooks/use-x402-payment";
import { Loader2, Send, TrendingUp, Users, Coins } from "lucide-react";
import { useTheme } from "next-themes";
import { DonationItem } from "@/components/donation-item";
import { DonationSuccess } from "@/components/donation-success";

interface DonationMessage {
  id: number;
  donor_address: string;
  donor_name: string | null;
  amount_usd: number;
  tokens_minted: number;
  message: string | null;
  created_at: string;
}

interface MessagesResponse {
  success: boolean;
  data: {
    donations: DonationMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stats: {
      totalDonations: number;
      totalAmount: number;
      totalTokens: number;
    };
  };
}

export default function Home() {
  // theme comes from next-themes ThemeProvider (or system) — map to 'dark'|'light'
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme as "dark" | "light" | undefined) || "light";

  const { connected, publicKey, disconnect } = useWallet();
  const walletOverlay = useWalletOverlay();
  const { initiatePayment, isProcessing, error } = useX402Payment();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<DonationMessage[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    totalTokens: 0,
  });
  const [customAmount, setCustomAmount] = useState("10");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(
    10
  );
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "top">("recent");
  const [donationResult, setDonationResult] = useState<any>(null);

  // Token config from env
  const tokenName = process.env.NEXT_PUBLIC_TOKEN_NAME || "Token";
  const tokenSymbol = process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "TOKEN";
  const tokenImage = process.env.NEXT_PUBLIC_TOKEN_IMAGE_URL;
  const tokenDescription =
    process.env.NEXT_PUBLIC_TOKEN_DESCRIPTION || "Support our community!";
  const mintableSupply = parseInt(
    process.env.NEXT_PUBLIC_MINTABLE_SUPPLY || "1000000"
  );
  const donationTarget = parseInt(
    process.env.NEXT_PUBLIC_DONATION_TARGET || "1000"
  );
  const dollarToTokenRatio = Math.floor(mintableSupply / donationTarget);

  useEffect(() => {
    setMounted(true);
    fetchMessages();
  }, [sortBy]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?sort=${sortBy}&limit=20`);
      if (response.ok) {
        const data: MessagesResponse = await response.json();
        setMessages(data.data.donations);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedQuickAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleDonate = async () => {
    if (!connected || !customAmount) return;

    const amount = parseFloat(customAmount);
    if (amount < 1) {
      alert("Minimum donation is $1");
      return;
    }

    try {
      const result = await initiatePayment("/api/write-message", {
        amount,
        name: donorName || undefined,
        message: donorMessage || undefined,
      });
      setDonationResult(result);
      setCustomAmount("10");
      setSelectedQuickAmount(10);
      setDonorName("");
      setDonorMessage("");
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error("Donation failed:", err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <main
      className="h-screen flex flex-col md:flex-row overflow-hidden"
      style={{
        background: theme === "dark" ? "#000000" : "#FFFFFF",
      }}
    >
      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col h-full overflow-y-auto">
        {/* Mobile Header */}
        <header
          style={{
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "16px",
            gap: "24px",
            background: theme === "dark" ? "#000000" : "#FFFFFF",
            borderBottom:
              theme === "dark"
                ? "1px solid rgba(255, 255, 255, 0.16)"
                : "1px solid #E4E4E7",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px",
              gap: "4px",
              alignSelf: "stretch",
            }}
          >
            <div
              style={{
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                color: theme === "dark" ? "#FFFFFF" : "#09090B",
              }}
            >
              {tokenName}
            </div>
            <div
              style={{
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                color:
                  theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "#71717A",
              }}
            >
              {tokenDescription}
            </div>
          </div>
        </header>

        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Mobile Stats Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                color: theme === "dark" ? "#FFFFFF" : "#09090B",
              }}
            >
              Statistics
            </div>
            <div
              style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                padding: "12px",
                gap: "24px",
                background: theme === "dark" ? "#000000" : "#FFFFFF",
                borderRadius: "8px",
                alignSelf: "stretch",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "0px",
                  flex: "1",
                }}
              >
                {/* Row 1 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "0px",
                    alignSelf: "stretch",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "0px",
                      gap: "4px",
                      flex: "1",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "20px",
                        textAlign: "center",
                        color: theme === "dark" ? "#FFFFFF" : "#09090B",
                      }}
                    >
                      {stats.totalDonations}
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textAlign: "center",
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.7)"
                            : "#09090B",
                      }}
                    >
                      Total Donors
                    </div>
                  </div>
                  <div
                    style={{
                      width: "1px",
                      height: "56px",
                      background:
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.16)"
                          : "#E4E4E7",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "0px",
                      gap: "4px",
                      flex: "1",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "20px",
                        textAlign: "center",
                        color: theme === "dark" ? "#FFFFFF" : "#09090B",
                      }}
                    >
                      ${stats.totalAmount.toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textAlign: "center",
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.7)"
                            : "#09090B",
                      }}
                    >
                      Total Donated
                    </div>
                  </div>
                </div>
                {/* Row 2 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "0px",
                    alignSelf: "stretch",
                    marginTop: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "0px",
                      gap: "4px",
                      flex: "1",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "20px",
                        textAlign: "center",
                        color: theme === "dark" ? "#FFFFFF" : "#09090B",
                      }}
                    >
                      {stats.totalTokens.toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textAlign: "center",
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.7)"
                            : "#09090B",
                      }}
                    >
                      Tokens Distributed
                    </div>
                  </div>
                  <div
                    style={{
                      width: "1px",
                      height: "56px",
                      background:
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.16)"
                          : "#E4E4E7",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "0px",
                      gap: "4px",
                      flex: "1",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "20px",
                        textAlign: "center",
                        color: theme === "dark" ? "#FFFFFF" : "#09090B",
                      }}
                    >
                      {(mintableSupply - stats.totalTokens).toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textAlign: "center",
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.7)"
                            : "#09090B",
                      }}
                    >
                      Tokens Remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Community Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px",
              gap: "12px",
              flex: "1",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0px",
                gap: "24px",
                alignSelf: "stretch",
              }}
            >
              <div
                style={{
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: theme === "dark" ? "#FFFFFF" : "#09090B",
                  flex: "1",
                }}
              >
                Community Board
              </div>
              <div
                style={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "4px",
                  background:
                    theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "#EBEBEB",
                  border:
                    theme === "dark"
                      ? "1px solid rgba(255, 255, 255, 0.16)"
                      : "1px solid rgba(255, 255, 255, 0.16)",
                  borderRadius: "50px",
                }}
              >
                <button
                  onClick={() => setSortBy("recent")}
                  style={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px 12px",
                    background:
                      sortBy === "recent"
                        ? theme === "dark"
                          ? "rgba(255, 255, 255, 0.2)"
                          : "#09090B"
                        : "transparent",
                    borderRadius: "50px",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color:
                      sortBy === "recent"
                        ? "#FFFFFF"
                        : theme === "dark"
                        ? "rgba(255, 255, 255, 0.6)"
                        : "#71717A",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Recent
                </button>
                <button
                  onClick={() => setSortBy("top")}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px 12px",
                    background:
                      sortBy === "top"
                        ? theme === "dark"
                          ? "rgba(255, 255, 255, 0.2)"
                          : "#09090B"
                        : "transparent",
                    borderRadius: "50px",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color:
                      sortBy === "top"
                        ? "#FFFFFF"
                        : theme === "dark"
                        ? "rgba(255, 255, 255, 0.6)"
                        : "#71717A",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Top
                </button>
              </div>
            </div>
            <div
              style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "24px",
                gap: "16px",
                background: theme === "dark" ? "#000000" : "#FFFFFF",
                border:
                  theme === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.16)"
                    : "1px solid #E4E4E7",
                borderRadius: "8px",
                alignSelf: "stretch",
                minHeight: "444px",
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0px",
                    gap: "16px",
                    alignSelf: "stretch",
                    flex: "1",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "0px",
                      gap: "6px",
                      alignSelf: "stretch",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "16px",
                        lineHeight: "24px",
                        color: theme === "dark" ? "#FFFFFF" : "#09090B",
                      }}
                    >
                      No supporters yet
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textAlign: "center",
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.7)"
                            : "#71717A",
                      }}
                    >
                      You can be the first supporter! Every contribution helps
                      this project move forward.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%", overflowY: "auto" }}>
                  {messages.map((msg) => (
                    <DonationItem
                      key={msg.id}
                      id={msg.id}
                      donor_address={msg.donor_address}
                      donor_name={msg.donor_name}
                      amount_usd={msg.amount_usd}
                      tokens_minted={msg.tokens_minted}
                      message={msg.message}
                      created_at={msg.created_at}
                      tokenSymbol={tokenSymbol}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Connect Wallet Button */}
          <Button
            onClick={() => walletOverlay.open()}
            style={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px 24px",
              gap: "8px",
              background:
                "linear-gradient(88.41deg, #744AC9 -3.85%, #22EBAD 111.06%), #09090B",
              borderRadius: "999px",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#FFFFFF",
              textShadow: "0px 3px 4px rgba(0, 0, 0, 0.2)",
              border: "none",
              cursor: "pointer",
              alignSelf: "stretch",
              height: "40px",
            }}
          >
            Connect Wallet
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div
        className="hidden md:flex flex-col overflow-hidden"
        style={{
          flex: 3,
          borderRight:
            theme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.16)"
              : "1px solid rgba(228, 228, 231, 1)",
        }}
      >
        {/* Header */}
        <header
          className="border-b"
          style={{
            background:
              theme === "dark" ? "rgba(9, 9, 11, 1)" : "rgba(255, 255, 255, 1)",
            borderBottom:
              theme === "dark"
                ? "1px solid rgba(255, 255, 255, 0.16)"
                : "1px solid rgba(228, 228, 231, 1)",
          }}
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {tokenImage && (
                <img
                  src={tokenImage}
                  alt={tokenName}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                  }}
                >
                  {tokenName}
                </h1>
                <p className="text-sm text-x402-muted">${tokenSymbol}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 flex flex-col flex-1 min-h-0">
          {/* Stats */}
          <div
            style={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "16px 24px",
              gap: "24px",
              background: theme === "dark" ? "#000000" : "#FFFFFF",
              borderRadius: "12px",
              alignSelf: "stretch",
              marginBottom: "32px",
              position: "relative",
            }}
          >
            {/* Gradient Border */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "12px",
                padding: "2px",
                background:
                  "linear-gradient(73.69deg, rgba(150, 71, 253, 0.8) 0%, rgba(34, 235, 173, 0.8) 100.02%)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            {/* Stats Container */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "0px",
                gap: "24px",
                flex: "1",
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Donors Count */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0px",
                  gap: "6px",
                  flex: "1",
                }}
              >
                <div
                  style={{
                    color: theme === "dark" ? "#FFFFFF" : "#09090B",
                  }}
                >
                  {stats.totalDonations}
                </div>
                <div
                  style={{
                    color:
                      theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "#71717A",
                  }}
                >
                  Total Donors
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: "1px",
                  height: "56px",
                  background:
                    theme === "dark" ? "rgba(255, 255, 255, 0.16)" : "#E4E4E7",
                }}
              />

              {/* Donated Amount */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0px",
                  gap: "6px",
                  flex: "1",
                }}
              >
                <div
                  style={{
                    color: theme === "dark" ? "#FFFFFF" : "#09090B",
                  }}
                >
                  ${stats.totalAmount.toFixed(2)}
                </div>
                <div
                  style={{
                    color:
                      theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "#71717A",
                  }}
                >
                  Total Donated
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: "1px",
                  height: "56px",
                  background:
                    theme === "dark" ? "rgba(255, 255, 255, 0.16)" : "#E4E4E7",
                }}
              />

              {/* Distribution Amount */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0px",
                  gap: "6px",
                  flex: "1",
                }}
              >
                <div
                  style={{
                    color: theme === "dark" ? "#FFFFFF" : "#09090B",
                  }}
                >
                  {stats.totalTokens.toLocaleString()}
                </div>
                <div
                  style={{
                    color:
                      theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "#71717A",
                  }}
                >
                  Tokens Distributed
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: "1px",
                  height: "56px",
                  background:
                    theme === "dark" ? "rgba(255, 255, 255, 0.16)" : "#E4E4E7",
                }}
              />

              {/* Remaining Amount */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0px",
                  gap: "6px",
                  flex: "1",
                }}
              >
                <div
                  style={{
                    color: theme === "dark" ? "#FFFFFF" : "#09090B",
                  }}
                >
                  {(mintableSupply - stats.totalTokens).toLocaleString()}
                </div>
                <div
                  style={{
                    color:
                      theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "#71717A",
                  }}
                >
                  Tokens Remaining
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4 mt-8">
            <h1
              className="font-normal"
              style={{
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 1)"
                    : "rgba(9, 9, 11, 1)",
              }}
            >
              Community Board
            </h1>
            <div
              className="flex gap-2 rounded-full"
              style={{
                border:
                  theme === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.16)"
                    : "1px solid rgba(228, 228, 231, 1)",
                background:
                  theme === "light" ? "rgba(235, 235, 235, 1)" : "transparent",
              }}
            >
              {sortBy === "recent" ? (
                <button
                  onClick={() => setSortBy("recent")}
                  className="px-3 py-1 text-sm rounded-full flex-1"
                  style={{
                    background:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(9, 9, 11, 1)",
                    color:
                      theme === "dark"
                        ? "rgba(156, 163, 175, 1)"
                        : "rgba(255, 255, 255, 1)",
                  }}
                >
                  Recent
                </button>
              ) : (
                <button
                  onClick={() => setSortBy("recent")}
                  className="px-3 py-1 text-sm rounded-full flex-1"
                  style={{
                    background: "transparent",
                    color:
                      theme === "dark"
                        ? "rgba(156, 163, 175, 1)"
                        : "rgba(113, 113, 122, 1)",
                  }}
                >
                  Recent
                </button>
              )}
              {sortBy === "top" ? (
                <button
                  onClick={() => setSortBy("top")}
                  className="px-3 py-1 text-sm rounded-full flex-1"
                  style={{
                    background:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(9, 9, 11, 1)",
                    color:
                      theme === "dark"
                        ? "rgba(156, 163, 175, 1)"
                        : "rgba(255, 255, 255, 1)",
                  }}
                >
                  Top
                </button>
              ) : (
                <button
                  onClick={() => setSortBy("top")}
                  className="px-3 py-1 text-sm rounded-full flex-1"
                  style={{
                    background: "transparent",
                    color:
                      theme === "dark"
                        ? "rgba(156, 163, 175, 1)"
                        : "rgba(113, 113, 122, 1)",
                  }}
                >
                  Top
                </button>
              )}
            </div>
          </div>
          {/* Message Board */}
          <Card
            className="overflow-hidden flex flex-col flex-1 min-h-0"
            style={{
              background:
                theme === "light" ? "rgba(255, 255, 255, 1)" : "transparent",
              border:
                theme === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.16)"
                  : "1px solid rgba(228, 228, 231, 1)",
            }}
          >
            <CardContent
              className="flex-1 overflow-y-auto min-h-[400px] flex flex-col hide-scrollbar"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="w-full">
                {messages.map((msg) => (
                  <DonationItem
                    key={msg.id}
                    id={msg.id}
                    donor_address={msg.donor_address}
                    donor_name={msg.donor_name}
                    amount_usd={msg.amount_usd}
                    tokens_minted={msg.tokens_minted}
                    message={msg.message}
                    created_at={msg.created_at}
                    tokenSymbol={tokenSymbol}
                    theme={theme}
                  />
                ))}
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    {/* Text Messages */}
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-bold">No supporters yet</h3>
                      <p
                        className="text-sm max-w-md mx-auto"
                        style={{
                          color:
                            theme === "dark"
                              ? "rgba(156, 163, 175, 1)"
                              : "rgba(113, 113, 122, 1)",
                        }}
                      >
                        You can be the first supporter! Every contribution helps
                        this project move forward.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div style={{ flex: 1 }} className="hidden md:block overflow-hidden">
        <header
          className="container mx-auto px-4 py-4"
          style={{
            background:
              theme === "dark" ? "rgba(9, 9, 11, 1)" : "rgba(255, 255, 255, 1)",
            borderBottom:
              theme === "dark"
                ? "1px solid rgba(255, 255, 255, 0.16)"
                : "1px solid rgba(228, 228, 231, 1)",
          }}
        >
          <div>
            <h1
              className="text-2xl font-bold text-nowrap"
              style={{
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 1)"
                    : "rgba(9, 9, 11, 1)",
              }}
            >
              Support Our Community
            </h1>
            <p className="text-sm text-x402-muted">
              Get {dollarToTokenRatio.toLocaleString()} {tokenSymbol} per $1
              donated
            </p>
          </div>
          <div className="flex gap-2"></div>
        </header>
        <div
          className="container mx-auto px-4 py-8 space-y-6"
          style={{
            background:
              theme === "dark" ? "transparent" : "rgba(255, 255, 255, 1)",
          }}
        >
          {!connected ? (
            <div className="text-center space-y-4">
              <h1
                className="text-xl font-bold mb-3"
                style={{
                  color:
                    theme === "dark"
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(9, 9, 11, 1)",
                }}
              >
                Connect Wallet
              </h1>
              <p className="text-sm text-gray-400">
                Please connect your Solana wallet to proceed with your donation.
              </p>
              <Button
                onClick={() => walletOverlay.open()}
                style={{
                  boxSizing: "border-box",
                  display: "block",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px 24px",
                  gap: "8px",
                  width: "150px",
                  height: "40px",
                  background:
                    "linear-gradient(88.41deg, #744AC9 -3.85%, #22EBAD 111.06%), #09090B",
                  borderRadius: "999px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "#FFFFFF",
                  textShadow: "0px 3px 4px rgba(0, 0, 0, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  margin: "0 auto",
                }}
              >
                Select Wallet
              </Button>
            </div>
          ) : (
            <>
              {/* Connected Wallet Section */}
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.06)"
                      : "rgba(0, 0, 0, 0.06)",
                  border:
                    theme === "dark"
                      ? "1px solid rgba(255, 255, 255, 0.16)"
                      : "1px solid rgba(0, 0, 0, 0.16)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center"
                    style={{ background: "#744AC9" }}
                  >
                    <span
                      className="text-xl"
                      style={{
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 1)"
                            : "rgba(9, 9, 11, 1)",
                      }}
                    >
                      👤
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Connected Wallet</p>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 1)"
                            : "rgba(9, 9, 11, 1)",
                      }}
                    >
                      {publicKey ? formatAddress(publicKey.toString()) : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-gray-400 text-sm"
                  style={{
                    color: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color =
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "";
                  }}
                >
                  Disconnect
                </button>
              </div>

              {/* Amount Section */}
              <div className="space-y-3">
                <label
                  className="text-sm font-bold block"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                  }}
                >
                  Amount
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedQuickAmount(null);
                    }}
                    className="flex-1 bg-transparent border-gray-600"
                    style={{
                      color:
                        theme === "dark"
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(9, 9, 11, 1)",
                      background:
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0, 0, 0, 0.06)",
                      border:
                        theme === "dark"
                          ? "1px solid rgba(255, 255, 255, 0.16)"
                          : "1px solid rgba(0, 0, 0, 0.16)",
                    }}
                  />
                  <span
                    style={{
                      color:
                        theme === "dark"
                          ? "rgba(156, 163, 175, 1)"
                          : "rgba(9, 9, 11, 1)",
                    }}
                  >
                    USD
                  </span>
                </div>

                {/* Quick Donation Buttons */}
                <div className="flex gap-2">
                  {[1, 5, 10, 15].map((amount) => {
                    const isSelected = selectedQuickAmount === amount;
                    return (
                      <div
                        key={amount}
                        style={{
                          padding: "1px",
                          background: isSelected
                            ? "linear-gradient(to right, #744AC9, #22EBAD)"
                            : "transparent",
                          borderRadius: "0.5rem",
                        }}
                      >
                        <button
                          onClick={() => handleQuickAmountSelect(amount)}
                          className="px-4 py-2 rounded-lg font-bold text-sm transition-all"
                          style={{
                            color: isSelected
                              ? theme === "dark"
                                ? "rgba(255, 255, 255, 1)"
                                : "rgba(9, 9, 11, 1)"
                              : theme === "dark"
                              ? "rgba(156, 163, 175, 1)"
                              : "rgba(9, 9, 11, 1)",
                            background: isSelected
                              ? theme === "dark"
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.1)"
                              : theme === "dark"
                              ? "rgba(255, 255, 255, 0.06)"
                              : "rgba(0, 0, 0, 0.06)",
                            border: isSelected
                              ? "none"
                              : theme === "dark"
                              ? "1px solid rgba(255, 255, 255, 0.16)"
                              : "1px solid rgba(0, 0, 0, 0.16)",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          ${amount}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p
                  className="text-xs"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(156, 163, 175, 1)"
                        : "rgba(113, 113, 122, 1)",
                  }}
                >
                  You will get{" "}
                  {(
                    parseFloat(customAmount || "0") * dollarToTokenRatio
                  ).toLocaleString()}{" "}
                  {tokenSymbol}
                </p>
              </div>

              {/* Your Name Section */}
              <div className="space-y-2">
                <label
                  className="text-sm font-bold block"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                  }}
                >
                  Your Name (Optional)
                </label>
                <Input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Bob"
                  className="bg-transparent border-gray-600"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                    background:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.06)"
                        : "rgba(0, 0, 0, 0.06)",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.16)"
                        : "1px solid rgba(0, 0, 0, 0.16)",
                  }}
                />
              </div>

              {/* Message Section */}
              <div className="space-y-2">
                <label
                  className="text-sm font-bold block"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                  }}
                >
                  Message (Optional)
                </label>
                <Textarea
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder="Ex: I love your project!"
                  rows={3}
                  className="bg-transparent border-gray-600"
                  style={{
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                    background:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.06)"
                        : "rgba(0, 0, 0, 0.06)",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.16)"
                        : "1px solid rgba(0, 0, 0, 0.16)",
                  }}
                />
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonate}
                disabled={
                  isProcessing || !customAmount || parseFloat(customAmount) < 1
                }
                className="w-full font-bold py-3 rounded-full"
                style={{
                  color:
                    theme === "dark"
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(9, 9, 11, 1)",
                  background: "linear-gradient(to right, #744AC9, #22EBAD)",
                  border: "none",
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Donate $${customAmount || "0"}`
                )}
              </Button>

              {/* Secure Payment Footer */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <span className="text-green-500">✓</span>
                <span>Secure payment powered by Solana</span>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
