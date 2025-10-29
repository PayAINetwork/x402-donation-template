import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { getConnection, getResourceWallet } from "./solana";

export interface TokenConfig {
  mint: string;
  name: string;
  symbol: string;
  totalSupply: number;
  mintableSupply: number;
  imageUrl: string;
  description: string;
  donationTarget: number;
  dollarToTokenRatio: number; // Calculated: mintableSupply / donationTarget
}

/**
 * Get token configuration from environment variables
 */
export function getTokenConfig(): TokenConfig {
  const mint = process.env.TOKEN_MINT;
  const name = process.env.TOKEN_NAME;
  const symbol = process.env.TOKEN_SYMBOL;
  const totalSupply = process.env.TOTAL_SUPPLY;
  const mintableSupply = process.env.MINTABLE_SUPPLY;
  const imageUrl = process.env.TOKEN_IMAGE_URL;
  const description = process.env.TOKEN_DESCRIPTION;
  const donationTarget = process.env.DONATION_TARGET;

  if (
    !mint ||
    !name ||
    !symbol ||
    !totalSupply ||
    !mintableSupply ||
    !imageUrl ||
    !description ||
    !donationTarget
  ) {
    throw new Error("Token configuration incomplete in environment variables");
  }

  const mintableSupplyNum = parseInt(mintableSupply);
  const donationTargetNum = parseInt(donationTarget);
  const dollarToTokenRatio = Math.floor(mintableSupplyNum / donationTargetNum);

  return {
    mint,
    name,
    symbol,
    totalSupply: parseInt(totalSupply),
    mintableSupply: mintableSupplyNum,
    imageUrl,
    description,
    donationTarget: donationTargetNum,
    dollarToTokenRatio,
  };
}

/**
 * Calculate how many tokens to mint for a given USD amount
 */
export function calculateTokensForDonation(
  amountUsd: number,
  dollarToTokenRatio: number
): number {
  return Math.floor(amountUsd * dollarToTokenRatio);
}

/**
 * Transfer tokens from resource server wallet to recipient
 * 
 * @param recipientAddress - Recipient's wallet address
 * @param amount - Amount of tokens to transfer (in token units, not smallest units)
 * @returns Transaction signature
 */
export async function transferTokens(
  recipientAddress: string,
  amount: number
): Promise<string> {
  const connection = getConnection();
  const resourceWallet = getResourceWallet();
  const tokenConfig = getTokenConfig();

  const mint = new PublicKey(tokenConfig.mint);
  const recipient = new PublicKey(recipientAddress);

  // Get resource server's token account
  const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    resourceWallet,
    mint,
    resourceWallet.publicKey,
    false,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  // Get or create recipient's token account
  const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    resourceWallet, // Payer for creating account
    mint,
    recipient,
    false,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  // Calculate amount in smallest units (assuming 9 decimals)
  const decimals = 9;
  const transferAmount = BigInt(amount) * BigInt(10 ** decimals);

  // Transfer tokens
  const signature = await transfer(
    connection,
    resourceWallet,
    sourceTokenAccount.address,
    destinationTokenAccount.address,
    resourceWallet,
    transferAmount,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  return signature;
}

