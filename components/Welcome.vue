<template>
  <CustomModal v-model="isOpen" :closable="false">
    <div class="flex flex-col max-h-[85vh] overflow-y-auto">
      <!-- Compact Header - Now Scrolls -->
      <div class="relative px-6 pt-6 pb-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-start gap-6">
          <div class="flex-1">
            <div class="mb-4">
              <AppLogo />
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome aboard! 🎉
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Let's get your organization set up in just a few steps.
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Need help? Contact us at <a href="mailto:support@bookyourpto.com" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">support@bookyourpto.com</a>
            </p>
          </div>
          
          <!-- Compact Animated Illustration -->
          <div class="hidden md:block w-24 h-24 relative flex-shrink-0">
            <div class="absolute inset-0 animate-float">
              <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-lg">
                <rect x="40" y="50" width="120" height="100" rx="8" fill="#3b82f6" opacity="0.9"/>
                <rect x="40" y="50" width="120" height="25" rx="8" fill="#2563eb"/>
                <circle cx="65" cy="62.5" r="4" fill="#60a5fa"/>
                <circle cx="100" cy="62.5" r="4" fill="#60a5fa"/>
                <circle cx="135" cy="62.5" r="4" fill="#60a5fa"/>
                <rect x="50" y="85" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="72" y="85" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="94" y="85" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="116" y="85" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="138" y="85" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="50" y="107" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="72" y="107" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="94" y="107" width="15" height="15" rx="2" fill="#10b981" opacity="1"/>
                <rect x="116" y="107" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="138" y="107" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="50" y="129" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="72" y="129" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <rect x="94" y="129" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
                <circle cx="170" cy="140" r="20" fill="#10b981" opacity="0.95"/>
                <path d="M 163 140 L 168 145 L 177 133" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="px-6 py-5 bg-white dark:bg-gray-950">
        <div class="max-w-xl mx-auto">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Icon name="lucide:settings" class="w-5 h-5 text-blue-600" />
            Quick Setup
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">
            These settings will help us tailor your experience.
          </p>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Leave Year Start -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Icon name="lucide:calendar-range" class="w-4 h-4 text-blue-600" />
                Leave Year Start Date
                <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.leaveYearStart"
                class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-gray-900 dark:text-white transition-all outline-none cursor-pointer"
              >
                <option v-for="month in months" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                When does your company's leave/vacation year begin?
              </p>
            </div>

            <!-- Annual Leave Allowance -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Icon name="lucide:calendar-days" class="w-4 h-4 text-blue-600" />
                  Default Annual Leave Allowance
                  <span class="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  @click="showAllowanceInfo = !showAllowanceInfo"
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <Icon name="lucide:help-circle" class="w-4 h-4" />
                </button>
              </div>
              
              <!-- Info Tooltip -->
              <Transition name="slide-fade">
                <div v-if="showAllowanceInfo" class="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div class="flex gap-2">
                    <Icon name="lucide:lightbulb" class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p class="text-xs text-blue-900 dark:text-blue-100">
                      This is the default allowance for new employees. You can customize individual allowances for each team member later in the dashboard.
                    </p>
                  </div>
                </div>
              </Transition>

              <div class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg">
                <input
                  v-model.number="form.annualLeaveAllowance"
                  type="number"
                  min="0"
                  max="365"
                  step="0.5"
                  required
                  class="w-24 px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-gray-900 dark:text-white text-center text-lg font-bold transition-all outline-none"
                />
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">days per year</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500">Standard is typically 20-30 days</p>
                </div>
              </div>
            </div>

            <!-- Info Card -->
            <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div class="flex gap-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Icon name="lucide:sparkles" class="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                    More customization options available
                  </h3>
                  <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    After setup, you can configure leave types, approval workflows, public holidays, departments, and individual employee settings from your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <Transition name="slide-fade">
              <div v-if="error" class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div class="flex items-start gap-2">
                  <Icon name="lucide:alert-circle" class="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p class="text-sm text-red-900 dark:text-red-100 font-medium">{{ error }}</p>
                </div>
              </div>
            </Transition>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="loading"
                class="w-full relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] disabled:hover:scale-100 group overflow-hidden"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
                  Setting up your workspace...
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <Icon name="lucide:rocket" class="w-5 h-5" />
                  Complete Setup & Get Started
                </span>
              </button>
              <p class="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">
                This will only take a moment
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'completed': [data: any]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const form = ref({
  leaveYearStart: 1, // January by default
  annualLeaveAllowance: 25,
})

const loading = ref(false)
const error = ref('')
const showAllowanceInfo = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('auth_token')
    
    // Update organization settings (company name already saved during registration)
    const response = await $fetch('/api/organization/onboarding', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: {
        leaveYearStart: form.value.leaveYearStart,
        annualLeaveAllowance: form.value.annualLeaveAllowance,
      },
    })

    emit('completed', response)
    isOpen.value = false
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to complete setup'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>