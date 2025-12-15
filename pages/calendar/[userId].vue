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
        <aside class="w-full lg:w-80 lg:shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
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
        </aside>
      </div>

      <!-- Floating action button -->
      <div class="fixed right-4 bottom-6 sm:right-6 sm:bottom-10 flex flex-col items-end gap-3">
        <Transition name="fab-actions">
          <div
            v-if="fabOpen"
            class="flex flex-col items-end gap-2 mb-1"
          >
            <!-- Book Time Off -->
            <button
              class="flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1.5 shadow-lg hover:bg-blue-700 text-sm transition-colors"
              @click="openBookTimeOff"
            >
              <span>Book time off</span>
              <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="lucide:calendar-plus" class="w-4 h-4" />
              </span>
            </button>

            <!-- Group Booking -->
            <button
              v-if="canAccessGroupBooking"
              class="flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1.5 shadow-lg hover:bg-blue-700 text-sm transition-colors"
              @click="openGroupBooking"
            >
              <span>Group Booking</span>
              <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="lucide:users" class="w-4 h-4" />
              </span>
            </button>

            <!-- Lock Dates (placeholder for future) -->
            <button
              v-if="canAccessGroupBooking"
              class="flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1.5 shadow-lg hover:bg-blue-700 text-sm transition-colors"
              @click="openLockDates"
            >
              <span>Lock Dates</span>
              <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="lucide:lock" class="w-4 h-4" />
              </span>
            </button>
          </div>
        </Transition>

        <button
          class="w-11 h-11 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all"
          :class="fabOpen ? 'rotate-45' : ''"
          @click="fabOpen = !fabOpen"
        >
          <Icon name="lucide:plus" class="w-5 h-5" />
        </button>
      </div>

      <!-- Individual Leave Request Modal -->
      <LeaveRequestModal
        :open="requestModalOpen"
        :mode="modalMode"
        :existing-leave="selectedLeave"
        :start-date="selectedStart"
        :end-date="selectedEnd"
        :user-id="routeUserId"
        :current-user-id="user?.id"
        :current-user-role="user?.role"
        :user-name="`${user?.firstName} ${user?.lastName}`"
        :user-job-title="user?.jobTitle"
        :leave-types="leaveTypes"
        :public-holidays="publicHolidays"
        @close="requestModalOpen = false"
        @submit="handleCreateLeave"
        @cancel="handleLeaveCancel"
      />

      <!-- Group Booking Modal -->
      <GroupBookingModal
        :open="groupBookingModalOpen"
        :departments="departments"
        :leave-types="leaveTypes"
        @close="groupBookingModalOpen = false"
        @submit="handleGroupBooking"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import CalendarHeader from '~/components/calendar/CalendarHeader.vue'
import CalendarGrid from '~/components/calendar/CalendarGrid.vue'
import LeaveRequestModal from '~/components/calendar/LeaveRequestModal.vue'
import GroupBookingModal from '~/components/calendar/GroupBookingModal.vue'

import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useLeaves } from '~/composables/useLeaves'
import { useCalendar } from '~/composables/useCalendar'
import type { User } from '~/types/user'

// TypeScript interfaces
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
  annualAllowance?: number | null
  isActive: boolean
  updatedAt: string
}

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

interface NonDeductibleItem {
  leaveType: LeaveType
  count: number
  days: number
}

interface DeductibleItem {
  leaveType: LeaveType
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
  deductible: DeductibleItem[]
  nonDeductible: NonDeductibleItem[]
}

// Composables and route
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

// ✅ FIX: Destructure loadOrgTimezone and orgTimezone from useCalendar
const { buildYear, loadOrgTimezone, orgTimezone } = useCalendar()

// State
const routeUserId = computed(() => String(route.params.userId || ''))
const year = ref(new Date().getFullYear())
const user = ref<User | null>(null)
const departments = ref<Department[]>([])

// Calendar months computation
const months = computed(() => {
  // console.log('🗓️ Building calendar', { year: year.value, leavesCount: leaves.value.length })
  return buildYear(year.value, leaves.value, publicHolidays.value)
})

// Modal states
const requestModalOpen = ref(false)
const groupBookingModalOpen = ref(false)
const selectedStart = ref<Date | null>(null)
const selectedEnd = ref<Date | null>(null)
const fabOpen = ref(false)
const modalMode = ref<'create' | 'view'>('create')
const selectedLeave = ref<any>(null)

// Permission checks
const canAccessGroupBooking = computed(() => {
  const role = user.value?.role
  return ['ADMINISTRATOR', 'EXECUTIVE', 'HR', 'DEPARTMENT_HEAD', 'MANAGER'].includes(role || '')
})

// Load user data
const loadUser = async () => {
  if (!routeUserId.value) return
  try {
    user.value = await api.fetchUser(routeUserId.value)
  } catch (error) {
    console.error('Failed to load user:', error)
  }
}

// Load departments (for group booking)
const loadDepartments = async () => {
  if (!canAccessGroupBooking.value) return
  try {
    const token = localStorage.getItem('auth_token')
    const data = await $fetch('/api/departments', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    departments.value = data as Department[]
  } catch (error) {
    console.error('Failed to load departments:', error)
  }
}

// Load all data
const loadAll = async () => {
  // ✅ FIX: Load organization timezone FIRST
  await loadOrgTimezone()

  if (!routeUserId.value) return
  await Promise.all([
    loadUser(),
    loadCalendarData(routeUserId.value, year.value),
  ])
  // Load departments after user is loaded (to check permissions)
  await loadDepartments()
}

// Lifecycle
onMounted(loadAll)

watch([routeUserId, year], () => {
  loadAll()
})

// Year navigation
const changeYear = (delta: number) => {
  year.value += delta
}

// Day click handler
const onDayClick = (day: any) => {
  if (day.leaves && day.leaves.length > 0) {
    // View existing leave
    selectedLeave.value = day.leaves[0]
    modalMode.value = 'view'
    requestModalOpen.value = true
  } else {
    // Create new leave
    selectedStart.value = day.date
    selectedEnd.value = day.date
    selectedLeave.value = null
    modalMode.value = 'create'
    requestModalOpen.value = true
  }
}

// Open individual booking modal
const openBookTimeOff = () => {
  const today = new Date()
  selectedStart.value = today
  selectedEnd.value = today
  selectedLeave.value = null
  modalMode.value = 'create'
  requestModalOpen.value = true
  fabOpen.value = false
}

// Open group booking modal
const openGroupBooking = () => {
  groupBookingModalOpen.value = true
  fabOpen.value = false
}

// Open lock dates (placeholder)
const openLockDates = () => {
  alert('Lock Dates feature coming soon!')
  fabOpen.value = false
}

// Handle individual leave creation
const handleCreateLeave = async (payload: {
  userId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  startHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  endHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  reason?: string
}) => {
  // console.log('📤 Creating leave request:', payload)
  
  try {
    await createLeave(payload)
    requestModalOpen.value = false
    fabOpen.value = false
    await loadCalendarData(routeUserId.value, year.value)
  } catch (error: any) {
    console.error('Create leave error:', error)
    alert(error.data?.message || error.message || 'Failed to create leave request')
  }
}

// Handle group booking creation
const handleGroupBooking = async (payload: {
  departmentId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  startHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  endHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  reason?: string
}) => {
  // console.log('📤 Creating group booking:', payload)
  
  try {
    const token = localStorage.getItem('auth_token')
    await $fetch('/api/leaves/group-booking', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: payload,
    })
    
    groupBookingModalOpen.value = false
    fabOpen.value = false
    
    // Show success message
    const dept = departments.value.find(d => d.id === payload.departmentId)
    alert(`Successfully created leave requests for ${dept?._count?.users || 0} members of ${dept?.name || 'department'}`)
    
    // Reload calendar
    await loadCalendarData(routeUserId.value, year.value)
  } catch (error: any) {
    console.error('Group booking error:', error)
    alert(error.data?.message || error.message || 'Failed to create group booking')
  }
}

// Handle leave cancellation
const handleLeaveCancel = async (leaveId: string) => {
  try {
    // Optimistic update
    const leaveIndex = leaves.value.findIndex(l => l.id === leaveId)
    if (leaveIndex !== -1) {
      leaves.value.splice(leaveIndex, 1)
    }
    
    // Refresh from server
    await loadCalendarData(routeUserId.value, year.value)
  } catch (error) {
    console.error('Failed to cancel leave:', error)
    await loadCalendarData(routeUserId.value, year.value)
  }
}

// Deductible leave display
const deductibleDisplay = computed(() => {
  if (!balanceSummary.value?.balances?.length) return []
  
  return balanceSummary.value.balances
    .filter(balance => balance.used > 0)
    .map(balance => ({
      key: balance.leaveType.code,
      label: balance.leaveType.name,
      icon: balance.leaveType.icon || 'lucide:calendar',
      color: balance.leaveType.color || '#3b82f6',
      days: balance.used,
    }))
})

// Non-deductible leave display
const nonDeductibleDisplay = computed(() => {
  if (!balanceSummary.value?.nonDeductible?.length) return []

  return balanceSummary.value.nonDeductible.map(item => ({
    key: item.leaveType.code,
    label: item.leaveType.name,
    icon: item.leaveType.icon || 'lucide:circle',
    color: item.leaveType.color || '#6b7280',
    days: item.days,
  }))
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