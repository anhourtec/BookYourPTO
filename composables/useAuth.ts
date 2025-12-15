export const useAuth = () => {
  const router = useRouter()

  const ensureValidToken = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      await router.push('/login')
      return false
    }

    try {
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format')
      }

      const payload = JSON.parse(atob(tokenParts[1]!))
      const currentTime = Math.floor(Date.now() / 1000)
      
      // If token expires in less than 1 minute, refresh it proactively
      if (payload.exp && payload.exp < currentTime + 60) {
        console.log('Token expiring soon, refreshing proactively...')
        
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          await router.push('/login')
          return false
        }

        try {
          const response = await $fetch('/api/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
          })
          
          localStorage.setItem('auth_token', response.accessToken)
          localStorage.setItem('refresh_token', response.refreshToken)
          
          console.log('Token refreshed proactively')
          return true
        } catch (error) {
          console.error('Proactive refresh failed:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          await router.push('/login')
          return false
        }
      }
      
      return true
    } catch (error) {
      console.error('Token validation error:', error)
      await router.push('/login')
      return false
    }
  }

  const getToken = (): string | null => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null
    }
    return localStorage.getItem('auth_token')
  }

  const logout = async () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
    await router.push('/login')
  }

  return {
    ensureValidToken,
    getToken,
    logout,
  }
}