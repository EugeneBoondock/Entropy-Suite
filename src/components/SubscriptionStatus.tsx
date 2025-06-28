import React, { useState, useEffect } from 'react';
import { subscriptionService, SubscriptionStatus as Status } from '../services/subscriptionService';

interface SubscriptionStatusProps {
  userEmail?: string;
  showFullDetails?: boolean;
  className?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  userEmail, 
  showFullDetails = false,
  className = ''
}) => {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail) {
      loadSubscriptionStatus();
    }
  }, [userEmail]);

  const loadSubscriptionStatus = async () => {
    if (!userEmail) return;

    setLoading(true);
    setError(null);

    try {
      const subscriptionStatus = await subscriptionService.getSubscriptionStatus(userEmail);
      setStatus(subscriptionStatus);
    } catch (err) {
      setError('Failed to load subscription status');
      console.error('Error loading subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!userEmail) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
          Free Tier
        </div>
        <a 
          href="/activate" 
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Upgrade
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
          Error
        </div>
        <button 
          onClick={loadSubscriptionStatus}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const info = subscriptionService.formatSubscriptionInfo(status);
  const isActive = subscriptionService.isSubscriptionActive(status);
  const isPremium = subscriptionService.isPremiumUser(status.tier);

  if (!showFullDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`px-3 py-1 ${info.badge} ${info.color} rounded-full text-sm font-medium`}>
          {info.displayName}
        </div>
        {!isPremium && (
          <a 
            href="/activate" 
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Upgrade
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
        <div className={`px-3 py-1 ${info.badge} ${info.color} rounded-full text-sm font-medium`}>
          {info.displayName}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Access Level:</span>
          <span className="font-medium text-gray-900">
            {isPremium ? 'Premium Features' : 'Basic Features'}
          </span>
        </div>

        {status.endsAt && status.tier !== 'LIFETIME' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {isActive ? 'Expires:' : 'Expired:'}
            </span>
            <span className="font-medium text-gray-900">
              {new Date(status.endsAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {status.tier === 'LIFETIME' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-green-600">Forever! 🎊</span>
          </div>
        )}
      </div>

      {!isPremium && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready to upgrade?</p>
              <p className="text-xs text-gray-500">Get access to premium features</p>
            </div>
            <a 
              href="/activate"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Activate Code
            </a>
          </div>
        </div>
      )}

      {isPremium && !isActive && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Subscription expired</p>
              <p className="text-xs text-gray-500">Renew to continue premium access</p>
            </div>
            <a 
              href="https://coff.ee/eugeneboondock"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Renew
            </a>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={loadSubscriptionStatus}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default SubscriptionStatus; 