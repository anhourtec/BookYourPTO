<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>

    <template v-else>
      <!-- Workspace Settings Card -->
      <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
        <h2 class="text-xl font-bold text-[rgb(var(--foreground))] mb-6">Workspace settings</h2>
        
        <div class="space-y-6">
          <!-- Company Name -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Company name
            </label>
            <input
              v-model="form.companyName"
              type="text"
              :disabled="!canEditSettings()"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <!-- Time Zone Selector -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Time zone
            </label>
            <div class="relative" ref="timezoneContainerRef">
              <!-- Display/Search Input -->
              <div class="relative">
                <input
                  v-model="timezoneSearchQuery"
                  type="text"
                  placeholder="Search timezone..."
                  :disabled="!canEditSettings()"
                  @focus="openDropdown"
                  @click="openDropdown"
                  class="w-full px-4 py-2.5 pr-10 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Icon 
                  name="lucide:chevron-down" 
                  class="absolute right-3 top-3 w-5 h-5 text-[rgb(var(--muted-foreground))] pointer-events-none transition-transform"
                  :class="{ 'rotate-180': isDropdownOpen }"
                />
              </div>
              
              <!-- Dropdown Menu -->
              <div 
                v-show="isDropdownOpen"
                class="absolute z-50 w-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg overflow-hidden"
              >
                <div class="max-h-64 overflow-y-auto">
                  <div
                    v-for="tz in displayedTimezones"
                    :key="tz.value"
                    @click="selectTimezone(tz)"
                    class="px-4 py-2.5 hover:bg-[rgb(var(--muted))] cursor-pointer transition"
                    :class="{ 'bg-[rgb(var(--primary))]/10': form.timezone === tz.value }"
                  >
                    <div class="text-sm font-medium text-[rgb(var(--foreground))]">
                      {{ tz.label }}
                    </div>
                    <div class="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                      {{ tz.offset }}
                    </div>
                  </div>
                  <div v-if="displayedTimezones.length === 0" class="px-4 py-6 text-center text-sm text-[rgb(var(--muted-foreground))]">
                    No timezones found
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              Selected: <span class="font-medium">{{ currentTimezoneDisplay }}</span>
            </p>
          </div>

          <!-- Business Hours -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-3">
              Business hours
            </label>
            <div class="flex flex-wrap gap-4">
              <label
                v-for="day in weekDays"
                :key="day.value"
                class="flex items-center gap-2"
                :class="canEditSettings() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
              >
                <input
                  type="checkbox"
                  v-model="form.businessDays"
                  :value="day.value"
                  :disabled="!canEditSettings()"
                  class="w-4 h-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span class="text-sm text-[rgb(var(--foreground))]">{{ day.label }}</span>
              </label>
            </div>
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              Select working days for your organization
            </p>
          </div>

          <!-- Week Start Day -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Week starts on
            </label>
            <select
              v-model.number="form.weekStartDay"
              :disabled="!canEditSettings()"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option :value="0">Sunday</option>
              <option :value="1">Monday</option>
            </select>
          </div>

          <!-- Leave Year Start -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Leave year start date
            </label>
            <select
              v-model.number="form.leaveYearStart"
              :disabled="!canEditSettings()"
              class="w-full px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              When does your company's leave/vacation year begin?
            </p>
          </div>

          <!-- Default Annual Leave Allowance -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Default annual leave allowance
            </label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="form.defaultLeaveAllowance"
                type="number"
                min="0"
                max="365"
                step="0.5"
                :disabled="!canEditSettings()"
                class="w-32 px-4 py-2.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition text-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span class="text-sm text-[rgb(var(--muted-foreground))]">days per year</span>
            </div>
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              Standard is typically 20-30 days
            </p>
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
      </div>

      <!-- Privacy Card -->
      <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
        <h2 class="text-xl font-bold text-[rgb(var(--foreground))] mb-6">Privacy</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">Leave types</h3>
            <p class="text-sm text-[rgb(var(--muted-foreground))]">
              You can set the visibility of each different type of booking in Leave Type Settings.
            </p>
          </div>

          <!-- Calendar View Toggle -->
          <div class="flex items-start justify-between gap-4 py-4 border-t border-[rgb(var(--border))]">
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">Calendar view</h3>
              <p class="text-sm text-[rgb(var(--muted-foreground))]">
                Calendar View shows the absences of a user over a full year. Hiding this means that screen is only visible to a user, their manager / approver or admin users.
              </p>
            </div>

            <div class="flex flex-col items-end gap-2">
              <SwitchToggle
                v-model="form.calendarViewHidden"
                :disabled="!canEditSettings()"
                aria-label="Toggle calendar view visibility"
                @update:modelValue="savePrivacySettings"
              />
              <span 
                class="text-xs font-medium"
                :class="form.calendarViewHidden ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--muted-foreground))]'"
              >
                {{ form.calendarViewHidden ? 'Hidden' : 'Visible' }}
              </span>
            </div>
          </div>

          <!-- Other Departments Toggle -->
          <div class="flex items-start justify-between gap-4 py-4 border-t border-[rgb(var(--border))]">
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">Other departments</h3>
              <p class="text-sm text-[rgb(var(--muted-foreground))]">
                When visible, users can view the calendars of any department. Hiding departments restricts users to only seeing the calendar of their own department. Note: This doesn't affect admin users, they can see everything.
              </p>
            </div>

            <div class="flex flex-col items-end gap-2">
              <SwitchToggle
                v-model="form.otherDepartmentsHidden"
                :disabled="!canEditSettings()"
                aria-label="Toggle other departments visibility"
                @update:modelValue="savePrivacySettings"
              />
              <span 
                class="text-xs font-medium"
                :class="form.otherDepartmentsHidden ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--muted-foreground))]'"
              >
                {{ form.otherDepartmentsHidden ? 'Hidden' : 'Visible' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface TimezoneOption {
  value: string
  label: string
  offset: string
  searchText: string
}

interface FormData {
  companyName: string
  timezone: string
  businessDays: string[]
  weekStartDay: number
  leaveYearStart: number
  defaultLeaveAllowance: number
  calendarViewHidden: boolean
  otherDepartmentsHidden: boolean
}

const api = useApi()
const { getUser, canAccessSettings } = usePermissions()

const currentUser = computed(() => getUser())

const canEditSettings = (): boolean => {
  return canAccessSettings()
}

const form = ref<FormData>({
  companyName: '',
  timezone: 'UTC',
  businessDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  weekStartDay: 1,
  leaveYearStart: 1,
  defaultLeaveAllowance: 25,
  calendarViewHidden: false,
  otherDepartmentsHidden: false,
})

const loading = ref<boolean>(true)
const saving = ref<boolean>(false)
const error = ref<string>('')
const successMessage = ref<string>('')
const timezoneSearchQuery = ref<string>('')
const isDropdownOpen = ref<boolean>(false)
const timezoneContainerRef = ref<HTMLDivElement | null>(null)

const weekDays = [
  { label: 'Mon', value: 'mon' },
  { label: 'Tue', value: 'tue' },
  { label: 'Wed', value: 'wed' },
  { label: 'Thu', value: 'thu' },
  { label: 'Fri', value: 'fri' },
  { label: 'Sat', value: 'sat' },
  { label: 'Sun', value: 'sun' },
]

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

// Generate all timezones once and cache them
const allTimezones = computed<TimezoneOption[]>(() => {
  const zones: string[] = typeof (Intl as any).supportedValuesOf === 'function' 
    ? (Intl as any).supportedValuesOf('timeZone') 
    : [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'America/Vancouver',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Dubai',
      'Asia/Singapore',
      'Australia/Sydney',
    ]
  
  const now = new Date()
  
  return zones.map((tz: string): TimezoneOption | null => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset'
      })
      
      const parts = formatter.formatToParts(now)
      const offsetPart = parts.find(part => part.type === 'timeZoneName')
      const offset = offsetPart?.value || ''
      
      const label = `${offset} ${tz.replace(/_/g, ' ')}`
      
      return {
        value: tz,
        label,
        offset,
        searchText: `${tz} ${offset}`.toLowerCase()
      }
    } catch {
      return null
    }
  })
  .filter((tz): tz is TimezoneOption => tz !== null)
  .sort((a: TimezoneOption, b: TimezoneOption): number => {
    const offsetA = a.offset.replace(/[^\d.+-]/g, '')
    const offsetB = b.offset.replace(/[^\d.+-]/g, '')
    return offsetA.localeCompare(offsetB) || a.value.localeCompare(b.value)
  })
})

// Filter timezones based on search query
const displayedTimezones = computed<TimezoneOption[]>(() => {
  const query = timezoneSearchQuery.value.toLowerCase().trim()
  
  if (!query) {
    return allTimezones.value.slice(0, 100)
  }
  
  return allTimezones.value
    .filter(tz => tz.searchText.includes(query))
    .slice(0, 100)
})

// Get current timezone display label
const currentTimezoneDisplay = computed<string>(() => {
  const selected = allTimezones.value.find(tz => tz.value === form.value.timezone)
  return selected ? selected.label : form.value.timezone
})

// Open dropdown
const openDropdown = (): void => {
  if (!canEditSettings()) return
  isDropdownOpen.value = true
  timezoneSearchQuery.value = ''
}

// Select a timezone
const selectTimezone = (tz: TimezoneOption): void => {
  form.value.timezone = tz.value
  timezoneSearchQuery.value = tz.label
  isDropdownOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent): void => {
  if (timezoneContainerRef.value && !timezoneContainerRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
    timezoneSearchQuery.value = currentTimezoneDisplay.value
  }
}

onMounted(async () => {
  await fetchSettings()
  timezoneSearchQuery.value = currentTimezoneDisplay.value
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const fetchSettings = async (): Promise<void> => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await api.fetchSettings()

    if (data) {
      form.value.companyName = data.name || ''
      form.value.timezone = data.timezone || 'UTC'
      form.value.businessDays = data.businessDays || ['mon', 'tue', 'wed', 'thu', 'fri'] // ✅ Load business days
      form.value.weekStartDay = data.weekStartDay ?? 1
      form.value.leaveYearStart = data.leaveYearStartMonth || 1
      form.value.defaultLeaveAllowance = data.defaultLeaveAllowance || 25
      form.value.calendarViewHidden = data.calendarViewRestricted || false
      form.value.otherDepartmentsHidden = data.departmentViewRestricted || false
    }
  } catch (err: any) {
    console.error('Error fetching settings:', err)
    error.value = err.data?.message || err.message || 'Failed to load settings'
  } finally {
    loading.value = false
  }
}
const saveSettings = async (): Promise<void> => {
  if (!canEditSettings()) {
    error.value = 'You do not have permission to update settings'
    return
  }

  // ✅ Validate that at least one business day is selected
  if (form.value.businessDays.length === 0) {
    error.value = 'Please select at least one business day'
    return
  }

  saving.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const payload = {
      name: form.value.companyName,
      timezone: form.value.timezone,
      businessDays: form.value.businessDays, // ✅ Include business days
      weekStartDay: form.value.weekStartDay,
      leaveYearStartMonth: form.value.leaveYearStart,
      defaultLeaveAllowance: form.value.defaultLeaveAllowance,
    }
    
    await api.updateSettings(payload)

    successMessage.value = 'Settings saved successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('Error saving settings:', err)
    error.value = err.data?.message || err.message || 'Failed to save settings'
  } finally {
    saving.value = false
  }
}

const savePrivacySettings = async (): Promise<void> => {
  if (!canEditSettings()) {
    return
  }

  try {
    const payload = {
      calendarViewRestricted: form.value.calendarViewHidden,
      departmentViewRestricted: form.value.otherDepartmentsHidden,
    }
    
    await api.updateSettings(payload)
  } catch (err: any) {
    console.error('Error saving privacy settings:', err)
    await fetchSettings()
  }
}
</script>