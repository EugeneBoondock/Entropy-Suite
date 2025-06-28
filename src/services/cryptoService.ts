import { ethers } from 'ethers';

// Earth 2 Essence Token Contract Address
export const ESSENCE_TOKEN_ADDRESS = '0x2c0687215Aca7F5e2792d956E170325e92A02aCA';
// Your wallet address for receiving payments
export const PAYMENT_WALLET_ADDRESS = '0x7a82906cf62447aaaff84e7a1f58615d317c3eb9';

// ERC20 ABI for token operations
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// Subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // USD price
  features: string[];
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'individual',
    name: 'Individual',
    price: 20,
    features: [
      'Access to all 32+ tools',
      'Unlimited usage',
      'Cloud storage (5GB)',
      'Email support',
      'No watermarks'
    ]
  },
  {
    id: 'heavy_user',
    name: 'Heavy User',
    price: 35,
    recommended: true,
    features: [
      'Everything in Individual',
      'Priority processing',
      'Cloud storage (25GB)',
      'Advanced AI models',
      'API access (1000 calls/month)',
      'Priority support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 500,
    features: [
      'Everything in Heavy User',
      'Unlimited cloud storage',
      'White-label options',
      'Unlimited API access',
      'Custom integrations',
      'Dedicated support manager',
      'SLA guarantee'
    ]
  }
];

// Get token price from multiple sources with fallback
export const getTokenPrice = async (): Promise<number> => {
  console.log('🔍 Fetching ESSENCE token price...');
  
  // First try to get price from CoinGecko (most reliable)
  try {
    console.log('📡 Trying CoinGecko API...');
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=earth-2&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data['earth-2']?.usd) {
        const price = data['earth-2'].usd;
        console.log(`✅ CoinGecko price: $${price}`);
        return price;
      }
    }
  } catch (error) {
    console.log('❌ CoinGecko API failed:', error);
  }

  // Fallback to DexScreener API (better for smaller tokens)
  try {
    console.log('📡 Trying DexScreener API...');
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/0x2c0687215Aca7F5e2792d956E170325e92A02aCA`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        if (pair.priceUsd) {
          const price = parseFloat(pair.priceUsd);
          console.log(`✅ DexScreener price: $${price}`);
          return price;
        }
      }
    }
  } catch (error) {
    console.log('❌ DexScreener API failed:', error);
  }

  // Try our backend as a final attempt
  try {
    console.log('📡 Trying backend API...');
    const response = await fetch('/api/crypto/token-price');
    if (response.ok) {
      const data = await response.json();
      if (data.price && data.source !== 'fallback') {
        console.log(`✅ Backend price: $${data.price} (source: ${data.source})`);
        return data.price;
      }
    }
  } catch (error) {
    console.log('❌ Backend API failed:', error);
  }

  // No fallback - throw error if no real price available
  console.error('💥 No real price data available from any source');
  throw new Error('Unable to fetch current ESSENCE token price. Please try again later.');
};

// Helper function to get ETH price
const getEthPrice = async (): Promise<number> => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const data = await response.json();
    return data.ethereum?.usd || 2000; // Fallback ETH price
  } catch (error) {
    return 2000; // Fallback ETH price
  }
};

// Calculate token amount needed for subscription
export const calculateTokenAmount = (usdPrice: number, tokenPrice: number): string => {
  const tokenAmount = usdPrice / tokenPrice;
  return tokenAmount.toFixed(6);
};

// Generate payment QR code data
export const generatePaymentQRData = (tokenAmount: string): string => {
  // EIP-681 format for Ethereum payments
  return `ethereum:${ESSENCE_TOKEN_ADDRESS}/transfer?address=${PAYMENT_WALLET_ADDRESS}&uint256=${ethers.parseUnits(tokenAmount, 18)}`;
};

// Check if user has MetaMask or other Web3 wallet
export const checkWeb3Wallet = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Connect to MetaMask
export const connectWallet = async (): Promise<string | null> => {
  if (!checkWeb3Wallet()) {
    throw new Error('No Web3 wallet detected. Please install MetaMask.');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Monitor payment transaction
export const monitorPayment = async (
  userAddress: string,
  expectedAmount: string,
  onPaymentReceived: (txHash: string) => void
): Promise<void> => {
  if (!checkWeb3Wallet()) return;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(ESSENCE_TOKEN_ADDRESS, ERC20_ABI, provider);

    // Listen for Transfer events
    const filter = contract.filters.Transfer(userAddress, PAYMENT_WALLET_ADDRESS);
    
    contract.on(filter, (from, to, amount, event) => {
      const amountInTokens = ethers.formatUnits(amount, 18);
      const expectedAmountNum = parseFloat(expectedAmount);
      const receivedAmountNum = parseFloat(amountInTokens);
      
      // Allow for small rounding differences (0.1% tolerance)
      if (Math.abs(receivedAmountNum - expectedAmountNum) / expectedAmountNum < 0.001) {
        onPaymentReceived(event.transactionHash);
      }
    });
  } catch (error) {
    console.error('Error monitoring payment:', error);
  }
};

// Create subscription smart contract call
export const createSubscription = async (
  userAddress: string,
  planId: string,
  tokenAmount: string,
  isRecurring: boolean = false
): Promise<string> => {
  if (!checkWeb3Wallet()) {
    throw new Error('No Web3 wallet detected');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(ESSENCE_TOKEN_ADDRESS, ERC20_ABI, signer);

    // Transfer tokens to payment wallet
    const amountWei = ethers.parseUnits(tokenAmount, 18);
    const tx = await contract.transfer(PAYMENT_WALLET_ADDRESS, amountWei);
    
    return tx.hash;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Validate Ethereum address
export const isValidEthereumAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

// Get user's token balance
export const getUserTokenBalance = async (userAddress: string): Promise<string> => {
  if (!checkWeb3Wallet()) return '0';

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(ESSENCE_TOKEN_ADDRESS, ERC20_ABI, provider);
    
    const balance = await contract.balanceOf(userAddress);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
};

// Format wallet address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

declare global {
  interface Window {
    ethereum?: any;
  }
} 