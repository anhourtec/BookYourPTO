<template>
  <div class="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
    <div class="text-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto mb-4 text-[rgb(var(--primary))]" />
      <p class="text-[rgb(var(--muted-foreground))]">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

onMounted(() => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('user')

    // If user is authenticated, redirect to dashboard
    if (token && userStr) {
      router.replace('/dashboard')
    } else {
      // If not authenticated, redirect to login
      router.replace('/login')
    }
  }
})
</script>