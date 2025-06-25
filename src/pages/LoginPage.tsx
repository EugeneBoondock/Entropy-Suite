import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Magic link sent! Check your inbox.');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f0e4]">
      <Navbar />
      <main className="flex-1 flex justify-center items-center p-4">
        <div className="bg-white border border-[#382f29] rounded-md p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center text-[#382f29]">Login / Sign Up</h1>
          {error && (
            <div className="bg-red-200 text-red-800 p-2 rounded mb-4 text-sm">{error}</div>
          )}
          {message && (
            <div className="bg-green-200 text-green-800 p-2 rounded mb-4 text-sm">{message}</div>
          )}
          <input
            type="email"
            className="w-full p-3 border border-[#382f29] rounded-md mb-3"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleSendLink}
            disabled={loading}
            className="w-full bg-[#e67722] text-[#382f29] font-bold py-2 rounded-md mb-4 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleOAuth('github')}
              className="w-full border border-[#382f29] py-2 rounded-md hover:bg-[#b8a99d] text-[#382f29]"
            >
              Continue with GitHub
            </button>
            <button
              onClick={() => handleOAuth('google')}
              className="w-full border border-[#382f29] py-2 rounded-md hover:bg-[#b8a99d] text-[#382f29]"
            >
              Continue with Google
            </button>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 text-sm text-[#5d4633] underline"
          >
            Go back
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage; 