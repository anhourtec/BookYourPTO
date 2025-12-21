<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-950">
    <Header />
    <main class="flex-1">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { brandName, faviconUrl, initializeBranding } = useWhitelabel()

// Set dynamic page title and favicon
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${brandName.value}` : brandName.value
  },
  link: computed(() => {
    const links = []

    // Add favicon if custom one is available
    if (faviconUrl.value && faviconUrl.value !== '/favicon.ico') {
      links.push({
        rel: 'icon',
        type: 'image/x-icon',
        href: faviconUrl.value
      })
    }

    return links
  })
})

onMounted(() => {
  // Set default color mode
  if (!localStorage.getItem('nuxt-color-mode')) {
    colorMode.preference = 'light'
  }

  // Initialize branding (loads from cookie if available)
  initializeBranding()
})
</script>