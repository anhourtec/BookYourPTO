// ============================================
// REDIRECT MIDDLEWARE
// ============================================
// Handles redirects for authenticated users
// Runs BEFORE auth.global.ts (alphabetically)

export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client-side
  if (process.server) return

  // Ensure we have access to localStorage
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user')
  const isAuthenticated = !!(token && userStr)

  // Auth pages that logged-in users shouldn't access
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthPage = authPages.some(page => to.path === page || to.path.startsWith(page))

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthenticated && isAuthPage) {
    return navigateTo('/dashboard', { replace: true })
  }

  // Redirect authenticated users from home to dashboard
  if (isAuthenticated && to.path === '/') {
    return navigateTo('/dashboard', { replace: true })
  }
})