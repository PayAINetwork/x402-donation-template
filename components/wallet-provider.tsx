"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
    // Get network from environment
    const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana-devnet";
    const network =
        networkEnv === "solana-devnet"
            ? WalletAdapterNetwork.Devnet
            : WalletAdapterNetwork.Mainnet;

    // RPC endpoint
    const endpoint = useMemo(() => {
        const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
        return customRpc || clusterApiUrl(network);
    }, [network]);

    // Wallet adapters
    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

