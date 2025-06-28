# Entropy Tools Subscription System Setup

## 🎯 Overview

This implementation creates a complete subscription service using coupon codes from BuyMeACoffee purchases. Here's what we've built:

### ✅ What's Implemented

1. **Database Schema** - Users, Coupons, Purchases tracking
2. **Backend API** - Webhook handler, coupon activation, status checks
3. **Frontend Pages** - Activation page, admin dashboard
4. **Email System** - Automatic coupon delivery
5. **Subscription Service** - Status management and validation

## 🚀 Setup Instructions

### 1. Server Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/entropy_tools"

# Email Configuration (for sending coupon codes)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# Admin Configuration  
ADMIN_SECRET="your-super-secret-admin-key"

# Server Configuration
PORT=4000
NODE_ENV=development
```

### 2. Database Setup

```bash
cd server
npx prisma db push
npx prisma generate
```

### 3. Start the Server

```bash
cd server
npm run dev
```

### 4. Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an "App Password" 
3. Use the app password in `EMAIL_PASSWORD`

### 5. BuyMeACoffee Webhook Setup

**Important**: BuyMeACoffee may not support webhooks for all accounts. If webhooks aren't available:

1. **Option A**: Use the admin dashboard to manually generate codes
2. **Option B**: Set up a polling script to check BMC API periodically
3. **Option C**: Ask supporters to email you for manual processing

Webhook URL (if available): `https://your-domain.com/webhook/buymeacoffee`

## 💰 Subscription Tiers

| Amount | Tier | Duration | Features |
|--------|------|----------|----------|
| $5 | Basic | 1 month | Premium access |
| $12 | Pro | 3 months | Premium access |
| $20 | Premium | 6 months | Premium access |
| $50+ | Lifetime | Forever | Premium access |

## 🔑 How It Works

### Purchase Flow
1. User donates on BuyMeACoffee (@https://coff.ee/eugeneboondock)
2. Webhook triggers coupon generation (or manual admin generation)
3. Coupon code emailed to supporter
4. User activates code on `/activate` page
5. Subscription activated in database

### Coupon Code Format
- 12 characters: `ABCD1234EFGH`
- Alphanumeric uppercase
- Unique and secure
- 7-day expiration by default

## 📊 Admin Dashboard

Access: `/admin`

Features:
- View all coupons and statistics
- Generate manual coupons
- Track usage and expiration
- Monitor subscription analytics

## 🛠️ API Endpoints

### Public Endpoints
- `POST /activate-coupon` - Activate a coupon code
- `GET /status/:email` - Check subscription status

### Webhook
- `POST /webhook/buymeacoffee` - BMC webhook handler

### Admin Endpoints
- `POST /admin/generate-coupon` - Generate coupon manually
- `GET /admin/coupons` - List all coupons

## 🎨 Frontend Integration

### Activation Page
- Clean, modern UI
- Email + coupon code input
- Success/error handling
- Subscription tier display

### Subscription Status Component
```tsx
import SubscriptionStatus from './components/SubscriptionStatus';

<SubscriptionStatus 
  userEmail="user@example.com" 
  showFullDetails={true}
/>
```

### Service Usage
```tsx
import { subscriptionService } from './services/subscriptionService';

// Check if user has premium access
const status = await subscriptionService.getSubscriptionStatus(email);
const isPremium = subscriptionService.isPremiumUser(status.tier);
```

## 🔐 Security Features

- Secure coupon generation with crypto.randomInt
- Rate limiting recommended for activation endpoint
- Admin authentication via secret key
- Coupon expiration (7 days)
- One-time use validation
- Input sanitization and validation

## 📧 Email Template

Beautiful HTML email includes:
- Coupon code prominently displayed
- Subscription tier details
- Activation instructions
- Branding consistent with app

## 🚨 Important Notes

1. **Database Migration**: Run Prisma migrations in production
2. **Email Service**: Consider using a service like SendGrid for production
3. **Webhook Security**: Validate BMC webhook signatures if available
4. **CORS**: Configure for your domain in production
5. **Rate Limiting**: Implement on activation endpoint
6. **Monitoring**: Set up alerts for failed activations

## 🧪 Testing

### Manual Testing
1. Generate test coupon via admin dashboard
2. Activate on `/activate` page
3. Check status via subscription service
4. Verify email delivery

### Admin Access
- Use your `ADMIN_SECRET` to access `/admin`
- Generate test coupons for different tiers
- Monitor usage statistics

## 🔄 Production Deployment

1. Update `baseUrl` in subscription service for production API
2. Set up proper database (PostgreSQL recommended)
3. Configure email service for production
4. Set up monitoring and logging
5. Update CORS settings
6. Enable rate limiting
7. Set up SSL certificates

## 📈 Next Steps

- Implement webhook signature validation
- Add subscription renewal notifications
- Create usage analytics dashboard
- Add integration with more payment providers
- Implement subscription pause/resume functionality

## 🛟 Support

For users having issues:
- Check coupon expiration
- Verify email address matches
- Try refreshing subscription status
- Contact support email provided in activation page

This system provides a robust foundation for subscription management using the innovative BuyMeACoffee + coupon code approach! 