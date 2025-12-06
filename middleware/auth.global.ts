// ============================================
// CLIENT-SIDE AUTHENTICATION MIDDLEWARE
// ============================================
// CRITICAL: This ONLY runs on client-side!

export default defineNuxtRouteMiddleware(async (to, from) => {
  // ============================================
  // MUST BE CLIENT-SIDE ONLY
  // ============================================
  if (process.server) return

  const publicRoutes = ['/', '/login', '/register', '/accept-invitation']
  const isPublicRoute = publicRoutes.some(route => to.path === route || to.path.startsWith(route))

  // Allow public routes
  if (isPublicRoute) return

  // ============================================
  // SAFE: Only access localStorage on client
  // ============================================
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    // Still on server somehow - skip
    return
  }

  const token = localStorage.getItem('auth_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const userStr = localStorage.getItem('user')

  // If no tokens at all, redirect to login
  if (!token || !userStr) {
    return navigateTo('/login')
  }

  // ============================================
  // Validate JWT token expiry
  // ============================================
  try {
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const payload = JSON.parse(atob(tokenParts[1]!))
    const currentTime = Math.floor(Date.now() / 1000)
    
    if (payload.exp && payload.exp < currentTime) {
      console.log('Access token expired - attempting refresh...')
      
      if (refreshToken) {
        try {
          const response = await $fetch('/api/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
          })
          
          localStorage.setItem('auth_token', response.accessToken)
          localStorage.setItem('refresh_token', response.refreshToken)
          
          console.log('✅ Token refreshed successfully in middleware')
          return
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          return navigateTo('/login')
        }
      } else {
        console.log('No refresh token available')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        return navigateTo('/login')
      }
    }
  } catch (error) {
    console.error('Token validation error:', error)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    return navigateTo('/login')
  }

  // Parse user data for role-based access
  const user = JSON.parse(userStr)

  // ============================================
  // Role-based route protection
  // ============================================
  const protectedRoutes: { [key: string]: string[] } = {
    '/users': ['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD', 'MANAGER'],
    '/settings': ['ADMINISTRATOR', 'EXECUTIVE'],
    '/departments': ['ADMINISTRATOR', 'EXECUTIVE'],
  }

  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (to.path.startsWith(route)) {
      if (!allowedRoles.includes(user.role)) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Page Not Found',
          fatal: true,
        })
      }
    }
  }
})