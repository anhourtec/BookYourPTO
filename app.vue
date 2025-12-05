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

onMounted(() => {
  if (!localStorage.getItem('nuxt-color-mode')) {
    colorMode.preference = 'light'
  }
})
</script>