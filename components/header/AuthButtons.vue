<template>
  <template v-if="!isAuthenticated">
    <NuxtLink 
      to="/login"
      :class="loginClass"
    >
      Log in
    </NuxtLink>
    
    <NuxtLink 
      to="/register"
      :class="registerClass"
    >
      <span class="relative z-10">Get started</span>
      <div v-if="!isMobile" class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </NuxtLink>
  </template>
</template>

<script setup lang="ts">
interface Props {
  isAuthenticated: boolean
  isMobile?: boolean
  onClose?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
})

const loginClass = computed(() => {
  if (props.isMobile) {
    return 'block text-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
  }
  return 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium px-4 py-2'
})

const registerClass = computed(() => {
  if (props.isMobile) {
    return 'block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-sm'
  }
  return 'relative bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-lg hover:scale-105 overflow-hidden group'
})
</script>
