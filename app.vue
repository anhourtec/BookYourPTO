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
const { brandName } = useWhitelabel()

// Set dynamic page title
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${brandName.value}` : brandName.value
  },
})

onMounted(() => {
  if (!localStorage.getItem('nuxt-color-mode')) {
    colorMode.preference = 'light'
  }
})
</script>