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
        <!-- Icon pill when there is at least one leave -->
        <span
          v-if="firstLeave"
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

        <!-- Day number under icon when there is a leave -->
        <span
          v-if="firstLeave"
          class="text-[10px]"
        >
          {{ day.date.getDate() }}
        </span>
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

const hasEvents = computed(() =>
  props.day.leaves.length > 0 || props.day.holidays.length > 0
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

  if (hasEvents.value) {
    base.push('border-gray-500/40 dark:border-gray-400/40')
  }

  if (props.day.isToday) {
    base.push('ring-1 ring-blue-400')
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

  if (props.day.holidays.length) {
    const holidays = props.day.holidays.map(h => h.name).join(', ')
    parts.push(holidays)
  }

  if (!parts.length && props.day.isToday) {
    parts.push('Today')
  }

  return parts.join(' • ')
})
</script>
