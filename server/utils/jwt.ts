import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'fallback-refresh-secret-change-in-production'

export interface JWTPayload {
  userId: string
  organizationId: string
  role: string
  email: string
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
}

// ============================================
// ACCESS TOKEN (Short-lived: 15 minutes)
// ============================================
export function generateAccessToken(payload: JWTPayload): string {
 return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

// ============================================
// REFRESH TOKEN (Long-lived: 7 days)
// ============================================
export function generateRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign({ userId, tokenId }, REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload
}

// ============================================
// UNIQUE TOKEN ID GENERATOR
// ============================================
export function generateTokenId(): string {
  return randomBytes(32).toString('hex')
}

// ============================================
// LEGACY: Keep for backward compatibility during migration
// ============================================
export function generateJWT(payload: JWTPayload): string {
  // This is now just a wrapper for generateAccessToken
  return generateAccessToken(payload)
}

export function verifyJWT(token: string): JWTPayload {
  return verifyAccessToken(token)
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}