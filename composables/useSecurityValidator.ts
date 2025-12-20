/**
 * ============================================
 * SECURITY VALIDATOR
 * ============================================
 * Detects localStorage tampering and forces logout
 * Validates JWT integrity on every page load
 */

export const useSecurityValidator = () => {
  const router = useRouter()

  const logViolation = async (violationType: string, details: {
    description: string
    severity?: string
    attemptedRole?: string
    actualRole?: string
    tamperedData?: any
  }) => {
    if (import.meta.server) return

    try {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')

      let userId: string | null = null
      let organizationId: string | null = null

      // Try to get user info from JWT or localStorage
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          userId = payload.userId
          organizationId = payload.organizationId
        } catch (e) {
          // If JWT parsing fails, try localStorage
          if (userStr) {
            try {
              const user = JSON.parse(userStr)
              userId = user.id
              organizationId = user.organizationId
            } catch (e2) {
              // Ignore
            }
          }
        }
      }

      // Log to backend (don't await - don't block logout)
      $fetch('/api/security/violations', {
        method: 'POST',
        body: {
          userId,
          organizationId,
          violationType,
          ...details,
        },
      }).catch(err => {
        // Silently fail - don't prevent logout
        console.error('Failed to log violation to server:', err)
      })
    } catch (error) {
      console.error('Error logging violation:', error)
    }
  }

  const forceLogout = async (reason: string, violationType: string = 'JWT_MISMATCH') => {
    console.error('🚨 SECURITY VIOLATION:', reason)

    // Log violation to backend before clearing tokens
    await logViolation(violationType, {
      description: reason,
      severity: 'HIGH',
    })

    // Clear all auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }

    // Redirect to login with error message
    router.push({
      path: '/login',
      query: { error: 'session_invalid' }
    })
  }

  const validateIntegrity = (): boolean => {
    if (import.meta.server) return true
    if (typeof window === 'undefined') return true

    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('user')

    // No token = not logged in (OK)
    if (!token) return true

    try {
      // Decode JWT to get the TRUTH (cryptographically signed)
      const payload = JSON.parse(atob(token.split('.')[1]))

      // Check JWT expiration
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        // Token expired - this is handled by refresh logic
        return true
      }

      // If there's user data in localStorage, validate it matches JWT
      if (userStr) {
        try {
          const localUser = JSON.parse(userStr)

          // ✅ CRITICAL SECURITY CHECK: Compare JWT with localStorage
          const mismatchDetected =
            localUser.id !== payload.userId ||
            localUser.email !== payload.email ||
            localUser.role !== payload.role ||
            localUser.organizationId !== payload.organizationId

          if (mismatchDetected) {
            // Log detailed tampering info
            const tamperedField =
              localUser.role !== payload.role ? 'role' :
              localUser.id !== payload.userId ? 'userId' :
              localUser.email !== payload.email ? 'email' :
              'organizationId'

            logViolation('LOCALSTORAGE_TAMPERING', {
              description: `${tamperedField.charAt(0).toUpperCase() + tamperedField.slice(1)} tampering detected`,
              severity: 'CRITICAL',
              attemptedRole: localUser.role,
              actualRole: payload.role,
              tamperedData: {
                localStorage: {
                  id: localUser.id,
                  email: localUser.email,
                  role: localUser.role,
                  organizationId: localUser.organizationId,
                },
                jwt: {
                  userId: payload.userId,
                  email: payload.email,
                  role: payload.role,
                  organizationId: payload.organizationId,
                },
              },
            })

            forceLogout('Session tampering detected', 'LOCALSTORAGE_TAMPERING')
            return false
          }
        } catch (error) {
          forceLogout('Corrupted session data')
          return false
        }
      }

      return true
    } catch (error) {
      forceLogout('Invalid token format')
      return false
    }
  }

  /**
   * Initialize security monitoring
   * Call this on app mount
   */
  const initSecurity = () => {
    if (import.meta.server) return

    // Validate on initialization
    validateIntegrity()

    // Monitor localStorage changes (detect tampering in real-time)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'user' || event.key === 'auth_token') {
          // Re-validate if auth data changed
          if (!validateIntegrity()) {
            console.error('🚨 Tampering detected via storage event')
          }
        }
      })
    }
  }

  /**
   * Get user data from JWT ONLY (never trust localStorage)
   */
  const getTrustedUser = () => {
    if (import.meta.server) return null
    if (typeof window === 'undefined') return null

    const token = localStorage.getItem('auth_token')
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))

      // Also get display data from localStorage but OVERRIDE critical fields
      const userStr = localStorage.getItem('user')
      const localUser = userStr ? JSON.parse(userStr) : {}

      return {
        ...localUser,
        // ✅ OVERRIDE with JWT data (source of truth)
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        organizationId: payload.organizationId,
      }
    } catch (error) {
      console.error('Failed to decode JWT:', error)
      return null
    }
  }

  return {
    validateIntegrity,
    initSecurity,
    getTrustedUser,
    forceLogout,
  }
}
