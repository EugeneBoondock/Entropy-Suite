import React, { useState, useEffect } from 'react';

interface Coupon {
  id: string;
  code: string;
  tier: string;
  duration: number;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
  expiresAt?: string;
  user?: {
    email: string;
    name?: string;
  };
}

const AdminPage: React.FC = () => {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate coupon form state
  const [generateForm, setGenerateForm] = useState({
    tier: 'BASIC',
    duration: '30'
  });

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:4000';

  const handleLogin = () => {
    if (adminKey.trim()) {
      setAuthenticated(true);
      loadCoupons();
    }
  };

  const loadCoupons = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${baseUrl}/admin/coupons?adminKey=${encodeURIComponent(adminKey)}`
      );

      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load coupons');
        if (response.status === 401) {
          setAuthenticated(false);
        }
      }
    } catch (err) {
      setError('Network error loading coupons');
    } finally {
      setLoading(false);
    }
  };

  const generateCoupon = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${baseUrl}/admin/generate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: generateForm.tier,
          duration: generateForm.duration,
          adminKey
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Generated coupon: ${data.couponCode}`);
        loadCoupons(); // Refresh the list
      } else {
        setError(data.error || 'Failed to generate coupon');
      }
    } catch (err) {
      setError('Network error generating coupon');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-blue-100 text-blue-800';
      case 'PRO':
        return 'bg-purple-100 text-purple-800';
      case 'PREMIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LIFETIME':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    const total = coupons.length;
    const used = coupons.filter(c => c.used).length;
    const unused = total - used;
    const expired = coupons.filter(c => 
      c.expiresAt && new Date(c.expiresAt) < new Date() && !c.used
    ).length;

    return { total, used, unused, expired };
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admin Dashboard
          </h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                id="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter admin key"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Admin</h1>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Coupons</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Used</h3>
            <p className="text-3xl font-bold text-green-600">{stats.used}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Unused</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.unused}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Expired</h3>
            <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
          </div>
        </div>

        {/* Generate Coupon Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Tier
              </label>
              <select
                value={generateForm.tier}
                onChange={(e) => setGenerateForm({ ...generateForm, tier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BASIC">Basic (1 month)</option>
                <option value="PRO">Pro (3 months)</option>
                <option value="PREMIUM">Premium (6 months)</option>
                <option value="LIFETIME">Lifetime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                value={generateForm.duration}
                onChange={(e) => setGenerateForm({ ...generateForm, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="36500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateCoupon}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Coupon'}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">All Coupons</h2>
            <button
              onClick={loadCoupons}
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Used By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {coupon.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(coupon.tier)}`}>
                        {coupon.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.duration === 36500 ? 'Lifetime' : `${coupon.duration} days`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.used ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Used
                        </span>
                      ) : coupon.expiresAt && new Date(coupon.expiresAt) < new Date() ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.user?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(coupon.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {coupons.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No coupons found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 