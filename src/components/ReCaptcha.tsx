import React, { useRef, useCallback, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onError?: () => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal' | 'invisible';
  className?: string;
  version?: 'v2' | 'v3';
  action?: string; // For v3
}

// reCAPTCHA v3 Component
const ReCaptchaV3: React.FC<ReCaptchaProps> = ({
  onVerify,
  onError,
  action = 'submit',
  className = ''
}) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleExecute = useCallback(async () => {
    if (!executeRecaptcha) {
      console.error('reCAPTCHA v3 not ready');
      onError?.();
      return;
    }

    try {
      const token = await executeRecaptcha(action);
      onVerify(token);
    } catch (error) {
      console.error('reCAPTCHA v3 error:', error);
      onError?.();
    }
  }, [executeRecaptcha, action, onVerify, onError]);

  useEffect(() => {
    // Auto-execute for v3 (invisible)
    handleExecute();
  }, [handleExecute]);

  return (
    <div className={className}>
      <div className="text-xs text-gray-500 mt-2">
        This site is protected by reCAPTCHA and the Google{' '}
        <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="https://policies.google.com/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </a>{' '}
        apply.
      </div>
    </div>
  );
};

// reCAPTCHA v2 Component
const ReCaptchaV2: React.FC<ReCaptchaProps> = ({
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
    console.error('reCAPTCHA v2 error occurred');
    onError?.();
  }, [onError]);

  const handleExpired = useCallback(() => {
    console.warn('reCAPTCHA v2 expired');
    onExpired?.();
  }, [onExpired]);

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

// Main ReCaptcha Component
const ReCaptcha: React.FC<ReCaptchaProps> = ({
  version = 'v3',
  ...props
}) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn('reCAPTCHA site key not found. Please set VITE_RECAPTCHA_SITE_KEY in your environment variables.');
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-md ${props.className}`}>
        <p className="text-yellow-800 text-sm">
          ⚠️ reCAPTCHA is not configured. Please contact the administrator.
        </p>
      </div>
    );
  }

  if (version === 'v3') {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
        <ReCaptchaV3 {...props} />
      </GoogleReCaptchaProvider>
    );
  }

  return <ReCaptchaV2 {...props} />;
};

export default ReCaptcha; 