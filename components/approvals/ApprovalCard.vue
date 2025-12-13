<template>
  <div
    class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-4 hover:shadow-md transition-all cursor-pointer"
    @click="$emit('view-details', request)"
  >
    <!-- Mobile Card View -->
    <div class="flex items-start gap-3">
      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-500 text-white"
        >
          {{ userInitials }}
        </div>
      </div>

      <!-- Request Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold text-[rgb(var(--foreground))] truncate">
              {{ request.user.firstName }} {{ request.user.lastName }}
            </h3>
            <p class="text-sm text-[rgb(var(--muted-foreground))] truncate">
              {{ request.user.jobTitle || 'No title' }}
            </p>
          </div>
        </div>

        <!-- Department Badge -->
        <div v-if="request.user.department" class="mb-2">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            :style="{
              backgroundColor: request.user.department.color + '20',
              color: request.user.department.color,
            }"
          >
            {{ request.user.department.name }}
          </span>
        </div>

        <!-- Leave Details -->
        <div class="grid grid-cols-2 gap-2 mb-3">
          <!-- Leave Type -->
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              :style="{
                backgroundColor: request.leaveType.color + '20',
                color: request.leaveType.color,
              }"
            >
              <Icon
                :name="request.leaveType.icon || 'lucide:calendar'"
                class="w-4 h-4"
              />
            </div>
            <div class="min-w-0">
              <div class="text-xs text-[rgb(var(--muted-foreground))]">Type</div>
              <div class="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                {{ request.leaveType.name }}
              </div>
            </div>
          </div>

          <!-- Duration -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Icon name="lucide:hash" class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <div class="text-xs text-[rgb(var(--muted-foreground))]">Days</div>
              <div class="text-sm font-medium text-[rgb(var(--foreground))]">
                {{ request.totalDays }}
              </div>
            </div>
          </div>

          <!-- Date Range -->
          <div class="col-span-2 flex items-center gap-2">
            <div class="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Icon name="lucide:calendar-range" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs text-[rgb(var(--muted-foreground))]">Duration</div>
              <div class="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                {{ formatDuration(request.startDate, request.endDate) }}
              </div>
            </div>
          </div>

          <!-- Requested -->
          <div class="col-span-2 flex items-center gap-2">
            <div class="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 flex-shrink-0">
              <Icon name="lucide:clock" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs text-[rgb(var(--muted-foreground))]">Requested</div>
              <div class="text-sm font-medium text-[rgb(var(--foreground))]">
                {{ formatTimeAgo(request.createdAt) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Reason Preview (if provided) -->
        <div v-if="request.reason" class="mb-3 pt-3 border-t border-[rgb(var(--border))]">
          <p class="text-xs text-[rgb(var(--muted-foreground))] mb-1 flex items-center gap-1">
            <Icon name="lucide:message-square" class="w-3 h-3" />
            Reason:
          </p>
          <p class="text-sm text-[rgb(var(--foreground))] line-clamp-2">{{ request.reason }}</p>
          <p class="text-xs text-[rgb(var(--primary))] mt-1">Click to view full details →</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2" @click.stop>
          <button
            @click="$emit('approve', request.id)"
            :disabled="processing"
            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <Icon
              v-if="processing"
              name="lucide:loader-2"
              class="w-4 h-4 animate-spin"
            />
            <Icon v-else name="lucide:check" class="w-4 h-4" />
            <span>Approve</span>
          </button>

          <button
            @click="$emit('reject', request)"
            :disabled="processing"
            class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDistance } from 'date-fns'
import type { LeaveRequest } from '~/types/approval'

interface Props {
  request: LeaveRequest
  processing: boolean
}

const props = defineProps<Props>()

defineEmits<{
  approve: [id: string]
  reject: [request: LeaveRequest]
  'view-details': [request: LeaveRequest]
}>()

const userInitials = computed(() =>
  `${props.request.user.firstName[0]}${props.request.user.lastName[0]}`.toUpperCase()
)

const formatDuration = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = startDate.toLocaleDateString('en-US', options)
  const endStr = endDate.toLocaleDateString('en-US', options)
  
  if (startStr === endStr) {
    return startStr
  }
  
  return `${startStr} - ${endStr}`
}

const formatTimeAgo = (date: string) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}
</script>