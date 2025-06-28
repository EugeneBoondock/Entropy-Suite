import React, { useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';

const ActivatePage: React.FC = () => {
  const [couponCode, setCouponCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = await subscriptionService.activateCoupon(couponCode, email);

      if (data.success) {
        setSuccess(true);
        setMessage(data.message || 'Coupon activated successfully!');
        setSubscriptionInfo(data.subscription);
        setCouponCode('');
      } else {
        setSuccess(false);
        setMessage(data.error || 'Failed to activate coupon');
      }
    } catch (error) {
      setSuccess(false);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTierDetails = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return { name: 'Basic', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'PRO':
        return { name: 'Pro', color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'PREMIUM':
        return { name: 'Premium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'LIFETIME':
        return { name: 'Lifetime', color: 'text-green-600', bg: 'bg-green-50' };
      default:
        return { name: 'Free', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243A6 6 0 0121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Activate Your Subscription</h1>
            <p className="text-gray-600">Enter your coupon code to unlock premium features</p>
          </div>

          {/* Success Message */}
          {success && subscriptionInfo && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800">🎉 Activation Successful!</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-700">Subscription Tier:</span>
                  <span className={`font-semibold ${getTierDetails(subscriptionInfo.tier).color}`}>
                    {getTierDetails(subscriptionInfo.tier).name}
                  </span>
                </div>
                
                {subscriptionInfo.tier !== 'LIFETIME' && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Valid Until:</span>
                    <span className="font-semibold text-green-800">
                      {formatDate(subscriptionInfo.endsAt)}
                    </span>
                  </div>
                )}
                
                {subscriptionInfo.tier === 'LIFETIME' && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Duration:</span>
                    <span className="font-semibold text-green-800">Forever! 🎊</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-green-700 text-sm">
                  You can now access all premium features. Enjoy your enhanced Entropy Tools experience!
                </p>
              </div>
            </div>
          )}

          {/* Activation Form */}
          {!success && (
            <div className="backdrop-blur-sm bg-white/80 border border-white/20 rounded-xl p-6 shadow-lg">
              <form onSubmit={handleActivate} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors font-mono text-lg tracking-wider text-center"
                    placeholder="ABCD1234EFGH"
                    maxLength={12}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 12-character code from your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !couponCode || !email}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Activating...
                    </span>
                  ) : (
                    'Activate Subscription'
                  )}
                </button>
              </form>

              {message && (
                <div className={`mt-4 p-4 rounded-lg ${success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <p className="text-sm">{message}</p>
                </div>
              )}
            </div>
          )}

          {/* Subscription Tiers Info */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Tiers</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Basic ($5)</span>
                <span className="text-gray-600">1 month access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600 font-medium">Pro ($12)</span>
                <span className="text-gray-600">3 months access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600 font-medium">Premium ($20)</span>
                <span className="text-gray-600">6 months access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-medium">Lifetime ($50+)</span>
                <span className="text-gray-600">Forever access</span>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Having issues? Contact support at{' '}
              <a href="mailto:support@entropy-tools.com" className="text-indigo-600 hover:text-indigo-700">
                support@entropy-tools.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivatePage; 