import tailwindcss from "@tailwindcss/vite";


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
 modules: [
    '@nuxt/ui',
    '@vueuse/motion/nuxt'
  ],

   routeRules: {
    // Disable SSR for authenticated pages
    '/dashboard': { ssr: false },
    '/users': { ssr: false },
    '/settings/**': { ssr: false },
    '/users/**': { ssr: false },
    '/calendar/**': { ssr: false },
    '/approvals': { ssr: false },
    // Disable SSR for auth pages to prevent content flash
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/forgot-password': { ssr: false },
    '/reset-password': { ssr: false },
    '/': { ssr: false },
  },
    
  app: {
  head: {
    // title: 'BookYourPTO',
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
    ]
  }
},

  colorMode: {
    preference: 'light', // default value
    fallback: 'light', // fallback value
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: ['*']
    },
  },


})
