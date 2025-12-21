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

    // ✅ SECURITY: Use security validator to get trusted user data
    const { getTrustedUser, validateIntegrity } = useSecurityValidator()

    // Validate integrity first (force logout if tampering detected)
    if (!validateIntegrity()) {
      user.value = null
      isAuthenticated.value = false
      return
    }

    const trustedUser = getTrustedUser()
    if (trustedUser) {
      user.value = trustedUser
      isAuthenticated.value = true
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