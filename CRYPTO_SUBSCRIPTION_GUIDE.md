# Crypto Subscription System Guide

## Overview

The Entropy Tools platform now supports crypto-powered subscriptions using Earth 2 Essence (ESSENCE) tokens. This system provides a decentralized, transparent, and automated way to handle subscription payments.

## Features

### 🚀 Core Features
- **Earth 2 Essence Token Payments**: Subscribe using ESSENCE tokens on Ethereum
- **QR Code Payments**: Scan QR codes for instant mobile wallet payments
- **Smart Contract Integration**: Automated recurring payments via smart contracts
- **Real-time Price Updates**: Dynamic token price calculation from DEX APIs
- **Transaction Verification**: On-chain verification of all payments
- **Wallet Integration**: MetaMask and Web3 wallet support

### 💎 Subscription Plans

#### Individual Plan - $20/month
- Access to all 32+ tools
- Unlimited usage
- Cloud storage (5GB)
- Email support
- No watermarks

#### Heavy User Plan - $35/month (Recommended)
- Everything in Individual
- Priority processing
- Cloud storage (25GB)
- Advanced AI models
- API access (1000 calls/month)
- Priority support

#### Enterprise Plan - $500/month
- Everything in Heavy User
- Unlimited cloud storage
- White-label options
- Unlimited API access
- Custom integrations
- Dedicated support manager
- SLA guarantee

## Technical Implementation

### Smart Contract Details

**Earth 2 Essence Token**
- Contract Address: `0x2c0687215Aca7F5e2792d956E170325e92A02aCA`
- Network: Ethereum Mainnet
- Symbol: ESSENCE
- Decimals: 18

**Payment Address**
- Recipient: `0x7a82906cf62447aaaff84e7a1f58615d317c3eb9`
- ⚠️ **Important**: Only send ESSENCE tokens to this address

### Frontend Components

#### CryptoPayment Component
Located at `src/components/CryptoPayment.tsx`

**Features:**
- Wallet connection (MetaMask, WalletConnect)
- QR code generation for mobile payments
- Real-time balance checking
- Transaction broadcasting
- Payment verification
- Recurring payment setup

#### Crypto Service
Located at `src/services/cryptoService.ts`

**Key Functions:**
```typescript
// Connect to Web3 wallet
connectWallet(): Promise<string>

// Get user's token balance
getUserTokenBalance(address: string): Promise<string>

// Calculate required token amount
calculateTokenAmount(usdPrice: number, tokenPrice: number): string

// Generate QR code for payments
generatePaymentQRData(tokenAmount: string): string

// Create subscription transaction
createSubscription(userAddress: string, planId: string, tokenAmount: string): Promise<string>
```

### Backend API Endpoints

#### Crypto Subscription Routes
Located at `server/src/routes/cryptoSubscription.ts`

**Endpoints:**

1. **POST** `/api/crypto/verify-payment`
   - Verifies transaction on-chain
   - Activates user subscription
   - Logs payment details

2. **GET** `/api/crypto/subscription-status`
   - Returns user's current subscription status
   - Includes plan details and expiration

3. **POST** `/api/crypto/cancel-recurring`
   - Disables automatic recurring payments
   - Preserves current subscription until expiration

4. **GET** `/api/crypto/payment-history`
   - Returns user's payment transaction history
   - Limited to last 10 transactions

5. **GET** `/api/crypto/token-price`
   - Returns current ESSENCE token price
   - Used for dynamic pricing calculations

### Database Schema

#### Profiles Table Updates
```sql
ALTER TABLE profiles ADD COLUMN subscription_status VARCHAR DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN subscription_plan VARCHAR;
ALTER TABLE profiles ADD COLUMN subscription_end TIMESTAMP;
ALTER TABLE profiles ADD COLUMN is_recurring BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN payment_method VARCHAR;
ALTER TABLE profiles ADD COLUMN last_payment_tx VARCHAR;
ALTER TABLE profiles ADD COLUMN wallet_address VARCHAR;
```

#### Payment Logs Table
```sql
CREATE TABLE payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  transaction_hash VARCHAR NOT NULL,
  amount_usd DECIMAL(10,2),
  plan_id VARCHAR,
  payment_method VARCHAR,
  status VARCHAR DEFAULT 'pending',
  wallet_address VARCHAR,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## User Flow

### 1. Plan Selection
- User visits `/pricing` page
- Views available plans with USD and ESSENCE pricing
- Clicks "Subscribe with ESSENCE" button

### 2. Wallet Connection
- System checks for Web3 wallet (MetaMask)
- User connects wallet and authorizes access
- System fetches wallet address and ESSENCE balance

### 3. Payment Options
- **QR Code**: Scan with mobile wallet for instant payment
- **Direct Payment**: Pay directly from connected wallet
- **Manual Transfer**: Copy address and amount for manual transfer

### 4. Transaction Processing
- User initiates ESSENCE token transfer
- System monitors blockchain for transaction confirmation
- Backend verifies transaction details and amount

### 5. Subscription Activation
- Transaction verified successfully
- User subscription activated immediately
- Option to enable recurring payments via smart contract

### 6. Recurring Payments (Optional)
- Smart contract automatically deducts monthly fee
- User can disable recurring payments anytime
- Notifications sent before each recurring payment

## Security Features

### Transaction Verification
- On-chain verification of all payments
- Validation of sender, recipient, and amount
- Transaction status confirmation
- Protection against double-spending

### Smart Contract Security
- Audited ERC20 token contract
- Transparent payment processing
- Immutable transaction records
- No private key exposure

### User Protection
- No storage of private keys
- Non-custodial wallet integration
- Real-time balance verification
- Clear transaction history

## Development Setup

### Prerequisites
```bash
# Install dependencies
npm install ethers qrcode react-qr-code web3

# Server dependencies
cd server
npm install ethers @types/express
```

### Environment Variables
```env
# Ethereum RPC endpoint (Infura/Alchemy)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Supabase configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SERVICE_KEY=your_service_key
```

### Testing
```bash
# Test on Ethereum testnet first
ETHEREUM_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID

# Use testnet ESSENCE tokens for testing
# Deploy test contract or use existing testnet version
```

## Troubleshooting

### Common Issues

#### "No Web3 wallet detected"
- Install MetaMask browser extension
- Ensure wallet is unlocked and connected
- Check browser compatibility

#### "Insufficient ESSENCE balance"
- Purchase ESSENCE tokens from DEX (Uniswap)
- Verify correct network (Ethereum Mainnet)
- Check wallet address accuracy

#### "Transaction failed"
- Increase gas limit for transaction
- Check network congestion
- Verify sufficient ETH for gas fees

#### "Payment verification failed"
- Wait for transaction confirmation (1-3 blocks)
- Check transaction hash on Etherscan
- Verify payment to correct address

### Support Resources

#### Documentation
- [MetaMask Setup Guide](https://metamask.io/faqs/)
- [Ethereum Gas Tracker](https://etherscan.io/gastracker)
- [Uniswap DEX](https://app.uniswap.org/)

#### Contact Support
- Email: support@entropytools.ai
- Discord: [Entropy Tools Community]
- GitHub Issues: [Report Bugs]

## Future Enhancements

### Planned Features
- Multi-token support (USDC, DAI, ETH)
- Layer 2 integration (Polygon, Arbitrum)
- DeFi yield farming for subscribers
- NFT-based subscription tiers
- Cross-chain payment bridges

### Smart Contract Upgrades
- Automated subscription management
- Discount mechanisms for long-term payments
- Referral reward system
- Governance token integration

## Legal & Compliance

### Important Notes
- Crypto payments are experimental
- Users responsible for tax implications
- No refunds for blockchain transactions
- Terms of service apply to all payments

### Regulatory Compliance
- KYC not required for basic subscriptions
- Enterprise plans may require additional verification
- Compliance with local cryptocurrency regulations
- Anti-money laundering (AML) monitoring

---

## Quick Start Guide

1. **Install MetaMask**: Download from [metamask.io](https://metamask.io)
2. **Get ESSENCE tokens**: Purchase on [Uniswap](https://app.uniswap.org/)
3. **Visit Pricing Page**: Go to `/pricing` on Entropy Tools
4. **Select Plan**: Choose your subscription tier
5. **Connect Wallet**: Authorize MetaMask connection
6. **Pay with ESSENCE**: Use QR code or direct payment
7. **Enjoy Premium Features**: Access all tools immediately

For technical support, contact our development team or submit an issue on GitHub. 