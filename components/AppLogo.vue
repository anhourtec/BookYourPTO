<template>
  <div class="flex items-center gap-2">
    <component 
      :is="colorMode.value === 'light' ? Logo : LogoDark" 
      class="h-15 w-auto"
    />
    <span class="text-2xl font-bold text-gray-900 dark:text-white">
      BookYourPTO
    </span>
  </div>
</template>

<script setup lang="ts">
import Logo from '@/components/logo/Logo.vue'
import LogoDark from '@/components/logo/LogoDark.vue'

const colorMode = useColorMode()
</script>
