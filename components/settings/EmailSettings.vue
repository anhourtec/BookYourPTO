<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>

    <template v-else>
      <!-- Email Configuration Card -->
      <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-[rgb(var(--foreground))]">Email Configuration</h2>
            <p class="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              Configure SMTP server for sending password resets, invitations, and notifications
            </p>
          </div>
          <div v-if="emailConfigured" class="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Icon name="lucide:check-circle" class="w-4 h-4 text-green-600" />
            <span class="text-sm font-medium text-green-600">Configured</span>
          </div>
          <div v-else class="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Icon name="lucide:alert-circle" class="w-4 h-4 text-yellow-600" />
            <span class="text-sm font-medium text-yellow-600">Not Configured</span>
          </div>
        </div>

        <form @submit.prevent="saveEmailSettings" class="space-y-6">
          <!-- SMTP Host -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              SMTP Host <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <input
              v-model="form.smtpHost"
              type="text"
              required
              placeholder="smtp.google.com"
              :disabled="!canEditSettings()"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Hostname or IP address of your SMTP server
            </p>
          </div>

          <!-- SMTP Port -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              SMTP Port <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <input
              v-model.number="form.smtpPort"
              type="number"
              required
              min="1"
              max="65535"
              placeholder="465"
              :disabled="!canEditSettings()"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Common ports: 25 (unencrypted), 587 (STARTTLS), 465 (SSL/TLS)
            </p>
          </div>

          <!-- SMTP User -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              SMTP Username <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <input
              v-model="form.smtpUser"
              type="text"
              required
              placeholder="support@anhourtec.com"
              :disabled="!canEditSettings()"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Username for SMTP authentication
            </p>
          </div>

          <!-- SMTP Password -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              SMTP Password <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.smtpPassword"
                :type="showPassword ? 'text' : 'password'"
                :required="!emailConfigured"
                :placeholder="emailConfigured ? '••••••••••••' : 'Enter password'"
                :disabled="!canEditSettings()"
                class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              />
              <button
                v-if="canEditSettings()"
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              <span v-if="emailConfigured">Leave empty to keep existing password</span>
              <span v-else>Password for SMTP authentication</span>
            </p>
          </div>

          <!-- From Name -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              From Name <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <input
              v-model="form.emailFromName"
              type="text"
              required
              placeholder="BookYourPTO"
              :disabled="!canEditSettings()"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Name displayed in the "From" field of emails
            </p>
          </div>

          <!-- From Email Address -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              From Email Address <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <input
              v-model="form.emailFromAddress"
              type="email"
              required
              placeholder="support@anhourtec.com"
              :disabled="!canEditSettings()"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Email address used in the "From" field
            </p>
          </div>

          <!-- Encryption & Security Toggles -->
          <div class="space-y-4 pt-4 border-t border-[rgb(var(--border))]">
            <h3 class="text-sm font-semibold text-[rgb(var(--foreground))]">Security Settings</h3>
            
            <!-- Use SSL/TLS -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-[rgb(var(--foreground))]">
                  Use SSL/TLS
                </label>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Encrypt connection using SSL/TLS (port 465)
                </p>
              </div>
              <SwitchToggle
                v-model="form.useSSL"
                :disabled="!canEditSettings()"
              />
            </div>

            <!-- Use STARTTLS -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-[rgb(var(--foreground))]">
                  Use STARTTLS
                </label>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Upgrade connection to TLS (port 587)
                </p>
              </div>
              <SwitchToggle
                v-model="form.useSTARTTLS"
                :disabled="!canEditSettings()"
              />
            </div>

            <!-- Reject Unauthorized Certificates -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-[rgb(var(--foreground))]">
                  Reject Invalid Certificates
                </label>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Reject self-signed or untrusted certificates
                </p>
              </div>
              <SwitchToggle
                v-model="form.rejectUnauthorized"
                :disabled="!canEditSettings()"
              />
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div class="flex items-center gap-2">
              <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600" />
              <p class="text-sm text-green-600 font-medium">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg">
            <div class="flex items-center gap-2">
              <Icon name="lucide:alert-circle" class="w-5 h-5 text-[rgb(var(--destructive))]" />
              <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="canEditSettings()" class="flex items-center gap-3 pt-4">
            <button
              type="submit"
              :disabled="saving || testing"
              class="px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <span>{{ saving ? 'Saving...' : 'Save Configuration' }}</span>
            </button>

            <button
              type="button"
              @click="testEmailConnection"
              :disabled="saving || testing || !isFormValid"
              class="px-6 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium text-[rgb(var(--foreground))]"
            >
              <Icon v-if="testing" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <Icon v-else name="lucide:send" class="w-4 h-4" />
              <span>{{ testing ? 'Testing...' : 'Test Connection' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Email Templates Info -->
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <Icon name="lucide:info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-blue-600 mb-1">Email Features</h3>
            <ul class="text-sm text-blue-600/80 space-y-1">
              <li>• Password reset emails with secure tokens</li>
              <li>• User invitation emails with activation links</li>
              <li>• Leave request notifications</li>
              <li>• System alerts and announcements</li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { canAccessSettings } = usePermissions()

const canEditSettings = () => {
  return canAccessSettings()
}

const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const error = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const emailConfigured = ref(false)

const form = ref({
  smtpHost: '',
  smtpPort: 465,
  smtpUser: '',
  smtpPassword: '',
  emailFromName: 'BookYourPTO',
  emailFromAddress: '',
  useSSL: true,
  useSTARTTLS: false,
  rejectUnauthorized: true,
})

const isFormValid = computed(() => {
  return form.value.smtpHost && 
         form.value.smtpPort && 
         form.value.smtpUser && 
         form.value.emailFromName && 
         form.value.emailFromAddress
})

onMounted(async () => {
  await fetchEmailSettings()
})

const fetchEmailSettings = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    
    const data = await $fetch('/api/settings/email', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    
    if (data) {
      form.value.smtpHost = data.smtpHost || ''
      form.value.smtpPort = data.smtpPort || 465
      form.value.smtpUser = data.smtpUser || ''
      form.value.emailFromName = data.emailFromName || 'BookYourPTO'
      form.value.emailFromAddress = data.emailFromAddress || ''
      form.value.useSSL = data.useSSL ?? true
      form.value.useSTARTTLS = data.useSTARTTLS ?? false
      form.value.rejectUnauthorized = data.rejectUnauthorized ?? true
      
      // Password is never returned for security
      form.value.smtpPassword = ''
      
      // Check if email is configured
      emailConfigured.value = !!(data.smtpHost && data.smtpPort && data.smtpUser)
    }
  } catch (err: any) {
    console.error('Error fetching email settings:', err)
    error.value = err.data?.message || err.message || 'Failed to load email settings'
  } finally {
    loading.value = false
  }
}

const saveEmailSettings = async () => {
  if (!canEditSettings()) {
    error.value = 'You do not have permission to update settings'
    return
  }

  saving.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    
    const payload: any = {
      smtpHost: form.value.smtpHost,
      smtpPort: form.value.smtpPort,
      smtpUser: form.value.smtpUser,
      emailFromName: form.value.emailFromName,
      emailFromAddress: form.value.emailFromAddress,
      useSSL: form.value.useSSL,
      useSTARTTLS: form.value.useSTARTTLS,
      rejectUnauthorized: form.value.rejectUnauthorized,
    }
    
    // Only include password if it's been changed
    if (form.value.smtpPassword) {
      payload.smtpPassword = form.value.smtpPassword
    }
    
    console.log('💾 Saving email settings:', { ...payload, smtpPassword: '***' })
    
    await $fetch('/api/settings/email', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: payload,
    })
    
    console.log('✅ Email settings saved successfully')
    
    successMessage.value = 'Email settings saved successfully!'
    emailConfigured.value = true
    
    // Clear password field after successful save
    form.value.smtpPassword = ''
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('❌ Error saving email settings:', err)
    error.value = err.data?.message || err.message || 'Failed to save email settings'
  } finally {
    saving.value = false
  }
}

const testEmailConnection = async () => {
  if (!canEditSettings() || !isFormValid.value) {
    return
  }

  testing.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    
    const payload = {
      smtpHost: form.value.smtpHost,
      smtpPort: form.value.smtpPort,
      smtpUser: form.value.smtpUser,
      smtpPassword: form.value.smtpPassword || undefined,
      emailFromName: form.value.emailFromName,
      emailFromAddress: form.value.emailFromAddress,
      useSSL: form.value.useSSL,
      useSTARTTLS: form.value.useSTARTTLS,
      rejectUnauthorized: form.value.rejectUnauthorized,
    }
    
    console.log('🧪 Testing email connection...')
    
    const result = await $fetch('/api/settings/email/test', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: payload,
    })
    
    console.log('✅ Email connection test successful:', result)
    
    successMessage.value = 'Email connection test successful! Test email sent.'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (err: any) {
    console.error('❌ Email connection test failed:', err)
    error.value = err.data?.message || err.message || 'Email connection test failed'
  } finally {
    testing.value = false
  }
}
</script>