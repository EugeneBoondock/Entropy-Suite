import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';
import CryptoPayment from '../components/CryptoPayment';
import { SUBSCRIPTION_PLANS, SubscriptionPlan, getTokenPrice, calculateTokenAmount } from '../services/cryptoService';

const Pricing: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceSource, setPriceSource] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTokenPrice();
    checkUser();
    
    // Refresh price every 30 seconds
    const interval = setInterval(fetchTokenPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchTokenPrice = async () => {
    setPriceLoading(true);
    setPriceError('');
    try {
      const price = await getTokenPrice();
      setTokenPrice(price);
      
      // Also try to get source info from backend
      try {
        const response = await fetch('/api/crypto/token-price');
        if (response.ok) {
          const data = await response.json();
          setPriceSource(data.source || 'api');
          if (data.warning) {
            console.warn('Price API warning:', data.warning);
          }
        }
      } catch (error) {
        setPriceSource('external');
      }
    } catch (error) {
      console.error('Error fetching token price:', error);
      setPriceError(error instanceof Error ? error.message : 'Failed to fetch token price');
      setTokenPrice(0);
      setPriceSource('error');
    } finally {
      setPriceLoading(false);
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    setSelectedPlan(plan);
    setShowCryptoPayment(true);
  };

  const handlePaymentSuccess = (txHash: string, isRecurring: boolean) => {
    setShowCryptoPayment(false);
    setSelectedPlan(null);
    
    // Show success message and redirect to dashboard
    alert(`Payment successful! Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-10)}\n${isRecurring ? 'Auto-pay enabled' : 'Manual payments only'}`);
    window.location.href = '/dashboard';
  };

  const handlePaymentCancel = () => {
    setShowCryptoPayment(false);
    setSelectedPlan(null);
  };

  if (showCryptoPayment && selectedPlan) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/images/bg_image.png)' }}
      >
        <div className="min-h-screen bg-black/10">
          <Navbar />
          <div className="pt-20 pb-16">
            <CryptoPayment
              plan={selectedPlan}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/bg_image.png)' }}
    >
      <div className="min-h-screen bg-black/10">
        <Navbar />
        
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white sm:text-5xl">
                Crypto-Powered Subscriptions
              </h1>
              <p className="mt-4 text-xl text-white/80">
                Pay with Earth 2 Essence tokens for seamless access
              </p>
              <div className="mt-6 flex items-center justify-center space-x-4">
                <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white/30">
                  <span className="text-white/80 text-sm">ESSENCE Price: </span>
                  {priceLoading ? (
                    <span className="text-white font-semibold">Loading...</span>
                  ) : priceError ? (
                    <span className="text-red-300 font-semibold">Error</span>
                  ) : tokenPrice > 0 ? (
                    <span className="text-white font-semibold">${tokenPrice.toFixed(4)}</span>
                  ) : (
                    <span className="text-yellow-300 font-semibold">Unavailable</span>
                  )}
                  {priceSource && !priceLoading && !priceError && (
                    <span className="text-white/60 text-xs ml-2">
                      ({priceSource === 'coingecko' ? 'CoinGecko' :
                        priceSource === 'dexscreener' ? 'DexScreener' :
                        priceSource === 'moralis' ? 'Moralis' :
                        priceSource === 'external' ? 'Live' : 'API'})
                    </span>
                  )}
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white/30">
                  <span className="text-white/80 text-sm">Network: </span>
                  <span className="text-green-300 font-semibold">Ethereum</span>
                </div>
                <button
                  onClick={fetchTokenPrice}
                  disabled={priceLoading}
                  className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 border border-white/30 hover:bg-white/30 transition-colors disabled:opacity-50"
                  title="Refresh Price"
                >
                  <svg 
                    className={`w-4 h-4 text-white ${priceLoading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              {priceError && (
                <div className="mt-4 bg-red-500/20 backdrop-blur-md rounded-lg px-4 py-3 border border-red-500/30">
                  <p className="text-red-200 text-sm text-center">
                    ⚠️ {priceError}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const tokenAmount = tokenPrice > 0 ? calculateTokenAmount(plan.price, tokenPrice) : '0';
                const canSubscribe = tokenPrice > 0 && !priceError;
                
                return (
                  <div 
                    key={plan.id}
                    className={`bg-white/20 backdrop-blur-md rounded-xl p-8 border border-white/30 ${
                      plan.recommended ? 'ring-2 ring-emerald-400 relative' : ''
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                        <span className="text-white/60">/month</span>
                      </div>
                      <div className="mt-2 text-emerald-300 font-semibold">
                        {priceLoading ? (
                          <span className="animate-pulse">Calculating...</span>
                        ) : priceError ? (
                          <span className="text-red-300">Price unavailable</span>
                        ) : tokenAmount !== '0' ? (
                          <>≈ {tokenAmount} ESSENCE</>
                        ) : (
                          <span className="text-yellow-300">Calculating...</span>
                        )}
                      </div>
                    </div>
                    
                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-white/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-8">
                      <button
                        onClick={() => canSubscribe && handleSubscribe(plan)}
                        disabled={!canSubscribe}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                          !canSubscribe
                            ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                            : plan.recommended
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                        }`}
                      >
                        {!user ? 'Login to Subscribe' : 
                         !canSubscribe ? 'Price Loading...' : 
                         'Subscribe with ESSENCE'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Crypto Features Section */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Why Crypto Subscriptions?
                </h2>
                <p className="text-white/80 text-lg">
                  Experience the future of payments with blockchain technology
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Decentralized</h3>
                  <p className="text-white/80">
                    No intermediaries, no chargebacks. Direct peer-to-peer transactions on the blockchain.
                  </p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.27 5.82 22 7 13.87 2 9l6.91-.74L12 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Smart Contracts</h3>
                  <p className="text-white/80">
                    Automated recurring payments with transparent, auditable smart contracts.
                  </p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">QR Payments</h3>
                  <p className="text-white/80">
                    Instant payments with QR codes. No need to manually enter wallet addresses.
                  </p>
                </div>
              </div>
            </div>

            {/* Token Information */}
            <div className="mt-20">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 border border-white/30">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Earth 2 Essence Token
                  </h2>
                  <p className="text-white/80 text-lg">
                    Our preferred payment method for subscriptions
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Token Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/80">Contract:</span>
                        <span className="text-purple-300 font-mono text-sm">0x2c0...aCA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Network:</span>
                        <span className="text-white">Ethereum Mainnet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Symbol:</span>
                        <span className="text-white">ESSENCE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Decimals:</span>
                        <span className="text-white">18</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Payment Address</h3>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-xs text-white/60 mb-2">Send ESSENCE to:</div>
                      <div className="font-mono text-sm text-white break-all">
                        0x7a82906cf62447aaaff84e7a1f58615d317c3eb9
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-white/60">
                      ⚠️ Only send ESSENCE tokens to this address. Sending other tokens may result in permanent loss.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-white/80 text-lg">
                  Answers to common questions about crypto subscriptions
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    How do I get ESSENCE tokens?
                  </h3>
                  <p className="text-white/80">
                    You can purchase ESSENCE tokens on decentralized exchanges like Uniswap or centralized exchanges that list the token.
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Are recurring payments automatic?
                  </h3>
                  <p className="text-white/80">
                    Yes, if you enable auto-pay, our smart contract will automatically deduct the monthly fee from your wallet.
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Can I cancel my subscription?
                  </h3>
                  <p className="text-white/80">
                    Yes, you can disable auto-pay at any time. You'll retain access until the end of your current billing period.
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    What wallets are supported?
                  </h3>
                  <p className="text-white/80">
                    We support MetaMask, WalletConnect, and any Web3 wallet that can interact with Ethereum smart contracts.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="mt-20 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Need Help?
              </h2>
              <p className="text-white/80 mb-8">
                Our support team is here to help you with crypto payments and subscriptions.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/contact"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
