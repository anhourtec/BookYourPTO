<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4 py-12">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="floating-shape-1 absolute top-20 left-10 w-72 h-72 bg-foreground/5 rounded-full blur-3xl" />
      <div class="floating-shape-2 absolute bottom-20 right-10 w-96 h-96 bg-foreground/5 rounded-full blur-3xl" />
    </div>

    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-2">Create Account</h1>
        <p class="text-muted-foreground">Start managing your team's time off</p>
      </div>

      <div class="bg-card border border-border rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-card-foreground mb-2">
                First Name
              </label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="John"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-card-foreground mb-2">
                Last Name
              </label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Doe"
              />
            </div>
          </div>

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
                minlength="8"
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
            <p class="text-xs text-muted-foreground mt-1">At least 8 characters</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-card-foreground mb-2">
              Organization Name
            </label>
            <input
              v-model="form.organizationName"
              type="text"
              required
              class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="Acme Corp"
              @input="generateSlug"
            />
            <p v-if="form.organizationSlug" class="text-xs text-muted-foreground mt-1">
              Your URL: <span class="font-mono text-foreground">{{ form.organizationSlug }}</span>
            </p>
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
            <span>{{ loading ? 'Creating Account...' : 'Create Account' }}</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-muted-foreground">
            Already have an account?
            <NuxtLink to="/login" class="text-primary hover:underline font-medium">
              Sign in
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

    <!-- Welcome Onboarding Modal -->
    <Welcome v-model="showWelcomeModal" @completed="handleOnboardingComplete" />
  </div>
</template>

<script setup lang="ts">
import Welcome from '~/components/Welcome.vue'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  organizationName: '',
  organizationSlug: '',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showWelcomeModal = ref(false)

const generateSlug = () => {
  if (form.value.organizationName) {
    form.value.organizationSlug = form.value.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

const handleRegister = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: form.value,
    })

    // ============================================
    // UPDATED: Store both access and refresh tokens
    // ============================================
    localStorage.setItem('auth_token', response.accessToken)
    localStorage.setItem('refresh_token', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))

    // Show welcome modal for onboarding
    showWelcomeModal.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleOnboardingComplete = async (data: any) => {
  // Onboarding completed, redirect to dashboard
  navigateTo('/users')
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