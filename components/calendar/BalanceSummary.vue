<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-950">
      <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Total allowance
      </div>
      <div class="mt-1 flex items-baseline gap-1">
        <span class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ summary?.totalAllowance ?? 0 }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">days</span>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-950">
      <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Used
      </div>
      <div class="mt-1 flex items-baseline gap-1">
        <span class="text-2xl font-semibold text-rose-600 dark:text-rose-400">
          {{ summary?.totalUsed ?? 0 }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">days</span>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-950">
      <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Carried over
      </div>
      <div class="mt-1 flex items-baseline gap-1">
        <span class="text-lg font-medium text-gray-900 dark:text-white">
          {{ summary?.carriedOver ?? 0 }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">days</span>
      </div>
    </div>

    <div class="rounded-xl border border-blue-200 dark:border-blue-800 p-3 bg-blue-50 dark:bg-blue-950/40">
      <div class="text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wide">
        Days remaining
      </div>
      <div class="mt-1 flex items-baseline gap-1">
        <span class="text-2xl font-semibold text-blue-700 dark:text-blue-300">
          {{ summary?.totalRemaining ?? 0 }}
        </span>
        <span class="text-xs text-blue-600 dark:text-blue-300">days</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaveBalanceSummary } from '~/types/api'

defineProps<{
  summary: LeaveBalanceSummary | null
}>()
</script>
