<template>
  <header class="border-b bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
         <NuxtLink to="/" class="flex items-center gap-2">
            <Logo class="h-15 w-auto" />
            <span class="text-2xl font-bold text-gray-900 dark:text-white">
              BookYourPTO
            </span>
          </NuxtLink>

        </div>
        
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
          
          <UButton color="primary" size="sm">
            Get Started
          </UButton>
          
          <UButton 
            :icon="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'" 
            color="neutral" 
            variant="ghost" 
            size="sm"
            :aria-label="`Switch to ${colorMode.value === 'dark' ? 'light' : 'dark'} mode`"
            @click="toggleTheme"
          />
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
