// ============================================
// API COMPOSABLE WITH AUTO-REFRESH
// ============================================
// SSR-safe: Only accesses localStorage on client-side

export const useApi = () => {
  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null

  // ============================================
  // SSR-safe helper to get auth headers
  // ============================================
  const getAuthHeaders = () => {
    // Only access localStorage on client-side
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return {}
    }
    
    const token = localStorage.getItem('auth_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // ============================================
  // Refresh access token using refresh token
  // ============================================
  const refreshAccessToken = async (): Promise<boolean> => {
    // Can't refresh on server
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false
    }

    // If already refreshing, return the existing promise
    if (isRefreshing && refreshPromise) {
      return refreshPromise
    }

    isRefreshing = true
    refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (!refreshToken) {
          console.log('No refresh token found')
          return false
        }

        console.log('Refreshing access token...')
        
        const response = await $fetch('/api/auth/refresh', {
          method: 'POST',
          body: { refreshToken },
        })

        // Store new tokens
        localStorage.setItem('auth_token', response.accessToken)
        localStorage.setItem('refresh_token', response.refreshToken)
        
        console.log('✅ Access token refreshed successfully')
        return true
      } catch (error) {
        console.error('❌ Failed to refresh token:', error)
        return false
      } finally {
        isRefreshing = false
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  // ============================================
  // Authenticated fetch with auto-retry on 401
  // ============================================
  const authenticatedFetch = async (url: string, options: any = {}) => {
    try {
      // First attempt with current token
      return await $fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      })
    } catch (error: any) {
      // If 401 error, try to refresh token and retry
      if (error?.statusCode === 401 || error?.response?.status === 401) {
        console.log('401 error - attempting to refresh token...')
        
        const refreshed = await refreshAccessToken()
        
        if (refreshed) {
          // Retry the original request with new token
          try {
            console.log('Retrying request with new token...')
            return await $fetch(url, {
              ...options,
              headers: {
                ...getAuthHeaders(),
                ...options.headers,
              },
            })
          } catch (retryError) {
            console.error('Retry failed after token refresh')
            throw retryError
          }
        } else {
          // Refresh failed - logout user (only on client)
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            console.log('Token refresh failed - logging out...')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            navigateTo('/login')
          }
        }
      }
      
      throw error
    }
  }

  // ============================================
  // USER API METHODS
  // ============================================
  
  const fetchUsers = async () => {
    return await authenticatedFetch('/api/users')
  }

  const fetchDepartments = async () => {
    return await authenticatedFetch('/api/departments')
  }

  const updateUser = async (userId: string, data: any) => {
    return await authenticatedFetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteUser = async (userId: string) => {
    return await authenticatedFetch(`/api/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // SETTINGS API METHODS
  // ============================================

  const fetchSettings = async () => {
    return await authenticatedFetch('/api/settings')
  }

  const updateSettings = async (data: {
    name?: string
    timezone?: string
    weekStartDay?: number
    leaveYearStartMonth?: number
    defaultLeaveAllowance?: number
    calendarViewRestricted?: boolean
    departmentViewRestricted?: boolean
    carryForwardDays?: number
    carryForwardHours?: number
    carryForwardExpires?: boolean
    carryForwardExpiryMonths?: number | null
  }) => {
    return await authenticatedFetch('/api/settings', {
      method: 'PATCH',
      body: data,
    })
  }

  // ============================================
  // Return all API methods
  // ============================================
  return {
    fetchUsers,
    fetchDepartments,
    updateUser,
    deleteUser,
    fetchSettings,
    updateSettings,
  }
}