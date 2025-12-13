"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletOverlay } from "@/components/wallet-overlay-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useX402Payment } from "@/hooks/use-x402-payment";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { DonationItem } from "@/components/donation-item";
import { ChristmasDivider } from "@/components/christmas-divider";

interface DonationMessage {
  id: number;
  donor_address: string;
  donor_name: string | null;
  amount_usd: number;
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
      biggestDonor?: {
        donor_name: string | null;
        donor_address: string | null;
        amount_usd: number;
      } | null;
    };
  };
}

interface Stats {
  totalDonations: number;
  totalAmount: number;
  biggestDonor?: {
    donor_name: string | null;
    donor_address: string | null;
    amount_usd: number;
  } | null;
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
  const [stats, setStats] = useState<Stats>({
    totalDonations: 0,
    totalAmount: 0,
    biggestDonor: null,
  });
  const [customAmount, setCustomAmount] = useState("10");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(
    10
  );
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "top">("recent");

  // Project config from env
  const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || "Project";
  const projectDescription =
    process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION || "Support our project!";
  const projectImage = process.env.NEXT_PUBLIC_PROJECT_IMAGE_URL;
  const donationTarget = process.env.NEXT_PUBLIC_DONATION_TARGET
    ? parseFloat(process.env.NEXT_PUBLIC_DONATION_TARGET)
    : null;

  const fetchMessages = useCallback(async () => {
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
  }, [sortBy]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    fetchMessages();
  }, [fetchMessages]);

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedQuickAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleDonate = async () => {
    if (!connected || !customAmount) return;

    // Use two decimal places for USD amount and a minimum of $0.01
    const amount = Number(parseFloat(customAmount).toFixed(2));
    if (isNaN(amount) || amount < 0.01) {
      alert("Minimum donation is $0.01");
      return;
    }

    try {
      await initiatePayment("/api/write-message", {
        amount,
        name: donorName || undefined,
        message: donorMessage || undefined,
      });
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

  const renderDonationPanel = (variant: "mobile" | "desktop") => {
    const containerClassName =
      variant === "desktop"
        ? "container mx-auto px-4 py-8 space-y-6"
        : "space-y-6";

    const containerStyle =
      variant === "desktop"
        ? {
            background:
              theme === "dark" ? "transparent" : "rgba(255, 255, 255, 1)",
          }
        : {
            background: theme === "dark" ? "#000000" : "#FFFFFF",
            border:
              theme === "dark"
                ? "1px solid rgba(255, 255, 255, 0.16)"
                : "1px solid #E4E4E7",
            borderRadius: "12px",
            padding: "16px",
          };

    return (
      <div className={containerClassName} style={containerStyle}>
        {!connected ? (
          <div className="text-center space-y-4">
            <h1
              className="text-xl font-bold mb-3"
              style={{
                fontFamily:
                  "var(--font-chelsea-market), Chelsea Market, cursive",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "28px",
                letterSpacing: "-0.03em",
                color: "#FAFAFA",
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
                display: variant === "desktop" ? "block" : "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px 24px",
                gap: "8px",
                width: variant === "desktop" ? "150px" : "100%",
                height: "40px",
                background: "#CB272A",
                border: "1px solid #A21010",
                borderRadius: "999px",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#FFFFFF",
                cursor: "pointer",
                margin: variant === "desktop" ? "0 auto" : undefined,
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
              <div
                className="flex items-center gap-3 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Open wallet selector"
                onClick={() => walletOverlay.open()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    walletOverlay.open();
                  }
                }}
              >
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
              <div className="relative">
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedQuickAmount(null);
                  }}
                  className="flex-1 bg-transparent border-gray-600"
                  style={{
                    paddingRight: "56px",
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
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color:
                      theme === "dark"
                        ? "rgba(156, 163, 175, 1)"
                        : "rgba(113, 113, 122, 1)",
                    pointerEvents: "none",
                  }}
                >
                  USDC
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
                          ? "linear-gradient(88.41deg, #744AC9 -3.85%, #22EBAD 111.06%)"
                          : theme === "dark"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.08)",
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
                          background:
                            theme === "dark"
                              ? "rgba(15, 15, 15, 0.95)"
                              : "rgba(255, 255, 255, 1)",
                          border: "1px solid transparent",
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
                Donations are processed in USDC and sent directly to our
                receiving wallet.
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
                placeholder="E.g. I love this community!"
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
                isProcessing || !customAmount || parseFloat(customAmount) < 0.01
              }
              className="w-full font-bold py-3 rounded-full"
              style={{
                background: "#CB272A",
                border: "1px solid #A21010",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
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
    );
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
            gap: "0px",
            background: theme === "dark" ? "#000000" : "#FFFFFF",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px",
              paddingBottom: "16px",
              gap: "4px",
              alignSelf: "stretch",
            }}
          >
            <div
              style={{
                fontFamily:
                  "var(--font-chelsea-market), Chelsea Market, cursive",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "28px",
                letterSpacing: "-0.03em",
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 1)"
                    : "rgba(9, 9, 11, 1)",
              }}
            >
              {projectName}
            </div>
            <div
              style={{
                fontFamily:
                  "var(--font-chelsea-market), Chelsea Market, cursive",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.03em",
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(113, 113, 122, 1)",
              }}
            >
              {projectDescription}
            </div>
          </div>
          <ChristmasDivider />
        </header>

        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            backgroundImage: "url(/websitebg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
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
                fontFamily:
                  "var(--font-chelsea-market), Chelsea Market, cursive",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "28px",
                letterSpacing: "-0.03em",
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
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(30px)",
                border: "1px solid rgba(228, 228, 231, 1)",
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
                      {stats.biggestDonor
                        ? stats.biggestDonor.donor_name
                          ? stats.biggestDonor.donor_name
                          : stats.biggestDonor.donor_address
                          ? formatAddress(stats.biggestDonor.donor_address)
                          : "-"
                        : "-"}
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
                      Biggest Donor
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
                      {`$${stats.totalAmount.toFixed(2)} / ${
                        donationTarget ? `$${donationTarget}` : `-`
                      }`}
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
                      Progress
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
              </div>
            </div>
          </div>
          {/* Mobile Donation Section */}
          <div style={{ width: "100%" }}>{renderDonationPanel("mobile")}</div>

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
                  fontFamily:
                    "var(--font-chelsea-market), Chelsea Market, cursive",
                  fontWeight: 400,
                  fontSize: "20px",
                  lineHeight: "28px",
                  letterSpacing: "-0.03em",
                  color: theme === "dark" ? "#FFFFFF" : "#09090B",
                  flex: "1",
                }}
              >
                Community Board
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "4px",
                  width: "168px",
                  height: "44px",
                  background: "#FFFFFF",
                  borderRadius: "50px",
                }}
              >
                <button
                  onClick={() => setSortBy("recent")}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px 16px",
                    width: "80px",
                    height: "36px",
                    background: sortBy === "recent" ? "#CB272A" : "transparent",
                    border: sortBy === "recent" ? "1px solid #A21010" : "none",
                    borderRadius: "50px",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: sortBy === "recent" ? "#FFFFFF" : "#71717A",
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
                    padding: "8px 16px",
                    width: "80px",
                    height: "36px",
                    background: sortBy === "top" ? "#CB272A" : "transparent",
                    border: sortBy === "top" ? "1px solid #A21010" : "none",
                    borderRadius: "50px",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: sortBy === "top" ? "#FFFFFF" : "#71717A",
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
                background: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(60px)",
                border:
                  theme === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.16)"
                    : "1px solid rgba(228, 228, 231, 1)",
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
                      message={msg.message}
                      created_at={msg.created_at}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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
              theme === "dark"
                ? "rgba(255, 255, 255, 0)"
                : "rgba(255, 255, 255, 1)",
          }}
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              {projectImage && (
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: "48px", height: "48px", flexShrink: 0 }}
                >
                  <div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{
                      width: "40px",
                      height: "40px",
                      margin: "auto",
                    }}
                  >
                    <img
                      src={projectImage}
                      alt={projectName}
                      className="w-full h-full"
                      style={{
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <img
                    src="/ImageRing.png"
                    alt="Decorative Ring"
                    className="absolute pointer-events-none"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              )}
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    fontFamily:
                      "var(--font-chelsea-market), Chelsea Market, cursive",
                    fontWeight: 400,
                    fontSize: "20px",
                    lineHeight: "28px",
                    letterSpacing: "-0.03em",
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(9, 9, 11, 1)",
                  }}
                >
                  {projectName}
                </h1>
                <p
                  className="text-sm"
                  style={{
                    fontFamily:
                      "var(--font-chelsea-market), Chelsea Market, cursive",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "-0.03em",
                    color:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(113, 113, 122, 1)",
                  }}
                >
                  {projectDescription}
                </p>
              </div>
            </div>
          </div>
          <ChristmasDivider />
        </header>

        <div
          className="container mx-auto px-4 py-8 flex flex-col flex-1 min-h-0"
          style={{
            backgroundImage: "url(/websitebg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Donation Statistic Heading */}
          <h2
            style={{
              fontFamily: "var(--font-chelsea-market), Chelsea Market, cursive",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "28px",
              letterSpacing: "-0.03em",
              color: "#FAFAFA",
              marginBottom: "16px",
            }}
          >
            Donation Statistic
          </h2>

          {/* Stats */}
          <div
            style={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "16px 24px",
              gap: "24px",
              isolation: "isolate",
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(228, 228, 231, 1)",
              borderRadius: "12px",
              alignSelf: "stretch",
              marginBottom: "32px",
              position: "relative",
            }}
          >
            {/* Ice Left */}
            <img
              src="/ice-left.png"
              alt="Ice decoration"
              style={{
                position: "absolute",
                width: "90.5px",
                height: "60.14px",
                left: "-3px",
                top: "-7px",
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
                zIndex: 0,
              }}
            >
              {/* Total Donors */}
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
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "28px",
                    textAlign: "center",
                    color: "#09090B",
                  }}
                >
                  {stats.totalDonations}
                </div>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#09090B",
                  }}
                >
                  Total Donors
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: "56px",
                  height: "0px",
                  border: "1px solid #E4E4E7",
                  transform: "rotate(90deg)",
                }}
              />

              {/* Total Donated */}
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
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "28px",
                    textAlign: "center",
                    color: "#09090B",
                  }}
                >
                  ${stats.totalAmount.toFixed(2)}
                </div>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#09090B",
                  }}
                >
                  Total Donated
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: "56px",
                  height: "0px",
                  border: "1px solid #E4E4E7",
                  transform: "rotate(90deg)",
                }}
              />

              {/* Biggest Donor */}
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
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "28px",
                    textAlign: "center",
                    color: "#09090B",
                  }}
                >
                  {stats.biggestDonor
                    ? stats.biggestDonor.donor_name
                      ? stats.biggestDonor.donor_name
                      : stats.biggestDonor.donor_address
                      ? formatAddress(stats.biggestDonor.donor_address)
                      : "-"
                    : "-"}
                </div>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#09090B",
                  }}
                >
                  Biggest Donor
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: "56px",
                  height: "0px",
                  border: "1px solid #E4E4E7",
                  transform: "rotate(90deg)",
                }}
              />

              {/* Progress */}
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
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "28px",
                    textAlign: "center",
                    color: "#09090B",
                  }}
                >
                  {`$${stats.totalAmount.toFixed(2)} / ${
                    donationTarget ? `$${donationTarget}` : `-`
                  }`}
                </div>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#09090B",
                  }}
                >
                  Progress
                </div>
              </div>
            </div>

            {/* Ice Right */}
            <img
              src="/ice-right.png"
              alt="Ice decoration"
              style={{
                position: "absolute",
                width: "90.5px",
                height: "60.14px",
                right: "-3px",
                top: "-7px",
                transform: "rotate(360deg)",
                zIndex: 2,
              }}
            />
          </div>
          <div className="flex justify-between items-center mb-4 mt-8">
            <h1
              className="font-normal"
              style={{
                fontFamily:
                  "var(--font-chelsea-market), Chelsea Market, cursive",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "28px",
                letterSpacing: "-0.03em",
                color: "#FAFAFA",
              }}
            >
              Community Board
            </h1>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "4px",
                width: "168px",
                height: "44px",
                background: "#FFFFFF",
                borderRadius: "50px",
              }}
            >
              {sortBy === "recent" ? (
                <button
                  onClick={() => setSortBy("recent")}
                  style={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px 16px",
                    width: "80px",
                    height: "36px",
                    background: "#CB272A",
                    border: "1px solid #A21010",
                    borderRadius: "50px",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  Recent
                </button>
              ) : (
                <button
                  onClick={() => setSortBy("recent")}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px 16px",
                    width: "80px",
                    height: "36px",
                    borderRadius: "50px",
                    background: "transparent",
                    border: "none",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#71717A",
                    cursor: "pointer",
                  }}
                >
                  Recent
                </button>
              )}
              {sortBy === "top" ? (
                <button
                  onClick={() => setSortBy("top")}
                  style={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px 16px",
                    width: "80px",
                    height: "36px",
                    background: "#CB272A",
                    border: "1px solid #A21010",
                    borderRadius: "50px",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  Top
                </button>
              ) : (
                <button
                  onClick={() => setSortBy("top")}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px 16px",
                    width: "80px",
                    height: "36px",
                    borderRadius: "50px",
                    background: "transparent",
                    border: "none",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#71717A",
                    cursor: "pointer",
                  }}
                >
                  Top
                </button>
              )}
            </div>
          </div>
          {/* Message Board */}
          <Card
            className="flex flex-col flex-1 min-h-0"
            style={{
              background: "rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(60px)",
              border:
                theme === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.16)"
                  : "1px solid rgba(228, 228, 231, 1)",
              position: "relative",
              overflow: "visible",
            }}
          >
            {/* Ice Left */}
            <img
              src="/ice-left.png"
              alt="Ice decoration"
              style={{
                position: "absolute",
                width: "90.5px",
                height: "60.14px",
                left: "-3px",
                top: "-7px",
                zIndex: 1,
              }}
            />

            {/* Ice Right */}
            <img
              src="/ice-right.png"
              alt="Ice decoration"
              style={{
                position: "absolute",
                width: "90.5px",
                height: "60.14px",
                right: "-3px",
                top: "-7px",
                transform: "rotate(360deg)",
                zIndex: 2,
              }}
            />
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
                    message={msg.message}
                    created_at={msg.created_at}
                    theme={theme}
                  />
                ))}
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    {/* Text Messages */}
                    <div className="text-center space-y-2 flex flex-col items-center">
                      <div className="flex items-end justify-center -space-x-4 mb-4">
                        <img
                          src="/tree.png"
                          alt="Christmas Tree"
                          className="w-24 h-auto object-contain z-0"
                        />
                        <img
                          src="/santa.png"
                          alt="Santa Claus"
                          className="w-20 h-auto object-contain z-10"
                        />
                      </div>
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
      <div
        style={{ flex: 1 }}
        className="hidden md:block overflow-hidden relative"
      >
        <header
          className="container mx-auto px-4 py-4"
          style={{
            background:
              theme === "dark"
                ? "rgba(255, 255, 255, 0)"
                : "rgba(255, 255, 255, 1)",
          }}
        >
          <div style={{ minHeight: "60px" }}>
            <h1
              className="text-2xl font-bold text-nowrap"
              style={{
                fontFamily:
                  "var(--font-chelsea-market), Chelsea Market, cursive",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "28px",
                letterSpacing: "-0.03em",
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 1)"
                    : "rgba(9, 9, 11, 1)",
              }}
            >
              Support Our Community
            </h1>
            <p
              className="text-sm"
              style={{
                fontFamily:
                  "var(--font-chelsea-market), Chelsea Market, cursive",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.03em",
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(113, 113, 122, 1)",
              }}
            >
              Every contribution directly helps our cause! and the kids bla bla
            </p>
          </div>
          <ChristmasDivider />
        </header>
        {renderDonationPanel("desktop")}

        {/* Gifts Decoration */}
        <div
          className="absolute bottom-0 right-0 w-full pointer-events-none"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            zIndex: 0,
          }}
        >
          <img
            src="/gifts.png"
            alt="Holiday Gifts"
            style={{
              maxHeight: "300px", // Adjust based on preference, keeping it reasonable
              objectFit: "contain",
              width: "auto",
            }}
          />
        </div>
      </div>
    </main>
  );
}
