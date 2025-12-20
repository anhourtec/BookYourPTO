/**
 * Composable for accessing whitelabel branding across the application
 * Updated to match database schema with all branding fields
 * Supports cookie-based branding persistence (visible even after logout)
 */
export const useWhitelabel = () => {
  const colorMode = useColorMode()
  const COOKIE_NAME = 'org_branding_id'
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

  // Reactive state for branding - matches database schema
  const branding = useState('org-branding', () => ({
    brandName: 'BookYourPTO',
    logoUrl: null as string | null, // Legacy field
    logoLightUrl: null as string | null,
    logoDarkUrl: null as string | null,
    faviconUrl: null as string | null,
    faviconDarkUrl: null as string | null,
    customCSS: null as any,
  }))

  const isLoaded = useState('org-branding-loaded', () => false)

  /**
   * Get organization ID from cookie
   */
  const getOrgIdFromCookie = (): string | null => {
    if (!import.meta.client) return null
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === COOKIE_NAME) {
        return decodeURIComponent(value)
      }
    }
    return null
  }

  /**
   * Save organization ID to cookie
   */
  const saveOrgIdToCookie = (orgId: string) => {
    if (!import.meta.client) return
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(orgId)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
    // console.log('Saved org ID to cookie:', orgId)
  }

  /**
   * Get organization ID from JWT token
   */
  const getOrgIdFromToken = (): string | null => {
    if (!import.meta.client) return null
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return null

      const payload = JSON.parse(atob(token.split('.')[1]!))
      return payload.organizationId || null
    } catch (error) {
      console.error('Failed to extract org ID from token:', error)
      return null
    }
  }

  /**
   * Load organization branding settings
   * Tries authenticated API first, then falls back to public API with cookie
   */
  const loadBranding = async () => {
    // Only load if not already loaded
    if (isLoaded.value) return

    try {
      const token = localStorage.getItem('auth_token')

      // Try authenticated API first (if logged in)
      if (token) {
        try {
          const response = await $fetch('/api/settings/branding', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          // Update branding state
          Object.assign(branding.value, response)
          isLoaded.value = true

          // Save org ID to cookie for future use
          const orgId = getOrgIdFromToken()
          if (orgId) {
            saveOrgIdToCookie(orgId)
          }

          // console.log('Whitelabel branding loaded (authenticated):', branding.value.brandName)
          return
        } catch (error) {
          console.error('Authenticated branding fetch failed, trying public API:', error)
        }
      }

      // Fallback: Try public API with cookie (works when logged out)
      const orgId = getOrgIdFromCookie()
      if (orgId) {
        try {
          const response = await $fetch(`/api/public/branding/${orgId}`)

          // Update branding state
          Object.assign(branding.value, response)
          isLoaded.value = true

          // console.log('Whitelabel branding loaded (public):', branding.value.brandName)
          return
        } catch (error) {
          console.error('Public branding fetch failed:', error)
        }
      }

      // If both methods fail, use default branding
      console.warn('No branding source available, using default')
      isLoaded.value = true
    } catch (error: any) {
      console.error('Failed to load branding:', error)
      // Keep default branding on error
      isLoaded.value = true
    }
  }

  /**
   * Get the appropriate logo URL based on current theme
   */
  const logoUrl = computed(() => {
    const isDark = colorMode.value === 'dark'

    // Use theme-specific logo if available, otherwise fallback
    if (isDark && branding.value.logoDarkUrl) {
      return branding.value.logoDarkUrl
    }

    if (!isDark && branding.value.logoLightUrl) {
      return branding.value.logoLightUrl
    }

    // Fallback to logoLightUrl
    return branding.value.logoLightUrl || null
  })

  /**
   * Get the appropriate favicon URL based on current theme
   */
  const faviconUrl = computed(() => {
    const isDark = colorMode.value === 'dark'

    if (isDark && branding.value.faviconDarkUrl) {
      return branding.value.faviconDarkUrl
    }

    return branding.value.faviconUrl || '/favicon.ico'
  })

  /**
   * Get brand name (application name)
   */
  const brandName = computed(() => branding.value.brandName || 'BookYourPTO')

  /**
   * Apply custom CSS if available
   */
  const applyCustomCSS = () => {
    if (!branding.value.customCSS) return

    // Remove existing custom style if any
    const existingStyle = document.getElementById('whitelabel-custom-css')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Add new custom CSS
    const style = document.createElement('style')
    style.id = 'whitelabel-custom-css'
    style.textContent = branding.value.customCSS
    document.head.appendChild(style)
  }

  /**
   * Update favicon dynamically
   */
  const updateFavicon = () => {
    if (!import.meta.client) return

    const favicon = faviconUrl.value
    if (!favicon || favicon === '/favicon.ico') return

    // Update favicon
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = favicon
  }

  /**
   * Force reload branding (useful after login or branding changes)
   */
  const reloadBranding = async () => {
    isLoaded.value = false
    await loadBranding()

    if (import.meta.client) {
      applyCustomCSS()
      updateFavicon()
    }
  }

  /**
   * Initialize branding (load and apply)
   */
  const initializeBranding = async () => {
    await loadBranding()

    if (import.meta.client) {
      applyCustomCSS()
      updateFavicon()
    }
  }

  /**
   * Clear branding cookie (useful for testing or switching orgs)
   */
  const clearBrandingCookie = () => {
    if (!import.meta.client) return
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
  }

  // Watch for theme changes to update favicon
  if (import.meta.client) {
    watch(() => colorMode.value, () => {
      updateFavicon()
    })
  }

  return {
    branding: readonly(branding),
    isLoaded: readonly(isLoaded),
    loadBranding,
    reloadBranding,
    initializeBranding,
    logoUrl,
    faviconUrl,
    brandName,
    applyCustomCSS,
    updateFavicon,
    clearBrandingCookie,
  }
}