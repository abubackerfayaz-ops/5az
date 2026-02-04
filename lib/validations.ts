import { z } from 'zod';

// Product validation schema
// Product validation schema (Variant-First)
export const productSchema = z.object({
    name: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
    slug: z.string().min(3),
    brand: z.string().default('5AZ'),
    categories: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
    attributes: z.array(z.object({
        name: z.string(),
        values: z.array(z.string())
    })),
    variants: z.array(z.object({
        sku: z.string().min(3),
        attributes: z.record(z.string()),
        price: z.object({
            amount: z.number().positive(),
            originalAmount: z.number().positive().optional(),
            currency: z.string().default('INR')
        }),
        inventory: z.object({
            quantity: z.number().int().min(0)
        }),
        images: z.array(z.object({
            url: z.string().url(),
            isPrimary: z.boolean().default(false)
        })).min(1),
        vendorPrice: z.number().optional()
    })).min(1),
    isActive: z.boolean().default(true),
    supplierUrl: z.string().url().optional()
}).strict();

// Order validation schema
export const orderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
        quantity: z.number().int().positive().max(100),
        size: z.string().min(1),
    })).min(1).max(50),
    shippingAddress: z.object({
        street: z.string().min(5).max(200),
        city: z.string().min(2).max(100),
        state: z.string().min(2).max(100),
        pincode: z.string().regex(/^[0-9]{6}$/),
        country: z.string().default('India'),
    }),
    guestInfo: z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        phone: z.string().regex(/^[6-9]\d{9}$/),
    }).optional(),
}).strict();

// Payment validation schema
export const paymentSchema = z.object({
    amount: z.number().positive().max(10000000), // Max 1 crore
    currency: z.enum(['INR', 'USD']),
}).strict();

// Payment verification schema
export const paymentVerifySchema = z.object({
    razorpay_order_id: z.string().min(10),
    razorpay_payment_id: z.string().min(10),
    razorpay_signature: z.string().min(40),
}).strict();

// User registration schema
export const userRegisterSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(100)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
}).strict();

// Coupon validation schema
export const couponSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    discountType: z.enum(['PERCENT', 'FLAT']),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().min(0).default(0),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive(),
    expiresAt: z.string().datetime(),
}).strict();
