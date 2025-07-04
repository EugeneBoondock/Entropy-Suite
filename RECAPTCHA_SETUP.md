# reCAPTCHA Integration Setup

This document explains the reCAPTCHA integration implemented in the Entropy Tools application.

## Overview

reCAPTCHA v2 has been integrated into the following forms to prevent spam and automated abuse:

1. **Contact Form** (/contact) - High priority
2. **Coupon Activation Form** (/activate) - Protects subscription system  
3. **Magic Link Login** (/login) - Optional protection against email spam

## Environment Configuration

### Frontend (.env.local)
VITE_RECAPTCHA_SITE_KEY=6Lc0LHErAAAAAIiw4Gb9YvyOu8kPoXW3k2IpLxMg

### Backend (server/.env)
RECAPTCHA_SECRET_KEY=your_secret_key_here

**Important:** Replace your_secret_key_here with your actual reCAPTCHA secret key.

## Implementation Complete

The following components have been implemented:
- Reusable ReCaptcha component (src/components/ReCaptcha.tsx)
- Contact form with reCAPTCHA protection
- Activation form with reCAPTCHA protection  
- Login form with optional reCAPTCHA protection
- Server-side verification in subscription routes

## Next Steps

1. Replace 'your_secret_key_here' in .env.local with your actual secret key
2. Add the secret key to your server environment (server/.env)
3. Test the forms to ensure reCAPTCHA is working
4. Deploy with proper environment variables
