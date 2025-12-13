import type { Metadata } from "next";
import { Inter, Chelsea_Market } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/wallet-provider";
import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const chelseaMarket = Chelsea_Market({
  weight: "400",
  variable: "--font-chelsea-market",
  subsets: ["latin"],
});

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || "Project";
const projectDescription =
  process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION || "Support our project!";
const projectImage = process.env.NEXT_PUBLIC_PROJECT_IMAGE_URL;

export const metadata: Metadata = {
  title: `${projectName} - x402 Donations!`,
  description: projectDescription,
  keywords: [projectName, "donation", "crypto", "solana", "community"],
  authors: [{ name: projectName }],
  icons: projectImage
    ? {
        icon: projectImage,
        apple: projectImage,
        shortcut: projectImage,
      }
    : undefined,
  openGraph: {
    title: `${projectName} - x402 Donations!`,
    description: projectDescription,
    images: projectImage
      ? [{ url: projectImage, alt: `${projectName} Logo` }]
      : [],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${projectName} - x402 Donations!`,
    description: projectDescription,
    images: projectImage ? [projectImage] : [],
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
      <body
        className={`${inter.variable} ${chelseaMarket.variable} antialiased`}
      >
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
