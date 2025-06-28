import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import ReCaptcha from '../components/ReCaptcha';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendLink = async () => {
    if (!email.trim()) return;
    
    // For magic links, reCAPTCHA is optional but recommended for heavy usage
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Magic link sent! Check your inbox.');
      setRecaptchaToken(null); // Reset reCAPTCHA after successful submission
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden"
      style={{ 
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Full page overlay for text readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      
      <div className="layout-container flex h-full grow flex-col relative z-10">
      <Navbar />
        {/* Spacer for fixed navbar */}
        <div className="h-16 sm:h-20"></div>
        
      <main className="flex-1 flex justify-center items-center p-4">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center text-[#382f29]">Login / Sign Up</h1>
          {error && (
            <div className="bg-red-100/60 backdrop-blur-sm text-red-900 p-3 rounded-lg mb-4 text-sm border border-red-300/50 shadow-sm">{error}</div>
          )}
          {message && (
            <div className="bg-green-100/60 backdrop-blur-sm text-green-900 p-3 rounded-lg mb-4 text-sm border border-green-300/50 shadow-sm">{message}</div>
          )}
          <input
            type="email"
            className="w-full p-3 border border-[#382f29]/30 rounded-lg mb-3 bg-white/70 backdrop-blur-sm focus:bg-white/90 focus:border-[#382f29]/50 transition-all duration-200"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          {/* reCAPTCHA */}
          <div className="mb-4">
            <ReCaptcha
              version="v3"
              action="login"
              onVerify={setRecaptchaToken}
              onError={() => setRecaptchaToken(null)}
              className="mb-2"
            />
          </div>
          
          <button
            onClick={handleSendLink}
            disabled={loading || !recaptchaToken}
            className="w-full bg-[#e67722]/90 backdrop-blur-sm text-[#382f29] font-bold py-3 rounded-lg mb-4 disabled:opacity-50 hover:bg-[#e67722] transition-all duration-200 shadow-lg"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleOAuth('github')}
              className="w-full border border-[#382f29]/30 py-3 rounded-lg hover:bg-[#b8a99d]/50 text-[#382f29] backdrop-blur-sm transition-all duration-200 shadow-md flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
            <button
              onClick={() => handleOAuth('google')}
              className="w-full border border-[#382f29]/30 py-3 rounded-lg hover:bg-[#b8a99d]/50 text-[#382f29] backdrop-blur-sm transition-all duration-200 shadow-md flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 text-sm text-[#5d4633] underline hover:text-[#382f29] transition-colors duration-200"
          >
            Go back
          </button>
        </div>
      </main>
    </div>
    </div>
  );
};

export default LoginPage; 