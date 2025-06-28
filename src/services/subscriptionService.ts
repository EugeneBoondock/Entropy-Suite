interface SubscriptionStatus {
  tier: 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM' | 'LIFETIME';
  active: boolean;
  endsAt: string | null;
}

interface ActivationResponse {
  success: boolean;
  message?: string;
  error?: string;
  subscription?: {
    tier: string;
    duration: number;
    endsAt: string | null;
  };
}

class SubscriptionService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:4000';

  async checkSubscriptionStatus(email: string): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Return free tier on error
      return {
        tier: 'FREE',
        active: false,
        endsAt: null
      };
    }
  }

  async activateCoupon(code: string, email: string): Promise<ActivationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/activate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          userEmail: email
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error activating coupon:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Check if user has access to premium features
  isPremiumUser(tier: string): boolean {
    return ['BASIC', 'PRO', 'PREMIUM', 'LIFETIME'].includes(tier);
  }

  // Check if subscription is still active
  isSubscriptionActive(status: SubscriptionStatus): boolean {
    if (status.tier === 'LIFETIME') return true;
    if (!status.endsAt) return false;
    
    const endDate = new Date(status.endsAt);
    const now = new Date();
    return endDate > now;
  }

  // Get days remaining in subscription
  getDaysRemaining(endsAt: string | null): number | null {
    if (!endsAt) return null;
    
    const endDate = new Date(endsAt);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  // Format subscription display info
  formatSubscriptionInfo(status: SubscriptionStatus) {
    const { tier, active, endsAt } = status;

    if (tier === 'FREE') {
      return {
        displayName: 'Free',
        description: 'Basic access to tools',
        color: 'text-gray-600',
        badge: 'bg-gray-100'
      };
    }

    if (tier === 'LIFETIME') {
      return {
        displayName: 'Lifetime',
        description: 'Forever access',
        color: 'text-green-600',
        badge: 'bg-green-100'
      };
    }

    const daysRemaining = this.getDaysRemaining(endsAt);
    const isExpiring = daysRemaining !== null && daysRemaining <= 7;

    return {
      displayName: tier.charAt(0) + tier.slice(1).toLowerCase(),
      description: active 
        ? `${daysRemaining} days remaining` 
        : 'Expired',
      color: active 
        ? (isExpiring ? 'text-yellow-600' : 'text-blue-600')
        : 'text-red-600',
      badge: active 
        ? (isExpiring ? 'bg-yellow-100' : 'bg-blue-100')
        : 'bg-red-100'
    };
  }

  // Local storage for caching subscription status
  private readonly CACHE_KEY = 'subscription_status';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  getCachedStatus(email: string): SubscriptionStatus | null {
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY}_${email}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(`${this.CACHE_KEY}_${email}`);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  setCachedStatus(email: string, status: SubscriptionStatus): void {
    try {
      const cached = {
        data: status,
        timestamp: Date.now()
      };
      localStorage.setItem(`${this.CACHE_KEY}_${email}`, JSON.stringify(cached));
    } catch (error) {
      console.warn('Failed to cache subscription status:', error);
    }
  }

  async getSubscriptionStatus(email: string, useCache = true): Promise<SubscriptionStatus> {
    if (useCache) {
      const cached = this.getCachedStatus(email);
      if (cached) return cached;
    }

    const status = await this.checkSubscriptionStatus(email);
    this.setCachedStatus(email, status);
    return status;
  }
}

export const subscriptionService = new SubscriptionService();
export type { SubscriptionStatus, ActivationResponse }; 