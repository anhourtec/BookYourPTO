<template>
  <div class="space-y-4">
    <!-- Annual Leave Bucket -->
    <div v-if="summary?.annual" class="space-y-3">
      <div class="flex items-center gap-2">
        <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
        <h3 class="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">Annual Leave</h3>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <!-- Allowance -->
        <div class="rounded-lg border border-[rgb(var(--border))] p-2.5 bg-gradient-to-br from-[rgb(var(--muted))]/30 to-transparent">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] text-[rgb(var(--muted-foreground))] uppercase tracking-wide font-medium">Allowance</span>
            <Icon name="lucide:calendar-check" class="w-3 h-3 text-blue-500/60" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-bold text-[rgb(var(--foreground))]">
              {{ summary.annual.allowance ?? 0 }}
            </span>
            <span class="text-[10px] text-[rgb(var(--muted-foreground))]">days</span>
          </div>
        </div>

        <!-- Used -->
        <div class="rounded-lg border border-rose-200 dark:border-rose-900/50 p-2.5 bg-gradient-to-br from-rose-50/50 dark:from-rose-950/20 to-transparent">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-wide font-medium">Used</span>
            <Icon name="lucide:calendar-x" class="w-3 h-3 text-rose-500/60" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-bold text-rose-700 dark:text-rose-400">
              {{ summary.annual.used ?? 0 }}
            </span>
            <span class="text-[10px] text-rose-600/60 dark:text-rose-400/60">days</span>
          </div>
        </div>

        <!-- Carried Over -->
        <div class="rounded-lg border border-[rgb(var(--border))] p-2.5 bg-gradient-to-br from-amber-50/30 dark:from-amber-950/10 to-transparent">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] text-[rgb(var(--muted-foreground))] uppercase tracking-wide font-medium">Carried</span>
            <Icon name="lucide:arrow-right-circle" class="w-3 h-3 text-amber-500/60" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-bold text-[rgb(var(--foreground))]">
              {{ summary.annual.carriedOver ?? 0 }}
            </span>
            <span class="text-[10px] text-[rgb(var(--muted-foreground))]">days</span>
          </div>
        </div>

        <!-- Remaining -->
        <div class="rounded-lg border-2 border-blue-300 dark:border-blue-800 p-2.5 bg-gradient-to-br from-blue-50 dark:from-blue-950/40 to-blue-100/50 dark:to-blue-900/20 shadow-sm">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] text-blue-700 dark:text-blue-300 uppercase tracking-wide font-bold">Remaining</span>
            <Icon name="lucide:calendar-clock" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-black text-blue-700 dark:text-blue-300">
              {{ summary.annual.remaining ?? 0 }}
            </span>
            <span class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">days</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sick Leave Bucket -->
    <div v-if="summary?.sick && summary.sick.allowance > 0" class="space-y-3">
      <div class="flex items-center gap-2">
        <div class="w-1 h-4 bg-green-500 rounded-full"></div>
        <h3 class="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">Sick Leave</h3>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <!-- Allowance -->
        <div class="rounded-lg border border-[rgb(var(--border))] p-2.5 bg-gradient-to-br from-[rgb(var(--muted))]/30 to-transparent">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] text-[rgb(var(--muted-foreground))] uppercase tracking-wide font-medium">Allowance</span>
            <Icon name="lucide:heart-pulse" class="w-3 h-3 text-green-500/60" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-bold text-[rgb(var(--foreground))]">
              {{ summary.sick.allowance ?? 0 }}
            </span>
            <span class="text-[10px] text-[rgb(var(--muted-foreground))]">days</span>
          </div>
        </div>

        <!-- Used -->
        <div class="rounded-lg border border-rose-200 dark:border-rose-900/50 p-2.5 bg-gradient-to-br from-rose-50/50 dark:from-rose-950/20 to-transparent">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-wide font-medium">Used</span>
            <Icon name="lucide:activity" class="w-3 h-3 text-rose-500/60" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-bold text-rose-700 dark:text-rose-400">
              {{ summary.sick.used ?? 0 }}
            </span>
            <span class="text-[10px] text-rose-600/60 dark:text-rose-400/60">days</span>
          </div>
        </div>

        <!-- Remaining -->
        <div class="rounded-lg border-2 border-green-300 dark:border-green-800 p-2.5 bg-gradient-to-br from-green-50 dark:from-green-950/40 to-green-100/50 dark:to-green-900/20 shadow-sm">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] text-green-700 dark:text-green-300 uppercase tracking-wide font-bold">Remaining</span>
            <Icon name="lucide:shield-plus" class="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-black text-green-700 dark:text-green-300">
              {{ summary.sick.remaining ?? 0 }}
            </span>
            <span class="text-[10px] text-green-600 dark:text-green-400 font-semibold">days</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback to legacy view if new bucket fields are not available -->
    <div v-if="!summary?.annual && !summary?.sick" class="grid grid-cols-2 gap-2">
      <div class="rounded-lg border border-[rgb(var(--border))] p-2.5 bg-gradient-to-br from-[rgb(var(--muted))]/30 to-transparent">
        <div class="text-[10px] text-[rgb(var(--muted-foreground))] uppercase tracking-wide font-medium mb-1">
          Total allowance
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-xl font-bold text-[rgb(var(--foreground))]">
            {{ summary?.totalAllowance ?? 0 }}
          </span>
          <span class="text-[10px] text-[rgb(var(--muted-foreground))]">days</span>
        </div>
      </div>

      <div class="rounded-lg border border-rose-200 dark:border-rose-900/50 p-2.5 bg-gradient-to-br from-rose-50/50 dark:from-rose-950/20 to-transparent">
        <div class="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-wide font-medium mb-1">
          Used
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-xl font-bold text-rose-700 dark:text-rose-400">
            {{ summary?.totalUsed ?? 0 }}
          </span>
          <span class="text-[10px] text-rose-600/60 dark:text-rose-400/60">days</span>
        </div>
      </div>

      <div class="rounded-lg border border-[rgb(var(--border))] p-2.5 bg-gradient-to-br from-amber-50/30 dark:from-amber-950/10 to-transparent">
        <div class="text-[10px] text-[rgb(var(--muted-foreground))] uppercase tracking-wide font-medium mb-1">
          Carried over
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-bold text-[rgb(var(--foreground))]">
            {{ summary?.carriedOver ?? 0 }}
          </span>
          <span class="text-[10px] text-[rgb(var(--muted-foreground))]">days</span>
        </div>
      </div>

      <div class="rounded-lg border-2 border-blue-300 dark:border-blue-800 p-2.5 bg-gradient-to-br from-blue-50 dark:from-blue-950/40 to-blue-100/50 dark:to-blue-900/20 shadow-sm">
        <div class="text-[10px] text-blue-700 dark:text-blue-300 uppercase tracking-wide font-bold mb-1">
          Days remaining
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-black text-blue-700 dark:text-blue-300">
            {{ summary?.totalRemaining ?? 0 }}
          </span>
          <span class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">days</span>
        </div>
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
