// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  
  colorMode: {
    preference: 'light', // default value
    fallback: 'light', // fallback value
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-04-03',
  devtools: { enabled: true }
})
