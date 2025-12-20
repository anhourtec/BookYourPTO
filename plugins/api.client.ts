// plugins/api.client.ts
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

export default defineNuxtPlugin(() => {
  const router = useRouter()

  // Store reference to original $fetch before we override it
  const originalFetch = globalThis.$fetch.create({})

  const refreshAccessToken = async (): Promise<boolean> => {
    // If already refreshing, wait for the existing promise
    if (isRefreshing && refreshPromise) {
      // console.log('⏳ Already refreshing token, waiting...')
      return refreshPromise
    }

    isRefreshing = true
    refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          // console.log('❌ No refresh token found')
          isRefreshing = false
          return false
        }

        // console.log('🔄 Refreshing access token...')

        const response = await originalFetch('/api/auth/refresh', {
          method: 'POST',
          body: { refreshToken },
        })

        // Update BOTH tokens (for token rotation)
        localStorage.setItem('auth_token', response.accessToken)
        localStorage.setItem('refresh_token', response.refreshToken)

        // console.log('✅ Access token refreshed successfully')
        isRefreshing = false
        return true
      } catch (error) {
        // console.error('❌ Failed to refresh token:', error)
        isRefreshing = false
        return false
      }
    })()

    return refreshPromise
  }

  // Create authenticated fetch wrapper
  const authenticatedFetch = async (url: any, options: any = {}) => {
    // Ensure options.headers exists
    if (!options.headers) {
      options.headers = {}
    }

    // Skip adding auth header for public endpoints and refresh endpoint
    const isPublicEndpoint = url.includes('/api/public/') || url.includes('/api/auth/refresh')

    if (!isPublicEndpoint && import.meta.client) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        }
      }
    }

    try {
      return await originalFetch(url, options)
    } catch (error: any) {
      // Handle 401 errors with token refresh (but skip for public endpoints)
      if (import.meta.client && (error?.statusCode === 401 || error?.response?.status === 401)) {
        // Don't try to refresh for public endpoints or refresh endpoint
        if (isPublicEndpoint) {
          // Public endpoints shouldn't trigger auth flow
          throw error
        }

        if (url.includes('/api/auth/refresh')) {
          // console.log('🚪 Refresh token invalid - logging out...')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          router.push('/login')
          throw error
        }

        // console.log('🔑 401 error - attempting to refresh token...')

        const refreshed = await refreshAccessToken()

        if (refreshed) {
          // Retry the original request with new token
          try {
            // console.log('🔄 Retrying request with new token...')
            const newToken = localStorage.getItem('auth_token')
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
            }
            return await originalFetch(url, options)
          } catch (retryError) {
            // console.error('❌ Retry failed after token refresh')
            throw retryError
          }
        } else {
          // Refresh failed - logout user
          // console.log('🚪 Token refresh failed - logging out...')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          router.push('/login')
        }
      }
      throw error
    }
  }

  // Override the global $fetch
  globalThis.$fetch = authenticatedFetch as typeof globalThis.$fetch

  return {
    provide: {
      fetch: authenticatedFetch
    }
  }
})