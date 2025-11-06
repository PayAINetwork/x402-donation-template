"use client";

interface DonationItemProps {
  id: number;
  donor_address: string;
  donor_name: string | null;
  amount_usd: number;
  tokens_minted: number;
  message: string | null;
  created_at: string;
  tokenSymbol: string;
  theme?: "dark" | "light";
}

export function DonationItem({
  donor_name,
  amount_usd,
  tokens_minted,
  message,
  created_at,
  tokenSymbol,
  theme = "dark",
}: DonationItemProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatTokens = (tokens: number) => {
    return tokens.toLocaleString().replace(/,/g, ".");
  };

  const isAnonymous = !donor_name;
  const avatarColor = isAnonymous ? "#744AC9" : "#22EBAD";

  return (
    <div
      className="py-4 border-b last:border-b-0"
      style={{
        borderColor:
          theme === "dark"
            ? "rgba(255, 255, 255, 0.16)"
            : "rgba(228, 228, 231, 1)",
      }}
    >
      {/* Header Row */}
      <div className="flex items-center gap-3 mb-2">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: avatarColor }}
        >
          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="w-full h-full bg-white/40 rounded-sm" />
              <div className="w-full h-full bg-white/40 rounded-sm" />
              <div className="w-full h-full bg-white/40 rounded-sm" />
              <div className="w-full h-full bg-white/40 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Donor Name */}
        <div className="flex-1 flex items-center justify-between">
          <p
            className="font-semibold text-sm"
            style={{
              color:
                theme === "dark"
                  ? "rgba(255, 255, 255, 1)"
                  : "rgba(9, 9, 11, 1)",
            }}
          >
            {donor_name || "Anonymous"}
          </p>
          <p className="text-gray-400 text-xs">{formatTimeAgo(created_at)}</p>
        </div>
      </div>

      {/* Comment/Message Section */}
      {message && (
        <div
          className="mb-2 p-3 rounded"
          style={{
            background:
              theme === "dark"
                ? "rgba(24, 24, 26, 1)"
                : "rgba(244, 244, 245, 1)",
            borderLeft: "2px solid rgba(150, 71, 253, 1)",
          }}
        >
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

      {/* Donation Details Section */}
      <div>
        <p className="text-sm">
          <span className="text-gray-400">Donation Amount: </span>
          <span
            className="font-semibold"
            style={{
              color:
                theme === "dark"
                  ? "rgba(34, 191, 145, 1)"
                  : "rgba(22, 163, 74, 1)",
            }}
          >
            ${amount_usd} USDC
          </span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-400">Tokens Received: </span>
          <span
            style={{
              color:
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(9, 9, 11, 0.8)",
            }}
          >
            {formatTokens(tokens_minted)} {tokenSymbol}
          </span>
        </p>
      </div>
    </div>
  );
}
