<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
      <p class="text-gray-600 dark:text-gray-400">Redirecting to your calendar...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Remove definePageMeta completely - auth.global.ts handles it

const router = useRouter()

onMounted(() => {
  // Get user data from localStorage
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user')
    
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user?.id) {
          // Redirect to user's personal calendar
          router.replace(`/calendar/${user.id}`)
          return
        }
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
    
    // If no user data, redirect to home
    router.replace('/')
  }
})
</script>