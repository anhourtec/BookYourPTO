<template>
  <CustomModal v-model="isOpen" max-width="2xl">
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[rgb(var(--border))]">
        <div>
          <h2 class="text-xl font-bold text-[rgb(var(--foreground))]">Leave Request Details</h2>
          <p class="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Review the complete information
          </p>
        </div>
        <button
          @click="closeModal"
          class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <Icon name="lucide:x" class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div v-if="request" class="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        <!-- Employee Info -->
        <div class="bg-[rgb(var(--muted))]/30 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
            <Icon name="lucide:user" class="w-4 h-4" />
            Employee Information
          </h3>
          
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
              {{ userInitials }}
            </div>
            
            <div class="flex-1 space-y-2">
              <div>
                <p class="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {{ request.user.firstName }} {{ request.user.lastName }}
                </p>
                <p class="text-sm text-[rgb(var(--muted-foreground))]">
                  {{ request.user.jobTitle || 'No title' }}
                </p>
              </div>
              
              <div v-if="request.user.department" class="flex items-center gap-2">
                <Icon name="lucide:building-2" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
                  :style="{
                    backgroundColor: request.user.department.color + '20',
                    color: request.user.department.color,
                  }"
                >
                  {{ request.user.department.name }}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <Icon name="lucide:mail" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                <span class="text-sm text-[rgb(var(--muted-foreground))]">
                  {{ request.user.email }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Leave Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Leave Type -->
          <div class="bg-[rgb(var(--muted))]/30 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:tag" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span class="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase">Leave Type</span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 rounded-md flex items-center justify-center"
                :style="{
                  backgroundColor: request.leaveType.color + '20',
                  color: request.leaveType.color,
                }"
              >
                <Icon
                  :name="request.leaveType.icon || 'lucide:calendar'"
                  class="w-5 h-5"
                />
              </div>
              <span class="text-base font-semibold text-[rgb(var(--foreground))]">
                {{ request.leaveType.name }}
              </span>
            </div>
          </div>

          <!-- Total Days -->
          <div class="bg-[rgb(var(--muted))]/30 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:hash" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span class="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase">Total Days</span>
            </div>
            <p class="text-2xl font-bold text-[rgb(var(--foreground))]">
              {{ request.totalDays }} {{ request.totalDays === 1 ? 'day' : 'days' }}
            </p>
          </div>

          <!-- Start Date -->
          <div class="bg-[rgb(var(--muted))]/30 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:calendar-arrow-up" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span class="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase">Start Date</span>
            </div>
            <p class="text-base font-semibold text-[rgb(var(--foreground))]">
              {{ formatFullDate(request.startDate) }}
            </p>
            <p v-if="request.startHalf !== 'FULL_DAY'" class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              {{ formatDayPortion(request.startHalf) }}
            </p>
          </div>

          <!-- End Date -->
          <div class="bg-[rgb(var(--muted))]/30 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:calendar-arrow-down" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span class="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase">End Date</span>
            </div>
            <p class="text-base font-semibold text-[rgb(var(--foreground))]">
              {{ formatFullDate(request.endDate) }}
            </p>
            <p v-if="request.endHalf !== 'FULL_DAY'" class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              {{ formatDayPortion(request.endHalf) }}
            </p>
          </div>
        </div>

        <!-- Reason -->
        <div v-if="request.reason" class="bg-[rgb(var(--muted))]/30 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-3">
            <Icon name="lucide:message-square" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <span class="text-sm font-semibold text-[rgb(var(--foreground))]">Reason for Leave</span>
          </div>
          <p class="text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap">
            {{ request.reason }}
          </p>
        </div>

        <!-- Notes (if any) -->
        <div v-if="request.notes" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-3">
            <Icon name="lucide:sticky-note" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span class="text-sm font-semibold text-blue-900 dark:text-blue-100">Additional Notes</span>
          </div>
          <p class="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
            {{ request.notes }}
          </p>
        </div>

        <!-- Request Timeline -->
        <div class="bg-[rgb(var(--muted))]/30 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-3">
            <Icon name="lucide:clock" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <span class="text-sm font-semibold text-[rgb(var(--foreground))]">Request Timeline</span>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-[rgb(var(--muted-foreground))]">Submitted</span>
              <span class="text-sm font-medium text-[rgb(var(--foreground))]">
                {{ formatDateTime(request.createdAt) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[rgb(var(--muted-foreground))]">Time Ago</span>
              <span class="text-sm font-medium text-[rgb(var(--foreground))]">
                {{ formatTimeAgo(request.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Footer -->
      <div class="border-t border-[rgb(var(--border))] px-4 sm:px-6 py-4 bg-[rgb(var(--muted))]/20">
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="closeModal"
            class="flex-1 sm:flex-initial px-4 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] font-medium transition-colors"
          >
            Close
          </button>
          <div class="flex-1 flex gap-3">
            <button
              @click="handleApprove"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              @click="handleReject"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
import { formatDistance } from 'date-fns'
import type { LeaveRequest } from '~/types/approval'

interface Props {
  modelValue: boolean
  request: LeaveRequest | null
  processing?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  approve: [id: string]
  reject: [request: LeaveRequest]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const userInitials = computed(() => {
  if (!props.request) return ''
  return `${props.request.user.firstName[0]}${props.request.user.lastName[0]}`.toUpperCase()
})

const closeModal = () => {
  isOpen.value = false
}

const handleApprove = () => {
  if (!props.request) return
  emit('approve', props.request.id)
}

const handleReject = () => {
  if (!props.request) return
  emit('reject', props.request)
  closeModal()
}

const formatFullDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTimeAgo = (date: string) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

const formatDayPortion = (portion: string) => {
  const portions: Record<string, string> = {
    FULL_DAY: 'Full Day',
    FIRST_HALF: 'Morning (First Half)',
    SECOND_HALF: 'Afternoon (Second Half)',
  }
  return portions[portion] || portion
}
</script>