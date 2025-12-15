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
        :can-create-leave="true"
        @toggle-filter="filterModalOpen = true"
        @prev-period="navigatePeriod(-1)"
        @next-period="navigatePeriod(1)"
        @add-leave="openLeaveModal()"
      />

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 sm:py-16">
        <Icon name="lucide:loader-2" class="w-8 sm:w-10 h-8 sm:h-10 animate-spin text-[rgb(var(--primary))] mb-3" />
        <p class="text-[rgb(var(--muted-foreground))] text-sm">Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-12 sm:py-16 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]"
      >
        <div class="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center mb-3 sm:mb-4">
          <Icon name="lucide:alert-circle" class="w-6 sm:w-8 h-6 sm:h-8 text-[rgb(var(--destructive))]" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Failed to load dashboard</h3>
        <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mb-4 sm:mb-6 text-center max-w-md px-4">{{ error }}</p>
        <button
          type="button"
          class="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          @click="loadDashboard"
        >
          Try Again
        </button>
      </div>

      <!-- Calendar Grid -->
      <DashboardCalendarGrid
        v-else
        :users="users"
        :year="year"
        :current-month="month"
        :public-holidays="publicHolidays"
        :week-start-day="weekStartDay"
        :can-add-users="canManageUsers"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import DashboardCalendarGrid from '~/components/dashboard/DashboardCalendarGrid.vue'
import DashboardFilterModal from '~/components/dashboard/DashboardFilterModal.vue'
import LeaveRequestModal from '~/components/calendar/LeaveRequestModal.vue'

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
  }
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
const { getUser } = usePermissions()
const { ensureValidToken } = useAuth()
const api = useApi()

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

// Current user
const currentUser = computed(() => getUser() as User | null)

const canManageUsers = computed(() => {
  const role = currentUser.value?.role
  return ['ADMINISTRATOR', 'EXECUTIVE'].includes(role || '')
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

    // Fetch dashboard data with fresh token
    const token = localStorage.getItem('auth_token')
    const response = await $fetch<{
      users: DashboardUser[]
      publicHolidays: PublicHoliday[]
      settings: { weekStartDay: number }
      permissions: typeof permissions.value
    }>(`/api/dashboard/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    users.value = response.users
    publicHolidays.value = response.publicHolidays
    weekStartDay.value = response.settings.weekStartDay
    permissions.value = response.permissions

    // Load departments for filter (uses api composable with auto-refresh)
    if (departments.value.length === 0) {
      const depts = await api.fetchDepartments()
      departments.value = depts
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
  try {
    await api.cancelLeaveRequest(leaveId)
    leaveModalOpen.value = false
    await loadDashboard()
  } catch (err: any) {
    console.error('Failed to cancel leave:', err)
    alert(err.data?.message || err.message || 'Failed to cancel leave request')
  }
}

// Navigate to add user page
const navigateToAddUser = () => {
  router.push('/users')
}

// Lifecycle
onMounted(() => {
  loadDashboard()
})
</script>