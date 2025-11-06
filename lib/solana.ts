import { Connection, Keypair, clusterApiUrl, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Get the Solana network from environment variables
 * @returns Network name (devnet or mainnet-beta)
 */
export function getSolanaNetwork(): string {
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana-devnet";
    return network === "solana-devnet" ? "devnet" : "mainnet-beta";
}

/**
 * Get the Solana RPC URL
 * @returns RPC endpoint URL
 */
export function getRpcUrl(): string {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (customRpc) {
        return customRpc;
    }

    const network = getSolanaNetwork();
    return clusterApiUrl(network as "devnet" | "mainnet-beta");
}

/**
 * Get a Solana connection instance
 * @returns Solana Connection
 */
export function getConnection(): Connection {
    const rpcUrl = getRpcUrl();
    const commitment = (process.env.SOLANA_COMMITMENT || "confirmed") as "confirmed" | "finalized";

    return new Connection(rpcUrl, commitment);
}

/**
 * Get the resource server wallet keypair from private key
 * @returns Resource server Keypair
 */
export function getResourceWallet(): Keypair {
    const privateKeyString = process.env.RESOURCE_SERVER_WALLET_PRIVATE_KEY;

    if (!privateKeyString) {
        throw new Error("RESOURCE_SERVER_WALLET_PRIVATE_KEY not configured");
    }

    try {
        const privateKeyBytes = bs58.decode(privateKeyString);
        return Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
        throw new Error(
            `Invalid RESOURCE_SERVER_WALLET_PRIVATE_KEY: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Get the resource server wallet public key (address)
 * @returns Resource server wallet address
 */
export function getResourceWalletAddress(): string {
    const address = process.env.RESOURCE_SERVER_WALLET_ADDRESS;

    if (!address) {
        throw new Error("RESOURCE_SERVER_WALLET_ADDRESS not configured");
    }

    return address;
}

/**
 * Extract the actual payer (donor) from a serialized transaction
 * The payment payload contains the signed transaction, which we can deserialize
 * to extract the user's wallet address (second signer, after the facilitator's fee payer)
 * 
 * @param serializedTransaction - Base64 encoded signed transaction from payment payload
 * @returns The actual payer's wallet address (second signer)
 */
export function getActualPayerFromSerializedTransaction(serializedTransaction: string): string | null {
    try {
        // Deserialize the transaction
        const txBuffer = Buffer.from(serializedTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(txBuffer);

        // Get account keys from the message
        const message = transaction.message;
        const accountKeys = message.getAccountKeys();

        // In x402 with facilitator:
        // - First signer (index 0): Fee payer (facilitator's wallet) 
        // - Second signer (index 1): Actual payer (donor's connected wallet)
        const staticKeys = accountKeys.staticAccountKeys;
        
        if (staticKeys.length >= 2) {
            // Return the second signer (the actual donor)
            return staticKeys[1].toBase58();
        }

        // Fallback: return first signer if only one exists
        if (staticKeys.length >= 1) {
            return staticKeys[0].toBase58();
        }

        return null;
    } catch (error) {
        console.error('[Solana] Error deserializing transaction:', error);
        return null;
    }
}

