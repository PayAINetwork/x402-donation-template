import { NextResponse } from "next/server";

/**
 * GET /.well-known/x402.json
 * 
 * x402 protocol schema
 * Defines available resources and payment requirements
 */
export async function GET() {
    const tokenName = process.env.TOKEN_NAME || "Unknown Token";
    const tokenSymbol = process.env.TOKEN_SYMBOL || "TOKEN";
    const dollarToTokenRatio = parseInt(process.env.DOLLAR_TO_TOKEN_RATIO || "1000");
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana-devnet";
    const facilitator = process.env.FACILITATOR_URL || "https://facilitator.payai.network";

    const schema = {
        name: `${tokenName} (${tokenSymbol})`,
        description: `Support ${tokenName} by making a donation and receive ${tokenSymbol} tokens in return. All donations are recorded on the blockchain and displayed on our community message board.`,
        version: "1.0.0",
        facilitator,
        resources: [
            {
                path: "/donate/1",
                method: "POST",
                price: 1000000, // $1 in smallest USDC units (6 decimals)
                currency: "USDC",
                network,
                description: `Donate $1 USDC and receive ${dollarToTokenRatio} ${tokenSymbol} tokens`,
            },
            {
                path: "/donate/5",
                method: "POST",
                price: 5000000, // $5 in smallest USDC units
                currency: "USDC",
                network,
                description: `Donate $5 USDC and receive ${dollarToTokenRatio * 5} ${tokenSymbol} tokens`,
            },
            {
                path: "/donate/10",
                method: "POST",
                price: 10000000, // $10 in smallest USDC units
                currency: "USDC",
                network,
                description: `Donate $10 USDC and receive ${dollarToTokenRatio * 10} ${tokenSymbol} tokens`,
            },
            {
                path: "/write-message",
                method: "POST",
                price: 1000000, // Minimum $1
                currency: "USDC",
                network,
                description: `Make a custom donation (minimum $1) with an optional message and your name to appear on the community board`,
                parameters: {
                    amount: "number (USD, minimum 1)",
                    name: "string (optional)",
                    message: "string (optional)",
                },
            },
            {
                path: "/messages",
                method: "GET",
                price: 0, // Free endpoint
                currency: "USDC",
                network,
                description: "View all donation messages from the community",
                parameters: {
                    page: "number (default: 1)",
                    limit: "number (default: 50, max: 100)",
                    sort: "'recent' | 'top' (default: recent)",
                },
            },
        ],
    };

    return NextResponse.json(schema, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

