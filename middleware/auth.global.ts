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

  if (!token || !userStr) {
    return navigateTo('/login')
  }

  // Parse user data for role-based access
  const user = JSON.parse(userStr)

  // Role-based route protection
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
