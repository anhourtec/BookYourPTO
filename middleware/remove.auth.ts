// ============================================
// SERVER-SIDE AUTHENTICATION MIDDLEWARE
// ============================================
// Runs on ALL /api/* requests
// Verifies JWT access tokens and attaches user info to event.context.auth

import { verifyAccessToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const path = event.node.req.url || ''

  // ============================================
  // SKIP AUTH FOR PUBLIC ROUTES
  // ============================================
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',  // ← IMPORTANT: Allow refresh endpoint
    '/api/auth/verify-email',
    '/api/auth/reset-password',
    '/api/auth/forgot-password',
  ]

  if (publicRoutes.some(route => path.startsWith(route))) {
    return // Skip authentication
  }

  // ============================================
  // EXTRACT TOKEN FROM AUTHORIZATION HEADER
  // ============================================
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No authorization header found for:', path)
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - No token provided',
    })
  }

  const token = authHeader.replace('Bearer ', '')

  // ============================================
  // VERIFY ACCESS TOKEN (NOT REFRESH TOKEN!)
  // ============================================
  try {
    const decoded = verifyAccessToken(token) // ← Use verifyAccessToken, NOT verifyJWT
    
    // Attach user info to event context for API handlers
    event.context.auth = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role,
      email: decoded.email,
    }

    console.log('✅ Token verified for user:', decoded.email)
  } catch (error: any) {
    console.log('❌ Token verification failed:', error.message)
    
    // Return 401 for invalid or expired tokens
    throw createError({
      statusCode: 401,
      message: error.message === 'jwt expired' 
        ? 'Access token expired' 
        : 'Invalid access token',
    })
  }
})