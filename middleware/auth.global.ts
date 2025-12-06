// ============================================
// CLIENT-SIDE AUTHENTICATION MIDDLEWARE
// ============================================
// Changes:
// 1. Added JWT token expiry validation
// 2. Auto-logout on expired tokens
// 3. Preserved role-based route protection

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip on server-side rendering
  if (process.server) return

  const publicRoutes = ['/', '/login', '/register', '/accept-invitation']
  const isPublicRoute = publicRoutes.some(route => to.path === route || to.path.startsWith(route))

  // Allow public routes
  if (isPublicRoute) return

  // Check authentication from localStorage (client-side only)
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user')

  // If no token or user data, redirect to login
  if (!token || !userStr) {
    return navigateTo('/login')
  }

  // ============================================
  // NEW: Validate JWT token expiry
  // ============================================
  try {
    // Decode JWT token (format: header.payload.signature)
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format')
    }

    // Decode the payload (base64url encoded)
    // TypeScript: tokenParts[1] is guaranteed to exist due to length check above
    const payloadBase64 = tokenParts[1]!
    const payload = JSON.parse(atob(payloadBase64))

    // Check if token has expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < currentTime) {
      // Token expired - clear storage and redirect to login
      console.log('Token expired, logging out...')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      return navigateTo('/login')
    }
  } catch (error) {
    // If token is malformed or can't be decoded, clear storage
    console.error('Token validation error:', error)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    return navigateTo('/login')
  }

  // Parse user data for role-based access
  const user = JSON.parse(userStr)

  // ============================================
  // EXISTING: Role-based route protection
  // ============================================
  const protectedRoutes: { [key: string]: string[] } = {
    '/users': ['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD', 'MANAGER'],
    '/settings': ['ADMINISTRATOR', 'EXECUTIVE'],
    '/departments': ['ADMINISTRATOR', 'EXECUTIVE'],
  }

  // Check if current route requires specific roles
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (to.path.startsWith(route)) {
      if (!allowedRoles.includes(user.role)) {
        // Return 404 for unauthorized access
        throw createError({
          statusCode: 404,
          statusMessage: 'Page Not Found',
          fatal: true,
        })
      }
    }
  }
})