<template>
  <div class="flex items-center gap-2">
    <!-- Custom Logo if available -->
    <img
      v-if="logoUrl"
      :src="logoUrl"
      :alt="brandName"
      class="h-10 w-auto object-contain"
    />

    <!-- Default Logo if no custom logo -->
    <component
      v-else
      :is="colorMode.value === 'light' ? Logo : LogoDark"
      class="h-15 w-auto"
    />

    <!-- Brand Name -->
    <span class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ brandName }}
    </span>
  </div>
</template>

<script setup lang="ts">
import Logo from '@/components/logo/Logo.vue'
import LogoDark from '@/components/logo/LogoDark.vue'

const colorMode = useColorMode()
const { logoUrl, brandName } = useWhitelabel()
</script>
