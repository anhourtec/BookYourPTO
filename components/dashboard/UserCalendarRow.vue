<template>
  <div class="flex items-center gap-2 sm:gap-4 py-3 px-2 sm:px-4 hover:bg-[rgb(var(--muted))]/20 transition-colors duration-150">
    <!-- User Info -->
    <div class="flex items-center gap-2 sm:gap-3 w-20 sm:w-52 flex-shrink-0">
      <!-- Avatar with role-based styling and badges -->
      <div class="relative">
        <div
          v-if="user.avatar"
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cover bg-center"
          :class="[getRoleColor(user.role).ring]"
          :style="{ backgroundImage: `url(${user.avatar})` }"
        />
        <div
          v-else
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold"
          :class="[
            getRoleColor(user.role).avatar,
            getRoleColor(user.role).avatarText,
            getRoleColor(user.role).ring
          ]"
        >
          {{ initials }}
        </div>
        
        <!-- Star Badge for Administrator -->
        <div
          v-if="user.role === 'ADMINISTRATOR'"
          class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center ring-2 ring-[rgb(var(--card))]"
        >
          <Icon name="lucide:star" class="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-900 dark:text-yellow-950 fill-current" />
        </div>

        <!-- Crown Badge for Executive -->
        <div
          v-else-if="user.role === 'EXECUTIVE'"
          class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center ring-2 ring-[rgb(var(--card))]"
        >
          <Icon name="lucide:crown" class="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-900 dark:text-yellow-950 fill-current" />
        </div>
        
        <!-- Leave balance badge - Show for all users -->
        <span
          v-if="typeof user.annualLeaveBalance === 'number'"
          class="absolute -top-1 -left-1 min-w-[20px] sm:min-w-[22px] h-[20px] sm:h-[22px] px-1.5 rounded-full ring-2 ring-[rgb(var(--card))] flex items-center justify-center text-[9px] sm:text-[10px] font-bold shadow-md"
          :class="user.annualLeaveBalance <= 0 ? 'bg-red-500 text-white' : 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]'"
          :title="`${user.annualLeaveBalance} days remaining`"
        >
          {{ formatBalance(user.annualLeaveBalance) }}
        </span>
      </div>

      <!-- Name and department -->
      <div class="min-w-0 flex-1">
        <div class="text-xs sm:text-sm font-semibold text-[rgb(var(--foreground))] truncate">
          {{ user.firstName }} {{ user.lastName }}
        </div>
        <div class="text-[10px] sm:text-xs text-[rgb(var(--muted-foreground))] truncate hidden sm:block">
          <span v-if="user.department">
            {{ user.department.name }}
          </span>
          <span v-else class="italic opacity-60">No department</span>
        </div>
      </div>
    </div>

    <!-- Calendar Days - Responsive: 7 days on mobile (from today), 30 days on desktop -->
    <div class="flex-1 min-w-0 overflow-x-auto sm:overflow-x-visible">
      <div class="grid gap-0.5 sm:gap-0" :style="{ gridTemplateColumns: `repeat(${displayDays.length}, minmax(0, 1fr))` }">
        <div
          v-for="day in displayDays"
          :key="day.dateKey"
          class="relative group"
        >
          <button
            type="button"
            class="h-11 sm:h-12 w-full flex flex-col items-center justify-center text-xs rounded-md transition-all duration-150 relative min-w-[36px] sm:min-w-0 gap-0.5"
            :class="getDayClasses(day)"
            @click="onDayClick(day)"
          >
          <!-- Holiday indicator with icon -->
          <span
            v-if="day.isHoliday"
            class="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
          >
            <Icon name="lucide:calendar-heart" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
          <!-- Leave indicator with icon and status -->
          <span
            v-else-if="day.leave"
            class="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full relative"
            :style="getLeaveStyle(day.leave)"
          >
            <Icon
              v-if="day.leave.leaveType?.icon"
              :name="day.leave.leaveType.icon"
              class="w-3 h-3 sm:w-3.5 sm:h-3.5"
            />
            <Icon
              v-else
              name="lucide:calendar"
              class="w-3 h-3 sm:w-3.5 sm:h-3.5"
            />
            <!-- Pending indicator -->
            <span
              v-if="day.leave.status === 'PENDING'"
              class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-400 dark:bg-yellow-500 ring-1 ring-white dark:ring-gray-900"
              title="Pending approval"
            />
          </span>
          <!-- Regular day - just date -->
          <span
            v-else
            class="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-medium"
          >
            {{ day.date.getDate() }}
          </span>

          <!-- Date number below icon (for holiday or leave) -->
          <span
            v-if="day.isHoliday || day.leave"
            class="text-[9px] sm:text-[10px] font-medium"
          >
            {{ day.date.getDate() }}
          </span>

          </button>

          <!-- Fast Tooltip -->
          <div
            v-if="day.leave || day.isHoliday"
            class="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap rounded-md bg-slate-900 dark:bg-slate-800 text-white text-[10px] sm:text-[11px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-10"
          >
            {{ getDayTooltip(day) }}
            <div class="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Leave, PublicHoliday } from '~/types/api'

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
  user: User
  visibleDays: DayInfo[]
  currentMonth: number
  weekStartDay?: number
  isMobile?: boolean
  today?: Date
}

const props = withDefaults(defineProps<Props>(), {
  weekStartDay: 0,
  isMobile: false,
  today: () => new Date(),
})

const emit = defineEmits<{
  'day-click': [payload: { user: User; day: DayInfo }]
}>()

// Use the role colors composable
const { getRoleColor } = useUserRoleColors()

// Format balance to show half days as ½
const formatBalance = (balance: number): string => {
  const wholePart = Math.floor(balance)
  const decimalPart = balance - wholePart

  if (decimalPart === 0.5) {
    return wholePart === 0 ? '½' : `${wholePart}½`
  } else if (decimalPart > 0 && decimalPart < 1) {
    // Round to nearest 0.5
    const rounded = Math.round(balance * 2) / 2
    const whole = Math.floor(rounded)
    const decimal = rounded - whole
    return decimal === 0.5 ? (whole === 0 ? '½' : `${whole}½`) : `${whole}`
  }

  return `${wholePart}`
}

const initials = computed(() => {
  const first = props.user.firstName?.[0] || ''
  const last = props.user.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

// Compute which days to display based on screen size
const displayDays = computed(() => {
  // Desktop: show first 30 days
  if (!props.isMobile) {
    return props.visibleDays.slice(0, 30)
  }

  // Mobile: show 7 days starting from today
  const today = new Date(props.today)
  today.setHours(0, 0, 0, 0)
  
  // Find today's index
  const todayIndex = props.visibleDays.findIndex(day => {
    const dayDate = new Date(day.date)
    dayDate.setHours(0, 0, 0, 0)
    return dayDate.getTime() === today.getTime()
  })
  
  // If today is found, show 7 days starting from today
  if (todayIndex >= 0 && todayIndex + 7 <= props.visibleDays.length) {
    return props.visibleDays.slice(todayIndex, todayIndex + 7)
  }
  
  // If today is near the end, show last 7 days
  if (todayIndex >= 0) {
    return props.visibleDays.slice(Math.max(0, todayIndex), Math.min(props.visibleDays.length, todayIndex + 7))
  }
  
  // Fallback: show first 7 days of visible days
  return props.visibleDays.slice(0, Math.min(7, props.visibleDays.length))
})

const getDayClasses = (day: DayInfo): string => {
  const classes: string[] = []

  // Base styling
  if (!day.isCurrentMonth) {
    classes.push('text-[rgb(var(--muted-foreground))]/30 opacity-40')
  } else {
    classes.push('text-[rgb(var(--foreground))]')
  }

  // Today indicator - very subtle on mobile, visible on desktop
  if (day.isToday) {
    classes.push('sm:ring-1 ring-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 sm:bg-[rgb(var(--primary))]/5 relative')
  }

  // Weekend styling
  if (day.isWeekend && !day.leave && !day.isHoliday) {
    classes.push('bg-[rgb(var(--muted))]/20')
  }

  // Holiday styling
  if (day.isHoliday) {
    classes.push('bg-emerald-50/50 dark:bg-emerald-950/20')
  }

  // Leave styling with status indication
  if (day.leave) {
    if (day.leave.status === 'PENDING') {
      classes.push('bg-yellow-50/30 dark:bg-yellow-950/10')
    } else {
      classes.push('bg-[rgb(var(--muted))]/10')
    }
  }

  // Hover - faster and more visible
  if (day.isCurrentMonth) {
    classes.push('hover:bg-[rgb(var(--primary))]/10 hover:ring-1 hover:ring-[rgb(var(--primary))]/30 cursor-pointer')
  }

  return classes.join(' ')
}

const getLeaveStyle = (leave: Leave) => {
  const color = leave.leaveType?.color || '#3b82f6'
  const isPending = leave.status === 'PENDING'

  return {
    backgroundColor: color + (isPending ? '20' : '30'),
    color: color,
    border: isPending ? `2px dashed ${color}80` : `1px solid ${color}60`,
    opacity: isPending ? '0.85' : '1',
  }
}

const getDayTooltip = (day: DayInfo): string => {
  const parts: string[] = []

  const dateStr = day.date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  parts.push(dateStr)

  if (day.isHoliday && day.holiday) {
    parts.push(`Holiday: ${day.holiday.name}`)
  }

  if (day.leave) {
    const typeName = day.leave.leaveType?.name || 'Leave'
    const status = day.leave.status
    const statusText = status === 'PENDING' ? 'Pending' : 'Approved'
    parts.push(`${typeName} - ${statusText}`)
  }

  return parts.join(' | ')
}

const onDayClick = (day: DayInfo) => {
  if (!day.isCurrentMonth) return
  emit('day-click', { user: props.user, day })
}
</script>