<template>
  <div
    class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[rgb(var(--muted))]/30 transition-colors cursor-pointer"
    @click="$emit('view-details', request)"
  >
    <!-- User Info with Avatar (3 cols) - EXACT COPY from UserTableRow -->
    <div class="col-span-3 flex items-center gap-3">
      <div class="relative">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
          :class="[
            getRoleColor(request.user.role).avatar,
            getRoleColor(request.user.role).avatarText,
            getRoleColor(request.user.role).ring
          ]"
        >
          {{ userInitials }}
        </div>

        <!-- Star Badge for Administrator - EXACT COPY from UserTableRow -->
        <div
          v-if="request.user.role === 'ADMINISTRATOR'"
          class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center ring-2 ring-[rgb(var(--card))]"
        >
          <Icon name="lucide:star" class="w-2.5 h-2.5 text-yellow-900 dark:text-yellow-950 fill-current" />
        </div>

        <!-- Crown Badge for Executive - EXACT COPY from UserTableRow -->
        <div
          v-else-if="request.user.role === 'EXECUTIVE'"
          class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center ring-2 ring-[rgb(var(--card))]"
        >
          <Icon name="lucide:crown" class="w-2.5 h-2.5 text-yellow-900 dark:text-yellow-950 fill-current" />
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <p class="font-medium text-[rgb(var(--foreground))] truncate text-sm">
          {{ request.user.firstName }} {{ request.user.lastName }}
        </p>
        <p class="text-xs text-[rgb(var(--muted-foreground))] truncate">
          {{ request.user.jobTitle || 'No title' }}
        </p>
      </div>
    </div>

    <!-- Leave Type (2 cols) -->
    <div class="col-span-2 flex items-center gap-2">
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
      <span class="text-sm text-[rgb(var(--foreground))] font-medium truncate">
        {{ request.leaveType.name }}
      </span>
    </div>

    <!-- Duration (2 cols) -->
    <div class="col-span-2">
      <p class="text-sm text-[rgb(var(--foreground))] font-medium">
        {{ formatDuration(request.startDate, request.endDate) }}
      </p>
      <p class="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
        {{ request.totalDays }} {{ request.totalDays === 1 ? 'day' : 'days' }}
        <span v-if="request.reason" class="text-[rgb(var(--primary))]">• Has reason</span>
      </p>
    </div>

    <!-- Department (2 cols) -->
    <div class="col-span-2 flex items-center">
      <span
        v-if="request.user.department"
        class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]"
      >
        {{ request.user.department.name }}
      </span>
      <span v-else class="text-xs text-[rgb(var(--muted-foreground))] italic">
        No department
      </span>
    </div>

    <!-- Actions (3 cols) -->
   <div class="col-span-3 flex items-center justify-end gap-2" @click.stop>
        <button
          @click="$emit('approve', request.id)"
          :disabled="processing"
          class="px-3 py-1.5 bg-[rgb(var(--primary))] hover:opacity-90 text-[rgb(var(--primary-foreground))] rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs shadow-sm"
        >
          <Icon
            v-if="processing"
            name="lucide:loader-2"
            class="w-3.5 h-3.5 animate-spin"
          />
          <Icon v-else name="lucide:check" class="w-3.5 h-3.5" />
          <span>Approve</span>
        </button>

        <button
          @click="$emit('reject', request)"
          :disabled="processing"
          class="px-3 py-1.5 border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
        >
          <Icon name="lucide:x" class="w-3.5 h-3.5" />
          <span>Reject</span>
        </button>
      </div>
  </div>
</template>

<script setup lang="ts">
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

const { getRoleColor } = useUserRoleColors()

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
</script>