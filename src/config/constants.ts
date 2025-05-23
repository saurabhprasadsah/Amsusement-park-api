require('dotenv').config();

export const AUTH_TOKEN_KEY = process.env.AUTH_TOKEN_KEY;
export const SESSION_TOKEN_KEY = process.env.SESSION_TOKEN_KEY;
export const FORGET_JWT_KEY = process.env.FORGET_JWT_KEY;
export const JWT_ALGO = process.env.JWT_ALGO || 'ES384';

export const DB = process.env.DB || '';

export const EMAIL = process.env.EMAIL;
export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;