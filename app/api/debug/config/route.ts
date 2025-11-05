import { NextResponse } from "next/server";

/**
 * GET /api/debug/config
 * 
 * Returns x402 configuration for debugging
 * (Safe to expose as it only shows env var existence, not values)
 */
export async function GET() {
  return NextResponse.json({
    facilitatorUrl: process.env.FACILITATOR_URL || 'Not set',
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'Not set',
    resourceWallet: process.env.RESOURCE_SERVER_WALLET_ADDRESS 
      ? `${process.env.RESOURCE_SERVER_WALLET_ADDRESS.slice(0, 8)}...${process.env.RESOURCE_SERVER_WALLET_ADDRESS.slice(-8)}`
      : 'Not set',
    tokenMint: process.env.TOKEN_MINT 
      ? `${process.env.TOKEN_MINT.slice(0, 8)}...${process.env.TOKEN_MINT.slice(-8)}`
      : 'Not set',
    launcherApiUrl: process.env.LAUNCHER_API_URL || 'Not set',
  });
}
