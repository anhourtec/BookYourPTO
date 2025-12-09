<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">Set New Password</h1>
        <p class="text-muted-foreground">
          {{ hasTokenInUrl ? 'Enter your new password below' : 'Enter your reset code and new password' }}
        </p>
      </div>

      <div class="bg-card border border-border rounded-2xl shadow-lg p-8">
        <!-- Verifying Token (only when token is in URL) -->
        <div v-if="verifying" class="text-center py-8">
          <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p class="text-muted-foreground">Verifying reset link...</p>
        </div>

        <!-- Invalid Token -->
        <div v-else-if="invalidToken" class="text-center">
          <div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lucide:x-circle" class="w-8 h-8 text-destructive" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Invalid or Expired Link</h3>
          <p class="text-muted-foreground mb-6">
            This password reset link is invalid or has expired.
          </p>
          <NuxtLink
            to="/forgot-password"
            class="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Request New Link
          </NuxtLink>
        </div>

        <!-- Success -->
        <div v-else-if="success" class="text-center">
          <div class="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lucide:check-circle" class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Password Reset Successfully</h3>
          <p class="text-muted-foreground mb-6">
            You can now login with your new password.
          </p>
          <NuxtLink
            to="/login"
            class="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Go to Login
          </NuxtLink>
        </div>

        <!-- Reset Form (only show after verification OR if manually entering code) -->
        <div v-else-if="tokenVerified || codeVerified" class="space-y-6">
          <!-- Password Fields Only (no code input since it's verified) -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="At least 8 characters"
                @input="error = ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Re-enter your password"
                @input="error = ''"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>

          <button
            @click="handleSubmit"
            :disabled="loading"
            class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon v-if="loading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
            <span>{{ loading ? 'Resetting...' : 'Reset Password' }}</span>
          </button>

          <div class="text-center pt-4 border-t border-border">
            <NuxtLink to="/forgot-password" class="text-sm text-primary hover:underline">
              ← Request new reset code
            </NuxtLink>
          </div>
        </div>

        <!-- Code Entry Form (show when no token in URL and code not verified) -->
        <div v-else class="space-y-6">
          <!-- Reset Code Input -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              6-Digit Reset Code
            </label>
            <input
              v-model="resetCode"
              type="text"
              required
              maxlength="6"
              pattern="[0-9]{6}"
              class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-center text-2xl tracking-widest font-mono"
              placeholder=""
              @input="error = ''"
              @keyup.enter="verifyCode"
            />
            <p class="text-xs text-muted-foreground mt-2">
              Enter the 6-digit code from your email
            </p>
          </div>

          <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>

          <button
            @click="verifyCode"
            :disabled="verifyingCode || !resetCode || resetCode.length !== 6"
            class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon v-if="verifyingCode" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
            <span>{{ verifyingCode ? 'Verifying...' : 'Verify Code' }}</span>
          </button>

          <div class="text-center pt-4 border-t border-border">
            <NuxtLink to="/forgot-password" class="text-sm text-primary hover:underline">
              ← Request new reset code
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const token = computed(() => route.query.token as string)
const hasTokenInUrl = computed(() => !!token.value)

const resetCode = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const verifying = ref(false)
const verifyingCode = ref(false)
const tokenVerified = ref(false)
const codeVerified = ref(false)
const invalidToken = ref(false)
const success = ref(false)
const error = ref('')
const hasVerified = ref(false) // Prevent multiple verification attempts

// Only verify token if it exists in URL
onMounted(async () => {
  // Don't verify if no token or already verified
  if (!token.value || hasVerified.value) {
    return
  }

  // Mark as attempting verification
  hasVerified.value = true
  verifying.value = true

  try {
    const response = await $fetch('/api/auth/verify-reset-token', {
      method: 'POST',
      body: { token: token.value },
    })
    
    console.log('✅ Token verified successfully')
    tokenVerified.value = true
    verifying.value = false
  } catch (err: any) {
    console.error('❌ Token verification failed:', err)
    invalidToken.value = true
    verifying.value = false
  }
})

const verifyCode = async () => {
  if (!resetCode.value || resetCode.value.length !== 6) {
    error.value = 'Please enter a 6-digit code'
    return
  }

  verifyingCode.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/verify-reset-token', {
      method: 'POST',
      body: { token: resetCode.value },
    })
    
    console.log('✅ Code verified successfully')
    codeVerified.value = true
  } catch (err: any) {
    console.error('❌ Code verification failed:', err)
    error.value = 'Invalid or expired code. Please try again.'
  } finally {
    verifyingCode.value = false
  }
}

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  // Use token from URL or from manual code input
  const tokenToUse = token.value || resetCode.value

  if (!tokenToUse) {
    error.value = 'Please enter your reset code'
    return
  }

  if (!hasTokenInUrl.value && resetCode.value.length !== 6) {
    error.value = 'Reset code must be 6 digits'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: tokenToUse,
        password: password.value,
      },
    })

    console.log('✅ Password reset successfully')
    success.value = true
  } catch (err: any) {
    console.error('❌ Password reset failed:', err)
    error.value = err.data?.message || 'Failed to reset password. Please check your code and try again.'
  } finally {
    loading.value = false
  }
}
</script>