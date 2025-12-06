import type { User, CreateUserInput, UpdateUserInput } from '~/types/user'

export const useUserManagement = () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsers = async (organizationId?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const endpoint = organizationId 
        ? `/api/organizations/${organizationId}/users`
        : '/api/users'
      
      const response = await $fetch<User[]>(endpoint)
      users.value = response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to fetch users'
      console.error('Error fetching users:', e)
    } finally {
      loading.value = false
    }
  }

  const addUser = async (userData: CreateUserInput) => {
    try {
      const newUser = await $fetch<User>('/api/users', {
        method: 'POST',
        body: userData
      })
      users.value.push(newUser)
      return newUser
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to add user'
      throw e
    }
  }

  const updateUser = async (userId: string, data: UpdateUserInput) => {
    try {
      const updatedUser = await $fetch<User>(`/api/users/${userId}`, {
        method: 'PATCH',
        body: data
      })
      
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      return updatedUser
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to update user'
      throw e
    }
  }

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    return updateUser(userId, { isActive })
  }

  const deleteUser = async (userId: string) => {
    try {
      await $fetch(`/api/users/${userId}`, { method: 'DELETE' })
      users.value = users.value.filter(u => u.id !== userId)
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to delete user'
      throw e
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    fetchUsers,
    addUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    clearError
  }
}
