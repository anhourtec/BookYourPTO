<template>
  <div class="bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] overflow-hidden shadow-md">
    <!-- Day Headers -->
    <div class="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 bg-[rgb(var(--muted))]/50 border-b border-[rgb(var(--border))]">
      <!-- Spacer for user column - responsive -->
      <div class="w-20 sm:w-52 flex-shrink-0" />

      <!-- Day headers - no overflow -->
      <div class="flex-1 min-w-0">
        <div class="grid gap-0.5 sm:gap-0" :style="{ gridTemplateColumns: `repeat(${headerDays.length}, minmax(0, 1fr))` }">
          <div
            v-for="day in headerDays"
            :key="day.dateKey"
            class="text-center py-1"
          >
            <!-- Day of week letter only -->
            <div
              class="text-xs sm:text-sm font-bold uppercase tracking-wider"
              :class="getDayHeaderClass(day)"
            >
              {{ day.dayLetter }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Rows -->
    <div class="divide-y divide-[rgb(var(--border))]">
      <template v-if="users.length > 0">
        <UserCalendarRow
          v-for="user in users"
          :key="user.id"
          :user="user"
          :visible-days="getUserDays(user)"
          :current-month="currentMonth"
          :week-start-day="weekStartDay"
          :is-mobile="isMobile"
          :today="todayDate"
          :mobile-start-date="mobileStartDate"
          @day-click="$emit('day-click', $event)"
        />
      </template>
      
      <!-- Empty State -->
      <div v-else class="px-4 py-16 text-center">
        <div class="w-20 h-20 rounded-full bg-[rgb(var(--muted))]/50 flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:users" class="w-10 h-10 text-[rgb(var(--muted-foreground))]/70" />
        </div>
        <h3 class="text-lg font-bold text-[rgb(var(--foreground))] mb-2">No users found</h3>
        <p class="text-sm text-[rgb(var(--muted-foreground))] max-w-sm mx-auto">
          Try adjusting your filters to see more users.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Leave, PublicHoliday } from '~/types/api'
import UserCalendarRow from './UserCalendarRow.vue'

interface User {
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

interface Props {
  users: User[]
  year: number
  currentMonth: number
  publicHolidays: PublicHoliday[]
  weekStartDay?: number
  canAddUsers?: boolean
  isMobile?: boolean
  today?: Date
  mobileStartDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  weekStartDay: 0,
  canAddUsers: false,
  isMobile: false,
  today: () => new Date(),
  mobileStartDate: () => new Date(),
})

defineEmits<{
  'day-click': [payload: { user: User; day: DayInfo }]
  'add-user': []
}>()

const dayLetters: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const mondayStartDayLetters: string[] = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Helper function to compare dates by calendar day (ignoring time)
const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Use timezone-aware today from props
const todayDate = computed(() => {
  const date = new Date(props.today)
  date.setHours(0, 0, 0, 0)
  return date
})

// Generate all visible days for the header
const headerDays = computed(() => {
  const days: DayInfo[] = []

  if (props.isMobile) {
    // Mobile: Show 7 days starting from mobileStartDate
    const startDate = new Date(props.mobileStartDate)
    startDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      days.push({
        date,
        dateKey,
        dayLetter: props.weekStartDay === 1 ? (mondayStartDayLetters[dayOfWeek] || 'M') : (dayLetters[dayOfWeek] || 'S'),
        isCurrentMonth: date.getMonth() === props.currentMonth,
        isToday: isSameDay(date, todayDate.value),
        isWeekend,
        isHoliday: false,
        holiday: undefined,
        leave: undefined,
      })
    }
  } else {
    // Desktop: Show 35 days (5 weeks)
    const startOfMonth = new Date(props.year, props.currentMonth, 1)
    const firstDayOfWeek = startOfMonth.getDay()
    const daysToSubtract = props.weekStartDay === 1
      ? (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
      : firstDayOfWeek
    
    const startDate = new Date(props.year, props.currentMonth, 1 - daysToSubtract)
    
    for (let i = 0; i < 35; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      days.push({
        date,
        dateKey,
        dayLetter: props.weekStartDay === 1 ? (mondayStartDayLetters[i % 7] || 'M') : (dayLetters[dayOfWeek] || 'S'),
        isCurrentMonth: date.getMonth() === props.currentMonth,
        isToday: isSameDay(date, todayDate.value),
        isWeekend,
        isHoliday: false,
        holiday: undefined,
        leave: undefined,
      })
    }
  }
  
  return days
})

// Get day header classes
const getDayHeaderClass = (day: DayInfo): string => {
  if (day.isToday) {
    return 'text-[rgb(var(--primary))]'
  }
  if (day.isWeekend) {
    return 'text-[rgb(var(--muted-foreground))]/60'
  }
  return 'text-[rgb(var(--muted-foreground))]'
}

// Check if a date is a holiday
const isHoliday = (date: Date): PublicHoliday | undefined => {
  const dateStr = date.toISOString().split('T')[0]
  return props.publicHolidays.find(h => {
    const holidayDate = new Date(h.date)
    return holidayDate.toISOString().split('T')[0] === dateStr
  })
}

// Check if a date falls within a leave period
const getLeaveForDate = (user: User, date: Date): Leave | undefined => {
  // Use ISO date strings to avoid timezone issues (same approach as isHoliday)
  const dateStr = date.toISOString().split('T')[0]

  return user.leaves.find(leave => {
    const leaveStart = new Date(leave.startDate).toISOString().split('T')[0]
    const leaveEnd = new Date(leave.endDate).toISOString().split('T')[0]

    return dateStr >= leaveStart && dateStr <= leaveEnd
  })
}

// Generate days for a specific user (with their leaves)
const getUserDays = (user: User): DayInfo[] => {
  return headerDays.value.map(day => {
    const holiday = isHoliday(day.date)
    const leave = getLeaveForDate(user, day.date)
    
    return {
      ...day,
      isHoliday: !!holiday,
      holiday,
      leave,
    }
  })
}
</script>
