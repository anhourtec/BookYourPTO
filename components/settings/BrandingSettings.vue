<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>

    <template v-else>
      <!-- Branding Settings Card -->
      <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-[rgb(var(--foreground))]">Branding & White-labeling</h2>
            <p class="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              Customize the appearance of your platform with your own branding
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6">
          <!-- Brand Name -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Application Name
              <span class="text-[rgb(var(--muted-foreground))] font-normal ml-1">(replaces "BookYourPTO")</span>
            </label>
            <input
              v-model="form.brandName"
              type="text"
              placeholder="Your Company Name"
              :disabled="!isExecutive"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
              This will appear in navigation, emails, and throughout the platform
            </p>
          </div>

          <!-- Logo URLs Section -->
          <div class="pt-4 border-t border-[rgb(var(--border))]">
            <h3 class="text-base font-semibold text-[rgb(var(--foreground))] mb-4">Logo & Icons</h3>

            <div class="space-y-4">
              <!-- Light Mode Logo -->
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Logo (Light Mode)
                </label>
                <input
                  v-model="form.logoLightUrl"
                  type="url"
                  placeholder="https://example.com/logo-light.png"
                  :disabled="!isExecutive"
                  class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                  URL to your logo for light theme. Recommended size: 200x50px (transparent PNG)
                </p>
                <!-- Preview -->
                <div v-if="form.logoLightUrl" class="mt-3 p-4 bg-white border border-[rgb(var(--border))] rounded-lg">
                  <p class="text-xs text-gray-600 mb-2">Preview (Light Mode):</p>
                  <img
                    :src="form.logoLightUrl"
                    alt="Light mode logo preview"
                    class="h-12 object-contain"
                    @error="handleImageError('logoLightUrl')"
                  />
                </div>
              </div>

              <!-- Dark Mode Logo -->
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Logo (Dark Mode)
                  <span class="text-[rgb(var(--muted-foreground))] font-normal ml-1">(optional)</span>
                </label>
                <input
                  v-model="form.logoDarkUrl"
                  type="url"
                  placeholder="https://example.com/logo-dark.png"
                  :disabled="!isExecutive"
                  class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                  URL to your logo for dark theme. If not set, light mode logo will be used
                </p>
                <!-- Preview -->
                <div v-if="form.logoDarkUrl" class="mt-3 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                  <p class="text-xs text-gray-400 mb-2">Preview (Dark Mode):</p>
                  <img
                    :src="form.logoDarkUrl"
                    alt="Dark mode logo preview"
                    class="h-12 object-contain"
                    @error="handleImageError('logoDarkUrl')"
                  />
                </div>
              </div>

              <!-- Favicon -->
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Favicon (Light Mode)
                  <span class="text-[rgb(var(--muted-foreground))] font-normal ml-1">(optional)</span>
                </label>
                <input
                  v-model="form.faviconUrl"
                  type="url"
                  placeholder="https://example.com/favicon.ico"
                  :disabled="!isExecutive"
                  class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                  Custom favicon for browser tabs. Recommended: .ico, .png or .svg (32x32px)
                </p>
              </div>

              <!-- Dark Mode Favicon -->
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Favicon (Dark Mode)
                  <span class="text-[rgb(var(--muted-foreground))] font-normal ml-1">(optional)</span>
                </label>
                <input
                  v-model="form.faviconDarkUrl"
                  type="url"
                  placeholder="https://example.com/favicon-dark.ico"
                  :disabled="!isExecutive"
                  class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                  Custom favicon for dark mode. If not set, light mode favicon will be used
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3 pt-4" v-if="isExecutive">
            <button
              type="submit"
              :disabled="saving || !hasChanges"
              class="px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <Icon v-else name="lucide:save" class="w-4 h-4" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>

            <button
              type="button"
              @click="resetForm"
              :disabled="saving || !hasChanges"
              class="px-6 py-2.5 border border-[rgb(var(--border))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgb(var(--muted))] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>

            <button
              type="button"
              @click="resetToDefault"
              :disabled="saving"
              class="px-6 py-2.5 border border-[#3b82f6] text-[#3b82f6] dark:text-[#3b82f6] rounded-lg hover:bg-[#3b82f6]/10 dark:hover:bg-[#3b82f6]/20 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon name="lucide:rotate-ccw" class="w-4 h-4" />
              Reset to Default
            </button>
          </div>
        </form>
      </div>

      <!-- Success/Error Messages -->
      <Transition name="fade">
        <div v-if="successMessage" class="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
            <p class="text-sm font-medium text-green-800 dark:text-green-200">{{ successMessage }}</p>
          </div>
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="errorMessage" class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
            <p class="text-sm font-medium text-red-800 dark:text-red-200">{{ errorMessage }}</p>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup lang="ts">
const { isExecutive } = usePermissions()
const api = useApi()

// State
const loading = ref(true)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Form data
const form = reactive({
  brandName: 'BookYourPTO',
  logoLightUrl: null as string | null,
  logoDarkUrl: null as string | null,
  faviconUrl: null as string | null,
  faviconDarkUrl: null as string | null,
})

// Store original values for comparison
const originalForm = ref({})

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(form) !== JSON.stringify(originalForm.value)
})

// Load branding settings
const loadBranding = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/settings/branding', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })

    Object.assign(form, response)
    originalForm.value = JSON.parse(JSON.stringify(form))
  } catch (err: any) {
    console.error('Failed to load branding settings:', err)
    errorMessage.value = err.data?.message || err.message || 'Failed to load branding settings'
  } finally {
    loading.value = false
  }
}

// Save branding settings
const handleSave = async () => {
  if (!hasChanges.value || saving.value) return

  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/settings/branding', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: form,
    })

    Object.assign(form, response)
    originalForm.value = JSON.parse(JSON.stringify(form))

    successMessage.value = 'Branding settings saved successfully! Refresh the page to see changes.'

    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (err: any) {
    console.error('Failed to save branding settings:', err)
    errorMessage.value = err.data?.message || err.message || 'Failed to save branding settings'
  } finally {
    saving.value = false
  }
}

// Reset form to original values
const resetForm = () => {
  Object.assign(form, originalForm.value)
  successMessage.value = ''
  errorMessage.value = ''
}

// Handle image load errors
const handleImageError = (field: string) => {
  console.warn(`Failed to load image for ${field}`)
}

// Reset to default BookYourPTO branding
const resetToDefault = async () => {
  if (!confirm('Are you sure you want to reset all branding to default BookYourPTO values? This will remove all custom logos, colors, and branding.')) {
    return
  }

  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const defaultBranding = {
      brandName: 'BookYourPTO',
      logoLightUrl: null,
      logoDarkUrl: null,
      faviconUrl: null,
      faviconDarkUrl: null,
    }

    const response = await $fetch('/api/settings/branding', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: defaultBranding,
    })

    Object.assign(form, response)
    originalForm.value = JSON.parse(JSON.stringify(form))

    successMessage.value = 'Branding reset to default BookYourPTO values! Refresh the page to see changes.'

    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (err: any) {
    console.error('Failed to reset branding:', err)
    errorMessage.value = err.data?.message || err.message || 'Failed to reset branding'
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadBranding()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
