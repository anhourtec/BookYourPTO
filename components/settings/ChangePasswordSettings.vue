<template>
  <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-4 sm:p-6">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">Change Password</h2>
      <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mt-1">
        Update your password to keep your account secure
      </p>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600 flex-shrink-0" />
        <p class="text-sm font-semibold text-green-600">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <Icon name="lucide:alert-circle" class="w-5 h-5 text-[rgb(var(--destructive))] flex-shrink-0" />
        <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
      </div>
    </div>

    <!-- Password Change Form -->
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Current Password -->
      <div>
        <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Current Password <span class="text-[rgb(var(--destructive))]">*</span>
        </label>
        <div class="relative">
          <input
            v-model="form.currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            required
            class="w-full px-4 py-2.5 pr-12 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            placeholder="Enter your current password"
            @input="clearMessages"
          />
          <button
            type="button"
            @click="showCurrentPassword = !showCurrentPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition"
          >
            <Icon :name="showCurrentPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
          </button>
        </div>
        <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
          We need your current password to verify it's you
        </p>
      </div>

      <!-- Divider -->
      <div class="border-t border-[rgb(var(--border))]"></div>

      <!-- New Password -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-[rgb(var(--foreground))]">
            New Password <span class="text-[rgb(var(--destructive))]">*</span>
          </label>
          <PasswordGenerator @password-generated="handlePasswordGenerated" />
        </div>
        <div class="relative">
          <input
            v-model="form.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            required
            minlength="8"
            class="w-full px-4 py-2.5 pr-12 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            placeholder="At least 8 characters"
            @input="clearMessages"
          />
          <button
            type="button"
            @click="showNewPassword = !showNewPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition"
          >
            <Icon :name="showNewPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
          </button>
        </div>

        <!-- Password Strength Indicator -->
        <div v-if="form.newPassword" class="mt-2 space-y-2">
          <div class="flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-300"
                :class="passwordStrengthColor"
                :style="{ width: passwordStrengthWidth }"
              ></div>
            </div>
            <span class="text-xs font-medium" :class="passwordStrengthTextColor">
              {{ passwordStrengthLabel }}
            </span>
          </div>
          
          <!-- Password Requirements -->
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs" :class="form.newPassword.length >= 8 ? 'text-green-600' : 'text-[rgb(var(--muted-foreground))]'">
              <Icon :name="form.newPassword.length >= 8 ? 'lucide:check' : 'lucide:circle'" class="w-3 h-3" />
              <span>At least 8 characters</span>
            </div>
            <div class="flex items-center gap-2 text-xs" :class="hasUpperCase ? 'text-green-600' : 'text-[rgb(var(--muted-foreground))]'">
              <Icon :name="hasUpperCase ? 'lucide:check' : 'lucide:circle'" class="w-3 h-3" />
              <span>Contains uppercase letter</span>
            </div>
            <div class="flex items-center gap-2 text-xs" :class="hasLowerCase ? 'text-green-600' : 'text-[rgb(var(--muted-foreground))]'">
              <Icon :name="hasLowerCase ? 'lucide:check' : 'lucide:circle'" class="w-3 h-3" />
              <span>Contains lowercase letter</span>
            </div>
            <div class="flex items-center gap-2 text-xs" :class="hasNumber ? 'text-green-600' : 'text-[rgb(var(--muted-foreground))]'">
              <Icon :name="hasNumber ? 'lucide:check' : 'lucide:circle'" class="w-3 h-3" />
              <span>Contains number</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm New Password -->
      <div>
        <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Confirm New Password <span class="text-[rgb(var(--destructive))]">*</span>
        </label>
        <div class="relative">
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            minlength="8"
            class="w-full px-4 py-2.5 pr-12 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            placeholder="Re-enter your new password"
            @input="clearMessages"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition"
          >
            <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
          </button>
        </div>

        <!-- Password Match Indicator -->
        <div v-if="form.confirmPassword" class="mt-2">
          <div v-if="form.newPassword === form.confirmPassword" class="flex items-center gap-2 text-xs text-green-600">
            <Icon name="lucide:check" class="w-3 h-3" />
            <span>Passwords match</span>
          </div>
          <div v-else class="flex items-center gap-2 text-xs text-[rgb(var(--destructive))]">
            <Icon name="lucide:x" class="w-3 h-3" />
            <span>Passwords don't match</span>
          </div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div class="flex gap-3">
          <Icon name="lucide:info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="text-sm text-blue-600 font-medium">Security Tip</p>
            <p class="text-xs text-blue-600/80">
              After changing your password, you'll be logged out from all devices for security. You'll need to log in again with your new password.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-[rgb(var(--border))]">
        <button
          type="button"
          @click="resetForm"
          :disabled="loading"
          class="flex-1 px-6 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))] font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="flex-1 px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ loading ? 'Changing Password...' : 'Change Password' }}</span>
        </button>
      </div>
    </form>
  </div>

  <!-- Success Confirmation Modal -->
  <CustomModal v-model="showSuccessModal" :max-width="'md'" class="z-[110]">
    <div class="p-6 text-center">
      <!-- Success Icon -->
      <div class="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="lucide:check-circle-2" class="w-10 h-10 text-green-600" />
      </div>

      <!-- Success Message -->
      <h3 class="text-xl font-bold text-[rgb(var(--foreground))] mb-2">
        Password Changed Successfully!
      </h3>
      <p class="text-sm text-[rgb(var(--muted-foreground))] mb-6">
        Your password has been updated. For security reasons, you'll be logged out from all devices.
      </p>

      <!-- Countdown -->
      <div class="mb-6">
        <div class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[rgb(var(--muted))] rounded-lg">
          <Icon name="lucide:clock" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          <span class="text-sm font-medium text-[rgb(var(--foreground))]">
            Redirecting to login in {{ countdown }} seconds...
          </span>
        </div>
      </div>

      <!-- Manual Redirect Button -->
      <button
        @click="redirectToLogin"
        class="px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium"
      >
        Go to Login Now
      </button>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const showSuccessModal = ref(false)
const countdown = ref(5)
let countdownInterval: NodeJS.Timeout | null = null

// Handle password generated from PasswordGenerator component
const handlePasswordGenerated = (password: string) => {
  form.value.newPassword = password
  form.value.confirmPassword = password
  showNewPassword.value = true
  showConfirmPassword.value = true
  clearMessages()
}

// Password strength calculations
const hasUpperCase = computed(() => /[A-Z]/.test(form.value.newPassword))
const hasLowerCase = computed(() => /[a-z]/.test(form.value.newPassword))
const hasNumber = computed(() => /[0-9]/.test(form.value.newPassword))
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(form.value.newPassword))

const passwordStrength = computed(() => {
  const password = form.value.newPassword
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (hasUpperCase.value) strength++
  if (hasLowerCase.value) strength++
  if (hasNumber.value) strength++
  if (hasSpecialChar.value) strength++
  
  return strength
})

const passwordStrengthWidth = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return '25%'
  if (strength <= 3) return '50%'
  if (strength <= 4) return '75%'
  return '100%'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return 'bg-red-500'
  if (strength <= 3) return 'bg-yellow-500'
  if (strength <= 4) return 'bg-blue-500'
  return 'bg-green-500'
})

const passwordStrengthTextColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return 'text-red-600'
  if (strength <= 3) return 'text-yellow-600'
  if (strength <= 4) return 'text-blue-600'
  return 'text-green-600'
})

const passwordStrengthLabel = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return 'Weak'
  if (strength <= 3) return 'Fair'
  if (strength <= 4) return 'Good'
  return 'Strong'
})

const isFormValid = computed(() => {
  return (
    form.value.currentPassword.length > 0 &&
    form.value.newPassword.length >= 8 &&
    form.value.newPassword === form.value.confirmPassword &&
    form.value.newPassword !== form.value.currentPassword
  )
})

const clearMessages = () => {
  error.value = ''
  successMessage.value = ''
}

const resetForm = () => {
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
  error.value = ''
  successMessage.value = ''
}

const startCountdown = () => {
  countdown.value = 5
  
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  countdownInterval = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      redirectToLogin()
    }
  }, 1000)
}

const redirectToLogin = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  navigateTo('/login')
}

const handleSubmit = async () => {
  // Clear previous messages
  clearMessages()

  // Validation
  if (!form.value.currentPassword) {
    error.value = 'Please enter your current password'
    return
  }

  if (form.value.newPassword.length < 8) {
    error.value = 'New password must be at least 8 characters'
    return
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.value.newPassword === form.value.currentPassword) {
    error.value = 'New password must be different from current password'
    return
  }

  loading.value = true

  try {
    const token = localStorage.getItem('auth_token')
    
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: {
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword,
      },
    })

    // Show success modal
    showSuccessModal.value = true
    
    // Reset form
    resetForm()

    // Start countdown
    startCountdown()
  } catch (err: any) {
    console.error('Password change error:', err)
    error.value = err.data?.message || err.message || 'Failed to change password'
  } finally {
    loading.value = false
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>