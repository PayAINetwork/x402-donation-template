"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletOverlay } from "@/components/wallet-overlay-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useX402Payment } from "@/hooks/use-x402-payment";
import { Loader2, Gift, Star, Snowflake } from "lucide-react";
import { useTheme } from "next-themes";
import { DonationItem } from "@/components/donation-item";
import { SnowEffect } from "@/components/snow-effect";

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
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme as "dark" | "light" | undefined) || "light";

  const { connected, publicKey, disconnect } = useWallet();
  const walletOverlay = useWalletOverlay();
  const { initiatePayment, isProcessing } = useX402Payment();
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
    setMounted(true);
    fetchMessages();
  }, [fetchMessages]);

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedQuickAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleDonate = async () => {
    if (!connected || !customAmount) return;

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
      fetchMessages();
    } catch (err) {
      console.error("Donation failed:", err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!mounted) {
    return null;
  }

  // --- Render Helpers ---

  // Reusable Donation Form Panel
  const renderDonationForm = () => (
    <div className="flex flex-col h-full bg-white dark:bg-black p-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-xl font-[family-name:var(--font-chelsea)] text-[#09090B] dark:text-white mb-1">
            Send a Gift 🎁
          </h2>
          <p className="text-xs text-gray-500">
            Support {projectName} with USDC
          </p>
        </div>

        {!connected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎅</span>
            </div>
            <p className="text-center text-sm text-gray-500 max-w-xs">
              Connect your Solana wallet to join the holiday giving spirit.
            </p>
            <Button
              onClick={() => walletOverlay.open()}
              className="w-full max-w-xs bg-gradient-to-r from-[#CB272A] to-[#D83228] hover:from-[#A4171D] hover:to-[#CB272A] text-white font-bold py-4 rounded-full shadow-lg transform transition hover:scale-105 text-sm"
            >
              <Snowflake className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Connected Wallet Header */}
            <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#CB272A] rounded-full flex items-center justify-center text-white font-bold shadow-md text-xs">
                  {publicKey?.toString()[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-medium">
                    Connected as
                  </span>
                  <span className="font-bold text-xs text-[#09090B] dark:text-white tracking-wide">
                    {publicKey ? formatAddress(publicKey.toString()) : ""}
                  </span>
                </div>
              </div>
              <button
                onClick={disconnect}
                className="px-3 py-1 text-[10px] text-red-500 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-full transition-colors"
              >
                Disconnect
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Amount (USDC)
                </label>
                <div className="relative group">
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedQuickAmount(null);
                    }}
                    className="pl-4 pr-16 py-4 text-lg font-bold rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 focus:ring-[#CB272A] focus:border-[#CB272A] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-400 group-focus-within:text-[#CB272A]">
                    USDC
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[1, 5, 10, 20].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleQuickAmountSelect(amt)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all transform hover:-translate-y-0.5 ${
                        selectedQuickAmount === amt
                          ? "bg-[#CB272A] text-white shadow-lg shadow-red-500/20"
                          : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  From (Optional)
                </label>
                <Input
                  placeholder="Santa Claus"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="py-4 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 focus:ring-[#CB272A] focus:border-[#CB272A] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <Textarea
                  placeholder="Merry Christmas! 🎄"
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 min-h-[80px] focus:ring-[#CB272A] focus:border-[#CB272A] text-sm"
                />
              </div>

              <Button
                onClick={handleDonate}
                disabled={isProcessing || !customAmount}
                className="w-full bg-gradient-to-r from-[#CB272A] to-[#D83228] hover:from-[#A4171D] hover:to-[#CB272A] text-white font-[family-name:var(--font-chelsea)] text-lg py-5 rounded-full shadow-lg shadow-red-500/20 mt-1 disabled:opacity-50 disabled:cursor-not-allowed transform transition active:scale-95"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : (
                  <Gift className="mr-2 mb-1 h-5 w-5" />
                )}
                {isProcessing ? "Processing..." : "Donate Gift"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 text-center border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
        Secure payment powered by Solana
      </div>
    </div>
  );

  return (
    <main
      className="min-h-screen flex flex-col md:flex-row overflow-hidden relative"
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(180deg, #0B1E28 0%, #000000 100%)"
            : "linear-gradient(180deg, #E8FBFF 0%, #FFFFFF 100%)",
      }}
    >
      <SnowEffect />
      {/* Decorative Vectors/Ice (CSS approximations) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        {/* Top Left Blur */}
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay animate-twinkle" />
        {/* Bottom Right Blur */}
        <div
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-green-100/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay animate-twinkle"
          style={{ animationDelay: "2s" }}
        />

        {/* BACKGROUND TREES (With Motion) */}
        {/* Tree 1 (Left, Large) */}
        <div
          className="absolute top-[20%] -left-[5%] w-[300px] h-[500px] bg-gradient-to-b from-[#165B33]/20 to-[#0B2E1A]/20 blur-[40px] animate-sway"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            animationDelay: "0s",
          }}
        />
        {/* Tree 2 (Left Center, Medium) */}
        <div
          className="absolute top-[30%] left-[10%] w-[200px] h-[350px] bg-gradient-to-b from-[#1BB24B]/15 to-[#165B33]/15 blur-[30px] animate-sway"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            animationDelay: "2s",
          }}
        />
        {/* Tree 3 (Bottom Center, Small) */}
        <div
          className="absolute bottom-[10%] left-[20%] w-[150px] h-[250px] bg-gradient-to-b from-[#165B33]/20 to-[#0B2E1A]/20 blur-[20px] animate-sway"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            animationDelay: "4s",
          }}
        />
        {/* Tree 4 (Right side background) */}
        <div
          className="absolute top-[15%] right-[40%] w-[250px] h-[400px] bg-gradient-to-b from-[#CB272A]/10 to-[#A4171D]/10 blur-[50px] animate-sway"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            animationDelay: "1s",
          }}
        />
      </div>

      {/* LEFT PANEL: Info & Stats */}
      <div className="w-full md:w-2/3 h-full overflow-y-auto z-10 p-4 md:p-8 flex flex-col gap-5 md:gap-6 relative">
        {/* Header */}
        <header className="flex flex-col gap-4 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-3xl p-5 md:p-6 border-r-4 border-[#CB272A] shadow-sm">
          <div className="flex items-center gap-4">
            {projectImage && (
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#1BB24B] rounded-full blur-md opacity-40 animate-pulse" />
                <img
                  src={projectImage}
                  alt={projectName}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-[#12903C] relative z-10 shadow-lg object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-chelsea)] text-[#09090B] dark:text-white leading-tight mb-1">
                {projectName}
              </h1>
              <p className="text-[#71717A] dark:text-gray-300 text-xs md:text-sm font-medium">
                {projectDescription}
              </p>
            </div>
          </div>

          {/* Festive Strip */}
          <div className="w-full h-2 md:h-3 flex overflow-hidden rounded-full opacity-90">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-full transform -skew-x-12 ${
                  i % 2 === 0 ? "bg-[#D83228]" : "bg-[#248665]"
                }`}
              />
            ))}
          </div>
        </header>

        {/* Stats Board (Glassmorphism) */}
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-5 md:p-6 border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <h2 className="text-lg md:text-xl font-[family-name:var(--font-chelsea)] text-[#09090B] dark:text-white mb-4 flex items-center gap-2">
            <Star className="text-[#FBB040] fill-[#FBB040] w-5 h-5" /> Community
            Impact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700/50">
            <div className="pt-4 md:pt-0 text-center md:text-left md:px-6 first:pl-0">
              <p className="text-2xl font-bold font-[family-name:var(--font-chelsea)] text-[#09090B] dark:text-white">
                {stats.totalDonations}
              </p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                Supporters
              </p>
            </div>
            <div className="pt-4 md:pt-0 text-center md:text-left md:px-6">
              <p className="text-2xl font-bold font-[family-name:var(--font-chelsea)] text-[#09090B] dark:text-white">
                ${stats.totalAmount.toFixed(2)}
              </p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                Raised
              </p>
            </div>
            <div className="pt-4 md:pt-0 text-center md:text-left md:px-6">
              <p
                className="text-2xl font-bold font-[family-name:var(--font-chelsea)] text-[#09090B] dark:text-white truncate"
                title={stats.biggestDonor?.donor_name || "-"}
              >
                {stats.biggestDonor
                  ? stats.biggestDonor.donor_name ||
                    formatAddress(stats.biggestDonor.donor_address || "")
                  : "-"}
              </p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                Top Donor
              </p>
            </div>
            <div className="pt-4 md:pt-0 text-center md:text-left md:px-6">
              <p className="text-2xl font-bold font-[family-name:var(--font-chelsea)] text-[#09090B] dark:text-white">
                {donationTarget
                  ? `${Math.round((stats.totalAmount / donationTarget) * 100)}%`
                  : "∞"}
              </p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                Goal
              </p>
            </div>
          </div>
        </div>

        {/* Donation Feed with Community Board Header */}
        <div className="flex-1 flex flex-col min-h-[400px]">
          {/* Community Board Header with Toggles */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-[family-name:var(--font-chelsea)] text-[#09090B] dark:text-white flex items-center gap-2">
              <Gift className="text-[#D83228] w-5 h-5" /> Community Board
            </h2>
            <div className="flex gap-1 bg-gray-100 dark:bg-white/10 rounded-full p-1 border border-gray-200 dark:border-white/10">
              <button
                onClick={() => setSortBy("recent")}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                  sortBy === "recent"
                    ? "bg-[#CB272A] text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortBy("top")}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                  sortBy === "top"
                    ? "bg-[#CB272A] text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Top
              </button>
            </div>
          </div>

          {/* Feed List */}
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-5 md:p-6 border border-white/40 dark:border-white/10 shadow-xl flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700/50 rounded-2xl bg-white/20 dark:bg-black/10">
                  <div className="text-6xl mb-4 animate-bounce">🎄</div>
                  <h4 className="text-xl font-bold text-[#09090B] dark:text-white mb-2">
                    No supporters yet
                  </h4>
                  <p className="text-gray-500 max-w-sm">
                    Be the first to leave a gift under the tree and start the
                    holiday cheer!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <DonationItem key={msg.id} {...msg} theme={theme} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Action Form (Desktop) */}
      <div className="hidden md:block w-1/3 min-w-[450px] border-l border-gray-200 dark:border-gray-800 z-20 shadow-2xl">
        {renderDonationForm()}
      </div>

      {/* MOBILE: Action Form (Bottom Sheet style or just stacked) */}
      <div className="block md:hidden w-full border-t border-gray-200 dark:border-gray-800 z-20">
        {renderDonationForm()}
      </div>
    </main>
  );
}
