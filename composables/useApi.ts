// ============================================
// API COMPOSABLE WITH AUTO-REFRESH
// ============================================
// SSR-safe: Only accesses localStorage on client-side
// Fully typed with TypeScript for better IDE support

import type {
  User,
  UpdateUserInput,
  Department,
  OrganizationSettings,
  UpdateSettingsInput,
  RefreshTokenResponse
} from '~/types/api'

export const useApi = () => {
  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null

  // ============================================
  // SSR-safe helper to get auth headers
  // ============================================
  const getAuthHeaders = (): Record<string, string> => {
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
        
        const response = await $fetch<RefreshTokenResponse>('/api/auth/refresh', {
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
  const authenticatedFetch = async <T = any>(url: string, options: any = {}): Promise<T> => {
    try {
      // First attempt with current token
      const response = await $fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      })
      return response as T
    } catch (error: any) {
      // If 401 error, try to refresh token and retry
      if (error?.statusCode === 401 || error?.response?.status === 401) {
        console.log('401 error - attempting to refresh token...')
        
        const refreshed = await refreshAccessToken()
        
        if (refreshed) {
          // Retry the original request with new token
          try {
            console.log('Retrying request with new token...')
            const retryResponse = await $fetch(url, {
              ...options,
              headers: {
                ...getAuthHeaders(),
                ...options.headers,
              },
            })
            return retryResponse as T
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
  
  /**
   * Fetch all users in the organization
   * @returns Array of users with department and manager info
   */
  const fetchUsers = async (): Promise<User[]> => {
    return await authenticatedFetch<User[]>('/api/users')
  }

  /**
   * Update a user's information
   * @param userId - User ID to update
   * @param data - Updated user data
   * @returns Updated user object
   */
  const updateUser = async (userId: string, data: UpdateUserInput): Promise<User> => {
    return await authenticatedFetch<User>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  /**
   * Delete a user
   * @param userId - User ID to delete
   */
  const deleteUser = async (userId: string): Promise<void> => {
    return await authenticatedFetch<void>(`/api/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // DEPARTMENT API METHODS
  // ============================================
  
  /**
   * Fetch all departments in the organization
   * @returns Array of departments with user counts
   */
  const fetchDepartments = async (): Promise<Department[]> => {
    return await authenticatedFetch<Department[]>('/api/departments')
  }

  // ============================================
  // SETTINGS API METHODS
  // ============================================

  /**
   * Fetch organization settings
   * @returns Organization settings object
   */
  const fetchSettings = async (): Promise<OrganizationSettings> => {
    return await authenticatedFetch<OrganizationSettings>('/api/settings')
  }

  /**
   * Update organization settings
   * @param data - Settings to update
   * @returns Updated settings object
   */
  const updateSettings = async (data: UpdateSettingsInput): Promise<OrganizationSettings> => {
    return await authenticatedFetch<OrganizationSettings>('/api/settings', {
      method: 'PATCH',
      body: data,
    })
  }

  // ============================================
  // Return all API methods
  // ============================================
  return {
    // User methods
    fetchUsers,
    updateUser,
    deleteUser,
    
    // Department methods
    fetchDepartments,
    
    // Settings methods
    fetchSettings,
    updateSettings,
  }
}