<template>
  <div
    v-if="day"
    class="rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-3"
  >
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ formattedDate }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ totalItemsText }}
        </p>
      </div>
      <button
        v-if="canManageLeaves && (day.leaves.length || day.holidays.length)"
        type="button"
        class="px-2 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
        @click="$emit('refresh')"
      >
        Refresh
      </button>
    </div>

    <!-- Public Holidays Section -->
    <div v-if="day.holidays.length" class="space-y-2">
      <div class="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
        Public Holidays
      </div>
      <div
        v-for="holiday in day.holidays"
        :key="holiday.name"
        class="flex items-start gap-2 rounded-lg border border-rose-100 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-2"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-rose-200 dark:bg-rose-900/40"
        >
          <Icon
            name="lucide:calendar-heart"
            class="w-4 h-4 text-rose-700 dark:text-rose-400"
          />
        </div>
        <div class="space-y-0.5 flex-1">
          <div class="text-xs font-medium text-gray-900 dark:text-white">
            {{ holiday.name }}
          </div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400">
            Public Holiday • Non-working day
          </div>
        </div>
      </div>
    </div>

    <!-- Leaves Section -->
    <div v-if="day.leaves.length" class="space-y-2">
      <div
        v-if="day.holidays.length"
        class="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
      >
        Leave Requests
      </div>
      <div
        v-for="leave in day.leaves"
        :key="leave.id"
        class="flex items-start justify-between gap-2 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        @click="$emit('leave-click', leave)"
      >
        <div class="flex items-start gap-2">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            :style="{ backgroundColor: (leave.leaveType?.color || '#3b82f6') + '22' }"
          >
            <Icon
              v-if="leave.leaveType?.icon"
              :name="leave.leaveType.icon"
              class="w-4 h-4"
              :style="{ color: leave.leaveType?.color || '#3b82f6' }"
            />
            <Icon
              v-else
              name="lucide:calendar"
              class="w-4 h-4"
              :style="{ color: leave.leaveType?.color || '#3b82f6' }"
            />
          </div>
          <div class="space-y-0.5">
            <div class="text-xs font-medium text-gray-900 dark:text-white">
              {{ leave.leaveType?.name || 'Leave' }}
            </div>
            <div class="text-[11px] text-gray-500 dark:text-gray-400">
              {{ formatRange(leave.startDate, leave.endDate) }}
              •
              {{ leave.totalDays }} day{{ leave.totalDays === 1 ? '' : 's' }}
              •
              <span
                :class="statusClass(leave.status)"
              >
                {{ leave.status }}
              </span>
            </div>
            <div
              v-if="leave.reason"
              class="text-[11px] text-gray-500 dark:text-gray-400"
            >
              {{ leave.reason }}
            </div>
          </div>
        </div>

        <button
          v-if="canCancel(leave)"
          type="button"
          class="flex items-center justify-center w-7 h-7 rounded-full border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40 transition-colors"
          @click.stop="onCancel(leave.id)"
          :disabled="cancellingId === leave.id"
          :title="cancelTitle(leave)"
        >
          <Icon
            v-if="cancellingId === leave.id"
            name="lucide:loader-2"
            class="w-3.5 h-3.5 animate-spin"
          />
          <Icon
            v-else
            name="lucide:trash-2"
            class="w-3.5 h-3.5"
          />
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <p v-if="!day.leaves.length && !day.holidays.length" class="text-xs text-gray-500 dark:text-gray-400">
      No events for this day.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { CalendarDay as CalendarDayType } from '~/composables/useCalendar'
import type { User } from '~/types/user'
import { useApi } from '~/composables/useApi'

interface Props {
  day: CalendarDayType | null
  currentUser: User | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: [id: string]
  refresh: []
  'leave-click': [leave: any]
}>()

const api = useApi()
const cancellingId = ref<string | null>(null)

const canManageLeaves = computed(() => {
  const role = props.currentUser?.role
  return role === 'ADMINISTRATOR' || role === 'EXECUTIVE'
})

const formattedDate = computed(() => {
  if (!props.day) return ''
  return props.day.date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
})

const totalItemsText = computed(() => {
  if (!props.day) return ''
  const holidayCount = props.day.holidays.length
  const leaveCount = props.day.leaves.length
  const total = holidayCount + leaveCount
  
  if (total === 0) return 'No events'
  
  const parts = []
  if (holidayCount) parts.push(`${holidayCount} holiday${holidayCount === 1 ? '' : 's'}`)
  if (leaveCount) parts.push(`${leaveCount} leave${leaveCount === 1 ? '' : 's'}`)
  
  return parts.join(', ')
})

const statusClass = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'PENDING':
      return 'text-amber-600 dark:text-amber-400'
    case 'CANCELLED':
      return 'text-gray-400 dark:text-gray-500'
    case 'REJECTED':
      return 'text-red-500 dark:text-red-400'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
}

const formatRange = (start: string | Date, end: string | Date) => {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const sText = s.toLocaleDateString(undefined, opts)
  const eText = e.toLocaleDateString(undefined, opts)
  return sText === eText ? sText : `${sText} – ${eText}`
}

const canCancel = (leave: any) => {
  const role = props.currentUser?.role
  const isAdmin = role === 'ADMINISTRATOR' || role === 'EXECUTIVE'
  const isOwner = leave.userId === props.currentUser?.id

  if (!['PENDING', 'APPROVED'].includes(leave.status)) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const leaveStartDate = new Date(leave.startDate)
  leaveStartDate.setHours(0, 0, 0, 0)

  if (!isAdmin && leaveStartDate < today) return false

  return isOwner || isAdmin
}

const cancelTitle = (leave: any) => {
  if (!canCancel(leave)) return 'Cannot cancel this leave'
  return 'Cancel this leave'
}

const onCancel = async (id: string) => {
  if (!confirm('Are you sure you want to cancel this leave? This will restore your leave balance.')) return
  
  try {
    cancellingId.value = id
    await api.cancelLeaveRequest(id)
    
    console.log('✅ Leave cancelled successfully')
    emit('cancel', id)
    emit('refresh')
  } catch (error: any) {
    console.error('❌ Failed to cancel leave:', error)
    alert(error.data?.message || error.message || 'Failed to cancel leave')
  } finally {
    cancellingId.value = null
  }
}
</script>