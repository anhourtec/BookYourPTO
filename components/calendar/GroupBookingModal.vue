<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
      <div class="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-950 shadow-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon name="lucide:users" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-900 dark:text-white">
                Group Booking
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Book time off for an entire department
              </div>
            </div>
          </div>

          <button
            type="button"
            class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="handleClose"
          >
            <Icon name="lucide:x" class="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <!-- Form -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Book time off for department
          </h2>

          <!-- Department Selection -->
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Department <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.departmentId"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Choose a department</option>
              <option
                v-for="dept in activeDepartments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.name }} ({{ dept._count?.users || 0 }} {{ dept._count?.users === 1 ? 'person' : 'people' }})
              </option>
            </select>
            <div v-if="selectedDepartment" class="flex items-start gap-2 mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <Icon name="lucide:info" class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p class="text-xs text-blue-700 dark:text-blue-300">
                This will create leave requests for all {{ selectedDepartment._count?.users || 0 }} members of {{ selectedDepartment.name }}
              </p>
            </div>
          </div>

          <!-- Type -->
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Type <span class="text-red-500">*</span>
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
              placeholder="Reason for group booking..."
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
                class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSubmit"
                class="px-4 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                :disabled="submitting || !form.departmentId || !form.leaveTypeId"
              >
                <Icon
                  v-if="submitting"
                  name="lucide:loader-2"
                  class="w-4 h-4 animate-spin"
                />
                <Icon v-else name="lucide:calendar-plus" class="w-4 h-4" />
                <span>{{ submitting ? 'Creating...' : 'Book for Department' }}</span>
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

interface Department {
  id: string
  name: string
  code: string
  color: string
  isActive: boolean
  _count?: {
    users: number
  }
}

interface Props {
  open: boolean
  departments: Department[]
  leaveTypes: LeaveType[]
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
})

const emit = defineEmits<{
  'close': []
  'submit': [payload: {
    departmentId: string
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
  departmentId: '',
  leaveTypeId: '',
  reason: '',
  startHalf: 'FULL_DAY' as 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF',
  endHalf: 'FULL_DAY' as 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF',
})

const startDateInput = ref('')
const endDateInput = ref('')

const activeDepartments = computed(() =>
  props.departments.filter(d => d.isActive !== false)
)

const activeLeaveTypes = computed(() =>
  props.leaveTypes.filter(t => t.isActive !== false)
)

const selectedDepartment = computed(() =>
  activeDepartments.value.find(d => d.id === form.departmentId) || null
)

const selectedLeaveType = computed(() =>
  activeLeaveTypes.value.find(t => t.id === form.leaveTypeId) || null
)

const deductsFromAllowance = computed(() => {
  return !!selectedLeaveType.value?.annualAllowance
})

const isPaidLeave = computed(() => {
  return !!selectedLeaveType.value?.paidLeave
})

watch(
  () => props.open,
  (val) => {
    if (!val) return
    const today = new Date()

    const toInput = (d: Date) =>
      d.toISOString().slice(0, 10)

    startDateInput.value = toInput(today)
    endDateInput.value = toInput(today)

    form.departmentId = activeDepartments.value[0]?.id ?? ''
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

const handleClose = () => {
  if (submitting.value) return // Prevent closing while submitting
  emit('close')
}

const handleSubmit = async () => {
  // Validation
  if (!startDateInput.value || !endDateInput.value || !form.departmentId || !form.leaveTypeId) {
    alert('Please fill in all required fields')
    return
  }

  // Prevent double submission
  if (submitting.value) return

  submitting.value = true
  
  try {
    const payload = {
      departmentId: form.departmentId,
      leaveTypeId: form.leaveTypeId,
      startDate: new Date(startDateInput.value).toISOString(),
      endDate: new Date(endDateInput.value).toISOString(),
      startHalf: form.startHalf,
      endHalf: form.endHalf,
      reason: form.reason || undefined,
    }
    
    // Emit the payload - parent will handle the async operation
    emit('submit', payload)
  } catch (error) {
    console.error('Error submitting group booking:', error)
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