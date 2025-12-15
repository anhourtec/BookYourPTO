import type { User } from '~/types/user'

export const useHeaderAuth = () => {
  const user = ref<any>(null)
  const isAuthenticated = ref(false)
  const router = useRouter()
  
  // Add a reactive userId that updates with user
  const currentUserId = computed(() => user.value?.id ?? null)
  
  const checkAuth = () => {
    // Only run on client-side
    if (process.server || typeof window === 'undefined') return
    
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        user.value = JSON.parse(userData)
        isAuthenticated.value = true
      } catch (error) {
        console.error('Failed to parse user data:', error)
        user.value = null
        isAuthenticated.value = false
      }
    } else {
      user.value = null
      isAuthenticated.value = false
    }
  }
  
  const handleLogout = () => {
    if (process.server || typeof window === 'undefined') return
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    user.value = null
    isAuthenticated.value = false
    router.push('/')
  }
  
  const handleProfileUpdated = (updatedUser: User) => {
    // Update localStorage so it stays in sync
    if (process.client) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
    user.value = updatedUser
  }
  
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`
  })
  
  const userInitials = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
  })
  
  return {
    user,
    isAuthenticated,
    currentUserId,
    userName,
    userInitials,
    checkAuth,
    handleLogout,
    handleProfileUpdated
  }
}