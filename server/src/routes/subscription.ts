import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import axios from 'axios';

const prisma = new PrismaClient();

// Email configuration (you'll need to set these environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate unique coupon code
function generateCouponCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(crypto.randomInt(0, characters.length));
  }
  return result;
}

// Verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not found in environment variables');
      return true; // Allow operation to continue if reCAPTCHA is not configured
    }

    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: secretKey,
        response: token
      }
    });

    return response.data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Determine subscription tier based on amount
function getTierFromAmount(amount: number): { tier: string, duration: number } {
  if (amount >= 50) return { tier: 'LIFETIME', duration: 36500 }; // 100 years
  if (amount >= 20) return { tier: 'PREMIUM', duration: 180 }; // 6 months
  if (amount >= 12) return { tier: 'PRO', duration: 90 }; // 3 months
  if (amount >= 5) return { tier: 'BASIC', duration: 30 }; // 1 month
  return { tier: 'FREE', duration: 0 };
}

export default async function subscriptionRoutes(fastify: FastifyInstance) {
  // BuyMeACoffee webhook endpoint
  fastify.post('/webhook/buymeacoffee', async (request, reply) => {
    try {
      const { 
        supporter_email, 
        supporter_name, 
        amount,
        transaction_id,
        currency = 'USD'
      } = request.body as any;

      // Validate webhook (you should verify this is actually from BMC)
      // Add webhook secret validation here if BMC supports it

      const { tier, duration } = getTierFromAmount(parseFloat(amount));
      
      // Generate coupon code
      const couponCode = generateCouponCode();
      
      // Create purchase record
      const purchase = await prisma.purchase.create({
        data: {
          bmcTransactionId: transaction_id,
          supporterEmail: supporter_email,
          supporterName: supporter_name,
          amount: parseFloat(amount),
          currency,
          tier: tier as any,
          processed: false
        }
      });

      // Create coupon code
      const coupon = await prisma.couponCode.create({
        data: {
          code: couponCode,
          tier: tier as any,
          duration,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
        }
      });

      // Send email with coupon code
      const emailHtml = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #4F46E5;">🎉 Thank you for supporting Entropy Tools!</h2>
          <p>Hi ${supporter_name || 'there'},</p>
          <p>Thank you for your generous support of $${amount}! Here's your exclusive access code:</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #1F2937; margin: 0;">Your Coupon Code</h3>
            <p style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 2px; margin: 10px 0;">
              ${couponCode}
            </p>
          </div>
          
          <div style="background: #EFF6FF; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
            <h4 style="color: #1E40AF; margin-top: 0;">Your Subscription Details:</h4>
            <ul style="color: #1F2937;">
              <li><strong>Tier:</strong> ${tier}</li>
              <li><strong>Duration:</strong> ${duration === 36500 ? 'Lifetime' : `${duration} days`}</li>
              <li><strong>Value:</strong> $${amount}</li>
            </ul>
          </div>
          
          <h3>🚀 How to Activate:</h3>
          <ol style="color: #374151;">
            <li>Visit <a href="https://entropy-tools.vercel.app/activate" style="color: #4F46E5;">https://entropy-tools.vercel.app/activate</a></li>
            <li>Enter your coupon code: <strong>${couponCode}</strong></li>
            <li>Enjoy premium features!</li>
          </ol>
          
          <p style="background: #FEF3C7; padding: 10px; border-radius: 6px; color: #92400E;">
            <strong>⏰ Important:</strong> This code expires in 7 days and can only be used once.
          </p>
          
          <p>If you have any issues, feel free to reach out!</p>
          <p>Best regards,<br>The Entropy Tools Team</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: supporter_email,
        subject: '🎁 Your Entropy Tools Access Code',
        html: emailHtml
      });

      // Mark purchase as processed
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { processed: true, couponCodeId: coupon.id }
      });

      return { success: true, couponCode };
    } catch (error) {
      console.error('Webhook error:', error);
      reply.status(500);
      return { error: 'Failed to process purchase' };
    }
  });

  // Validate and activate coupon code
  fastify.post('/activate-coupon', async (request, reply) => {
    try {
      const { code, userEmail, recaptchaToken } = request.body as { 
        code: string; 
        userEmail: string; 
        recaptchaToken?: string; 
      };

      if (!code || !userEmail) {
        reply.status(400);
        return { error: 'Code and email are required' };
      }

      // Verify reCAPTCHA if token is provided
      if (recaptchaToken) {
        const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
        if (!isValidRecaptcha) {
          reply.status(400);
          return { error: 'reCAPTCHA verification failed. Please try again.' };
        }
      }

      // Find the coupon
      const coupon = await prisma.couponCode.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (!coupon) {
        reply.status(404);
        return { error: 'Invalid coupon code' };
      }

      if (coupon.used) {
        reply.status(400);
        return { error: 'This coupon has already been used' };
      }

      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        reply.status(400);
        return { error: 'This coupon has expired' };
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: userEmail }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            subscriptionTier: 'FREE'
          }
        });
      }

      // Calculate subscription end date
      let subscriptionEnds: Date | null = null;
      if (coupon.tier !== 'LIFETIME') {
        const currentEnd = user.subscriptionEnds || new Date();
        const startDate = currentEnd > new Date() ? currentEnd : new Date();
        subscriptionEnds = new Date(startDate.getTime() + coupon.duration * 24 * 60 * 60 * 1000);
      }

      // Update user subscription
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: coupon.tier as any,
          subscriptionEnds: subscriptionEnds
        }
      });

      // Mark coupon as used
      await prisma.couponCode.update({
        where: { id: coupon.id },
        data: {
          used: true,
          usedBy: user.id,
          usedAt: new Date()
        }
      });

      return {
        success: true,
        message: 'Coupon activated successfully!',
        subscription: {
          tier: coupon.tier,
          duration: coupon.duration,
          endsAt: subscriptionEnds
        }
      };
    } catch (error) {
      console.error('Activation error:', error);
      reply.status(500);
      return { error: 'Failed to activate coupon' };
    }
  });

  // Check user subscription status
  fastify.get('/status/:email', async (request, reply) => {
    try {
      const { email } = request.params as { email: string };

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          tier: 'FREE',
          active: false,
          endsAt: null
        };
      }

      const isActive = user.subscriptionTier === 'LIFETIME' || 
                      (user.subscriptionEnds && new Date() < user.subscriptionEnds);

      return {
        tier: user.subscriptionTier,
        active: isActive,
        endsAt: user.subscriptionEnds
      };
    } catch (error) {
      console.error('Status check error:', error);
      reply.status(500);
      return { error: 'Failed to check status' };
    }
  });

  // Admin: Generate manual coupon (for testing or special cases)
  fastify.post('/admin/generate-coupon', async (request, reply) => {
    try {
      const { tier, duration, adminKey } = request.body as any;

      // Simple admin authentication (you should use proper auth)
      if (adminKey !== process.env.ADMIN_SECRET) {
        reply.status(401);
        return { error: 'Unauthorized' };
      }

      const couponCode = generateCouponCode();
      
      const coupon = await prisma.couponCode.create({
        data: {
          code: couponCode,
          tier: tier as any,
          duration: parseInt(duration),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      return { success: true, couponCode };
    } catch (error) {
      console.error('Admin generation error:', error);
      reply.status(500);
      return { error: 'Failed to generate coupon' };
    }
  });

  // Admin: List all coupons
  fastify.get('/admin/coupons', async (request, reply) => {
    try {
      const { adminKey } = request.query as { adminKey: string };

      if (adminKey !== process.env.ADMIN_SECRET) {
        reply.status(401);
        return { error: 'Unauthorized' };
      }

      const coupons = await prisma.couponCode.findMany({
        include: {
          user: {
            select: { email: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return coupons;
    } catch (error) {
      console.error('Admin list error:', error);
      reply.status(500);
      return { error: 'Failed to fetch coupons' };
    }
  });
} 