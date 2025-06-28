import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { 
  calculateTokenAmount,
  getTokenPrice,
  formatAddress,
  PAYMENT_WALLET_ADDRESS,
  SubscriptionPlan
} from '../services/cryptoService';

interface CryptoPaymentProps {
  plan: SubscriptionPlan;
  onPaymentSuccess: (txHash: string, isRecurring: boolean) => void;
  onCancel: () => void;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({ plan, onPaymentSuccess, onCancel }) => {
  const [step, setStep] = useState<'address' | 'payment' | 'processing'>('address');
  const [userAddress, setUserAddress] = useState<string>('');
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [tokenAmount, setTokenAmount] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [checkingPayment, setCheckingPayment] = useState<boolean>(false);

  useEffect(() => {
    initializePayment();
  }, [plan]);

  const initializePayment = async () => {
    try {
      const price = await getTokenPrice();
      setTokenPrice(price);
      
      const amount = calculateTokenAmount(plan.price, price);
      setTokenAmount(amount);
    } catch (error) {
      console.error('Error initializing payment:', error);
      setError('Failed to load current ESSENCE price. Please try again.');
    }
  };

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddressSubmit = () => {
    if (!validateAddress(userAddress)) {
      setError('Please enter a valid Ethereum address (0x...)');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handleCheckPayment = async () => {
    setCheckingPayment(true);
    setError('');
    
    try {
      // Call backend to check for recent transactions from user address to payment address
      const response = await fetch('/api/crypto/check-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          userAddress,
          planId: plan.id,
          expectedAmount: tokenAmount,
          isRecurring
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment verification failed');
      }

      const result = await response.json();
      
      if (result.success && result.txHash) {
        onPaymentSuccess(result.txHash, isRecurring);
      } else {
        setError('No valid payment found. Please ensure you sent the correct amount to the payment address.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify payment. Please try again.');
    } finally {
      setCheckingPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  if (step === 'address') {
    return (
      <div className="max-w-md mx-auto bg-white/20 backdrop-blur-md rounded-xl p-8 border border-white/30">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Crypto Payment</h3>
          <p className="text-white/80">
            Subscribe to <span className="font-semibold text-emerald-300">{plan.name}</span> plan
          </p>
          <div className="mt-4 p-4 bg-black/20 rounded-lg">
            <div className="text-sm text-white/60">Total Amount</div>
            <div className="text-2xl font-bold text-white">${plan.price}/month</div>
            <div className="text-sm text-emerald-300">≈ {tokenAmount} ESSENCE</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Your Ethereum Wallet Address
            </label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-white/60 text-xs mt-1">
              This is the address you'll send the payment from
            </p>
          </div>

          <button
            onClick={handleAddressSubmit}
            disabled={!userAddress.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Payment
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full mt-4 text-white/60 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md rounded-xl p-8 border border-white/30">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Send Payment</h3>
          <p className="text-white/80">
            Send ESSENCE tokens to complete your subscription
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="space-y-6">
            <div className="bg-black/20 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-4">Payment Details</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-sm">Amount to Send</label>
                  <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 mt-1">
                    <span className="text-white font-mono">{tokenAmount} ESSENCE</span>
                    <button
                      onClick={() => copyToClipboard(tokenAmount)}
                      className="text-emerald-300 hover:text-emerald-200 text-xs"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm">Send To Address</label>
                  <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 mt-1">
                    <span className="text-white font-mono text-sm">{formatAddress(PAYMENT_WALLET_ADDRESS)}</span>
                    <button
                      onClick={() => copyToClipboard(PAYMENT_WALLET_ADDRESS)}
                      className="text-emerald-300 hover:text-emerald-200 text-xs"
                    >
                      Copy Full
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm">Your Address</label>
                  <div className="bg-black/20 rounded-lg p-3 mt-1">
                    <span className="text-white font-mono text-sm">{formatAddress(userAddress)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-4">Recurring Payments</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recurring"
                    checked={!isRecurring}
                    onChange={() => setIsRecurring(false)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-white/80">One-time payment only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recurring"
                    checked={isRecurring}
                    onChange={() => setIsRecurring(true)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-white/80">Enable auto-renewal (manual for now)</span>
                </label>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <QRCode 
                value={PAYMENT_WALLET_ADDRESS}
                size={200}
                level="M"
              />
            </div>
            <p className="text-white/60 text-sm text-center mb-6">
              Scan with your wallet app to send payment
            </p>

            <button
              onClick={handleCheckPayment}
              disabled={checkingPayment}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {checkingPayment ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Checking Payment...
                </div>
              ) : (
                'I\'ve Sent the Payment'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep('address')}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CryptoPayment; 