
export const useApi = () => {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
    }
  }

  const fetchUsers = async () => {
    return await $fetch('/api/users', {
      headers: getAuthHeaders(),
    })
  }

  const fetchDepartments = async () => {
    return await $fetch('/api/departments', {
      headers: getAuthHeaders(),
    })
  }

  const updateUser = async (userId: string, data: any) => {
    return await $fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data,
    })
  }

  const deleteUser = async (userId: string) => {
    return await $fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  }

  // ============================================
  // SETTINGS API METHODS
  // ============================================

  const fetchSettings = async () => {
    return await $fetch('/api/settings', {
      headers: getAuthHeaders(),
    })
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
    return await $fetch('/api/settings', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data,
    })
  }

  return {
    fetchUsers,
    fetchDepartments,
    updateUser,
    deleteUser,
    fetchSettings,
    updateSettings,
  }
}