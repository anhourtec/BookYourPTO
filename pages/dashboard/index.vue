<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <!-- Header -->
    <div class="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))] mb-1">Dashboard</h1>
            <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
              Team calendar overview
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <!-- Header with navigation and filters -->
      <DashboardHeader
        :year="year"
        :month="month"
        :total-users="users.length"
        :active-filter-count="activeFilterCount"
        :is-mobile="isMobile"
        :mobile-start-date="mobileStartDate"
        @toggle-filter="filterModalOpen = true"
        @prev-period="navigatePeriod(-1)"
        @next-period="navigatePeriod(1)"
      />

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 sm:py-20 bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))]">
        <Icon name="lucide:loader-2" class="w-10 sm:w-12 h-10 sm:h-12 animate-spin text-[rgb(var(--primary))] mb-4" />
        <p class="text-[rgb(var(--muted-foreground))] text-sm font-medium">Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-16 sm:py-20 bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))]"
      >
        <div class="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center mb-4 sm:mb-5">
          <Icon name="lucide:alert-circle" class="w-8 sm:w-10 h-8 sm:h-10 text-[rgb(var(--destructive))]" />
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))] mb-2">Failed to load dashboard</h3>
        <p class="text-sm text-[rgb(var(--muted-foreground))] mb-6 text-center max-w-md px-4">{{ error }}</p>
        <button
          type="button"
          class="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold shadow-md"
          @click="loadDashboard"
        >
          Try Again
        </button>
      </div>

      <!-- Calendar Grid -->
      <DashboardCalendarGrid
        v-else
        :users="users as any"
        :year="year"
        :current-month="month"
        :public-holidays="publicHolidays"
        :week-start-day="weekStartDay"
        :can-add-users="false"
        :is-mobile="isMobile"
        :today="todayInOrgTz"
        :mobile-start-date="mobileStartDate"
        @day-click="onDayClick"
        @add-user="navigateToAddUser"
      />

      <!-- Filter Modal -->
      <DashboardFilterModal
        :open="filterModalOpen"
        :departments="departments"
        :current-user-department-id="currentUser?.departmentId"
        :can-view-all-departments="permissions.canViewAllDepartments"
        :initial-filters="filters"
        @close="filterModalOpen = false"
        @apply-filters="applyFilters"
      />

      <!-- Leave Request Modal (reused from calendar) -->
      <LeaveRequestModal
        :open="leaveModalOpen"
        :mode="leaveModalMode"
        :existing-leave="selectedLeave"
        :start-date="selectedStartDate"
        :end-date="selectedEndDate"
        :user-id="selectedUserId"
        :current-user-id="currentUser?.id"
        :current-user-role="currentUser?.role"
        :user-name="selectedUserName"
        :user-job-title="selectedUserJobTitle"
        :leave-types="leaveTypes"
        @close="leaveModalOpen = false"
        @submit="handleCreateLeave"
        @cancel="handleCancelLeave"
      />

      <!-- Group Booking Modal -->
      <GroupBookingModal
        :open="groupBookingModalOpen"
        :departments="departments as any"
        :leave-types="leaveTypes"
        @close="groupBookingModalOpen = false"
        @submit="handleGroupBooking"
      />

      <!-- Reject Modal (for admins rejecting others' leaves) -->
      <CustomModal v-model="rejectModalOpen" max-width="md">
        <div class="p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
              Reject Leave Request
            </h2>
            <button
              @click="rejectModalOpen = false"
              class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <div v-if="leaveToReject" class="space-y-4">
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p class="text-sm text-amber-800 dark:text-amber-200">
                You are about to reject the leave request from
                <strong>{{ selectedUserName }}</strong>.
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Rejection Reason <span class="text-[rgb(var(--destructive))]">*</span>
              </label>
              <textarea
                v-model="rejectionReason"
                rows="4"
                placeholder="Please provide a reason for rejection..."
                class="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:ring-2 focus:ring-[rgb(var(--destructive))] focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div class="flex gap-3">
              <button
                @click="rejectModalOpen = false"
                class="flex-1 px-4 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                @click="confirmReject"
                :disabled="!rejectionReason.trim() || rejecting"
                class="flex-1 px-4 py-2.5 bg-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/90 text-[rgb(var(--destructive-foreground))] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icon
                  v-if="rejecting"
                  name="lucide:loader-2"
                  class="w-4 h-4 animate-spin"
                />
                <span>{{ rejecting ? 'Rejecting...' : 'Confirm Rejection' }}</span>
              </button>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>

    <!-- Floating Action Button -->
    <div class="fixed right-4 bottom-6 sm:right-6 sm:bottom-10 flex flex-col items-end gap-3 z-50">
      <Transition name="fab-actions">
        <div
          v-if="fabOpen"
          class="flex flex-col items-end gap-2 mb-1"
        >
          <!-- Book Time Off -->
          <button
            class="flex items-center gap-2 rounded-full bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-3 py-1.5 shadow-lg hover:opacity-90 text-sm transition-all"
            @click="openLeaveModal(); fabOpen = false"
          >
            <span class="font-medium">Book time off</span>
            <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Icon name="lucide:calendar-plus" class="w-4 h-4" />
            </span>
          </button>

          <!-- Group Booking -->
          <button
            v-if="canAccessGroupBooking"
            class="flex items-center gap-2 rounded-full bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-3 py-1.5 shadow-lg hover:opacity-90 text-sm transition-all"
            @click="groupBookingModalOpen = true; fabOpen = false"
          >
            <span class="font-medium">Group Booking</span>
            <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Icon name="lucide:users" class="w-4 h-4" />
            </span>
          </button>
        </div>
      </Transition>

      <button
        class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow-xl flex items-center justify-center hover:opacity-90 transition-all"
        :class="fabOpen ? 'rotate-45' : ''"
        @click="fabOpen = !fabOpen"
      >
        <Icon name="lucide:plus" class="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import DashboardCalendarGrid from '~/components/dashboard/DashboardCalendarGrid.vue'
import DashboardFilterModal from '~/components/dashboard/DashboardFilterModal.vue'
import LeaveRequestModal from '~/components/calendar/LeaveRequestModal.vue'
import GroupBookingModal from '~/components/calendar/GroupBookingModal.vue'

// Set page title
useHead({
  title: 'Dashboard'
})

// This prevents the page from rendering before redirect completes
if (process.client) {
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user')
  
  if (!token || !userStr) {
    navigateTo('/login', { replace: true })
  }
}

import { useCalendar } from '~/composables/useCalendar'

import type { Leave, PublicHoliday, LeaveType, Department } from '~/types/api'
import type { User } from '~/types/user'

interface DashboardUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  jobTitle?: string
  role: string
  departmentId?: string
  annualLeaveBalance?: number
  department?: {
    id: string
    name: string
    color?: string
  } | null
  leaves: Leave[]
}

interface Filters {
  userFilter: 'all' | 'selected'
  sortBy: 'firstName' | 'lastName' | 'department'
  accountType: 'all' | 'managers' | 'approvers' | 'favourites'
  departmentIds: string[]
}

interface DayInfo {
  date: Date
  dateKey: string
  dayLetter: string
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  isHoliday: boolean
  holiday?: PublicHoliday
  leave?: Leave
}

// Composables
const router = useRouter()
const { getUser, canCreateGroupBooking } = usePermissions()
const { ensureValidToken } = useAuth()
const api = useApi()
const { loadOrgTimezone, getTodayInOrgTimezone } = useCalendar()

// Detect mobile
const isMobile = ref(false)

// FAB state
const fabOpen = ref(false)

// Timezone-aware today
const todayInOrgTz = ref<Date>(new Date())

// Mobile view: Track the start date for the 7-day window
const mobileStartDate = ref<Date>(new Date())

// State
const loading = ref(true)
const error = ref<string | null>(null)
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth())
const users = ref<DashboardUser[]>([])
const publicHolidays = ref<PublicHoliday[]>([])
const departments = ref<Department[]>([])
const leaveTypes = ref<LeaveType[]>([])
const weekStartDay = ref(0)
const permissions = ref({
  canViewAllDepartments: true,
  canViewCalendar: true,
  isAdmin: false,
})

// Filter state
const filterModalOpen = ref(false)
const filters = ref<Filters>({
  userFilter: 'all',
  sortBy: 'firstName',
  accountType: 'all',
  departmentIds: [],
})

// Leave modal state
const leaveModalOpen = ref(false)
const leaveModalMode = ref<'create' | 'view'>('create')
const selectedLeave = ref<Leave | null>(null)
const selectedStartDate = ref<Date | null>(null)
const selectedEndDate = ref<Date | null>(null)
const selectedUserId = ref('')
const selectedUserName = ref('')
const selectedUserJobTitle = ref('')

// Group booking modal state
const groupBookingModalOpen = ref(false)

// Reject modal state (for admins rejecting others' leaves)
const rejectModalOpen = ref(false)
const leaveToReject = ref<Leave | null>(null)
const rejectionReason = ref('')
const rejecting = ref(false)

// Current user
const currentUser = computed(() => getUser() as User | null)

const canManageUsers = computed(() => {
  const role = currentUser.value?.role
  return ['ADMINISTRATOR', 'EXECUTIVE'].includes(role || '')
})

const canAccessGroupBooking = computed(() => {
  return canCreateGroupBooking()
})

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.sortBy !== 'firstName') count++
  if (filters.value.accountType !== 'all') count++
  if (filters.value.departmentIds.length > 0) count++
  return count
})

// Load dashboard data
const loadDashboard = async () => {
  loading.value = true
  error.value = null

  try {
    // Load organization timezone first
    await loadOrgTimezone()
    todayInOrgTz.value = getTodayInOrgTimezone()

    // Initialize mobile start date to today if not set
    if (!mobileStartDate.value || mobileStartDate.value.getTime() === new Date(0).getTime()) {
      mobileStartDate.value = new Date(todayInOrgTz.value)
      mobileStartDate.value.setHours(0, 0, 0, 0)
    }

    // Ensure valid token before making API calls
    const isValid = await ensureValidToken()
    if (!isValid) {
      return // Will redirect to login
    }

    // Build query params
    const params = new URLSearchParams({
      year: year.value.toString(),
      month: month.value.toString(),
      sortBy: filters.value.sortBy,
      accountType: filters.value.accountType,
    })

    if (filters.value.departmentIds.length > 0) {
      params.append('departmentIds', filters.value.departmentIds.join(','))
    }

    // Fetch dashboard data and public holidays in parallel
    const token = localStorage.getItem('auth_token')
    const [response, holidays] = await Promise.all([
      $fetch<{
        users: DashboardUser[]
        publicHolidays: PublicHoliday[]
        settings: { weekStartDay: number }
        permissions: typeof permissions.value
      }>(`/api/dashboard/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      // Fetch holidays using the smart endpoint that auto-fetches from API if needed
      api.fetchPublicHolidays(year.value)
    ])

    users.value = response.users
    publicHolidays.value = holidays // Use holidays from smart endpoint
    weekStartDay.value = response.settings.weekStartDay
    permissions.value = response.permissions

    // Load departments for filter (uses api composable with auto-refresh)
    if (departments.value.length === 0) {
      const depts = await api.fetchDepartments()
      departments.value = depts as any
    }

    // Load leave types for modal (uses api composable with auto-refresh)
    if (leaveTypes.value.length === 0) {
      const types = await api.fetchLeaveTypes()
      leaveTypes.value = types
    }
  } catch (err: any) {
    console.error('Failed to load dashboard:', err)
    
    // Check if it's an auth error
    if (err?.statusCode === 401 || err?.response?.status === 401) {
      // Try to refresh and retry
      const isValid = await ensureValidToken()
      if (isValid) {
        // Retry loading
        return loadDashboard()
      }
      // If still invalid, ensureValidToken will redirect to login
      return
    }
    
    error.value = err.data?.message || err.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

// Navigate to previous/next period
const navigatePeriod = (delta: number) => {
  if (isMobile.value) {
    // Mobile: Navigate by 7 days
    const newStartDate = new Date(mobileStartDate.value)
    newStartDate.setDate(newStartDate.getDate() + (delta * 7))
    mobileStartDate.value = newStartDate

    // Update year and month based on the new start date for data fetching
    // We need to fetch data for the month range that covers these 7 days
    const endDate = new Date(newStartDate)
    endDate.setDate(newStartDate.getDate() + 6)

    // Fetch data for both months if the 7-day range spans two months
    year.value = newStartDate.getFullYear()
    month.value = newStartDate.getMonth()
  } else {
    // Desktop: Navigate by month
    let newMonth = month.value + delta
    let newYear = year.value

    if (newMonth < 0) {
      newMonth = 11
      newYear--
    } else if (newMonth > 11) {
      newMonth = 0
      newYear++
    }

    month.value = newMonth
    year.value = newYear
  }

  loadDashboard()
}

// Apply filters
const applyFilters = (newFilters: Filters) => {
  filters.value = newFilters
  loadDashboard()
}

// Handle day click
const onDayClick = (payload: { user: DashboardUser; day: DayInfo }) => {
  const { user, day } = payload

  if (day.leave) {
    // View existing leave
    selectedLeave.value = day.leave
    leaveModalMode.value = 'view'
    selectedUserId.value = user.id
    selectedUserName.value = `${user.firstName} ${user.lastName}`
    selectedUserJobTitle.value = user.jobTitle || ''
    leaveModalOpen.value = true
  } else {
    // Create new leave for this user
    openLeaveModal(user, day.date)
  }
}

// Open leave modal for creating new leave
const openLeaveModal = (user?: DashboardUser, date?: Date) => {
  const targetUser = user || (currentUser.value as DashboardUser | null)
  const targetDate = date || new Date()

  if (!targetUser) return

  selectedLeave.value = null
  leaveModalMode.value = 'create'
  selectedStartDate.value = targetDate
  selectedEndDate.value = targetDate
  selectedUserId.value = targetUser.id
  selectedUserName.value = `${targetUser.firstName} ${targetUser.lastName}`
  selectedUserJobTitle.value = targetUser.jobTitle || ''
  leaveModalOpen.value = true
}

// Handle leave creation
const handleCreateLeave = async (payload: {
  userId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  startHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  endHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  reason?: string
}) => {
  try {
    await api.createLeaveRequest(payload)
    leaveModalOpen.value = false
    await loadDashboard()
  } catch (err: any) {
    console.error('Failed to create leave:', err)
    alert(err.data?.message || err.message || 'Failed to create leave request')
  }
}

// Handle leave cancellation
const handleCancelLeave = async (leaveId: string) => {
  // Check if current user is admin/executive/dept head and viewing someone else's leave
  const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'].includes(currentUser.value?.role || '')
  const isOwnLeave = selectedLeave.value?.userId === currentUser.value?.id

  // If admin rejecting someone else's leave, open reject modal
  if (isAdmin && !isOwnLeave) {
    leaveToReject.value = selectedLeave.value
    leaveModalOpen.value = false
    rejectModalOpen.value = true
    return
  }

  // Otherwise, proceed with regular cancellation (for own leaves)
  try {
    await api.cancelLeaveRequest(leaveId)
    leaveModalOpen.value = false
    await loadDashboard()
  } catch (err: any) {
    console.error('Failed to cancel leave:', err)
    // Extract error message from various possible locations
    const errorMessage = err.data?.message || err.response?.data?.message || err.message || 'Failed to cancel leave request'
    alert(errorMessage)
    // Keep modal open on error so user can see the issue
  }
}

// Confirm reject (for admins rejecting others' leaves)
const confirmReject = async () => {
  if (!leaveToReject.value || !rejectionReason.value.trim()) return

  rejecting.value = true

  try {
    const token = localStorage.getItem('auth_token')
    await $fetch(`/api/leaves/${leaveToReject.value.id}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { reason: rejectionReason.value },
    })

    // Close modal and reload dashboard
    rejectModalOpen.value = false
    leaveToReject.value = null
    rejectionReason.value = ''
    await loadDashboard()

    alert('Leave request rejected successfully')
  } catch (err: any) {
    console.error('Failed to reject leave:', err)
    const errorMessage = err.data?.message || err.response?.data?.message || err.message || 'Failed to reject leave request'
    alert(errorMessage)
  } finally {
    rejecting.value = false
  }
}

// Navigate to add user page
const navigateToAddUser = () => {
  router.push('/users')
}

// Handle group booking
const handleGroupBooking = async (payload: {
  departmentId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  startHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  endHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  reason?: string
}) => {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await $fetch('/api/leaves/group-booking', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    })

    groupBookingModalOpen.value = false

    // Show success message with details
    const summary = response.summary
    const message = `Group booking created!\n\n✓ ${summary.created} leave requests created\n${summary.skipped > 0 ? `⚠ ${summary.skipped} users skipped\n` : ''}${summary.errors > 0 ? `✗ ${summary.errors} errors` : ''}`
    alert(message)

    await loadDashboard()
  } catch (err: any) {
    console.error('Failed to create group booking:', err)
    alert(err.data?.message || err.message || 'Failed to create group booking')
  }
}

// Check screen size for mobile detection
const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 640
  }
}

// Lifecycle
onMounted(() => {
  loadDashboard()

  // Setup mobile detection
  checkMobile()
  if (process.client) {
    window.addEventListener('resize', checkMobile)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkMobile)
  }
})
</script>

<style scoped>
.fab-actions-enter-active,
.fab-actions-leave-active {
  transition: all 0.3s ease;
}

.fab-actions-enter-from,
.fab-actions-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.fab-actions-enter-to,
.fab-actions-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>