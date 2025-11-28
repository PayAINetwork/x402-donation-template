# x402 Donation Template (No Token)

A Next.js template for creating a paid community message board with x402 payment integration. Users can write messages by paying with $PAYAI tokens, with all contributions recorded on-chain and displayed on a community board.

> **💡 Recommended**: Deploy this template via the [x402 Merchant Launcher](https://github.com/postmanode/x402-merchant-launcher) by selecting "No Token (Donations Only)" option for automatic configuration and one-click setup.

> **🪙 Looking for the token version?** Check out [x402-donation-with-token-template](https://github.com/PayAINetwork/x402-donation-with-token-template) to mint and distribute your own tokens.

## 📖 Overview

### What is this?

This is a **paid community message board** that allows supporters to leave messages on your project's wall by paying with $PAYAI tokens. Think of it as a combination of:

- 💬 **Paid Guestbook** - Community members pay to leave messages
- 📊 **Public Board** - All messages displayed in real-time
- 🔐 **Payment Processor** - Seamless crypto payments via x402
- 📈 **Stats Dashboard** - Track total contributors and messages

### How it works

1. **Project Creator** (you) uses [x402 Merchant Launcher](https://github.com/postmanode/x402-merchant-launcher) and selects "No Token" option
2. **Merchant Server** goes live on Vercel and is automatically discoverable on [x402scan.com](https://x402scan.com)
3. **Community Members** visit your message board and write messages by paying with $PAYAI
4. **Community Board** displays all messages and contributor names in real-time

### Why use this?

- ✅ **No token creation needed** - Use existing $PAYAI token
- ✅ **Simple setup** - Just project name and description
- ✅ **x402 protocol compliant** - Auto-discoverable, standard payments
- ✅ **Community engagement** - Let supporters share their thoughts
- ✅ **Zero maintenance** - Serverless architecture, auto-scaling
- ✅ **Transparent** - All contributions recorded on Solana blockchain
- ✅ **Built-in database** - Messages stored automatically

### Example Use Cases

- 💬 **Community Feedback** - Let supporters share ideas and thoughts
- 🎉 **Event Guestbook** - Collect messages from event attendees
- 💝 **Support Wall** - Give fans a way to show appreciation
- 📣 **Announcement Board** - Community-driven message sharing
- 🏆 **Recognition Wall** - Acknowledge contributors publicly

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PayAINetwork/x402-donation-template)

## ✨ Features

- 💬 **x402 Payment Protocol** - Pay with $PAYAI tokens to write messages
- ✍️ **Custom Messages** - Contributors can leave messages and their name
- 📊 **Community Board** - Public feed of all messages and contributors
- 📈 **Stats Dashboard** - Track total messages and contributors
- 🔐 **Wallet Integration** - Phantom, Solflare, and more via Solana Wallet Adapter
- 🎨 **Modern UI** - Beautiful dark/light theme with responsive design
- ⚡ **Built with Next.js 15** - Server components, API routes, and TypeScript
- 🗄️ **Integrated Database** - Messages stored automatically via Vercel Postgres

## 🏗️ Architecture

### Message Flow

```
1. User connects wallet (Phantom, Solflare, etc.)
2. User enters custom amount of $PAYAI tokens
3. User writes optional name and message
4. x402 middleware verifies payment with PayAI facilitator
5. Payment settles on-chain ($PAYAI transferred to project wallet)
6. Message saved to database
7. User receives confirmation
8. Community board updates with new message
```

### API Endpoints

#### Protected Endpoints (require x402 payment)

- `POST /api/write-message` - Write a message on the community board (requires $PAYAI payment)

#### Public Endpoints

- `GET /api/messages` - Retrieve messages (paginated, sortable)
  - Query params: `?page=1&limit=50&sort=recent|top`
- `GET /.well-known/x402.json` - x402 protocol schema

## 🛠️ Setup

### Prerequisites

- Node.js 18+ or pnpm
- Solana wallet with devnet/mainnet SOL
- Vercel account (for deployment)
- Token already created on Solana (via x402 Merchant Launcher)

### Environment Variables

Create a `.env.local` file:

### Environment Variables

Create a `.env.local` file:

```bash
# Project Configuration
NEXT_PUBLIC_PROJECT_NAME=<your_project_name>
NEXT_PUBLIC_PROJECT_DESCRIPTION=<your_project_description>

# Resource Server Wallet (receives $PAYAI payments)
RESOURCE_SERVER_WALLET_ADDRESS=<your_solana_address>

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=solana-devnet  # or 'solana' for mainnet

# Optional: Custom RPC
# NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=your-key
SOLANA_COMMITMENT=confirmed

# PayAI Facilitator
FACILITATOR_URL=https://facilitator.payai.network

# PayAI Token (for write-on-wall payments)
NEXT_PUBLIC_PAYAI_TOKEN_MINT=<payai_token_mint_address>
```

### Database Configuration

This template connects to **Vercel Storage (Neon Postgres)** both locally and in production. Vercel deployments expose a pooled `STORAGE_URL`, and you can optionally add `STORAGE_URL_NON_POOLING` (or the legacy `POSTGRES_URL(_NON_POOLING)`) if you want a dedicated serverless connection string. The runtime and drizzle tooling look for `STORAGE_URL_NON_POOLING`, `STORAGE_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`, then `DATABASE_URL`. For local development, set at least `STORAGE_URL` or `DATABASE_URL` in `.env.local` so drizzle-kit commands and the app can share the same Neon instance.

### Local Development

1. **Clone the repository:**

   ```bash
   git clone https://github.com/postmanode/x402-donation-template.git
   cd x402-donation-template
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Run the development server:**

   ```bash
   pnpm dev
   ```

5. **Open http://localhost:3000** in your browser

**Note**: Donations will not be saved when running locally unless you set `LAUNCHER_API_URL` to a deployed launcher instance.

### Deploying to Vercel

#### Option 1: One-Click Deploy (Recommended)

1. Click the "Deploy with Vercel" button above
2. Configure environment variables in Vercel dashboard
3. Deploy (no database setup needed - uses launcher's database)

#### Option 2: Manual Deploy

1. **Push to GitHub:**

   ```bash
   git push origin main
   ```

2. **Import to Vercel:**

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables

3. **Deploy x402 schema:**
   - Your site is now live at `your-project.vercel.app`
   - x402 schema accessible at `your-project.vercel.app/.well-known/x402.json`

## 🔧 Configuration

### Customizing Payment Amount

Users can enter a custom amount of $PAYAI tokens to write on the wall. The amount is flexible and determined by the user at the time of writing their message.

### Customizing Donation Token

By default, donations are made in USDC. You can configure a different token for donations using these environment variables:

- `NEXT_PUBLIC_DONATION_INPUT_TOKEN_ADDRESS` - The Solana token mint address (default: USDC on mainnet)
- `NEXT_PUBLIC_DONATION_INPUT_TOKEN_SYMBOL` - The token symbol (default: "USDC")
- `NEXT_PUBLIC_DONATION_INPUT_TOKEN_NAME` - The token name (default: "USD Coin")
- `NEXT_PUBLIC_DONATION_INPUT_TOKEN_DECIMALS` - Number of decimals (default: 6)

Example for using a custom token:

```bash
NEXT_PUBLIC_DONATION_INPUT_TOKEN_ADDRESS=YourTokenMintAddressHere
NEXT_PUBLIC_DONATION_INPUT_TOKEN_SYMBOL=YOUR
NEXT_PUBLIC_DONATION_INPUT_TOKEN_NAME=Your Token
NEXT_PUBLIC_DONATION_INPUT_TOKEN_DECIMALS=9
```

**Note**: The x402 facilitator must support the configured token for payments to work.

### Switching to Mainnet

1. Update environment variables:

   ```bash
   NEXT_PUBLIC_SOLANA_NETWORK=solana
   NEXT_PUBLIC_PAYAI_TOKEN_MINT=<mainnet_payai_token_address>
   ```

2. Ensure you have mainnet USDC and SOL in your resource wallet

3. Redeploy to Vercel

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Blockchain**: Solana (@solana/web3.js, @solana/spl-token)
- **Wallet Adapter**: @solana/wallet-adapter-react
- **Payment Protocol**: x402 (x402-solana, x402-next)
- **Database**: Vercel Postgres (@vercel/postgres)
- **Deployment**: Vercel

## 🎨 Customization

### Branding

Update token branding via environment variables:

- `TOKEN_NAME` - Display name
- `TOKEN_SYMBOL` - Ticker symbol
- `TOKEN_IMAGE_URL` - Logo URL (IPFS recommended)
- `TOKEN_DESCRIPTION` - Hero section description

### Theme

Edit `app/globals.css` to customize colors:

```css
--color-x402-bg: #0a1f1f; /* Background */
--color-x402-card: #0f2828; /* Card background */
--color-x402-border: #1a3535; /* Borders */
--color-x402-text: #e0f2f2; /* Text */
--color-x402-muted: #7a9999; /* Muted text */
--color-x402-cyan: #00ffff; /* Primary accent */
--color-x402-cyan-hover: #00dddd; /* Hover state */
```

## 🔒 Security

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use Vercel's environment variable management
- **x402 Middleware**: All donation endpoints are protected by x402 payment verification
- **On-Chain Settlement**: Payments are settled on Solana blockchain before token distribution
- **Vercel Postgres**: Database credentials managed by Vercel

## 📚 API Reference

### GET /api/messages

Retrieve paginated messages.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 50, max: 100) - Items per page
- `sort` (`recent` | `top`, default: `recent`) - Sort order

**Response:**

```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "id": 1,
        "donor_address": "ABC...XYZ",
        "donor_name": "John Doe",
        "amount_usd": 0,
        "tokens_minted": 0,
        "message": "Great project! Keep building!",
        "created_at": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    },
    "stats": {
      "totalDonations": 150,
      "totalAmount": 0,
      "totalTokens": 0
    }
  }
}
```

### POST /api/write-message

Write a message on the community board (protected by x402).

**Protected by:** x402 payment middleware (requires $PAYAI payment)

**Request Body:**

```json
{
  "amount": 100,
  "name": "John Doe",
  "message": "Great project!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Thank you, John Doe, for your message!",
  "data": {
    "contributor": "ABC...XYZ",
    "amountPayAI": 100,
    "name": "John Doe",
    "message": "Great project!"
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR.

## 📄 License

MIT

## 🔗 Links

- [x402 Merchant Launcher](https://github.com/postmanode/x402-merchant-launcher) - Deploy this template
- [x402 Donation WITH Token Template](https://github.com/PayAINetwork/x402-donation-with-token-template) - Token version
- [PayAI Network](https://payai.network)
- [x402 Protocol](https://x402.org)
- [Solana Docs](https://docs.solana.com)
- [Next.js Docs](https://nextjs.org/docs)

## ❓ Support

- **Issues**: [GitHub Issues](https://github.com/PayAINetwork/x402-donation-template/issues)
- **Discord**: [PayAI Community](https://discord.gg/payai)
- **Docs**: [x402 Documentation](https://x402.org/docs)

---

Built with ❤️ by the PayAI Network team
