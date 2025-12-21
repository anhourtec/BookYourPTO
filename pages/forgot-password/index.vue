<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
        <p class="text-muted-foreground">
          Enter your email and we'll send you reset instructions
        </p>
      </div>

      <div class="bg-card border border-border rounded-2xl shadow-lg p-8">
        <!-- Success State -->
        <div v-if="success" class="text-center">
          <div class="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lucide:check-circle" class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Check your email</h3>
          <p class="text-muted-foreground mb-6">
            If an account exists for <strong>{{ email }}</strong>, you will receive a 
            <strong>6-digit reset code and reset link</strong>.
          </p>
          <div class="text-sm text-muted-foreground mb-6 space-y-1">
            <p>Enter the code from your email on the next screen</p>
            <p>Or click the link in your email</p>
          </div>

          <!-- Resend Button with Timer -->
          <div class="mb-4">
            <button
              v-if="canResend"
              @click="handleResend"
              :disabled="resending"
              class="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary/80 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="resending" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <Icon v-else name="lucide:mail" class="w-4 h-4" />
              <span>{{ resending ? 'Resending...' : 'Resend Email' }}</span>
            </button>
            <div v-else class="text-sm text-muted-foreground py-2">
              <Icon name="lucide:clock" class="w-4 h-4 inline mr-1" />
              Resend available in {{ countdown }}s
            </div>
          </div>

          <NuxtLink
            to="/reset-password"
            class="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition mb-4"
          >
            Enter Reset Code
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </NuxtLink>

          <p class="text-xs text-muted-foreground mt-4">
            Didn't receive email? Check spam folder or 
            <NuxtLink to="/login" class="text-primary hover:underline">return to login</NuxtLink>
          </p>
        </div>

        <!-- Form -->
        <div v-else class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="john@company.com"
              @blur="normalizeEmail"
            />
          </div>

          <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>

          <button
            @click="handleSubmit"
            :disabled="loading || !email"
            class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <Icon v-if="loading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
            <span>{{ loading ? 'Sending...' : 'Send Reset Code & Link' }}</span>
          </button>

          <div class="text-center pt-4 border-t border-border">
            <NuxtLink to="/login" class="text-sm text-primary hover:underline">
              ← Back to Login
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const resending = ref(false)
const success = ref(false)
const error = ref('')
const canResend = ref(false)
const countdown = ref(60)

let countdownInterval: NodeJS.Timeout | null = null

// Normalize email on blur (UX improvement)
const normalizeEmail = () => {
  email.value = email.value.toLowerCase().trim()
}

const startCountdown = () => {
  canResend.value = false
  countdown.value = 60

  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  countdownInterval = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      canResend.value = true
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, 1000)
}

const handleSubmit = async () => {
  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Ensure email is normalized before sending
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value.toLowerCase().trim() },
    })

    success.value = true
    startCountdown()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  resending.value = true
  error.value = ''

  try {
    // Ensure email is normalized before sending
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value.toLowerCase().trim() },
    })

    startCountdown()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to resend email'
    canResend.value = true
  } finally {
    resending.value = false
  }
}

// Cleanup interval on component unmount
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>