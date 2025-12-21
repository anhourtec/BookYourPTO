<template>
  <button
    @click="toggleTheme"
    class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 active:scale-95 group"
    :aria-label="`Switch to ${colorMode.value === 'dark' ? 'light' : 'dark'} mode`"
  >
    <Icon
      v-if="colorMode.value === 'dark'"
      name="lucide:moon"
      class="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
    />
    <Icon
      v-else
      name="lucide:sun"
      class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
    />
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
