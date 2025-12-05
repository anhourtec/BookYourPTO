<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-950">
    <Header />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

// Force light mode on mount if not set
onMounted(() => {
  if (!localStorage.getItem('nuxt-color-mode')) {
    colorMode.preference = 'light'
  }
})
</script>
