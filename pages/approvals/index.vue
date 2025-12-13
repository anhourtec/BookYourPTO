<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <!-- Header -->
    <div class="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))] mb-1">
              Leave Approvals
            </h1>
            <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
              Review and approve pending leave requests
              <span v-if="isDepartmentHead"> from your department</span>
              ({{ filteredRequests.length }} {{ filteredRequests.length === 1 ? 'request' : 'requests' }})
            </p>
          </div>
          
          <!-- Stats Summary -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 px-3 sm:px-4 py-2 sm:py-2.5">
              <div class="text-xs text-orange-600 dark:text-orange-400">Pending</div>
              <div class="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                {{ pendingCount }}
              </div>
            </div>
            <div class="bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 px-3 sm:px-4 py-2 sm:py-2.5">
              <div class="text-xs text-green-600 dark:text-green-400">Today</div>
              <div class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                {{ processedToday }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div class="flex-1 relative">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-[rgb(var(--muted-foreground))] pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by employee name..."
            class="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-shadow text-sm"
          />
        </div>

        <button
          @click="showFilterModal = true"
          class="px-4 py-2 sm:py-2.5 border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium text-[rgb(var(--foreground))] relative"
        >
          <Icon name="lucide:filter" class="w-4 h-4" />
          <span>Filters</span>
          <span
            v-if="activeFiltersCount > 0"
            class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] text-xs rounded-full flex items-center justify-center font-semibold"
          >
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 sm:py-16">
        <Icon name="lucide:loader-2" class="w-8 sm:w-10 h-8 sm:h-10 animate-spin text-[rgb(var(--primary))] mb-3" />
        <p class="text-[rgb(var(--muted-foreground))] text-sm">Loading requests...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 sm:py-16 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
        <div class="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center mb-3 sm:mb-4">
          <Icon name="lucide:alert-circle" class="w-6 sm:w-8 h-6 sm:h-8 text-[rgb(var(--destructive))]" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Failed to load requests</h3>
        <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mb-4 sm:mb-6 text-center max-w-md px-4">{{ error }}</p>
        <button
          @click="fetchPendingRequests"
          class="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRequests.length === 0" class="flex flex-col items-center justify-center py-12 sm:py-16 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
        <div class="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3 sm:mb-4">
          <Icon name="lucide:check-circle" class="w-6 sm:w-8 h-6 sm:h-8 text-green-600" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-[rgb(var(--foreground))] mb-2">
          {{ searchQuery || activeFiltersCount > 0 ? 'No requests found' : 'All caught up!' }}
        </h3>
        <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mb-4 sm:mb-6 text-center max-w-md px-4">
          {{ searchQuery || activeFiltersCount > 0 
            ? 'Try adjusting your search or filters' 
            : 'There are no pending leave requests at the moment.' 
          }}
        </p>
        <button 
          v-if="activeFiltersCount > 0 || searchQuery"
          @click="clearAllFilters" 
          class="px-4 sm:px-5 py-2 sm:py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-sm font-medium"
        >
          Clear Filters
        </button>
      </div>

      <!-- Approvals Display -->
      <div v-else>
        <!-- Mobile Card View (< lg) -->
        <div class="lg:hidden space-y-3">
          <ApprovalCard
            v-for="request in filteredRequests"
            :key="request.id"
            :request="request"
            :processing="processing[request.id] || false"
            @approve="approveRequest"
            @reject="openRejectModal"
            @view-details="openDetailModal"
          />
        </div>

        <!-- Desktop Table View (>= lg) -->
        <div class="hidden lg:block bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm overflow-hidden">
          <!-- Table Header -->
          <div class="grid grid-cols-12 gap-4 px-6 py-3.5 bg-[rgb(var(--muted))]/50 border-b border-[rgb(var(--border))] text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
            <div class="col-span-3">Employee</div>
            <div class="col-span-2">Leave Type</div>
            <div class="col-span-2">Duration</div>
            <div class="col-span-2">Department</div>
            <div class="col-span-3 text-right">Actions</div>
          </div>

          <!-- Request Rows -->
          <div class="divide-y divide-[rgb(var(--border))]">
            <ApprovalTableRow
              v-for="request in filteredRequests"
              :key="request.id"
              :request="request"
              :processing="processing[request.id] || false"
              @approve="approveRequest"
              @reject="openRejectModal"
              @view-details="openDetailModal"
            />
          </div>
        </div>

        <!-- Pagination Info -->
        <div class="mt-4 text-center">
          <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
            Showing {{ filteredRequests.length }} {{ filteredRequests.length === 1 ? 'request' : 'requests' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Filter Modal -->
    <CustomModal v-model="showFilterModal">
      <div class="flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgb(var(--border))]">
          <h2 class="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">Filter Requests</h2>
          <button 
            @click="showFilterModal = false" 
            class="p-1.5 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
          >
            <Icon name="lucide:x" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        <div class="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <ApprovalFilter
            :sections="filterSections"
            @update:filter="handleFilterUpdate"
          />
        </div>

        <div class="border-t border-[rgb(var(--border))] px-4 sm:px-6 py-3 sm:py-4 bg-[rgb(var(--muted))]/20">
          <div class="flex gap-2 sm:gap-3">
            <button
              @click="clearAllFilters"
              class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-sm font-medium"
            >
              Clear All
            </button>
            <button
              @click="showFilterModal = false"
              class="flex-1 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </CustomModal>

    <!-- Reject Modal -->
    <CustomModal v-model="rejectModalOpen" max-width="md">
      <div class="p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
            Reject Leave Request
          </h2>
          <button
            @click="rejectModalOpen = false"
            class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div v-if="selectedRequest" class="space-y-4">
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p class="text-sm text-amber-800 dark:text-amber-200">
              You are about to reject the leave request from
              <strong>{{ selectedRequest.user.firstName }} {{ selectedRequest.user.lastName }}</strong>
              for <strong>{{ selectedRequest.totalDays }} {{ selectedRequest.totalDays === 1 ? 'day' : 'days' }}</strong>.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Rejection Reason <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <textarea
              v-model="rejectionReason"
              rows="4"
              placeholder="Please provide a reason for rejection..."
              class="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:ring-2 focus:ring-[rgb(var(--destructive))] focus:border-transparent resize-none"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="rejectModalOpen = false"
              class="flex-1 px-4 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmReject"
              :disabled="!rejectionReason.trim() || rejecting"
              class="flex-1 px-4 py-2.5 bg-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/90 text-[rgb(var(--destructive-foreground))] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon
                v-if="rejecting"
                name="lucide:loader-2"
                class="w-4 h-4 animate-spin"
              />
              <span>{{ rejecting ? 'Rejecting...' : 'Confirm Rejection' }}</span>
            </button>
          </div>
        </div>
      </div>
    </CustomModal>

    <!-- Leave Detail Modal -->
    <LeaveDetailModal
      v-model="showDetailModal"
      :request="selectedRequest"
      :processing="selectedRequest ? (processing[selectedRequest.id] || false) : false"
      @approve="approveRequest"
      @reject="handleRejectFromDetail"
    />

    <!-- Success Toast -->
    <Transition name="toast">
      <div
        v-if="successMessage"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md z-50"
      >
        <Icon name="lucide:check-circle" class="w-5 h-5 flex-shrink-0" />
        <span class="text-sm font-medium">{{ successMessage }}</span>
      </div>
    </Transition>

    <!-- Error Toast -->
    <Transition name="toast">
      <div
        v-if="errorMessage"
        class="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md z-50"
      >
        <Icon name="lucide:alert-circle" class="w-5 h-5 flex-shrink-0" />
        <span class="text-sm font-medium">{{ errorMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import ApprovalCard from '~/components/approvals/ApprovalCard.vue'
import ApprovalTableRow from '~/components/approvals/ApprovalTableRow.vue'
import ApprovalFilter from '~/components/approvals/ApprovalFilter.vue'
import LeaveDetailModal from '~/components/approvals/LeaveDetailModal.vue'
import type { LeaveRequest } from '~/types/approval'

const { getUser, hasRole, canApproveRequests } = usePermissions()

// Check permissions
onMounted(() => {
  if (!canApproveRequests()) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true,
    })
  }
  fetchPendingRequests()
})

// Check if user is department head
const currentUser = computed(() => getUser())
const isDepartmentHead = computed(() => currentUser.value?.role === 'DEPARTMENT_HEAD')

// State
const pendingRequests = ref<LeaveRequest[]>([])
const loading = ref(true)
const processing = ref<Record<string, boolean>>({})
const error = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const processedToday = ref(0)

// Modals
const showFilterModal = ref(false)
const showDetailModal = ref(false)
const rejectModalOpen = ref(false)
const selectedRequest = ref<LeaveRequest | null>(null)
const rejectionReason = ref('')
const rejecting = ref(false)

// Filters
const searchQuery = ref('')
const sortByField = ref('createdAt')
const selectedLeaveTypes = ref<string[]>(['all'])
const selectedDepartments = ref<string[]>(['all'])

// Computed
const pendingCount = computed(() => pendingRequests.value.length)

// Get unique leave types and departments for filters
const leaveTypeOptions = computed(() => {
  const types = new Set(pendingRequests.value.map(r => r.leaveType.id))
  return [
    { label: 'All types', value: 'all' },
    ...Array.from(types).map(typeId => {
      const req = pendingRequests.value.find(r => r.leaveType.id === typeId)!
      return {
        label: req.leaveType.name,
        value: typeId,
        badge: pendingRequests.value.filter(r => r.leaveType.id === typeId).length.toString()
      }
    })
  ]
})

const departmentOptions = computed(() => {
  const depts = new Set(
    pendingRequests.value
      .filter(r => r.user.department)
      .map(r => r.user.department!.id)
  )
  return [
    { label: 'All departments', value: 'all' },
    ...Array.from(depts).map(deptId => {
      const req = pendingRequests.value.find(r => r.user.department?.id === deptId)!
      return {
        label: req.user.department!.name,
        value: deptId,
        badge: pendingRequests.value.filter(r => r.user.department?.id === deptId).length.toString()
      }
    })
  ]
})

const filterSections = computed(() => [
  {
    id: 'sortBy',
    label: 'Sort Order',
    type: 'radio' as const,
    value: sortByField.value,
    options: [
      { label: 'Oldest first', value: 'createdAt' },
      { label: 'Newest first', value: '-createdAt' },
      { label: 'Most days', value: 'totalDays' },
      { label: 'Employee name', value: 'user.firstName' },
    ]
  },
  {
    id: 'leaveTypes',
    label: 'Leave Types',
    type: 'checkbox' as const,
    value: selectedLeaveTypes.value,
    options: leaveTypeOptions.value
  },
  {
    id: 'departments',
    label: 'Departments',
    type: 'checkbox' as const,
    value: selectedDepartments.value,
    options: departmentOptions.value
  }
])

const activeFiltersCount = computed(() => {
  let count = 0
  if (sortByField.value !== 'createdAt') count++
  if (!selectedLeaveTypes.value.includes('all')) count++
  if (!selectedDepartments.value.includes('all')) count++
  return count
})

const handleFilterUpdate = (id: string, value: string | string[]) => {
  switch (id) {
    case 'sortBy':
      sortByField.value = value as string
      break
    case 'leaveTypes':
      selectedLeaveTypes.value = value as string[]
      break
    case 'departments':
      selectedDepartments.value = value as string[]
      break
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  sortByField.value = 'createdAt'
  selectedLeaveTypes.value = ['all']
  selectedDepartments.value = ['all']
}

const filteredRequests = computed(() => {
  let filtered = [...pendingRequests.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((request) =>
      request.user.firstName.toLowerCase().includes(query) ||
      request.user.lastName.toLowerCase().includes(query) ||
      request.user.email.toLowerCase().includes(query)
    )
  }

  // Leave type filter
  if (!selectedLeaveTypes.value.includes('all') && selectedLeaveTypes.value.length > 0) {
    filtered = filtered.filter(r => selectedLeaveTypes.value.includes(r.leaveType.id))
  }

  // Department filter
  if (!selectedDepartments.value.includes('all') && selectedDepartments.value.length > 0) {
    filtered = filtered.filter(r => 
      r.user.department && selectedDepartments.value.includes(r.user.department.id)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortByField.value === 'createdAt') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortByField.value === '-createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortByField.value === 'totalDays') {
      return b.totalDays - a.totalDays
    } else if (sortByField.value === 'user.firstName') {
      return a.user.firstName.localeCompare(b.user.firstName)
    }
    return 0
  })

  return filtered
})

// Fetch pending requests
const fetchPendingRequests = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    const data = await $fetch<LeaveRequest[]>('/api/leaves/pending', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    pendingRequests.value = data
  } catch (err: any) {
    console.error('Failed to fetch pending requests:', err)
    error.value = err.data?.message || 'Failed to load pending requests'
  } finally {
    loading.value = false
  }
}

// Approve request
const approveRequest = async (leaveId: string) => {
  processing.value[leaveId] = true
  
  try {
    const token = localStorage.getItem('auth_token')
    await $fetch(`/api/leaves/${leaveId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })

    // Remove from list
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== leaveId)
    processedToday.value++
    
    // Close detail modal if open
    if (showDetailModal.value) {
      showDetailModal.value = false
    }
    
    showSuccess('Leave request approved successfully')
  } catch (err: any) {
    console.error('Failed to approve request:', err)
    showError(err.data?.message || 'Failed to approve request')
  } finally {
    delete processing.value[leaveId]
  }
}

// Open detail modal
const openDetailModal = (request: LeaveRequest) => {
  selectedRequest.value = request
  showDetailModal.value = true
}

// Open reject modal
const openRejectModal = (request: LeaveRequest) => {
  selectedRequest.value = request
  rejectionReason.value = ''
  rejectModalOpen.value = true
}

// Handle reject from detail modal
const handleRejectFromDetail = (request: LeaveRequest) => {
  showDetailModal.value = false
  openRejectModal(request)
}

// Confirm reject
const confirmReject = async () => {
  if (!selectedRequest.value || !rejectionReason.value.trim()) return

  rejecting.value = true
  const leaveId = selectedRequest.value.id

  try {
    const token = localStorage.getItem('auth_token')
    await $fetch(`/api/leaves/${leaveId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { reason: rejectionReason.value },
    })

    // Remove from list
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== leaveId)
    processedToday.value++
    
    rejectModalOpen.value = false
    selectedRequest.value = null
    showSuccess('Leave request rejected')
  } catch (err: any) {
    console.error('Failed to reject request:', err)
    showError(err.data?.message || 'Failed to reject request')
  } finally {
    rejecting.value = false
  }
}

// Show success message
const showSuccess = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Show error message
const showError = (message: string) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>