<template>
  <div class="space-y-6">
    <!-- Reports Card -->
    <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
      <h2 class="text-xl font-bold text-[rgb(var(--foreground))] mb-2">Reports</h2>
      <p class="text-sm text-[rgb(var(--muted-foreground))] mb-6">
        Generate detailed Excel reports for leave analysis and tracking.
      </p>
      
      <div class="space-y-6">
        <!-- Leave Report Section -->
        <div class="border border-[rgb(var(--border))] rounded-lg p-5">
          <div class="flex items-start gap-3 mb-4">
            <div class="p-2 bg-[rgb(var(--primary))]/10 rounded-lg">
              <Icon name="lucide:file-spreadsheet" class="w-5 h-5 text-[rgb(var(--primary))]" />
            </div>
            <div class="flex-1">
              <h3 class="text-base font-semibold text-[rgb(var(--foreground))] mb-1">
                Leave Usage Report
              </h3>
              <p class="text-sm text-[rgb(var(--muted-foreground))]">
                Comprehensive Excel report with leave details, employee summaries, and leave type statistics.
              </p>
            </div>
          </div>

          <!-- Filter Options -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <!-- Date Range -->
            <div>
              <label class="block text-xs font-medium text-[rgb(var(--foreground))] mb-2">
                Start Date
              </label>
              <input
                v-model="reportFilters.startDate"
                type="date"
                class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label class="block text-xs font-medium text-[rgb(var(--foreground))] mb-2">
                End Date
              </label>
              <input
                v-model="reportFilters.endDate"
                type="date"
                class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none"
              />
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-xs font-medium text-[rgb(var(--foreground))] mb-2">
                Status
              </label>
              <select
                v-model="reportFilters.status"
                class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none"
              >
                <option value="">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <!-- Report Info -->
          <div class="bg-[rgb(var(--muted))]/50 rounded-lg p-4 mb-4">
            <h4 class="text-xs font-semibold text-[rgb(var(--foreground))] mb-2">
              Report Includes:
            </h4>
            <ul class="space-y-1.5 text-xs text-[rgb(var(--muted-foreground))]">
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-3.5 h-3.5 text-green-600" />
                <span>Detailed leave records with employee information</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-3.5 h-3.5 text-green-600" />
                <span>Summary by employee showing leave type breakdown</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-3.5 h-3.5 text-green-600" />
                <span>Summary by leave type with approval statistics</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-3.5 h-3.5 text-green-600" />
                <span>Paid/unpaid leave tracking and color coding</span>
              </li>
            </ul>
          </div>

          <!-- Generate Button -->
          <div class="flex items-center gap-3">
            <button
              @click="generateLeaveReport"
              :disabled="generatingReport"
              class="px-5 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              <Icon v-if="generatingReport" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <Icon v-else name="lucide:download" class="w-4 h-4" />
              <span>{{ generatingReport ? 'Generating Report...' : 'Download Excel Report' }}</span>
            </button>

            <button
              v-if="reportFilters.startDate || reportFilters.endDate || reportFilters.status"
              @click="clearFilters"
              class="px-4 py-2.5 bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgb(var(--muted))]/80 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>

          <!-- Success Message -->
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 transform scale-95"
            enter-to-class="opacity-100 transform scale-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 transform scale-100"
            leave-to-class="opacity-0 transform scale-95"
          >
            <div v-if="reportSuccess" class="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div class="flex items-center gap-2">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <p class="text-sm text-green-600 font-medium">{{ reportSuccess }}</p>
              </div>
            </div>
          </Transition>

          <!-- Error Message -->
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 transform scale-95"
            enter-to-class="opacity-100 transform scale-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 transform scale-100"
            leave-to-class="opacity-0 transform scale-95"
          >
            <div v-if="reportError" class="mt-4 p-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg">
              <div class="flex items-center gap-2">
                <Icon name="lucide:alert-circle" class="w-5 h-5 text-[rgb(var(--destructive))] flex-shrink-0" />
                <p class="text-sm text-[rgb(var(--destructive))]">{{ reportError }}</p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Timesheet Report - REMOVED FOR COMMUNITY EDITION (Premium feature) -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { ensureValidToken, getToken } = useAuth()

const reportFilters = ref({
  startDate: '',
  endDate: '',
  status: ''
})

const generatingReport = ref(false)
const reportSuccess = ref('')
const reportError = ref('')

const clearFilters = () => {
  reportFilters.value = {
    startDate: '',
    endDate: '',
    status: ''
  }
}

// Timesheet functionality - REMOVED FOR COMMUNITY EDITION (Premium feature)

const generateLeaveReport = async () => {
  generatingReport.value = true
  reportError.value = ''
  reportSuccess.value = ''

  try {
    // ✅ Ensure token is valid and refresh if needed
    const isValid = await ensureValidToken()
    
    if (!isValid) {
      throw new Error('Session expired. Please log in again.')
    }

    // ✅ Get fresh token (could be refreshed)
    const token = getToken()
    
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.')
    }

    // Build query string
    const params = new URLSearchParams()
    if (reportFilters.value.startDate) params.append('startDate', reportFilters.value.startDate)
    if (reportFilters.value.endDate) params.append('endDate', reportFilters.value.endDate)
    if (reportFilters.value.status) params.append('status', reportFilters.value.status)

    console.log('📊 Requesting report with filters:', {
      startDate: reportFilters.value.startDate,
      endDate: reportFilters.value.endDate,
      status: reportFilters.value.status
    })

    // Use native fetch for blob download with auth header
    const response = await fetch(`/api/reports/leaves?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })

    if (!response.ok) {
      // Try to parse error message
      let errorMessage = 'Failed to generate report'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // If response isn't JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    // Get blob from response
    const blob = await response.blob()
    
    console.log('✅ Report downloaded, size:', blob.size, 'bytes')
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Generate filename
    const startDateStr = reportFilters.value.startDate || 'all'
    const endDateStr = reportFilters.value.endDate || 'time'
    const timestamp = new Date().toISOString().split('T')[0]
    link.download = `Leave_Report_${startDateStr}_to_${endDateStr}_${timestamp}.xlsx`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    reportSuccess.value = 'Report generated and downloaded successfully!'
    
    setTimeout(() => {
      reportSuccess.value = ''
    }, 5000)
  } catch (err: any) {
    console.error('❌ Error generating report:', err)
    reportError.value = err.message || 'Failed to generate report. Please try again.'
    
    setTimeout(() => {
      reportError.value = ''
    }, 8000)
  } finally {
    generatingReport.value = false
  }
}

// generateTimesheetReport - REMOVED FOR COMMUNITY EDITION (Premium feature)
</script>
