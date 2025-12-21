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
      <span class="relative z-10 flex items-center gap-2">
        Get started
        <Icon name="lucide:arrow-right" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
      <div v-if="!isMobile" class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
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
    return 'block text-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700'
  }
  return 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/50'
})

const registerClass = computed(() => {
  if (props.isMobile) {
    return 'block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25'
  }
  return 'relative bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] overflow-hidden group active:scale-[0.98]'
})
</script>
