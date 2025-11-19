"use client";

import { ThemeProvider } from "next-themes";
import { SolanaWalletProvider } from "./wallet-provider";
import { WalletOverlayProvider } from "./wallet-overlay-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableColorScheme>
      <SolanaWalletProvider>
        <WalletOverlayProvider>{children}</WalletOverlayProvider>
      </SolanaWalletProvider>
    </ThemeProvider>
  );
}
