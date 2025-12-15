<template>
  <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] overflow-hidden shadow-sm">
    <!-- Day Headers -->
    <div class="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-2.5 bg-[rgb(var(--muted))]/50 border-b border-[rgb(var(--border))]">
      <!-- Spacer for user column - responsive -->
      <div class="w-20 sm:w-52 flex-shrink-0" />
      
      <!-- Day headers -->
      <div class="flex-1 overflow-x-auto">
        <div class="flex gap-0">
          <div
            v-for="day in headerDays"
            :key="day.dateKey"
            :class="[
              'text-center',
              isMobile ? 'flex-1 min-w-[40px]' : 'w-8 flex-shrink-0'
            ]"
          >
            <!-- Day of week letter -->
            <div
              class="text-[10px] font-semibold uppercase tracking-wide"
              :class="getDayHeaderClass(day)"
            >
              {{ day.dayLetter }}
            </div>
            <!-- Date number -->
            <div
              class="text-xs font-medium"
              :class="getDateNumberClass(day)"
            >
              {{ day.date.getDate() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Rows -->
    <div class="divide-y divide-[rgb(var(--border))]">
      <template v-if="users.length > 0">
        <div
          v-for="user in users"
          :key="user.id"
          class="px-2 sm:px-4 hover:bg-[rgb(var(--muted))]/30 transition-colors"
        >
          <UserCalendarRow
            :user="user"
            :visible-days="getUserDays(user)"
            :current-month="currentMonth"
            :week-start-day="weekStartDay"
            :is-mobile="isMobile"
            @day-click="$emit('day-click', $event)"
          />
        </div>
      </template>
      
      <!-- Empty State -->
      <div v-else class="px-4 py-12 text-center">
        <div class="w-16 h-16 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:users" class="w-8 h-8 text-[rgb(var(--muted-foreground))]" />
        </div>
        <h3 class="text-base font-semibold text-[rgb(var(--foreground))] mb-2">No users found</h3>
        <p class="text-sm text-[rgb(var(--muted-foreground))]">
          Try adjusting your filters or add new users.
        </p>
      </div>
    </div>

    <!-- Add New User Row -->
    <div
      v-if="canAddUsers"
      class="px-2 sm:px-4 py-3 border-t border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/30 transition-colors cursor-pointer"
      @click="$emit('add-user')"
    >
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center ring-2 ring-[rgb(var(--border))]">
          <Icon name="lucide:plus" class="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--muted-foreground))]" />
        </div>
        <div>
          <div class="text-sm font-medium text-[rgb(var(--primary))]">New user</div>
          <div class="text-xs text-[rgb(var(--muted-foreground))] hidden sm:block">Add someone else</div>
        </div>
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
}

const props = withDefaults(defineProps<Props>(), {
  weekStartDay: 0,
  canAddUsers: false,
  isMobile: false,
})

defineEmits<{
  'day-click': [payload: { user: User; day: DayInfo }]
  'add-user': []
}>()

const dayLetters: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const mondayStartDayLetters: string[] = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Get today's date for comparison
const today = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
})

// Generate all visible days for the header
const headerDays = computed(() => {
  const days: DayInfo[] = []
  
  if (props.isMobile) {
    // Mobile: Show 7 days starting from today
    const startDate = new Date(today.value)
    
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
        isToday: i === 0,
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
        isToday: date.getTime() === today.value.getTime(),
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

// Get date number classes
const getDateNumberClass = (day: DayInfo): string => {
  const classes: string[] = []
  
  if (day.isToday) {
    classes.push('text-[rgb(var(--primary))] font-bold')
  } else if (!day.isCurrentMonth) {
    classes.push('text-[rgb(var(--muted-foreground))]/40')
  } else if (day.isWeekend) {
    classes.push('text-[rgb(var(--muted-foreground))]/60')
  } else {
    classes.push('text-[rgb(var(--foreground))]')
  }
  
  return classes.join(' ')
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
  const dateTime = date.getTime()
  
  return user.leaves.find(leave => {
    const startDate = new Date(leave.startDate)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(leave.endDate)
    endDate.setHours(23, 59, 59, 999)
    
    return dateTime >= startDate.getTime() && dateTime <= endDate.getTime()
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
