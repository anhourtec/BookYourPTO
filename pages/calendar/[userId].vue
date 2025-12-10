<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <main class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <!-- Top user/year header -->
      <CalendarHeader
        :year="year"
        :first-name="user?.firstName"
        :last-name="user?.lastName"
        :job-title="user?.jobTitle"
        :department-name="user?.department?.name"
        @prev-year="changeYear(-1)"
        @next-year="changeYear(1)"
      />

      <!-- Main layout: calendar + sidebar -->
      <div class="flex flex-col lg:flex-row gap-6 items-start">
        <!-- Left: calendar area -->
        <section class="flex-1 space-y-4 w-full">
          <CalendarGrid
            :months="months"
            :current-user="user"
            @day-click="onDayClick"
            @leave-cancel="handleLeaveCancel"
          />
        </section>

        <!-- Right: sidebar column -->
        <aside
          class="w-full lg:w-80 lg:shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start"
        >
          <!-- Year end summary card group -->
          <div class="rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Year end Dec {{ year }}
            </div>

            <!-- Allowance -->
            <div class="mb-4">
              <div class="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                <span>Allowance</span>
                <span>Days</span>
              </div>
              <div class="rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5">
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Contractual allowance</span>
                  <span>{{ balanceSummary?.totalAllowance ?? 0 }}</span>
                </div>
                <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-gray-900 dark:text-white">
                  <span>Total allowance</span>
                  <span>{{ balanceSummary?.totalAllowance ?? 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Deductions -->
            <div>
              <div class="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                <span>Deductions</span>
                <span>Days</span>
              </div>
              <div class="rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5">
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Total deductions</span>
                  <span>{{ balanceSummary?.totalUsed ?? 0 }}</span>
                </div>
                <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div class="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                    Days remaining
                  </div>
                  <div class="text-3xl leading-tight font-semibold text-gray-900 dark:text-white">
                    {{ balanceSummary?.totalRemaining ?? (balanceSummary?.totalAllowance ?? 0) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Deductible leave card -->
          <div class="rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2.5">
              Deductible leave
            </h3>
            <div class="space-y-1.5 text-xs text-gray-700 dark:text-gray-200">
              <template v-if="deductibleDisplay.length">
                <div
                  v-for="item in deductibleDisplay"
                  :key="item.key"
                  class="flex items-center justify-between gap-2"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex w-6 h-6 items-center justify-center rounded-md text-[13px]"
                      :style="{ backgroundColor: item.color + '18', color: item.color }"
                    >
                      <Icon :name="item.icon" class="w-3.5 h-3.5" />
                    </span>
                    <span>{{ item.label }}</span>
                  </div>
                  <span class="text-gray-500 dark:text-gray-400">
                    {{ item.days }} days
                  </span>
                </div>
              </template>
              <p v-else class="text-gray-400 dark:text-gray-500">
                No deductible leave yet.
              </p>
            </div>
          </div>

          <!-- Non-deductible leave card -->
          <div class="rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2.5">
              Non-deductible leave
            </h3>
            <div class="space-y-1.5 text-xs text-gray-700 dark:text-gray-200">
              <template v-if="nonDeductibleDisplay.length">
                <div
                  v-for="item in nonDeductibleDisplay"
                  :key="item.key"
                  class="flex items-center justify-between gap-2"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex w-6 h-6 items-center justify-center rounded-md text-[13px]"
                      :style="{ backgroundColor: item.color + '18', color: item.color }"
                    >
                      <Icon :name="item.icon" class="w-3.5 h-3.5" />
                    </span>
                    <span>{{ item.label }}</span>
                  </div>
                  <span class="text-gray-500 dark:text-gray-400">
                    {{ item.days }} days
                  </span>
                </div>
              </template>
              <p v-else class="text-gray-400 dark:text-gray-500">
                No non-deductible leave yet.
              </p>
            </div>
          </div>

          <!-- Time off mini chart -->
          <div class="rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Time off
            </h3>
            <div class="flex items-end gap-1 h-20 mb-2 px-1">
              <div
                v-for="(value, idx) in monthlyUsage"
                :key="idx"
                class="flex-1 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950/40 overflow-hidden"
              >
                <div
                  class="w-full rounded-full bg-fuchsia-600 dark:bg-fuchsia-400 transition-all ease-out duration-200"
                  :style="{ height: value === 0 ? '0px' : `calc(${(value / maxMonthlyUsage) * 100}% - 3px)` }"
                />
              </div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 tracking-tight px-0.5">
              <span v-for="m in ['J','F','M','A','M','J','J','A','S','O','N','D']" :key="m">
                {{ m }}
              </span>
            </div>
          </div>
        </aside>
      </div>

      <!-- Floating action button -->
      <div class="fixed right-4 bottom-6 sm:right-6 sm:bottom-10 flex flex-col items-end gap-3">
        <Transition name="fab-actions">
          <div
            v-if="fabOpen"
            class="flex flex-col items-end gap-2 mb-1"
          >
            <button
              class="flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1.5 shadow-lg hover:bg-blue-700 text-sm"
              @click="openBookTimeOff"
            >
              <span>Book time off</span>
              <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="lucide:calendar-plus" class="w-4 h-4" />
              </span>
            </button>

            <button
              class="w-9 h-9 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700"
              title="Group booking"
            >
              <Icon name="lucide:users" class="w-4 h-4" />
            </button>

            <button
              class="w-9 h-9 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700"
              title="Lock dates"
            >
              <Icon name="lucide:lock" class="w-4 h-4" />
            </button>
          </div>
        </Transition>

        <button
          class="w-11 h-11 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition-transform"
          :class="fabOpen ? 'rotate-45' : ''"
          @click="fabOpen = !fabOpen"
        >
          <Icon name="lucide:plus" class="w-5 h-5" />
        </button>
      </div>

      <LeaveRequestModal
        :open="requestModalOpen"
        :start-date="selectedStart"
        :end-date="selectedEnd"
        :user-id="routeUserId"
        :leave-types="leaveTypes"
        @close="requestModalOpen = false"
        @submit="handleCreateLeave"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import CalendarHeader from '~/components/calendar/CalendarHeader.vue'
import CalendarGrid from '~/components/calendar/CalendarGrid.vue'
import LeaveRequestModal from '~/components/calendar/LeaveRequestModal.vue'

import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useLeaves } from '~/composables/useLeaves'
import { useCalendar } from '~/composables/useCalendar'
import type { User } from '~/types/user'

// Correct TypeScript interfaces matching your actual data structure
interface LeaveType {
  id: string
  organizationId: string
  name: string
  code: string
  description?: string
  color: string
  icon?: string
  requiresApproval: boolean
  requiresDocumentation: boolean
  // ... other LeaveType properties
  updatedAt: string
}

interface NonDeductibleItem {
  leaveType: LeaveType
  count: number
  days: number
}

interface BalanceItem {
  leaveType: LeaveType
  allowance: number
  used: number
  remaining: number
}

interface BalanceSummary {
  year: number
  fiscalPeriodStart: string
  fiscalPeriodEnd: string
  totalAllowance: number
  totalUsed: number
  totalRemaining: number
  carriedOver: number
  balances: BalanceItem[]
  nonDeductible: NonDeductibleItem[]
}

const route = useRoute()
const api = useApi()
const {
  leaves,
  leaveTypes,
  publicHolidays,
  balanceSummary,
  loadCalendarData,
  createLeave,
} = useLeaves()
const { buildYear } = useCalendar()

const routeUserId = computed(() => String(route.params.userId || ''))
const year = ref(new Date().getFullYear())
const user = ref<User | null>(null)
const months = computed(() =>
  buildYear(year.value, leaves.value, publicHolidays.value)
)

const requestModalOpen = ref(false)
const selectedStart = ref<Date | null>(null)
const selectedEnd = ref<Date | null>(null)
const fabOpen = ref(false)

const loadUser = async () => {
  if (!routeUserId.value) return
  user.value = await api.fetchUser(routeUserId.value)
}

const loadAll = async () => {
  if (!routeUserId.value) return
  await Promise.all([
    loadUser(),
    loadCalendarData(routeUserId.value, year.value),
  ])
}

onMounted(loadAll)

watch([routeUserId, year], () => {
  loadAll()
})

const changeYear = (delta: number) => {
  year.value += delta
}

const onDayClick = (day: any) => {
  selectedStart.value = day.date
  selectedEnd.value = day.date
  requestModalOpen.value = true
}

const openBookTimeOff = () => {
  const today = new Date()
  selectedStart.value = today
  selectedEnd.value = today
  requestModalOpen.value = true
}

const handleCreateLeave = async (payload: {
  userId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  reason?: string
}) => {
  await createLeave({
    ...payload,
    startHalf: 'FULL_DAY',
    endHalf: 'FULL_DAY',
  })
  requestModalOpen.value = false
  fabOpen.value = false
  await loadCalendarData(routeUserId.value, year.value)
}

/**
 * Handle leave cancellation from DayLeavesList
 */
const handleLeaveCancel = async (leaveId: string) => {
  try {
    // Optimistic update - remove immediately
    const leaveIndex = leaves.value.findIndex(l => l.id === leaveId)
    if (leaveIndex !== -1) {
      leaves.value.splice(leaveIndex, 1)
    }
    
    // Refresh data from server
    await loadCalendarData(routeUserId.value, year.value)
  } catch (error) {
    console.error('Failed to delete leave:', error)
    // Revert optimistic update on error
    await loadCalendarData(routeUserId.value, year.value)
  }
}

/**
 * Deductible leave from balances array (VACATION, PERSONAL, etc.)
 */
const deductibleDisplay = computed(() => {
  if (!balanceSummary.value?.balances) return []
  
  return balanceSummary.value.balances
    .filter(b => b.used > 0) // Only show used leave
    .map(balance => ({
      key: balance.leaveType.code,
      label: `${balance.leaveType.name} (${balance.used} days used)`,
      icon: 'lucide:calendar',
      color: balance.leaveType.color || '#3b82f6',
      days: balance.used,
    }))
})



/**
 * Non-deductible mapping using balanceSummary.nonDeductible
 */
const nonDeductibleDisplay = computed(() => {
  if (!balanceSummary.value?.nonDeductible?.length) return []

  const iconMap: Record<string, { icon: string; color: string; label: string }> = {
    PUBLIC_HOLIDAYS: { icon: 'lucide:calendar-days', color: '#4b5563', label: 'Public Holidays' },
    WFH: { icon: 'lucide:home', color: '#14b8a6', label: 'Working from home' },
    SPECIAL: { icon: 'lucide:sparkles', color: '#6366f1', label: 'Special Event Leave' },
    MEETING: { icon: 'lucide:users', color: '#eab308', label: 'Meeting' },
    SICK_PAID: { icon: 'lucide:heart-pulse', color: '#ec4899', label: 'Sick Leave - Paid' },
  }

  return balanceSummary.value.nonDeductible.map((item: NonDeductibleItem) => {
    const code = item.leaveType.code
    const mapEntry = iconMap[code] ?? {
      icon: 'lucide:circle',
      color: item.leaveType.color || '#6b7280',
      label: item.leaveType.name,
    }

    return {
      key: code,
      label: mapEntry.label,
      icon: mapEntry.icon,
      color: mapEntry.color,
      days: item.days,
    }
  })
})

/**
 * Monthly usage for tiny bar chart
 */
const monthlyUsage = computed(() => {
  const arr = new Array(12).fill(0)
  leaves.value.forEach(l => {
    const d = new Date(l.startDate)
    if (d.getFullYear() === year.value) {
      arr[d.getMonth()] += l.totalDays
    }
  })
  return arr
})

const maxMonthlyUsage = computed(() => {
  return Math.max(...monthlyUsage.value, 1)
})
</script>

<style scoped>
.fab-actions-enter-active,
.fab-actions-leave-active {
  transition: all 0.18s ease-out;
}
.fab-actions-enter-from,
.fab-actions-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
