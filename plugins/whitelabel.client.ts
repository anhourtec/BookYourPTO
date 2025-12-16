/**
 * Client-side plugin to initialize whitelabel branding
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const { initializeBranding, brandName } = useWhitelabel()

  // Initialize branding on app load
  try {
    await initializeBranding()
   // console.log(`✅ Whitelabel initialized: ${brandName.value}`)
  } catch (error) {
    // console.error('❌ Failed to initialize whitelabel:', error)
  }
})
