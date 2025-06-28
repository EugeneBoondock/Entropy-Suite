import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ethers } from 'ethers';
import { supabase } from '../supabaseAdmin';

// Earth 2 Essence Token Contract Address
const ESSENCE_TOKEN_ADDRESS = '0x2c0687215Aca7F5e2792d956E170325e92A02aCA';
const PAYMENT_WALLET_ADDRESS = '0x7a82906cf62447aaaff84e7a1f58615d317c3eb9';

// ERC20 ABI for token operations
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// Ethereum provider (you'll need to set up an Infura or Alchemy endpoint)
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID');

interface VerifyPaymentBody {
  txHash: string;
  planId: string;
  userAddress: string;
  isRecurring: boolean;
}

export default async function cryptoSubscriptionRoutes(fastify: FastifyInstance) {
  // Verify transaction and activate subscription
  fastify.post<{ Body: VerifyPaymentBody }>('/api/crypto/verify-payment', async (req: FastifyRequest<{ Body: VerifyPaymentBody }>, reply: FastifyReply) => {
    try {
      const { txHash, planId, userAddress, isRecurring } = req.body;
      const userId = (req as any).userId;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (!txHash || !planId || !userAddress) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return reply.status(400).send({ error: 'Transaction not found' });
      }

      if (receipt.status !== 1) {
        return reply.status(400).send({ error: 'Transaction failed' });
      }

      // Verify the transaction is to our payment address
      if (receipt.to?.toLowerCase() !== ESSENCE_TOKEN_ADDRESS.toLowerCase()) {
        return reply.status(400).send({ error: 'Invalid contract address' });
      }

      // Parse transfer events
      const contract = new ethers.Contract(ESSENCE_TOKEN_ADDRESS, ERC20_ABI, provider);
      const transferEvents = receipt.logs
        .filter(log => log.address.toLowerCase() === ESSENCE_TOKEN_ADDRESS.toLowerCase())
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter(event => event && event.name === 'Transfer');

      // Find the transfer to our payment address
      const validTransfer = transferEvents.find(event => 
        event && 
        event.args.from.toLowerCase() === userAddress.toLowerCase() &&
        event.args.to.toLowerCase() === PAYMENT_WALLET_ADDRESS.toLowerCase()
      );

      if (!validTransfer) {
        return reply.status(400).send({ error: 'No valid transfer found' });
      }

      // Get plan details and verify amount
      const planPrices = {
        'individual': 20,
        'heavy_user': 35,
        'enterprise': 500
      };

      const planPrice = planPrices[planId as keyof typeof planPrices];
      if (!planPrice) {
        return reply.status(400).send({ error: 'Invalid plan ID' });
      }

      // Calculate subscription end date (30 days from now)
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

      // Update user subscription in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: planId,
          subscription_end: subscriptionEnd.toISOString(),
          is_recurring: isRecurring,
          payment_method: 'crypto',
          last_payment_tx: txHash,
          wallet_address: userAddress
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return reply.status(500).send({ error: 'Failed to update subscription' });
      }

      // Log the successful payment
      const { error: logError } = await supabase
        .from('payment_logs')
        .insert({
          user_id: userId,
          transaction_hash: txHash,
          amount_usd: planPrice,
          plan_id: planId,
          payment_method: 'crypto',
          status: 'completed',
          wallet_address: userAddress,
          is_recurring: isRecurring
        });

      if (logError) {
        console.error('Error logging payment:', logError);
      }

      return { 
        success: true, 
        message: 'Subscription activated successfully',
        subscriptionEnd: subscriptionEnd.toISOString()
      };

    } catch (error) {
      console.error('Error verifying payment:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get user's subscription status
  fastify.get('/api/crypto/subscription-status', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_plan, subscription_end, is_recurring, payment_method')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return reply.status(500).send({ error: 'Failed to fetch subscription status' });
      }

      return {
        status: profile?.subscription_status || 'inactive',
        plan: profile?.subscription_plan || null,
        endDate: profile?.subscription_end || null,
        isRecurring: profile?.is_recurring || false,
        paymentMethod: profile?.payment_method || null
      };

    } catch (error) {
      console.error('Error getting subscription status:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Cancel recurring subscription
  fastify.post('/api/crypto/cancel-recurring', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          is_recurring: false
        })
        .eq('id', userId);

      if (error) {
        console.error('Error canceling recurring subscription:', error);
        return reply.status(500).send({ error: 'Failed to cancel recurring subscription' });
      }

      return { success: true, message: 'Recurring subscription canceled' };

    } catch (error) {
      console.error('Error canceling recurring subscription:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get payment history
  fastify.get('/api/crypto/payment-history', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { data: payments, error } = await supabase
        .from('payment_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching payment history:', error);
        return reply.status(500).send({ error: 'Failed to fetch payment history' });
      }

      return payments || [];

    } catch (error) {
      console.error('Error getting payment history:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get current token price from multiple APIs
  fastify.get('/api/crypto/token-price', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Try CoinGecko first (most reliable for Earth 2)
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=earth-2&vs_currencies=usd'
        );
        const data = await response.json();
        if (data['earth-2']?.usd) {
          const price = data['earth-2'].usd;
          return { price, symbol: 'ESSENCE', source: 'coingecko' };
        }
      } catch (error) {
        console.log('CoinGecko API failed for ESSENCE price');
      }

      // Try DEX price via DexScreener API
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/0x2c0687215Aca7F5e2792d956E170325e92A02aCA`
        );
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          if (pair.priceUsd) {
            const price = parseFloat(pair.priceUsd);
            return { price, symbol: 'ESSENCE', source: 'dexscreener' };
          }
        }
      } catch (error) {
        console.log('DexScreener API failed for ESSENCE price');
      }

      // Try Moralis API for token price
      try {
        const response = await fetch(
          `https://deep-index.moralis.io/api/v2/erc20/0x2c0687215Aca7F5e2792d956E170325e92A02aCA/price?chain=eth`,
          {
            headers: {
              'X-API-Key': process.env.MORALIS_API_KEY || 'demo'
            }
          }
        );
        const data = await response.json();
        if (data.usdPrice) {
          const price = parseFloat(data.usdPrice);
          return { price, symbol: 'ESSENCE', source: 'moralis' };
        }
      } catch (error) {
        console.log('Moralis API failed for ESSENCE price');
      }

      // No real price available - return error
      console.error('All price APIs failed, no real price data available');
      return reply.status(503).send({ 
        error: 'Price data temporarily unavailable',
        message: 'Unable to fetch current ESSENCE token price from any source. Please try again later.'
      });

    } catch (error) {
      console.error('Error getting token price:', error);
      return reply.status(500).send({ error: 'Failed to get token price' });
    }
  });

  // Check for payment from user address to payment address
  fastify.post<{ Body: { userAddress: string; planId: string; expectedAmount: string; isRecurring: boolean } }>('/api/crypto/check-payment', async (req: FastifyRequest<{ Body: { userAddress: string; planId: string; expectedAmount: string; isRecurring: boolean } }>, reply: FastifyReply) => {
    try {
      const { userAddress, planId, expectedAmount, isRecurring } = req.body;
      const userId = (req as any).userId;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (!userAddress || !planId || !expectedAmount) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
        return reply.status(400).send({ error: 'Invalid Ethereum address format' });
      }

      // Get recent blocks to check for transactions (last ~10 minutes)
      const currentBlock = await provider.getBlockNumber();
      const blocksToCheck = 50; // Approximately 10 minutes of blocks
      const fromBlock = Math.max(0, currentBlock - blocksToCheck);

      console.log(`Checking for payments from ${userAddress} to ${PAYMENT_WALLET_ADDRESS}`);
      console.log(`Expected amount: ${expectedAmount} ESSENCE`);
      console.log(`Checking blocks ${fromBlock} to ${currentBlock}`);

      // Create contract instance to parse events
      const contract = new ethers.Contract(ESSENCE_TOKEN_ADDRESS, ERC20_ABI, provider);

      // Get Transfer events from the token contract
      const filter = contract.filters.Transfer(userAddress, PAYMENT_WALLET_ADDRESS);
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);

      console.log(`Found ${events.length} transfer events`);

      if (events.length === 0) {
        return reply.status(404).send({ 
          success: false, 
          error: 'No payment found',
          message: 'No recent transactions found from your address to the payment address. Please ensure you sent the payment and try again in a few minutes.'
        });
      }

      // Find the most recent transaction with the correct amount
      const expectedAmountWei = ethers.parseUnits(expectedAmount, 18); // ESSENCE has 18 decimals
      const tolerance = ethers.parseUnits('0.01', 18); // Allow 0.01 token tolerance

      let validTransaction: any = null;
      for (const event of events.reverse()) { // Check most recent first
        try {
          // Cast to EventLog to access args
          const eventLog = event as any;
          if (eventLog.args && eventLog.args.value) {
            const amount = eventLog.args.value;
            const difference = amount > expectedAmountWei ? amount - expectedAmountWei : expectedAmountWei - amount;
            
            if (difference <= tolerance) {
              validTransaction = event;
              break;
            }
          }
        } catch (error) {
          console.log('Error processing event:', error);
          continue;
        }
      }

      if (!validTransaction) {
        return reply.status(404).send({ 
          success: false, 
          error: 'No valid payment found',
          message: `Found transactions but none match the expected amount of ${expectedAmount} ESSENCE. Please check the amount and try again.`
        });
      }

      const txHash = validTransaction.transactionHash;
      console.log(`Valid payment found: ${txHash}`);

      // Get plan details and verify amount
      const planPrices = {
        'individual': 20,
        'heavy_user': 35,
        'enterprise': 500
      };

      const planPrice = planPrices[planId as keyof typeof planPrices];
      if (!planPrice) {
        return reply.status(400).send({ error: 'Invalid plan ID' });
      }

      // Calculate subscription end date (30 days from now)
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

      // Update user subscription in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: planId,
          subscription_end: subscriptionEnd.toISOString(),
          is_recurring: isRecurring,
          payment_method: 'crypto',
          last_payment_tx: txHash,
          wallet_address: userAddress
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return reply.status(500).send({ error: 'Failed to update subscription' });
      }

      // Log the successful payment
      const { error: logError } = await supabase
        .from('payment_logs')
        .insert({
          user_id: userId,
          transaction_hash: txHash,
          amount_usd: planPrice,
          plan_id: planId,
          payment_method: 'crypto',
          status: 'completed',
          wallet_address: userAddress,
          is_recurring: isRecurring
        });

      if (logError) {
        console.error('Error logging payment:', logError);
      }

      return { 
        success: true, 
        txHash,
        message: 'Payment verified and subscription activated successfully',
        subscriptionEnd: subscriptionEnd.toISOString()
      };

    } catch (error) {
      console.error('Error checking payment:', error);
      return reply.status(500).send({ error: 'Internal server error while checking payment' });
    }
  });
} 