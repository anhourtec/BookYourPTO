/**
 * ============================================
 * SECURITY MONITOR PLUGIN
 * ============================================
 * Initializes real-time tampering detection
 * Runs on app startup (client-side only)
 */

export default defineNuxtPlugin(() => {
  const { initSecurity } = useSecurityValidator()

  // Initialize security monitoring
  initSecurity()

  console.log('🔒 Security monitoring initialized')
})
