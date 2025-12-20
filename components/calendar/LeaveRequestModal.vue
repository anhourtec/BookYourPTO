<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
      <div class="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-950 shadow-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <!-- Header with user (only show for other users' leaves) -->
        <div class="flex items-start justify-between gap-4">
          <div v-if="isViewingOtherUserLeave" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              {{ userInitials }}
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ userName }}
              </div>
              <div v-if="userJobTitle" class="text-xs text-gray-500 dark:text-gray-400">
                {{ userJobTitle }}
              </div>
            </div>
          </div>

          <button
            type="button"
            class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'ml-auto': !isViewingOtherUserLeave }"
            @click="handleClose"
          >
            <Icon name="lucide:x" class="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <!-- VIEW MODE: Show existing leave details -->
        <div v-if="mode === 'view' && existingLeave" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Leave Request Details
          </h2>

          <!-- Leave Type Badge -->
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: (existingLeave.leaveType?.color || '#3b82f6') + '22' }"
            >
              <Icon
                :name="existingLeave.leaveType?.icon || 'lucide:calendar'"
                class="w-5 h-5"
                :style="{ color: existingLeave.leaveType?.color || '#3b82f6' }"
              />
            </div>
            <div>
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ existingLeave.leaveType?.name || 'Leave' }}
              </div>
              <div class="text-xs">
                <span :class="statusBadgeClass(existingLeave.status)">
                  {{ existingLeave.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Date Range -->
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Start Date</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatDate(existingLeave.startDate) }}
                <span v-if="existingLeave.startHalf !== 'FULL_DAY'" class="text-xs text-gray-500">
                  ({{ existingLeave.startHalf === 'FIRST_HALF' ? 'Morning' : 'Afternoon' }})
                </span>
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">End Date</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatDate(existingLeave.endDate) }}
                <span v-if="existingLeave.endHalf !== 'FULL_DAY'" class="text-xs text-gray-500">
                  ({{ existingLeave.endHalf === 'FIRST_HALF' ? 'Morning' : 'End of day' }})
                </span>
              </span>
            </div>
            <div class="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-800">
              <span class="text-gray-500 dark:text-gray-400">Total Days</span>
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ existingLeave.totalDays }} day{{ existingLeave.totalDays === 1 ? '' : 's' }}
              </span>
            </div>
          </div>

          <!-- Reason -->
          <div v-if="existingLeave.reason" class="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reason</div>
            <div class="text-sm text-gray-900 dark:text-white">{{ existingLeave.reason }}</div>
          </div>

          <!-- Notes -->
          <div v-if="existingLeave.notes" class="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</div>
            <div class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{{ existingLeave.notes }}</div>
          </div>

          <!-- Submission Info -->
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Submitted {{ formatDate(existingLeave.submittedAt) }}
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              @click="handleClose"
            >
              Close
            </button>
            <button
              v-if="canCancelLeave"
              type="button"
              class="px-4 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              :disabled="cancelling"
              @click="handleCancelLeave"
            >
              <Icon
                v-if="cancelling"
                name="lucide:loader-2"
                class="w-4 h-4 animate-spin"
              />
              <Icon v-else-if="isAdminRejectingOthersLeave" name="lucide:x-circle" class="w-4 h-4" />
              <Icon v-else name="lucide:trash-2" class="w-4 h-4" />
              <span>{{ cancelButtonText }}</span>
            </button>
          </div>
        </div>

        <!-- CREATE MODE: New leave request form -->
        <div v-else class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Book time off
          </h2>

          <!-- Type -->
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              v-model="form.leaveTypeId"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option
                v-for="t in activeLeaveTypes"
                :key="t.id"
                :value="t.id"
              >
                {{ t.name }}
              </option>
            </select>
          </div>

          <!-- Dates & halves -->
          <div class="grid sm:grid-cols-2 gap-4">
            <!-- Starting -->
            <div class="space-y-2">
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
                Starting
              </div>
              <div class="flex gap-2">
                <input
                  type="date"
                  v-model="startDateInput"
                  class="flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <select
                  v-model="form.startHalf"
                  class="w-32 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="FULL_DAY">Full day</option>
                  <option value="FIRST_HALF">Morning</option>
                  <option value="SECOND_HALF">Afternoon</option>
                </select>
              </div>
            </div>

            <!-- Ending -->
            <div class="space-y-2">
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
                Ending
              </div>
              <div class="flex gap-2">
                <input
                  type="date"
                  v-model="endDateInput"
                  class="flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <select
                  v-model="form.endHalf"
                  class="w-32 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="FULL_DAY">End of day</option>
                  <option value="FIRST_HALF">Morning</option>
                  <option value="SECOND_HALF">Afternoon</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Reason -->
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Reason <span class="text-gray-400 text-[11px]">(optional)</span>
            </label>
            <textarea
              v-model="form.reason"
              rows="3"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Reason for time off..."
            />
          </div>

          <!-- Footer -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div class="text-[11px] flex flex-col gap-1.5">
              <div class="text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span v-if="estimatedDays > 0 && deductsFromAllowance">
                  Takes
                  <span class="font-semibold text-gray-900 dark:text-white">{{ estimatedDays }}</span>
                  day{{ estimatedDays === 1 ? '' : 's' }} from {{ deductionBucketName }}
                </span>
                <span v-else-if="estimatedDays > 0">
                  Does not deduct from any allowance
                </span>

                <span v-if="selectedLeaveType" class="sm:ml-1.5">
                  • {{ isPaidLeave ? 'Paid leave' : 'Unpaid leave' }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSubmit"
                class="px-4 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                :disabled="submitting"
              >
                <Icon
                  v-if="submitting"
                  name="lucide:loader-2"
                  class="w-4 h-4 animate-spin"
                />
                <span>{{ submitting ? 'Sending…' : 'Send request' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { LeaveType } from '~/types/api'
import { useApi } from '~/composables/useApi'
import { usePermissions } from '~/composables/usePermissions'

interface Leave {
  id: string
  userId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  startHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  endHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  totalDays: number
  reason?: string
  notes?: string
  status: string
  submittedAt: string
  leaveType?: LeaveType
}

interface Props {
  open: boolean
  mode?: 'create' | 'view'
  existingLeave?: Leave | null
  startDate?: Date | null
  endDate?: Date | null
  userId: string
  currentUserId?: string
  currentUserRole?: string
  leaveTypes: LeaveType[]
  userName?: string
  userJobTitle?: string
  publicHolidays?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  existingLeave: null,
  startDate: null,
  endDate: null,
  currentUserId: '',
  currentUserRole: 'EMPLOYEE',
  publicHolidays: () => []
})

const emit = defineEmits<{
  'close': []
  'submit': [payload: {
    userId: string
    leaveTypeId: string
    startDate: string
    endDate: string
    startHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
    endHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
    reason?: string
  }]
  'cancel': [leaveId: string]
}>()

const api = useApi()
const permissions = usePermissions()
const submitting = ref(false)
const cancelling = ref(false)

// Organization settings (business hours)
const orgSettings = ref<any>(null)

const form = reactive({
  leaveTypeId: '',
  reason: '',
  startHalf: 'FULL_DAY' as 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF',
  endHalf: 'FULL_DAY' as 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF',
})

// Fetch organization settings on mount
const fetchOrgSettings = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    const settings = await $fetch('/api/organization/settings', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    orgSettings.value = settings
  } catch (error) {
    console.error('Failed to fetch organization settings:', error)
  }
}

onMounted(() => {
  fetchOrgSettings()
})

const activeLeaveTypes = computed(() =>
  props.leaveTypes.filter(t => t.isActive !== false)
)

const selectedLeaveType = computed(() =>
  activeLeaveTypes.value.find(t => t.id === form.leaveTypeId) || null
)

const deductsFromAllowance = computed(() => {
  if (!selectedLeaveType.value) return false
  const bucket = selectedLeaveType.value.deductionBucket ||
    (selectedLeaveType.value.annualAllowance && selectedLeaveType.value.annualAllowance > 0
      ? (selectedLeaveType.value.code === 'SICK_PAID' ? 'SICK' : 'ANNUAL')
      : 'NONE')
  return bucket !== 'NONE'
})

const deductionBucketName = computed(() => {
  if (!selectedLeaveType.value) return ''
  const bucket = selectedLeaveType.value.deductionBucket ||
    (selectedLeaveType.value.annualAllowance && selectedLeaveType.value.annualAllowance > 0
      ? (selectedLeaveType.value.code === 'SICK_PAID' ? 'SICK' : 'ANNUAL')
      : 'NONE')

  if (bucket === 'ANNUAL') return 'annual leave allowance'
  if (bucket === 'SICK') return 'sick leave allowance'
  return ''
})

const isPaidLeave = computed(() => {
  return !!selectedLeaveType.value?.paidLeave
})

const isViewingOtherUserLeave = computed(() => {
  return props.mode === 'view' && props.userId !== props.currentUserId
})

// Check if a date is a business day according to org settings
const isBusinessDay = (date: Date): boolean => {
  if (!orgSettings.value?.businessHours) return true // If no settings, allow all days

  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = dayNames[dayOfWeek]

  return dayName !== undefined && orgSettings.value.businessHours[dayName] === true
}

// Check if a date is a public holiday
const isPublicHoliday = (date: Date): boolean => {
  if (!props.publicHolidays || props.publicHolidays.length === 0) return false

  return props.publicHolidays.some(holiday => {
    const holidayDate = new Date(holiday.date)
    return (
      holidayDate.getUTCFullYear() === date.getFullYear() &&
      holidayDate.getUTCMonth() === date.getMonth() &&
      holidayDate.getUTCDate() === date.getDate()
    )
  })
}

// Get array of all dates in the selected range
const getDatesInRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

// Validate selected date range
const validateDateRange = (): { valid: boolean; message: string } => {
  if (!startDateInput.value || !endDateInput.value) {
    return { valid: false, message: 'Please select start and end dates' }
  }

  const start = new Date(startDateInput.value)
  const end = new Date(endDateInput.value)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid date format' }
  }

  if (end < start) {
    return { valid: false, message: 'End date cannot be before start date' }
  }

  // Get all dates in range
  const datesInRange = getDatesInRange(start, end)

  // Check for public holidays
  const holidayDates = datesInRange.filter(date => isPublicHoliday(date))
  if (holidayDates.length > 0) {
    const holidayNames = holidayDates.map(date => {
      const holiday = props.publicHolidays?.find(h => {
        const hDate = new Date(h.date)
        return (
          hDate.getUTCFullYear() === date.getFullYear() &&
          hDate.getUTCMonth() === date.getMonth() &&
          hDate.getUTCDate() === date.getDate()
        )
      })
      return holiday?.name || date.toLocaleDateString()
    }).join(', ')

    return {
      valid: false,
      message: `Cannot book leave on public holiday${holidayDates.length > 1 ? 's' : ''}: ${holidayNames}`
    }
  }

  // Check for non-business days
  const nonBusinessDays = datesInRange.filter(date => !isBusinessDay(date))
  if (nonBusinessDays.length > 0) {
    const dayNames = nonBusinessDays.map(date =>
      date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    ).join(', ')

    return {
      valid: false,
      message: `Cannot book leave on non-business day${nonBusinessDays.length > 1 ? 's' : ''}: ${dayNames}`
    }
  }

  return { valid: true, message: '' }
}

const userInitials = computed(() => {
  if (!props.userName) return 'U'
  const parts = props.userName.trim().split(/\s+/).filter(p => p.length > 0)
  if (parts.length === 0) return 'U'
  const first = parts[0]?.[0] ?? ''
  const last = parts[parts.length - 1]?.[0] ?? ''
  return (first + (parts.length > 1 ? last : '')).toUpperCase() || 'U'
})

const canCancelLeave = computed(() => {
  if (!props.existingLeave) return false

  return permissions.canCancelLeave(
    props.existingLeave.status,
    props.existingLeave.startDate,
    props.existingLeave.userId
  )
})

// Check if admin is rejecting someone else's leave
const isAdminRejectingOthersLeave = computed(() => {
  if (!props.existingLeave || !props.currentUserId || !props.currentUserRole) return false
  const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'].includes(props.currentUserRole)
  const isOwnLeave = props.existingLeave.userId === props.currentUserId
  return isAdmin && !isOwnLeave
})

// Button text based on who is cancelling/rejecting
const cancelButtonText = computed(() => {
  if (cancelling.value) return 'Processing...'
  return isAdminRejectingOthersLeave.value ? 'Reject Request' : 'Cancel Leave'
})

const startDateInput = ref('')
const endDateInput = ref('')

// ✅ Watch for modal open/close to reset states
watch(
  () => props.open,
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      // Modal is opening
      if (props.mode === 'create') {
        // Reset form for create mode
        const start = props.startDate ?? new Date()
        const end = props.endDate ?? start

        const toInput = (d: Date) => d.toISOString().slice(0, 10)

        startDateInput.value = toInput(start)
        endDateInput.value = toInput(end)

        form.leaveTypeId = activeLeaveTypes.value[0]?.id ?? ''
        form.reason = ''
        form.startHalf = 'FULL_DAY'
        form.endHalf = 'FULL_DAY'
      }
    } else if (!isOpen && wasOpen) {
      // Modal is closing - reset all loading states
      submitting.value = false
      cancelling.value = false
    }
  }
)

const estimatedDays = computed(() => {
  if (!startDateInput.value || !endDateInput.value) return 0
  const start = new Date(startDateInput.value)
  const end = new Date(endDateInput.value)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0

  const ms = end.getTime() - start.getTime()
  const baseDays = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1
  if (baseDays <= 0) return 0

  let total = baseDays

  if (form.startHalf !== 'FULL_DAY') total -= 0.5
  if (form.endHalf !== 'FULL_DAY') total -= 0.5

  return Math.max(total, 0.5)
})

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'  
  })
}

const statusBadgeClass = (status: string) => {
  const classes = 'inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide '
  switch (status) {
    case 'APPROVED':
      return classes + 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    case 'PENDING':
      return classes + 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    case 'CANCELLED':
      return classes + 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    case 'REJECTED':
      return classes + 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
    case 'WITHDRAWN':
      return classes + 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    default:
      return classes + 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

// ✅ Handle close to ensure state cleanup
const handleClose = () => {
  submitting.value = false
  cancelling.value = false
  emit('close')
}

const handleSubmit = async () => {
  if (!startDateInput.value || !endDateInput.value || !form.leaveTypeId) {
    alert('Please fill in all required fields')
    return
  }

  // Validate date range for business hours and public holidays
  const validation = validateDateRange()
  if (!validation.valid) {
    alert(validation.message)
    return
  }

  if (submitting.value) return // Prevent double submission

  submitting.value = true

  try {
    const payload = {
      userId: props.userId,
      leaveTypeId: form.leaveTypeId,
      startDate: new Date(startDateInput.value + 'T12:00:00.000Z').toISOString(),
      endDate: new Date(endDateInput.value + 'T12:00:00.000Z').toISOString(),
      startHalf: form.startHalf,
      endHalf: form.endHalf,
      reason: form.reason || undefined,
    }

    console.log('📤 Submitting leave request:', {
      ...payload,
      inputDates: { start: startDateInput.value, end: endDateInput.value }
    })

    // Emit the submit event - parent will handle closing the modal
    emit('submit', payload)

    // ✅ NOTE: Don't reset submitting here - the watcher will do it when modal closes
    // This prevents the button from flickering back to "Send request" before modal closes
  } catch (error) {
    console.error('Error submitting leave:', error)
    submitting.value = false // Only reset on error
    alert('An error occurred while submitting the request. Please try again.')
  }
}

const handleCancelLeave = () => {
  if (!props.existingLeave) return

  const confirmMessage = 'Are you sure you want to cancel this leave request? This will restore the leave balance.'
  if (!confirm(confirmMessage)) return

  if (cancelling.value) return // Prevent double submission

  cancelling.value = true

  // Emit event to parent - parent will handle the API call
  emit('cancel', props.existingLeave.id)

  // Note: Parent is responsible for closing the modal and refreshing data
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>