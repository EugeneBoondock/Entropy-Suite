import React, { useRef, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onError?: () => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal' | 'invisible';
  className?: string;
}

const ReCaptcha: React.FC<ReCaptchaProps> = ({
  onVerify,
  onError,
  onExpired,
  theme = 'light',
  size = 'normal',
  className = ''
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const handleChange = useCallback((token: string | null) => {
    onVerify(token);
  }, [onVerify]);

  const handleError = useCallback(() => {
    console.error('reCAPTCHA error occurred');
    onError?.();
  }, [onError]);

  const handleExpired = useCallback(() => {
    console.warn('reCAPTCHA expired');
    onExpired?.();
  }, [onExpired]);

  const reset = useCallback(() => {
    recaptchaRef.current?.reset();
  }, []);

  // Expose useful methods to parent components
  const publicMethods = {
    reset,
    execute: () => recaptchaRef.current?.execute(),
    getResponse: () => recaptchaRef.current?.getValue()
  };

  if (!siteKey) {
    console.warn('reCAPTCHA site key not found. Please set VITE_RECAPTCHA_SITE_KEY in your environment variables.');
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-md ${className}`}>
        <p className="text-yellow-800 text-sm">
          ⚠️ reCAPTCHA is not configured. Please contact the administrator.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onErrored={handleError}
        onExpired={handleExpired}
        theme={theme}
        size={size}
      />
    </div>
  );
};

export default ReCaptcha; 