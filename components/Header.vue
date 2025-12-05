<template>
  <header class="border-b bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <AppLogo />
        </NuxtLink>
        
        <nav class="flex items-center gap-6">
          <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Home
          </NuxtLink>
          <NuxtLink to="/features" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Features
          </NuxtLink>
          <NuxtLink to="/docs" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Docs
          </NuxtLink>
          
          <NuxtLink 
            to="/login"
            class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium px-4 py-2"
          >
            Log in
          </NuxtLink>
          
          <NuxtLink 
            to="/register"
            class="relative bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-lg hover:scale-105 overflow-hidden group"
          >
            <span class="relative z-10">Get started</span>
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </NuxtLink>
          
          <button
            @click="toggleTheme"
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :aria-label="`Switch to ${colorMode.value === 'dark' ? 'light' : 'dark'} mode`"
          >
            <Icon v-if="colorMode.value === 'dark'" name="lucide:moon" class="w-5 h-5" />
            <Icon v-else name="lucide:sun" class="w-5 h-5" />
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>