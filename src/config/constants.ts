require('dotenv').config()

export const AUTH_TOKEN_KEY = process.env.AUTH_TOKEN_KEY
export const SESSION_TOKEN_KEY = process.env.SESSION_TOKEN_KEY
export const FORGET_JWT_KEY = process.env.FORGET_JWT_KEY
export const JWT_ALGO = process.env.JWT_ALGO || "ES384"

export const DB = process.env.DB || ''