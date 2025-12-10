// plugins/api.client.ts
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const originalFetch = $fetch

  const authenticatedFetch = async (url: any, options: any = {}) => {
    if (process.client) {
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
      if (process.client && (error?.statusCode === 401 || error?.response?.status === 401)) {
        console.log('401 Unauthorized - Token expired or invalid, logging out...')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        router.push('/login')
      }
      throw error
    }
  }

  return {
    provide: {
      fetch: authenticatedFetch
    }
  }
})