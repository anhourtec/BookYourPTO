<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4 py-12">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="floating-shape-1 absolute top-20 left-10 w-72 h-72 bg-foreground/5 rounded-full blur-3xl" />
      <div class="floating-shape-2 absolute bottom-20 right-10 w-96 h-96 bg-foreground/5 rounded-full blur-3xl" />
    </div>

    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
        <p class="text-muted-foreground">Sign in to your account</p>
      </div>

      <div class="bg-card border border-border rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-card-foreground mb-2">
              Email Address
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-card-foreground mb-2">
              Password
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                <Icon v-if="showPassword" name="lucide:eye-off" class="w-5 h-5" />
                <Icon v-else name="lucide:eye" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded border-border" />
              <span class="text-sm text-muted-foreground">Remember me</span>
            </label>
            <NuxtLink to="/forgot-password" class="text-sm text-primary hover:underline">
              Forgot password?
            </NuxtLink>
          </div>

          <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon v-if="loading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-muted-foreground">
            Don't have an account?
            <NuxtLink to="/register" class="text-primary hover:underline font-medium">
              Create account
            </NuxtLink>
          </p>
        </div>
      </div>

      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground transition">
          <Icon name="lucide:arrow-left" class="w-4 h-4 inline mr-1" />
          Back to home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value,
    })

    // ============================================
    // UPDATED: Store both access and refresh tokens
    // ============================================
    localStorage.setItem('auth_token', response.accessToken)
    localStorage.setItem('refresh_token', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))

    // Navigate to dashboard
    navigateTo('/users')
  } catch (err: any) {
    error.value = err.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.floating-shape-1 {
  animation: float 8s ease-in-out infinite;
}

.floating-shape-2 {
  animation: float 10s ease-in-out infinite 1s;
}
</style>