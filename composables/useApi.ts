// ============================================
// API COMPOSABLE WITH AUTO-REFRESH
// ============================================
import type {
  User,
  UpdateUserInput,
  Department,
  OrganizationSettings,
  UpdateSettingsInput,
  RefreshTokenResponse,
  Leave,
  LeaveBalance,
  LeaveBalanceSummary,
  LeaveType,
  PublicHoliday,
  CreateLeaveInput,
  UpdateLeaveInput
} from '~/types/api'

// ============================================
// SHARED STATE - Prevent duplicate refresh calls
// ============================================
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

// Type-safe fetch wrapper to avoid Nuxt's complex route type inference
type FetchFunction = <T = any>(url: string, options?: Record<string, any>) => Promise<T>
const safeFetch = $fetch as FetchFunction

export const useApi = () => {
  const router = useRouter()

  // ============================================
  // SSR-safe helper to get auth headers
  // ============================================
  const getAuthHeaders = (): Record<string, string> => {
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
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false
    }

    // If already refreshing, wait for the existing promise
    if (isRefreshing && refreshPromise) {
      console.log('Already refreshing token, waiting...')
      return refreshPromise
    }

    isRefreshing = true
    refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          console.log('No refresh token found')
          isRefreshing = false
          return false
        }

        console.log('Refreshing access token...')

        const response = await safeFetch<RefreshTokenResponse>('/api/auth/refresh', {
          method: 'POST',
          body: { refreshToken },
        })

        // IMPORTANT: Update BOTH tokens (for token rotation)
        localStorage.setItem('auth_token', response.accessToken)
        localStorage.setItem('refresh_token', response.refreshToken)

        console.log('Access token refreshed successfully')
        isRefreshing = false
        return true
      } catch (error) {
        console.error('Failed to refresh token:', error)
        isRefreshing = false
        return false
      }
    })()

    return refreshPromise
  }

  // ============================================
  // Authenticated fetch with auto-retry on 401
  // ============================================
  const authenticatedFetch = async <T = any>(
    url: string,
    options: Record<string, any> = {}
  ): Promise<T> => {
    // Skip refresh endpoint to avoid infinite loops
    if (url.includes('/api/auth/refresh')) {
      return await safeFetch<T>(url, options)
    }

    try {
      // First attempt with current token
      const response = await safeFetch<T>(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      })
      return response
    } catch (error: any) {
      // If 401 error, try to refresh token and retry
      if (error?.statusCode === 401 || error?.response?.status === 401) {
        console.log('401 error - attempting to refresh token...')

        const refreshed = await refreshAccessToken()

        if (refreshed) {
          // Retry the original request with new token
          try {
            console.log('Retrying request with new token...')
            const retryResponse = await safeFetch<T>(url, {
              ...options,
              headers: {
                ...getAuthHeaders(),
                ...options.headers,
              },
            })
            return retryResponse
          } catch (retryError) {
            console.error('Retry failed after token refresh')
            throw retryError
          }
        } else {
          // Refresh failed - logout user
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            console.log('🚪 Token refresh failed - logging out...')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            router.push('/login')
          }
        }
      }

      throw error
    }
  }

  // ============================================
  // USER API METHODS
  // ============================================
  
  const fetchUsers = async (): Promise<User[]> => {
    return await authenticatedFetch<User[]>('/api/users')
  }

  const fetchUser = async (userId: string): Promise<User> => {
    return await authenticatedFetch<User>(`/api/users/${userId}`)
  }

  const updateUser = async (userId: string, data: UpdateUserInput): Promise<User> => {
    return await authenticatedFetch<User>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteUser = async (userId: string): Promise<void> => {
    return await authenticatedFetch<void>(`/api/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // DEPARTMENT API METHODS
  // ============================================
  
  const fetchDepartments = async (): Promise<Department[]> => {
    return await authenticatedFetch<Department[]>('/api/departments')
  }

  // ============================================
  // SETTINGS API METHODS
  // ============================================

  const fetchSettings = async (): Promise<OrganizationSettings> => {
    return await authenticatedFetch<OrganizationSettings>('/api/settings')
  }

  const updateSettings = async (data: UpdateSettingsInput): Promise<OrganizationSettings> => {
    return await authenticatedFetch<OrganizationSettings>('/api/settings', {
      method: 'PATCH',
      body: data,
    })
  }

  // ============================================
// REPORTS API METHODS
// ============================================

const downloadLeaveReport = async (filters: {
  startDate?: string
  endDate?: string
  status?: string
}): Promise<Blob> => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    throw new Error('Not available on server side')
  }

  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    throw new Error('Authentication token not found')
  }

  // Build query string
  const params = new URLSearchParams()
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.status) params.append('status', filters.status)

  // Use native fetch for blob download
  const response = await fetch(`/api/reports/leaves?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  })

  if (!response.ok) {
    let errorMessage = 'Failed to generate report'
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      errorMessage = response.statusText || errorMessage
    }
    throw new Error(errorMessage)
  }

  return await response.blob()
}

  // ============================================
  // LEAVE MANAGEMENT API METHODS
  // ============================================

  const fetchLeaves = async (userId: string, year: number, status?: string): Promise<Leave[]> => {
    const params = new URLSearchParams({
      userId,
      year: year.toString()
    })
    
    if (status) {
      params.append('status', status)
    }
    
    return await authenticatedFetch<Leave[]>(`/api/leaves?${params.toString()}`)
  }

  const fetchLeaveBalance = async (userId: string, year: number): Promise<LeaveBalanceSummary> => {
    const params = new URLSearchParams({
      userId,
      year: year.toString()
    })
    
    return await authenticatedFetch<LeaveBalanceSummary>(`/api/leaves/balance?${params.toString()}`)
  }

  const createLeaveRequest = async (data: CreateLeaveInput): Promise<Leave> => {
    return await authenticatedFetch<Leave>('/api/leaves', {
      method: 'POST',
      body: data
    })
  }

  const updateLeaveStatus = async (leaveId: string, data: UpdateLeaveInput): Promise<Leave> => {
    return await authenticatedFetch<Leave>(`/api/leaves/${leaveId}`, {
      method: 'PATCH',
      body: data
    })
  }

  const cancelLeaveRequest = async (leaveId: string): Promise<{ success: boolean; message: string }> => {
    return await authenticatedFetch(`/api/leaves/${leaveId}`, {
      method: 'DELETE'
    })
  }

  const fetchLeaveTypes = async (): Promise<LeaveType[]> => {
    return await authenticatedFetch<LeaveType[]>('/api/leave-types')
  }

  const fetchPublicHolidays = async (year?: number, userId?: string): Promise<PublicHoliday[]> => {
    const currentYear = year || new Date().getFullYear()

    // console.log('Fetching public holidays for year:', currentYear, 'userId:', userId)

    // Add userId parameter to get user-specific holidays
    const url = userId
      ? `/api/public-holidays?year=${currentYear}&userId=${userId}`
      : `/api/public-holidays?year=${currentYear}`

    const holidays = await authenticatedFetch<PublicHoliday[]>(url)

    // console.log('Received holidays:', holidays)
    return holidays
  }

  // ============================================
  // Return all API methods
  // ============================================
  return {
    // User methods
    fetchUsers,
    fetchUser,
    updateUser,
    deleteUser,
    
    // Department methods
    fetchDepartments,
    
    // Settings methods
    fetchSettings,
    updateSettings,

    // Leave methods
    fetchLeaves,
    fetchLeaveBalance,
    createLeaveRequest,
    updateLeaveStatus,
    cancelLeaveRequest,
    fetchLeaveTypes,
    fetchPublicHolidays,
    downloadLeaveReport
  }
}