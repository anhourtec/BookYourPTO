<template>
  <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>

    <template v-else>
      <h2 class="text-xl font-bold text-[rgb(var(--foreground))] mb-4">Carry forward</h2>
      <p class="text-sm text-[rgb(var(--muted-foreground))] mb-6">
        How much unused allowance can be transferred into the next leave year.
      </p>

      <div class="space-y-6">
        <!-- Users with allowances in days -->
        <div>
          <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-4">
            Users with allowances in days
          </h3>
          <div class="flex items-center gap-3">
            <span class="text-sm text-[rgb(var(--foreground))]">Carry forward</span>
            <input
              v-model.number="form.carryForwardDays"
              type="number"
              min="0"
              step="0.5"
              :disabled="!canEditSettings()"
              class="w-24 px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition text-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span class="text-sm text-[rgb(var(--muted-foreground))]">days (max)</span>
          </div>
        </div>

        <!-- Users with allowances in hours -->
        <div class="pt-6 border-t border-[rgb(var(--border))]">
          <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-4">
            Users with allowances in hours
          </h3>
          <div class="flex items-center gap-3">
            <span class="text-sm text-[rgb(var(--foreground))]">Carry forward</span>
            <input
              v-model.number="form.carryForwardHours"
              type="number"
              min="0"
              step="0.5"
              :disabled="!canEditSettings()"
              class="w-24 px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition text-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span class="text-sm text-[rgb(var(--muted-foreground))]">hours (max)</span>
          </div>
        </div>

        <!-- Carry forward expires -->
        <div class="pt-6 border-t border-[rgb(var(--border))]">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">
                Carry forward expires?
              </h3>
              <p class="text-sm text-[rgb(var(--muted-foreground))]">
                Set an expiry date for carried forward allowance
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span 
                class="text-sm font-medium"
                :class="!form.carryForwardExpires ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--muted-foreground))]'"
              >
                Never
              </span>
              <SwitchToggle
                v-model="form.carryForwardExpires"
                :disabled="!canEditSettings()"
                aria-label="Toggle carry forward expiry"
              />
              <span 
                class="text-sm font-medium"
                :class="form.carryForwardExpires ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--muted-foreground))]'"
              >
                Always
              </span>
            </div>
          </div>

          <!-- Expiry months input - only shown when expiry is enabled -->
          <div v-if="form.carryForwardExpires" class="mt-4 pl-4 border-l-2 border-[rgb(var(--primary))]">
            <div class="flex items-center gap-3">
              <span class="text-sm text-[rgb(var(--foreground))]">Expires</span>
              <input
                v-model.number="form.carryForwardExpiryMonths"
                type="number"
                min="1"
                max="24"
                :disabled="!canEditSettings()"
                class="w-20 px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition text-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span class="text-sm text-[rgb(var(--muted-foreground))]">months from the start of the leave year</span>
            </div>
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              Common values: 3, 6, or 12 months
            </p>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600" />
          <p class="text-sm text-green-600 font-medium">{{ successMessage }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-6 p-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-5 h-5 text-[rgb(var(--destructive))]" />
          <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
        </div>
      </div>

      <!-- Save Button -->
      <div v-if="canEditSettings()" class="mt-6 flex justify-end">
        <button
          @click="saveSettings"
          :disabled="saving"
          class="px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
        >
          <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ saving ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const api = useApi()
const { canAccessSettings } = usePermissions()

// Check if user can edit settings (ADMINISTRATOR or EXECUTIVE only)
const canEditSettings = () => {
  return canAccessSettings()
}

const form = ref({
  carryForwardDays: 0,
  carryForwardHours: 0,
  carryForwardExpires: false,
  carryForwardExpiryMonths: 12,
})

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const successMessage = ref('')

// Fetch settings on mount
onMounted(async () => {
  await fetchSettings()
})

const fetchSettings = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await api.fetchSettings()

    if (data) {
      form.value.carryForwardDays = data.carryForwardDays ?? 0
      form.value.carryForwardHours = data.carryForwardHours ?? 0
      form.value.carryForwardExpires = data.carryForwardExpires ?? false
      form.value.carryForwardExpiryMonths = data.carryForwardExpiryMonths ?? 12
    }
  } catch (err: any) {
    console.error('Error fetching carry forward settings:', err)
    error.value = err.data?.message || err.message || 'Failed to load carry forward settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  if (!canEditSettings()) {
    error.value = 'You do not have permission to update settings'
    return
  }

  // Validation
  if (form.value.carryForwardExpires && (!form.value.carryForwardExpiryMonths || form.value.carryForwardExpiryMonths < 1)) {
    error.value = 'Please specify expiry months when carry forward expiry is enabled'
    return
  }

  saving.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const payload = {
      carryForwardDays: form.value.carryForwardDays,
      carryForwardHours: form.value.carryForwardHours,
      carryForwardExpires: form.value.carryForwardExpires,
      carryForwardExpiryMonths: form.value.carryForwardExpires ? form.value.carryForwardExpiryMonths : null,
    }
    
    console.log('💾 Saving carry forward settings:', payload)
    
    const result = await api.updateSettings(payload)
    
    console.log('✅ Carry forward settings saved successfully:', result)

    successMessage.value = 'Carry forward settings saved successfully!'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('❌ Error saving carry forward settings:', err)
    console.error('Error details:', {
      message: err.message,
      data: err.data,
      statusCode: err.statusCode,
    })
    error.value = err.data?.message || err.message || 'Failed to save carry forward settings'
  } finally {
    saving.value = false
  }
}
</script>