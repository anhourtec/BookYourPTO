<template>
  <div class="flex items-center gap-2 sm:gap-4 py-2.5 border-b border-[rgb(var(--border))] last:border-b-0">
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
        
        <!-- Leave balance badge - Only for DEPARTMENT_HEAD, ADMINISTRATOR, EXECUTIVE -->
        <span
          v-if="showLeaveBalance && typeof user.annualLeaveBalance === 'number'"
          class="absolute -top-1.5 -left-1.5 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-0.5 sm:px-1 rounded-full bg-[rgb(var(--primary))] ring-2 ring-[rgb(var(--card))] flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-[rgb(var(--primary-foreground))]"
        >
          {{ Math.round(user.annualLeaveBalance) }}
        </span>
      </div>

      <!-- Name and department -->
      <div class="min-w-0 flex-1">
        <div class="text-xs sm:text-sm font-medium text-[rgb(var(--foreground))] truncate">
          {{ user.firstName }} {{ user.lastName }}
        </div>
        <div class="text-[10px] sm:text-xs text-[rgb(var(--muted-foreground))] truncate hidden sm:block">
          {{ user.department?.name || 'No department' }}
        </div>
      </div>
    </div>

    <!-- Calendar Days - Responsive: 7 days on mobile (from today), 30 days on desktop -->
    <div class="flex-1 min-w-0 overflow-x-auto sm:overflow-x-visible">
      <div class="grid gap-0.5 sm:gap-0" :style="{ gridTemplateColumns: `repeat(${displayDays.length}, minmax(0, 1fr))` }">
        <button
          v-for="day in displayDays"
          :key="day.dateKey"
          type="button"
          class="h-8 sm:h-8 flex items-center justify-center text-[11px] sm:text-xs rounded transition-colors relative min-w-[32px] sm:min-w-0"
          :class="getDayClasses(day)"
          :title="getDayTooltip(day)"
          @click="onDayClick(day)"
        >
          <!-- Holiday indicator -->
          <span v-if="day.isHoliday" class="text-emerald-600 dark:text-emerald-400 font-medium truncate">
            {{ day.date.getDate() }}
          </span>
          <!-- Leave indicator -->
          <span
            v-else-if="day.leave"
            class="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
            :style="getLeaveStyle(day.leave)"
          >
            {{ day.date.getDate() }}
          </span>
          <!-- Regular day -->
          <span v-else class="truncate">
            {{ day.date.getDate() }}
          </span>
        </button>
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
}

const props = withDefaults(defineProps<Props>(), {
  weekStartDay: 0,
  isMobile: false,
})

const emit = defineEmits<{
  'day-click': [payload: { user: User; day: DayInfo }]
}>()

// Use the role colors composable
const { getRoleColor } = useUserRoleColors()

// Show leave balance only for DEPARTMENT_HEAD, ADMINISTRATOR, EXECUTIVE
const showLeaveBalance = computed(() => {
  return ['DEPARTMENT_HEAD', 'ADMINISTRATOR', 'EXECUTIVE'].includes(props.user.role)
})

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
  const today = new Date()
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
    classes.push('text-[rgb(var(--muted-foreground))]/40')
  } else {
    classes.push('text-[rgb(var(--foreground))]')
  }
  
  // Today indicator
  if (day.isToday) {
    classes.push('ring-1 sm:ring-2 ring-[rgb(var(--primary))] ring-offset-1')
  }
  
  // Weekend styling
  if (day.isWeekend && !day.leave && !day.isHoliday) {
    classes.push('bg-[rgb(var(--muted))]/50')
  }
  
  // Holiday styling
  if (day.isHoliday) {
    classes.push('bg-emerald-50 dark:bg-emerald-950/30')
  }
  
  // Hover
  if (day.isCurrentMonth) {
    classes.push('hover:bg-[rgb(var(--muted))] cursor-pointer')
  }
  
  return classes.join(' ')
}

const getLeaveStyle = (leave: Leave) => {
  const color = leave.leaveType?.color || '#3b82f6'
  return {
    backgroundColor: color + '30',
    color: color,
    border: `1px solid ${color}60`,
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
    parts.push(`${typeName} (${status})`)
  }
  
  return parts.join(' - ')
}

const onDayClick = (day: DayInfo) => {
  if (!day.isCurrentMonth) return
  emit('day-click', { user: props.user, day })
}
</script>