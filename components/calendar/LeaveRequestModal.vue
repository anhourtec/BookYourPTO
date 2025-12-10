<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
      <div class="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-950 shadow-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-5">
        <!-- Header with user -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              {{ userInitials }}
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ userName || 'My time off' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ userJobTitle || 'Time off request' }}
              </div>
            </div>
          </div>

          <button
            type="button"
            class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="$emit('close')"
          >
            <Icon name="lucide:x" class="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Book time off
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Type -->
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              v-model="form.leaveTypeId"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
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
                  class="flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  required
                />
                <select
                  v-model="form.startHalf"
                  class="w-32 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-2 text-xs"
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
                  class="flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  required
                />
                <select
                  v-model="form.endHalf"
                  class="w-32 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-2 text-xs"
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
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm resize-none"
              placeholder="Reason for time off..."
            />
          </div>

          <!-- Footer -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div class="text-[11px] text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1.5">
              <span v-if="estimatedDays > 0 && deductsFromAllowance">
                Takes
                <span class="font-semibold text-gray-900 dark:text-white">{{ estimatedDays }}</span>
                day{{ estimatedDays === 1 ? '' : 's' }} from allowance
              </span>
              <span v-else-if="estimatedDays > 0">
                Does not deduct from annual allowance
              </span>

              <span v-if="selectedLeaveType" class="sm:ml-1.5">
                • {{ isPaidLeave ? 'Paid leave' : 'Unpaid leave' }}
              </span>
            </div>

            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                @click="$emit('close')"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
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
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { LeaveType } from '~/types/api'

interface Props {
  open: boolean
  startDate: Date | null
  endDate: Date | null
  userId: string
  leaveTypes: LeaveType[]
  userName?: string
  userJobTitle?: string
}

const props = defineProps<Props>()

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
}>()

const submitting = ref(false)

const form = reactive({
  leaveTypeId: '',
  reason: '',
  startHalf: 'FULL_DAY' as 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF',
  endHalf: 'FULL_DAY' as 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF',
})

const activeLeaveTypes = computed(() =>
  props.leaveTypes.filter(t => t.isActive !== false)
)

const selectedLeaveType = computed(() =>
  activeLeaveTypes.value.find(t => t.id === form.leaveTypeId) || null
)

// Deduct / paid flags from backend settings
const deductsFromAllowance = computed(() => {
  return !!selectedLeaveType.value?.annualAllowance
})

const isPaidLeave = computed(() => {
  return !!selectedLeaveType.value?.paidLeave
})

const userInitials = computed(() => {
  if (!props.userName) return 'U'
  const parts = props.userName.split(' ')
  const first = parts[0]?.[0] ?? ''
  const last = parts[1]?.[0] ?? ''
  return (first + last).toUpperCase() || 'U'
})

const userName = computed(() => props.userName ?? '')
const userJobTitle = computed(() => props.userJobTitle ?? '')

const startDateInput = ref('')
const endDateInput = ref('')

watch(
  () => props.open,
  (val) => {
    if (!val) return
    const start = props.startDate ?? new Date()
    const end = props.endDate ?? start

    const toInput = (d: Date) =>
      d.toISOString().slice(0, 10)

    startDateInput.value = toInput(start)
    endDateInput.value = toInput(end)

    form.leaveTypeId = activeLeaveTypes.value[0]?.id ?? ''
    form.reason = ''
    form.startHalf = 'FULL_DAY'
    form.endHalf = 'FULL_DAY'
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

const handleSubmit = async () => {
  if (!startDateInput.value || !endDateInput.value || !form.leaveTypeId) {
    console.error('❌ Missing required fields:', {
      startDate: startDateInput.value,
      endDate: endDateInput.value,
      leaveTypeId: form.leaveTypeId
    })
    return
  }

  console.log('🚀 SUBMITTING:', {
    userId: props.userId,
    leaveTypeId: form.leaveTypeId,
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    startHalf: form.startHalf,
    endHalf: form.endHalf,
    reason: form.reason
  })

  submitting.value = true
  try {
    const payload = {
      userId: props.userId,
      leaveTypeId: form.leaveTypeId,
      startDate: new Date(startDateInput.value).toISOString(),
      endDate: new Date(endDateInput.value).toISOString(),
      startHalf: form.startHalf,
      endHalf: form.endHalf,
      reason: form.reason || undefined,
    }
    
    console.log('📤 EMITTING PAYLOAD:', payload)
    await emit('submit', payload)
    console.log('✅ EMIT SUCCESS')
  } catch (error) {
    console.error('❌ SUBMIT ERROR:', error)
  } finally {
    submitting.value = false
  }
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
