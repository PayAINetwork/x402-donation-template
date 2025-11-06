import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/wallet-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tokenName = process.env.NEXT_PUBLIC_TOKEN_NAME || process.env.TOKEN_NAME || "Token";
const tokenSymbol = process.env.NEXT_PUBLIC_TOKEN_SYMBOL || process.env.TOKEN_SYMBOL || "TOKEN";
const tokenDescription = process.env.NEXT_PUBLIC_TOKEN_DESCRIPTION || process.env.TOKEN_DESCRIPTION || `Support our community and receive ${tokenSymbol} tokens`;
const tokenImage = process.env.NEXT_PUBLIC_TOKEN_IMAGE_URL || process.env.TOKEN_IMAGE_URL;

export const metadata: Metadata = {
  title: `${tokenName} (${tokenSymbol}) - Community Donation Portal`,
  description: tokenDescription,
  keywords: [tokenName, tokenSymbol, 'donation', 'crypto', 'solana', 'tokens', 'community'],
  authors: [{ name: tokenName }],
  openGraph: {
    title: `${tokenName} (${tokenSymbol}) - Community Donation Portal`,
    description: tokenDescription,
    images: tokenImage ? [{ url: tokenImage, alt: `${tokenName} Logo` }] : [],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${tokenName} (${tokenSymbol}) - Community Donation Portal`,
    description: tokenDescription,
    images: tokenImage ? [tokenImage] : [],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
