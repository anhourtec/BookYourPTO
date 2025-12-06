// ============================================
// API COMPOSABLE (WITH AUTO-AUTH HEADERS)
// ============================================
// This version includes a helper that automatically adds auth headers

export const useApi = () => {
  // ============================================
  // Helper to get auth headers
  // ============================================
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // ============================================
  // Helper for authenticated fetch with error handling
  // ============================================
  const authenticatedFetch = async (url: string, options: any = {}) => {
    try {
      return await $fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      })
    } catch (error: any) {
      // Handle 401 errors - token expired or invalid
      if (error?.statusCode === 401 || error?.response?.status === 401) {
        console.log('401 Unauthorized - Token expired or invalid, logging out...')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        navigateTo('/login')
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