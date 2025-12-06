// ============================================
// SERVER-SIDE AUTHENTICATION MIDDLEWARE
// ============================================
// Purpose: Verify JWT tokens on all API routes
// Runs on EVERY server request to /api/*

import { verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const url = event.path || event.node.req.url || ''

  // ============================================
  // Only authenticate /api/* routes
  // ============================================
  if (!url.startsWith('/api/')) {
    return // Skip non-API routes
  }

  // ============================================
  // Skip authentication for public routes
  // ============================================
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/accept-invitation',
  ]

  // Allow public routes without authentication
  const isPublicRoute = publicRoutes.some(route => url.startsWith(route))
  if (isPublicRoute) {
    return // Continue without authentication
  }

  // ============================================
  // Extract and verify JWT token
  // ============================================
  const authHeader = event.node.req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Authorization token required',
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    // Verify token (this will throw error if expired or invalid)
    const decoded = verifyToken(token)

    // ============================================
    // Attach user info to event context
    // ============================================
    // This makes user data available in API handlers via event.context.auth
    event.context.auth = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role,
      email: decoded.email,
    }

    // Continue to the API handler
  } catch (error: any) {
    // Token is invalid, expired, or verification failed
    throw createError({
      statusCode: 401,
      message: error.message || 'Invalid or expired token',
    })
  }
})