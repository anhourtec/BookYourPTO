<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <span class="font-medium text-gray-900 dark:text-white">
        {{ month.name }}
      </span>
      <span>{{ month.year }}</span>
    </div>

    <!-- ✅ FIXED: Correct day headers for Sunday-starting weeks -->
    <div class="grid grid-cols-7 gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
      <span v-for="d in dayHeaders" :key="d" class="text-center">
        {{ d }}
      </span>
    </div>

    <div class="grid grid-cols-7 gap-1.5">
      <template v-for="(week, wi) in month.weeks" :key="`w-${wi}`">
        <CalendarDay
          v-for="(day, di) in week"
          :key="`d-${wi}-${day.date.toISOString()}`"
          :day="day"
          @day-click="$emit('day-click', $event)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarMonth as CalendarMonthType } from '~/composables/useCalendar'
import CalendarDay from './CalendarDay.vue'

const props = defineProps<{
  month: CalendarMonthType
  weekStartDay?: number // 0 = Sunday, 1 = Monday
}>()

defineEmits<{
  'day-click': [payload: any]
}>()

// ✅ FIXED: Generate correct day headers based on week start day
const dayHeaders = computed(() => {
  const weekStartDay = props.weekStartDay ?? 0 // Default to Sunday (0)
  
  if (weekStartDay === 0) {
    // Sunday start: S M T W T F S
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  } else {
    // Monday start: M T W T F S S
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  }
})
</script>