"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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
import { useX402Payment } from "@/hooks/use-x402-payment";
import { Loader2, Send, TrendingUp, Users, Coins } from "lucide-react";
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

interface DonationApiResponse {
  success: boolean;
  data: {
    amountUsd: number;
    tokensMinted: number;
    tokenSymbol: string;
    transactionSignature: string;
    name?: string | null;
    message?: string | null;
  };
}

interface DonationResult {
  amountUsd: number;
  tokensMinted: number;
  tokenSymbol: string;
  transactionSignature: string;
  name?: string | null;
  message?: string | null;
}

export default function Home() {
  const { connected, publicKey, disconnect } = useWallet();
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
  const [donationResult, setDonationResult] = useState<DonationResult | null>(
    null
  );
  const quickAmounts = [5, 10, 25, 50];
  const handleSuccessDismiss = () => setDonationResult(null);

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
  const remainingTokens = Math.max(mintableSupply - stats.totalTokens, 0);
  const averageDonation =
    stats.totalDonations > 0 ? stats.totalAmount / stats.totalDonations : 0;

  const statsCards = [
    {
      label: "Raised so far",
      value: `$${stats.totalAmount.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`,
      helper: "treasury",
      icon: TrendingUp,
      accent: "bg-fuchsia-500/20 text-fuchsia-200",
    },
    {
      label: "Tokens minted",
      value: stats.totalTokens.toLocaleString(),
      helper: tokenSymbol,
      icon: Coins,
      accent: "bg-cyan-500/20 text-cyan-200",
    },
    {
      label: "Supporters",
      value: stats.totalDonations.toLocaleString(),
      helper: "wallets",
      icon: Users,
      accent: "bg-emerald-500/20 text-emerald-200",
    },
    {
      label: "Avg. gift",
      value: `$${averageDonation.toFixed(0)}`,
      helper: "per supporter",
      icon: Send,
      accent: "bg-amber-500/20 text-amber-200",
    },
  ];

  const formatAddress = (address: string) =>
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedQuickAmount(amount);
    setCustomAmount(amount.toString());
  };

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

  const handleDonate = async () => {
    if (!connected || isProcessing) {
      return;
    }

    const amount = parseFloat(customAmount || "0");
    if (!amount || amount < 1) {
      return;
    }

    try {
      const response = await initiatePayment<DonationApiResponse>(
        "/api/write-message",
        {
          amount,
          name: donorName || undefined,
          message: donorMessage || undefined,
        }
      );

      if (!response.success) {
        throw new Error("Donation failed");
      }

      const payload = response.data;
      setDonationResult({
        amountUsd: payload.amountUsd,
        tokensMinted: payload.tokensMinted,
        tokenSymbol: payload.tokenSymbol,
        transactionSignature: payload.transactionSignature,
        name: donorName || payload.name || null,
        message: donorMessage || payload.message || null,
      });

      setDonorMessage("");
      setSelectedQuickAmount(null);
      fetchMessages();
    } catch (err) {
      console.error("Donation error:", err);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-start gap-5">
            {tokenImage && (
              <img
                src={tokenImage}
                alt={tokenName}
                className="h-20 w-20 rounded-2xl border border-white/20 object-cover"
              />
            )}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.5em] text-cyan-300">
                Community Drop
              </p>
              <div>
                <h1 className="text-3xl font-semibold text-white md:text-4xl">
                  {tokenName}
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-300 md:text-lg">
                  {tokenDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge
                  className="border-white/20 bg-white/5 text-xs uppercase tracking-tight text-slate-200"
                  variant="outline"
                >
                  {tokenSymbol}
                </Badge>
                <Badge
                  className="border-white/20 bg-white/5 text-xs uppercase tracking-tight text-slate-200"
                  variant="outline"
                >
                  {dollarToTokenRatio.toLocaleString()} {tokenSymbol} / $1
                </Badge>
                <Badge
                  className="border-white/20 bg-white/5 text-xs uppercase tracking-tight text-slate-200"
                  variant="outline"
                >
                  Goal: ${donationTarget.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-wide text-[11px] text-slate-400">
                Remaining tokens
              </span>
              <span className="font-semibold text-white">
                {remainingTokens.toLocaleString()} {tokenSymbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-wide text-[11px] text-slate-400">
                Network
              </span>
              <span className="font-semibold text-white">
                {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana-devnet"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-wide text-[11px] text-slate-400">
                Treasury target
              </span>
              <span className="font-semibold text-white">
                ${donationTarget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${card.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {card.helper}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">
                  {card.value}
                </p>
                <p className="text-sm text-slate-400">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Card className="border-white/10 bg-slate-900/60 shadow-2xl shadow-black/40">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Power the community treasury
              </CardTitle>
              <CardDescription className="text-base text-slate-300">
                Every dollar mints {dollarToTokenRatio.toLocaleString()}{" "}
                {tokenSymbol}. Help unlock the next milestone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {donationResult ? (
                <DonationSuccess
                  amountUsd={donationResult.amountUsd}
                  tokensMinted={donationResult.tokensMinted}
                  tokenSymbol={donationResult.tokenSymbol}
                  name={donationResult.name || undefined}
                  message={donationResult.message || undefined}
                  transactionSignature={donationResult.transactionSignature}
                  theme="dark"
                  onConfirm={handleSuccessDismiss}
                />
              ) : (
                <div className="space-y-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Treasury progress
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        ${stats.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-400">
                        toward ${donationTarget.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Tokens remaining
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {remainingTokens.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-400">
                        available rewards
                      </p>
                    </div>
                  </div>

                  {!connected ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                      <h3 className="text-xl font-semibold text-white">
                        Connect your wallet
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">
                        Verify your Solana wallet to start sending USDC
                        donations.
                      </p>
                      <div className="mt-4 flex justify-center">
                        <WalletMultiButton />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">
                            Connected wallet
                          </p>
                          <p className="font-mono text-white">
                            {publicKey
                              ? formatAddress(publicKey.toString())
                              : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => disconnect()}
                          className="text-xs font-semibold text-slate-300 transition hover:text-white"
                        >
                          Disconnect
                        </button>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-200">
                          Donation amount
                        </label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="1"
                            step="0.01"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              setSelectedQuickAmount(null);
                            }}
                            className="flex-1 rounded-2xl border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                          />
                          <span className="text-sm text-slate-400">USD</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {quickAmounts.map((amount) => {
                            const isSelected = selectedQuickAmount === amount;
                            return (
                              <button
                                key={amount}
                                onClick={() => handleQuickAmountSelect(amount)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                  isSelected
                                    ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-slate-950"
                                    : "border border-white/10 bg-white/0 text-slate-200 hover:border-white/30"
                                }`}
                              >
                                ${amount}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-400">
                          You will receive{" "}
                          {(
                            parseFloat(customAmount || "0") * dollarToTokenRatio
                          ).toLocaleString()}{" "}
                          {tokenSymbol}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-200">
                            Display name
                          </label>
                          <Input
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="Optional"
                            className="rounded-2xl border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-200">
                            Message
                          </label>
                          <Textarea
                            value={donorMessage}
                            onChange={(e) => setDonorMessage(e.target.value)}
                            rows={3}
                            placeholder="Leave a note for the community"
                            className="rounded-2xl border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                          {error}
                        </div>
                      )}

                      <Button
                        onClick={handleDonate}
                        disabled={
                          isProcessing ||
                          !customAmount ||
                          parseFloat(customAmount) < 1
                        }
                        className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-fuchsia-500/30 hover:opacity-90"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          `Donate $${customAmount || "0"}`
                        )}
                      </Button>

                      <p className="text-center text-xs text-slate-500">
                        Secure payments via Solana & x402. You keep full
                        custody.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl text-white">
                  Community board
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Celebrate every supporter in real time.
                </CardDescription>
              </div>
              <div className="flex gap-2 rounded-full border border-white/10 p-1">
                {(["recent", "top"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                      sortBy === option
                        ? "bg-white text-slate-900"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[640px] space-y-4 overflow-y-auto pr-2">
                {messages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
                    <p className="text-lg font-semibold text-white">
                      No supporters yet
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Be the very first donor to light up the board.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <DonationItem
                        id={msg.id}
                        donor_address={msg.donor_address}
                        donor_name={msg.donor_name}
                        amount_usd={msg.amount_usd}
                        tokens_minted={msg.tokens_minted}
                        message={msg.message}
                        created_at={msg.created_at}
                        tokenSymbol={tokenSymbol}
                        theme="dark"
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
