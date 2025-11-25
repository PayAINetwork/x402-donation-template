import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/wallet-provider";
import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const tokenName =
  process.env.NEXT_PUBLIC_TOKEN_NAME || process.env.TOKEN_NAME || "Token";
const tokenSymbol =
  process.env.NEXT_PUBLIC_TOKEN_SYMBOL || process.env.TOKEN_SYMBOL || "TOKEN";
const tokenDescription =
  process.env.NEXT_PUBLIC_TOKEN_DESCRIPTION ||
  process.env.TOKEN_DESCRIPTION ||
  `Support our community and receive ${tokenSymbol} tokens`;
const tokenImage =
  process.env.NEXT_PUBLIC_TOKEN_IMAGE_URL || process.env.TOKEN_IMAGE_URL;

export const metadata: Metadata = {
  title: `${tokenName} (${tokenSymbol}) - Community Donation Portal`,
  description: tokenDescription,
  keywords: [
    tokenName,
    tokenSymbol,
    "donation",
    "crypto",
    "solana",
    "tokens",
    "community",
  ],
  authors: [{ name: tokenName }],
  icons: tokenImage
    ? {
        icon: tokenImage,
        apple: tokenImage,
        shortcut: tokenImage,
      }
    : undefined,
  openGraph: {
    title: `${tokenName} (${tokenSymbol}) - Community Donation Portal`,
    description: tokenDescription,
    images: tokenImage ? [{ url: tokenImage, alt: `${tokenName} Logo` }] : [],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <div className="fixed right-4 top-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
