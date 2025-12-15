<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    <CalendarMonth
      v-for="month in months"
      :key="`${month.year}-${month.monthIndex}`"
      :month="month"
      :current-user="currentUser"
      @day-click="$emit('day-click', $event)"
      @leave-cancel="$emit('leave-cancel', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { CalendarMonth as CalendarMonthType } from '~/composables/useCalendar'
import type { User } from '~/types/user'

defineProps<{
  months: CalendarMonthType[]
  currentUser: User | null
}>()

defineEmits<{
  'day-click': [payload: any]
  'leave-cancel': [leaveId: string]
}>()
</script>
