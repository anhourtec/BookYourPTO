import type { Leave, PublicHoliday, LeaveType, Department } from '~/types/api'

export interface DashboardUser {
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

export interface DashboardFilters {
  userFilter: 'all' | 'selected'
  sortBy: 'firstName' | 'lastName' | 'department'
  accountType: 'all' | 'managers' | 'approvers' | 'favourites'
  departmentIds: string[]
}

export interface DashboardPermissions {
  canViewAllDepartments: boolean
  canViewCalendar: boolean
  isAdmin: boolean
}

export interface DashboardState {
  loading: boolean
  error: string | null
  year: number
  month: number
  users: DashboardUser[]
  publicHolidays: PublicHoliday[]
  departments: Department[]
  leaveTypes: LeaveType[]
  weekStartDay: number
  permissions: DashboardPermissions
  filters: DashboardFilters
}

const defaultFilters: DashboardFilters = {
  userFilter: 'all',
  sortBy: 'firstName',
  accountType: 'all',
  departmentIds: [],
}

export const useDashboard = () => {
  const api = useApi()

  // State
  const state = reactive<DashboardState>({
    loading: true,
    error: null,
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    users: [],
    publicHolidays: [],
    departments: [],
    leaveTypes: [],
    weekStartDay: 0,
    permissions: {
      canViewAllDepartments: true,
      canViewCalendar: true,
      isAdmin: false,
    },
    filters: { ...defaultFilters },
  })

  // Computed
  const activeFilterCount = computed(() => {
    let count = 0
    if (state.filters.sortBy !== 'firstName') count++
    if (state.filters.accountType !== 'all') count++
    if (state.filters.departmentIds.length > 0) count++
    return count
  })

  const dateRangeText = computed(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = monthNames[state.month]
    const nextMonth = state.month === 11 ? 0 : state.month + 1
    const nextYear = state.month === 11 ? state.year + 1 : state.year

    if (nextYear !== state.year) {
      return `${currentMonth} ${state.year} - ${monthNames[nextMonth]} ${nextYear}`
    }
    return `${currentMonth} ${state.year} - ${monthNames[nextMonth]} ${state.year}`
  })

  // Methods
  const loadDashboard = async () => {
    state.loading = true
    state.error = null

    try {
      const params = new URLSearchParams({
        year: state.year.toString(),
        month: state.month.toString(),
        sortBy: state.filters.sortBy,
        accountType: state.filters.accountType,
      })

      if (state.filters.departmentIds.length > 0) {
        params.append('departmentIds', state.filters.departmentIds.join(','))
      }

      const token = localStorage.getItem('auth_token')
      const response = await $fetch<{
        users: DashboardUser[]
        publicHolidays: PublicHoliday[]
        settings: { weekStartDay: number }
        permissions: DashboardPermissions
      }>(`/api/dashboard/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      state.users = response.users
      state.publicHolidays = response.publicHolidays
      state.weekStartDay = response.settings.weekStartDay
      state.permissions = response.permissions

      // Load departments if not already loaded
      if (state.departments.length === 0) {
        state.departments = await api.fetchDepartments()
      }

      // Load leave types if not already loaded
      if (state.leaveTypes.length === 0) {
        state.leaveTypes = await api.fetchLeaveTypes()
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      state.error = err.data?.message || err.message || 'Failed to load dashboard'
    } finally {
      state.loading = false
    }
  }

  const navigatePeriod = (delta: number) => {
    let newMonth = state.month + delta
    let newYear = state.year

    if (newMonth < 0) {
      newMonth = 11
      newYear--
    } else if (newMonth > 11) {
      newMonth = 0
      newYear++
    }

    state.month = newMonth
    state.year = newYear
    loadDashboard()
  }

  const setFilters = (filters: DashboardFilters) => {
    state.filters = filters
    loadDashboard()
  }

  const resetFilters = () => {
    state.filters = { ...defaultFilters }
    loadDashboard()
  }

  const goToToday = () => {
    const now = new Date()
    state.year = now.getFullYear()
    state.month = now.getMonth()
    loadDashboard()
  }

  // Generate visible days for the calendar grid
  const generateVisibleDays = (targetMonth?: number, targetYear?: number) => {
    const m = targetMonth ?? state.month
    const y = targetYear ?? state.year

    const days: {
      date: Date
      dateKey: string
      dayLetter: string
      isCurrentMonth: boolean
      isToday: boolean
      isWeekend: boolean
    }[] = []

    const dayLetters = state.weekStartDay === 1
      ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      : ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    const startOfMonth = new Date(y, m, 1)
    const firstDayOfWeek = startOfMonth.getDay()
    const daysToSubtract = state.weekStartDay === 1
      ? (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
      : firstDayOfWeek

    const startDate = new Date(y, m, 1 - daysToSubtract)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 35; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      days.push({
        date,
        dateKey: date.toISOString().split('T')[0],
        dayLetter: dayLetters[i % 7],
        isCurrentMonth: date.getMonth() === m,
        isToday: date.getTime() === today.getTime(),
        isWeekend,
      })
    }

    return days
  }

  // Check if a date is a holiday
  const isHoliday = (date: Date): PublicHoliday | undefined => {
    const dateStr = date.toISOString().split('T')[0]
    return state.publicHolidays.find(h => {
      const holidayDate = new Date(h.date)
      return holidayDate.toISOString().split('T')[0] === dateStr
    })
  }

  // Get leave for a specific user on a specific date
  const getLeaveForDate = (user: DashboardUser, date: Date): Leave | undefined => {
    const dateTime = date.getTime()

    return user.leaves.find(leave => {
      const startDate = new Date(leave.startDate)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(leave.endDate)
      endDate.setHours(23, 59, 59, 999)

      return dateTime >= startDate.getTime() && dateTime <= endDate.getTime()
    })
  }

  return {
    // State
    state: readonly(state),
    
    // Computed
    activeFilterCount,
    dateRangeText,
    
    // Methods
    loadDashboard,
    navigatePeriod,
    setFilters,
    resetFilters,
    goToToday,
    generateVisibleDays,
    isHoliday,
    getLeaveForDate,
  }
}