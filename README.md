# x402 Donation Template

A Next.js template for creating community donation portals for Solana tokens with x402 payment integration. Users can donate USDC and receive your token in return, with all donations recorded on-chain and displayed on a community message board.

> **💡 Recommended**: Deploy this template via the [x402 Merchant Launcher](https://github.com/postmanode/x402-merchant-launcher) for automatic token creation, configuration, and one-click setup. Or follow the manual setup instructions below.

## 📖 Overview

### What is this?

This is a **community donation portal** that allows anyone to support your token project by making USDC donations and receiving your tokens in return. Think of it as a combination of:

- 💰 **Token Faucet** - Distribute tokens to supporters
- 💬 **Guestbook** - Community members can leave messages
- 📊 **Leaderboard** - Track top donors and total raised
- 🔐 **Payment Processor** - Seamless crypto payments via x402

### How it works

1. **Token Creator** (you) uses [x402 Merchant Launcher](https://github.com/postmanode/x402-merchant-launcher) to create a token and deploy this template
2. **Merchant Server** goes live on Vercel and is automatically discoverable on [x402scan.com](https://x402scan.com)
3. **Community Members** visit your donation portal and contribute USDC
4. **Server** automatically distributes tokens from your allocation to donors
5. **Community Board** displays all donations, messages, and donor names in real-time

### Why use this?

- ✅ **No smart contracts required** - Just deploy to Vercel
- ✅ **x402 protocol compliant** - Auto-discoverable, standard payments
- ✅ **Community engagement** - Donors can leave messages and see the community
- ✅ **Flexible pricing** - You set how many tokens per dollar
- ✅ **Zero maintenance** - Serverless architecture, auto-scaling
- ✅ **Transparent** - All donations recorded on Solana blockchain

### Example Use Cases

- 🚀 **Token Launch** - Distribute initial supply to early supporters
- 💎 **Community Building** - Reward active community members
- 🎁 **Fundraising** - Raise capital while distributing tokens
- 🏆 **Contributor Rewards** - Thank contributors with tokens + recognition
- 📣 **Marketing** - Let supporters leave messages promoting your project

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postmanode/x402-donation-template)

## ✨ Features

- 💰 **x402 Payment Protocol** - Seamless USDC donations with automatic token distribution
- 🎁 **Quick Donate Buttons** - Preset amounts ($1, $5, $10)
- 💬 **Custom Donations** - Donors can leave messages and their name
- 📊 **Community Board** - Public feed of all donations and messages
- 📈 **Stats Dashboard** - Track total donors, amount raised, and tokens distributed
- 🔐 **Wallet Integration** - Phantom, Solflare, and more via Solana Wallet Adapter
- 🎨 **Modern UI** - Beautiful dark theme with cyan accents (x402 style)
- ⚡ **Built with Next.js 16** - Server components, API routes, and TypeScript
- 🗄️ **Vercel Postgres** - Message storage with zero-config database

## 🏗️ Architecture

### Donation Flow

```
1. User connects wallet (Phantom, Solflare, etc.)
2. User selects donation amount ($1, $5, $10, or custom)
3. x402 middleware verifies payment with PayAI facilitator
4. Payment settles on-chain (USDC transferred to resource wallet)
5. Server mints tokens from resource wallet to donor
6. Donation message saved to Vercel Postgres
7. User receives tokens + confirmation
8. Community board updates with new message
```

### API Endpoints

#### Protected Endpoints (require x402 payment)

- `POST /api/donate/1` - Donate $1 USDC
- `POST /api/donate/5` - Donate $5 USDC
- `POST /api/donate/10` - Donate $10 USDC
- `POST /api/write-message` - Custom donation with optional name/message

#### Public Endpoints

- `GET /api/messages` - Retrieve donation messages (paginated, sortable)
  - Query params: `?page=1&limit=50&sort=recent|top`
- `GET /.well-known/x402.json` - x402 protocol schema

## 🛠️ Setup

### Prerequisites

- Node.js 18+ or pnpm
- Solana wallet with devnet/mainnet SOL
- Vercel account (for deployment and Postgres)
- Token already created on Solana (via PayAI Token Launcher or similar)

### Environment Variables

Create a `.env.local` file:

```bash
# Token Configuration (server-side - for token distribution)
TOKEN_MINT=<your_token_mint_address>
TOKEN_NAME=<your_token_name>
TOKEN_SYMBOL=<your_token_symbol>
TOTAL_SUPPLY=<your_total_supply>
MINTABLE_SUPPLY=<amount_allocated_for_donations>
TOKEN_IMAGE_URL=<your_token_image_ipfs_url>
TOKEN_DESCRIPTION=<your_token_description>

# Frontend Token Configuration (client-side - for display purposes)
NEXT_PUBLIC_TOKEN_NAME=<your_token_name>
NEXT_PUBLIC_TOKEN_SYMBOL=<your_token_symbol>
NEXT_PUBLIC_TOKEN_IMAGE_URL=<your_token_image_ipfs_url>
NEXT_PUBLIC_TOKEN_DESCRIPTION=<your_token_description>
NEXT_PUBLIC_MINTABLE_SUPPLY=<amount_allocated_for_donations>

# Donation Settings
DONATION_TARGET=1000  # Target amount in USD to raise (e.g., 1000 = $1000)
NEXT_PUBLIC_DONATION_TARGET=1000  # Same value for frontend display
# Note: DOLLAR_TO_TOKEN_RATIO is calculated as MINTABLE_SUPPLY / DONATION_TARGET

# Resource Server Wallet (holds tokens for distribution)
RESOURCE_SERVER_WALLET_ADDRESS=<your_solana_address>
RESOURCE_SERVER_WALLET_PRIVATE_KEY=<your_base58_private_key>

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=solana-devnet  # or 'solana' for mainnet

# Optional: Custom RPC
# NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=your-key
SOLANA_COMMITMENT=confirmed

# PayAI Facilitator
FACILITATOR_URL=https://facilitator.payai.network

# Vercel Postgres (auto-configured by Vercel)
# POSTGRES_URL=  # Auto-set by Vercel
```

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

4. **Set up Vercel Postgres (for local development):**
   ```bash
   # Install Vercel CLI
   pnpm install -g vercel

   # Link to your Vercel project
   vercel link

   # Pull environment variables (including Postgres)
   vercel env pull .env.local
   ```

5. **Run the development server:**
   ```bash
pnpm dev
   ```

6. **Open http://localhost:3000** in your browser

### Deploying to Vercel

#### Option 1: One-Click Deploy (Recommended)

1. Click the "Deploy with Vercel" button above
2. Configure environment variables in Vercel dashboard
3. Add Vercel Postgres storage to your project:
   - Go to Storage tab → Create Database → Postgres
4. Redeploy to apply environment variables

#### Option 2: Manual Deploy

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Add Vercel Postgres:**
   - Go to Storage tab
   - Create Database → Postgres
   - Database URL is automatically added to your project

4. **Deploy x402 schema:**
   - Your site is now live at `your-project.vercel.app`
   - x402 schema accessible at `your-project.vercel.app/.well-known/x402.json`

## 🔧 Configuration

### Adjusting Token Distribution

Edit `DONATION_TARGET` in your environment variables to control the token-to-dollar ratio:

```bash
# Examples (assuming 1,000,000 MINTABLE_SUPPLY):
DONATION_TARGET=1000    # Ratio: 1000 tokens per $1 (1,000,000 / 1,000)
DONATION_TARGET=100     # Ratio: 10,000 tokens per $1 (1,000,000 / 100)
DONATION_TARGET=10000   # Ratio: 100 tokens per $1 (1,000,000 / 10,000)

# The DOLLAR_TO_TOKEN_RATIO is automatically calculated as:
# DOLLAR_TO_TOKEN_RATIO = MINTABLE_SUPPLY / DONATION_TARGET
```

### Customizing Donation Amounts

Edit `middleware.ts` to change preset donation amounts:

```typescript
export const middleware = paymentMiddleware(
    resourceWallet,
    {
        '/api/donate/1': { price: '$1', network, config: { description: 'Donate $1' } },
        '/api/donate/5': { price: '$5', network, config: { description: 'Donate $5' } },
        '/api/donate/10': { price: '$10', network, config: { description: 'Donate $10' } },
        // Add more preset amounts:
        '/api/donate/25': { price: '$25', network, config: { description: 'Donate $25' } },
        '/api/donate/50': { price: '$50', network, config: { description: 'Donate $50' } },
    },
    // ...
);
```

### Switching to Mainnet

1. Update environment variables:
   ```bash
   NEXT_PUBLIC_SOLANA_NETWORK=solana
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
--color-x402-bg: #0a1f1f;        /* Background */
--color-x402-card: #0f2828;      /* Card background */
--color-x402-border: #1a3535;    /* Borders */
--color-x402-text: #e0f2f2;      /* Text */
--color-x402-muted: #7a9999;     /* Muted text */
--color-x402-cyan: #00ffff;      /* Primary accent */
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

Retrieve paginated donation messages.

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
        "donator_address": "ABC...XYZ",
        "amount_usd": 10.50,
        "tokens_minted": 10500,
        "name": "John Doe",
        "message": "To the moon!",
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
      "totalAmount": 1250.50,
      "totalTokens": 1250500
    }
  }
}
```

### POST /api/donate/[amount]

Make a quick donation (protected by x402).

**Protected by:** x402 payment middleware

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your $10 donation!",
  "data": {
    "donator": "ABC...XYZ",
    "amountUsd": 10,
    "tokensMinted": 10000,
    "tokenSymbol": "TOKEN",
    "transactionSignature": "5x..."
  }
}
```

### POST /api/write-message

Custom donation with optional message (protected by x402).

**Request Body:**
```json
{
  "amount": 25.50,
  "name": "John Doe",
  "message": "Great project!"
}
```

**Response:** Same as `/api/donate/[amount]`

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR.

## 📄 License

MIT

## 🔗 Links

- [PayAI Network](https://payai.network)
- [x402 Protocol](https://x402.org)
- [Solana Docs](https://docs.solana.com)
- [Next.js Docs](https://nextjs.org/docs)

## ❓ Support

- **Issues**: [GitHub Issues](https://github.com/postmanode/x402-donation-template/issues)
- **Discord**: [PayAI Community](https://discord.gg/payai)
- **Docs**: [x402 Documentation](https://x402.org/docs)

---

Built with ❤️ by the PayAI Network team
