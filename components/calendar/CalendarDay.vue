<template>
  <div class="relative group">
    <button
      type="button"
      class="relative w-full aspect-square rounded-md border text-left px-1 pt-0.5
             transition-colors overflow-hidden"
      :class="dayClasses"
      @click="$emit('day-click', day)"
    >
      <div class="flex flex-col items-center justify-center gap-0.5">
        <!-- Holiday indicator - shows first if there's a holiday -->
        <span
          v-if="hasHoliday"
          class="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
        >
          <Icon name="lucide:calendar-heart" class="w-3.5 h-3.5" />
        </span>
        
        <!-- Icon pill when there is at least one leave -->
        <span
          v-else-if="firstLeave"
          class="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px]"
          :style="pillStyle"
        >
          <Icon
            v-if="firstLeave.leaveType?.icon"
            :name="firstLeave.leaveType.icon"
            class="w-3.5 h-3.5"
          />
          <Icon
            v-else
            name="lucide:calendar"
            class="w-3.5 h-3.5"
          />
        </span>

        <!-- Fallback: just date if no events -->
        <span
          v-else
          class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
        >
          {{ day.date.getDate() }}
        </span>

        <!-- Day number under icon when there is a leave or holiday -->
        <span
          v-if="firstLeave || hasHoliday"
          class="text-[10px]"
        >
          {{ day.date.getDate() }}
        </span>
        
        <!-- Multi-event indicator (small dots) -->
        <div v-if="totalEvents > 1" class="flex gap-0.5 mt-0.5">
          <span 
            v-for="i in Math.min(totalEvents, 3)" 
            :key="i"
            class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"
          />
        </div>
      </div>
    </button>

    <!-- Tooltip -->
    <div
      v-if="tooltipText"
      class="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full
             whitespace-nowrap rounded-md bg-slate-900 text-white text-[11px] px-2 py-1
             opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarDay as CalendarDayType } from '~/composables/useCalendar'

const props = defineProps<{
  day: CalendarDayType
}>()

defineEmits<{
  'day-click': [day: CalendarDayType]
}>()

const hasHoliday = computed(() => {
  const result = props.day.holidays && props.day.holidays.length > 0
  // // Debug log for December dates
  // if (props.day.date.getMonth() === 11) {
  //   console.log(`Dec ${props.day.date.getDate()}:`, {
  //     hasHoliday: result,
  //     holidayCount: props.day.holidays?.length || 0,
  //     holidays: props.day.holidays
  //   })
  // }
  return result
})

const hasEvents = computed(() =>
  props.day.leaves.length > 0 || (props.day.holidays?.length || 0) > 0
)

const totalEvents = computed(() => 
  props.day.leaves.length + (props.day.holidays?.length || 0)
)

const firstLeave = computed(() => props.day.leaves[0] ?? null)

const dayClasses = computed(() => {
  const base = [
    'border-transparent',
    'bg-white dark:bg-gray-950',
    'hover:bg-gray-50 dark:hover:bg-gray-900',
    'text-gray-900 dark:text-gray-100',
  ]

  if (!props.day.isCurrentMonth) {
    base.push('opacity-35')
  }

  // Highlight holidays with a subtle green border
  if (hasHoliday.value) {
    base.push('border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20')
  } else if (hasEvents.value) {
    base.push('border-gray-500/40 dark:border-gray-400/40')
  }

  if (props.day.isToday) {
    base.push('ring-2 ring-blue-400')
  }

  return base.join(' ')
})

const pillStyle = computed(() => {
  const leave = firstLeave.value
  if (!leave?.leaveType) return {}

  const color = leave.leaveType.color || '#3b82f6'
  return {
    backgroundColor: color + '20',
    color,
    border: `1px solid ${color}55`,
  }
})

const tooltipText = computed(() => {
  const parts: string[] = []

  // Show holidays first
  if (props.day.holidays && props.day.holidays.length) {
    const holidays = props.day.holidays.map(h => h.name).join(', ')
    parts.push(`${holidays}`)
  }

  // Then show leaves
  if (props.day.leaves.length) {
    const names = Array.from(
      new Set(
        props.day.leaves.map(
          (l: any) => l.leaveType?.name || 'Leave',
        ),
      ),
    )
    parts.push(names.join(', '))
  }

  if (!parts.length && props.day.isToday) {
    parts.push('Today')
  }

  return parts.join(' • ')
})
</script>