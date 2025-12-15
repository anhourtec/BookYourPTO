<template>
  <div class="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
    <!-- Left side: Filter button and user count -->
    <div class="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded-lg transition-colors"
        @click="$emit('toggle-filter')"
      >
        <Icon name="lucide:filter" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Filter</span>
        <span
          v-if="activeFilterCount > 0"
          class="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-semibold text-[rgb(var(--primary-foreground))] bg-[rgb(var(--primary))] rounded-full"
        >
          {{ activeFilterCount }}
        </span>
      </button>
      
      <span class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
        {{ totalUsers }} user{{ totalUsers === 1 ? '' : 's' }}
      </span>
    </div>

    <!-- Center: Date navigation -->
    <div class="flex items-center gap-1.5 sm:gap-3">
      <button
        type="button"
        class="p-1.5 sm:p-2 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] transition-colors"
        @click="$emit('prev-period')"
        title="Previous period"
      >
        <Icon name="lucide:chevron-left" class="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      <div class="min-w-[140px] sm:min-w-[180px] text-center">
        <span class="text-xs sm:text-sm font-semibold text-[rgb(var(--foreground))]">
          {{ dateRangeText }}
        </span>
      </div>
      
      <button
        type="button"
        class="p-1.5 sm:p-2 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] transition-colors"
        @click="$emit('next-period')"
        title="Next period"
      >
        <Icon name="lucide:chevron-right" class="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>

    <!-- Right side: Spacer (actions moved to FAB) -->
    <div class="flex items-center gap-2">
      <!-- Actions moved to floating action button -->
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  year: number
  month: number
  totalUsers: number
  activeFilterCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  activeFilterCount: 0,
})

defineEmits<{
  'toggle-filter': []
  'prev-period': []
  'next-period': []
}>()

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const dateRangeText = computed(() => {
  const currentMonth = monthNames[props.month]
  const currentYear = props.year
  
  // Calculate next month
  const nextMonth = props.month === 11 ? 0 : props.month + 1
  const nextYear = props.month === 11 ? props.year + 1 : props.year
  
  if (nextYear !== currentYear) {
    return `${currentMonth} ${currentYear} — ${monthNames[nextMonth]} ${nextYear}`
  }
  
  return `${currentMonth} — ${monthNames[nextMonth]} ${currentYear}`
})
</script>