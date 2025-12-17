/**
 * Composable for accessing whitelabel branding across the application
 * Updated to match database schema with all branding fields
 */
export const useWhitelabel = () => {
  const colorMode = useColorMode()

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
   * Load organization branding settings
   */
  const loadBranding = async () => {
    // Only load if not already loaded
    if (isLoaded.value) return

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.warn('No auth token found, using default branding')
        isLoaded.value = true
        return
      }

      const response = await $fetch('/api/settings/branding', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Update branding state
      Object.assign(branding.value, response)
      isLoaded.value = true

      // console.log('Whitelabel branding loaded:', branding.value.brandName)
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
   * Initialize branding (load and apply)
   */
  const initializeBranding = async () => {
    await loadBranding()

    if (import.meta.client) {
      applyCustomCSS()
      updateFavicon()
    }
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
    initializeBranding,
    logoUrl,
    faviconUrl,
    brandName,
    applyCustomCSS,
    updateFavicon,
  }
}