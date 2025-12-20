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
  // ✅ SECURITY: Get user ID from JWT, not localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]!))
        if (payload?.userId) {
          // Redirect to user's personal calendar
          router.replace(`/calendar/${payload.userId}`)
          return
        }
      } catch (error) {
        console.error('Failed to parse JWT:', error)
      }
    }

    // If no valid token, redirect to home
    router.replace('/')
  }
})
</script>