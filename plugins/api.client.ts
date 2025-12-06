// ============================================
// CLIENT-SIDE API PLUGIN
// ============================================
// Purpose: Automatically inject auth headers and handle 401 responses

export default defineNuxtPlugin(() => {
  const router = useRouter()

  // ============================================
  // Intercept $fetch calls using ofetch
  // ============================================
  // Store the original $fetch
  const originalFetch = $fetch

  // Create a wrapped version with auth
  const authenticatedFetch = async (url: any, options: any = {}) => {
    // Get token from localStorage (client-side only)
    if (process.client) {
      const token = localStorage.getItem('auth_token')

      // Add Authorization header if token exists
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        }
      }
    }

    try {
      // Make the actual request
      return await originalFetch(url, options)
    } catch (error: any) {
      // Handle 401 Unauthorized errors
      if (process.client && (error?.statusCode === 401 || error?.response?.status === 401)) {
        console.log('401 Unauthorized - Token expired or invalid, logging out...')

        // Clear authentication data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')

        // Redirect to login
        router.push('/login')
      }

      // Re-throw the error so calling code can handle it
      throw error
    }
  }

  // ============================================
  // Replace global $fetch with authenticated version
  // ============================================
  return {
    provide: {
      fetch: authenticatedFetch
    }
  }
})