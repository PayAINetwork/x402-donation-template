"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useX402Payment } from "@/hooks/use-x402-payment";
import { Loader2, Send, TrendingUp, Users, Coins } from "lucide-react";

interface DonationMessage {
  id: number;
  donator_address: string;
  amount_usd: number;
  tokens_minted: number;
  name: string | null;
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
  const { connected } = useWallet();
  const { initiatePayment, isProcessing, error } = useX402Payment();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<DonationMessage[]>([]);
  const [stats, setStats] = useState({ totalDonations: 0, totalAmount: 0, totalTokens: 0 });
  const [customAmount, setCustomAmount] = useState("1");
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "top">("recent");
  const [donationResult, setDonationResult] = useState<any>(null);

  // Token config from env
  const tokenName = process.env.NEXT_PUBLIC_TOKEN_NAME || "Token";
  const tokenSymbol = process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "TOKEN";
  const tokenImage = process.env.NEXT_PUBLIC_TOKEN_IMAGE_URL;
  const tokenDescription = process.env.NEXT_PUBLIC_TOKEN_DESCRIPTION || "Support our community!";
  const dollarToTokenRatio = parseInt(process.env.NEXT_PUBLIC_DOLLAR_TO_TOKEN_RATIO || "1000");

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

  const handleQuickDonation = async (amount: number) => {
    if (!connected) return;

    try {
      const result = await initiatePayment(`/api/donate/${amount}`);
      setDonationResult(result);
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error("Donation failed:", err);
    }
  };

  const handleCustomDonation = async () => {
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
      setCustomAmount("1");
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
    <main className="min-h-screen bg-x402-bg">
      {/* Header */}
      <header className="border-b border-x402-border bg-x402-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {tokenImage && (
              <img src={tokenImage} alt={tokenName} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-x402-text">{tokenName}</h1>
              <p className="text-sm text-x402-muted">${tokenSymbol}</p>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-x402-cyan">
            Support Our Community
          </h2>
          <p className="text-x402-text max-w-2xl mx-auto">
            {tokenDescription}
          </p>
          <p className="text-x402-muted">
            Get <span className="text-x402-cyan font-semibold">{dollarToTokenRatio} {tokenSymbol}</span> tokens per $1 donated
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-x402-card border-x402-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-x402-cyan" />
                <div>
                  <p className="text-2xl font-bold text-x402-text">{stats.totalDonations}</p>
                  <p className="text-sm text-x402-muted">Total Donors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-x402-card border-x402-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-x402-cyan" />
                <div>
                  <p className="text-2xl font-bold text-x402-text">${stats.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-x402-muted">Total Raised</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-x402-card border-x402-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-x402-cyan" />
                <div>
                  <p className="text-2xl font-bold text-x402-text">{stats.totalTokens.toLocaleString()}</p>
                  <p className="text-sm text-x402-muted">Tokens Distributed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Section */}
        {donationResult ? (
          <Card className="bg-x402-card border-x402-border">
            <CardHeader>
              <CardTitle className="text-x402-cyan text-center">🎉 Thank You!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-x402-text">{donationResult.message}</p>
                <p className="text-x402-muted mt-2">
                  You received <span className="text-x402-cyan font-semibold">{donationResult.data.tokensMinted.toLocaleString()} {tokenSymbol}</span>
                </p>
              </div>
              <Separator className="bg-x402-border" />
              <div className="space-y-2 text-sm">
                <p className="text-x402-muted">
                  Transaction:{" "}
                  <a
                    href={`https://explorer.solana.com/tx/${donationResult.data.transactionSignature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK === "solana" ? "mainnet" : "devnet"}`}
            target="_blank"
            rel="noopener noreferrer"
                    className="text-x402-cyan hover:underline"
                  >
                    View on Explorer
                  </a>
                </p>
              </div>
              <Button
                onClick={() => setDonationResult(null)}
                className="w-full bg-x402-cyan text-x402-bg hover:bg-x402-cyan-hover font-semibold transition-all duration-200"
              >
                Make Another Donation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Donate */}
            <Card className="bg-x402-card border-x402-border">
              <CardHeader>
                <CardTitle className="text-x402-text">Quick Donate</CardTitle>
                <CardDescription className="text-x402-muted">
                  Choose a preset amount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!connected ? (
                  <div className="text-center py-8">
                    <p className="text-x402-muted mb-4">Connect your wallet to donate</p>
                    <WalletMultiButton />
                  </div>
                ) : (
                  <>
                    {[1, 5, 10].map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => handleQuickDonation(amount)}
                        disabled={isProcessing}
                        className="w-full bg-x402-cyan text-x402-bg hover:bg-x402-cyan-hover font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,255,255,0.3)]"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>Donate ${amount} → Get {amount * dollarToTokenRatio} {tokenSymbol}</>
                        )}
                      </Button>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Custom Donate with Message */}
            <Card className="bg-x402-card border-x402-border">
              <CardHeader>
                <CardTitle className="text-x402-text">Custom Donation</CardTitle>
                <CardDescription className="text-x402-muted">
                  Leave a message for the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!connected ? (
                  <div className="text-center py-8">
                    <p className="text-x402-muted mb-4">Connect your wallet to donate</p>
                    <WalletMultiButton />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm text-x402-text mb-2 block">Amount (USD)</label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="bg-x402-bg border-x402-border text-x402-text"
                      />
                      <p className="text-xs text-x402-muted mt-1">
                        You'll receive {(parseFloat(customAmount) * dollarToTokenRatio).toLocaleString()} {tokenSymbol}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-x402-text mb-2 block">Your Name (Optional)</label>
                      <Input
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Anonymous"
                        className="bg-x402-bg border-x402-border text-x402-text"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-x402-text mb-2 block">Message (Optional)</label>
                      <Textarea
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        placeholder="Leave a message..."
                        rows={3}
                        className="bg-x402-bg border-x402-border text-x402-text"
                      />
                    </div>
                    <Button
                      onClick={handleCustomDonation}
                      disabled={isProcessing || !customAmount || parseFloat(customAmount) < 1}
                      className="w-full bg-x402-cyan text-x402-bg hover:bg-x402-cyan-hover font-semibold transition-all duration-200"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Donate ${customAmount || "0"}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-red-400">Donation Failed</p>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Message Board */}
        <Card className="bg-x402-card border-x402-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-x402-text">Community Board</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                  className={sortBy === "recent" ? "bg-x402-cyan text-x402-bg" : "border-x402-border text-x402-muted"}
                >
                  Recent
                </Button>
                <Button
                  variant={sortBy === "top" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("top")}
                  className={sortBy === "top" ? "bg-x402-cyan text-x402-bg" : "border-x402-border text-x402-muted"}
                >
                  Top
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-center text-x402-muted py-8">No donations yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-lg bg-x402-bg border border-x402-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-x402-text font-semibold">
                          {msg.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-x402-muted">
                          {formatAddress(msg.donator_address)} • {formatDate(msg.created_at)}
                        </p>
                      </div>
                      <Badge className="bg-x402-cyan/20 text-x402-cyan border-x402-cyan">
                        ${msg.amount_usd}
                      </Badge>
                    </div>
                    {msg.message && (
                      <p className="text-sm text-x402-text mt-2">{msg.message}</p>
                    )}
                    <p className="text-xs text-x402-muted mt-2">
                      Received {msg.tokens_minted.toLocaleString()} {tokenSymbol}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>
  );
}
