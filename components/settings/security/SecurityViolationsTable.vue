<template>
  <div class="space-y-4">
    <!-- Alert Banner -->
    <div class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <Icon name="lucide:shield-alert" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="text-sm font-semibold text-red-800 dark:text-red-200">Security Violations</h3>
          <p class="text-xs text-red-700 dark:text-red-300 mt-1">
            This log shows all detected security violations including localStorage tampering attempts, unauthorized access, and session anomalies. Review and investigate suspicious activity.
          </p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="!loading && !error" class="flex flex-wrap gap-2">
      <!-- Status Filter -->
      <select
        v-model="filters.reviewed"
        @change="applyFilters"
        class="px-3 py-2 border border-[rgb(var(--border))] rounded-lg text-sm bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
      >
        <option value="">All Violations</option>
        <option value="false">Needs Review</option>
        <option value="true">Reviewed</option>
      </select>

      <!-- Clear Filters -->
      <button
        v-if="filters.reviewed !== ''"
        @click="clearFilters"
        class="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition"
      >
        <Icon name="lucide:x" class="w-4 h-4 inline mr-1" />
        Clear
      </button>

      <!-- Export Button -->
      <button
        @click="exportToCSV"
        class="px-3 py-2 border border-[rgb(var(--border))] rounded-lg text-sm bg-[rgb(var(--background))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition flex items-center gap-2"
      >
        <Icon name="lucide:download" class="w-4 h-4" />
        Export CSV
      </button>

      <!-- Stats -->
      <div class="ml-auto flex items-center gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="text-[rgb(var(--muted-foreground))]">Unreviewed:</span>
          <span class="font-semibold text-red-600">{{ unreviewedCount }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[rgb(var(--muted-foreground))]">Total:</span>
          <span class="font-semibold">{{ total }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
        <p class="text-sm font-medium text-red-800 dark:text-red-200">{{ error }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="violations.length === 0" class="text-center py-12">
      <Icon name="lucide:shield-check" class="w-12 h-12 mx-auto text-green-600 mb-3" />
      <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">No Security Violations</h3>
      <p class="text-sm text-[rgb(var(--muted-foreground))] mt-1">
        No security violations detected. Your system is secure.
      </p>
    </div>

    <!-- Table -->
    <div v-else class="border border-[rgb(var(--border))] rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm table-fixed">
          <thead class="bg-[rgb(var(--muted))] border-b border-[rgb(var(--border))]">
            <tr>
              <th class="w-[140px] px-3 py-3 text-left font-medium text-[rgb(var(--foreground))]">Timestamp</th>
              <th class="w-[180px] px-3 py-3 text-left font-medium text-[rgb(var(--foreground))]">User</th>
              <th class="w-[150px] px-3 py-3 text-left font-medium text-[rgb(var(--foreground))]">Type</th>
              <th class="w-[90px] px-3 py-3 text-left font-medium text-[rgb(var(--foreground))]">Severity</th>
              <th class="px-3 py-3 text-left font-medium text-[rgb(var(--foreground))]">Details</th>
              <th class="w-[120px] px-3 py-3 text-left font-medium text-[rgb(var(--foreground))]">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[rgb(var(--border))] bg-[rgb(var(--card))]">
            <tr
              v-for="violation in violations"
              :key="violation.id"
              class="hover:bg-[rgb(var(--muted))/50] transition cursor-pointer"
              @click="selectedViolation = violation"
            >
              <td class="px-3 py-3 text-[rgb(var(--foreground))] text-xs">
                {{ formatDate(violation.createdAt) }}
              </td>
              <td class="px-3 py-3">
                <div v-if="violation.user" class="truncate">
                  <div class="font-medium text-[rgb(var(--foreground))] truncate">
                    {{ violation.user.firstName }} {{ violation.user.lastName }}
                  </div>
                  <div class="text-xs text-[rgb(var(--muted-foreground))] truncate">{{ violation.user.email }}</div>
                </div>
                <div v-else class="text-[rgb(var(--muted-foreground))] italic text-xs">Unknown</div>
              </td>
              <td class="px-3 py-3">
                <span
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                  :class="getViolationTypeClass(violation.violationType)"
                >
                  {{ formatViolationType(violation.violationType) }}
                </span>
              </td>
              <td class="px-3 py-3">
                <span
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                  :class="getSeverityClass(violation.severity)"
                >
                  {{ violation.severity }}
                </span>
              </td>
              <td class="px-3 py-3 text-[rgb(var(--foreground))] truncate" :title="violation.description">
                {{ violation.description }}
              </td>
              <td class="px-3 py-3">
                <button
                  v-if="!violation.reviewed"
                  @click.stop="markAsReviewed(violation.id)"
                  class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition whitespace-nowrap"
                >
                  Mark Reviewed
                </button>
                <span v-else class="text-xs text-green-600 flex items-center gap-1 whitespace-nowrap">
                  <Icon name="lucide:check-circle" class="w-3 h-3" />
                  Reviewed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && violations.length > 0" class="flex items-center justify-between">
      <div class="text-sm text-[rgb(var(--muted-foreground))]">
        Showing {{ Math.min((currentPage - 1) * limit + 1, total) }} - {{ Math.min(currentPage * limit, total) }} of {{ total }}
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 border border-[rgb(var(--border))] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="text-sm text-[rgb(var(--muted-foreground))]">Page {{ currentPage }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage * limit >= total"
          class="px-3 py-1 border border-[rgb(var(--border))] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedViolation"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="selectedViolation = null"
      >
        <div class="bg-[rgb(var(--card))] rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div class="p-6 border-b border-[rgb(var(--border))]">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Security Violation Details</h3>
                <p class="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                  {{ formatDate(selectedViolation.createdAt) }}
                </p>
              </div>
              <button
                @click="selectedViolation = null"
                class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <!-- User Info -->
            <div>
              <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">User</div>
              <div v-if="selectedViolation.user">
                <div class="font-medium">{{ selectedViolation.user.firstName }} {{ selectedViolation.user.lastName }}</div>
                <div class="text-sm text-[rgb(var(--muted-foreground))]">{{ selectedViolation.user.email }}</div>
                <div class="text-sm text-[rgb(var(--muted-foreground))]">Role: {{ selectedViolation.user.role }}</div>
              </div>
              <div v-else class="text-[rgb(var(--muted-foreground))] italic">Unknown User</div>
            </div>

            <!-- Violation Type & Severity -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">Type</div>
                <span :class="getViolationTypeClass(selectedViolation.violationType)" class="inline-flex px-2 py-1 rounded text-sm font-medium">
                  {{ formatViolationType(selectedViolation.violationType) }}
                </span>
              </div>
              <div>
                <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">Severity</div>
                <span :class="getSeverityClass(selectedViolation.severity)" class="inline-flex px-2 py-1 rounded text-sm font-medium">
                  {{ selectedViolation.severity }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">Description</div>
              <div class="text-sm bg-[rgb(var(--muted))/50] rounded p-3">{{ selectedViolation.description }}</div>
            </div>

            <!-- Attempted vs Actual Role -->
            <div v-if="selectedViolation.attemptedRole" class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">Attempted Role</div>
                <div class="text-sm font-semibold text-red-600">{{ selectedViolation.attemptedRole }}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">Actual Role</div>
                <div class="text-sm font-semibold text-green-600">{{ selectedViolation.actualRole }}</div>
              </div>
            </div>

            <!-- Tampered Data -->
            <div v-if="selectedViolation.tamperedData">
              <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">Tampered Data</div>
              <pre class="text-xs bg-[rgb(var(--muted))/50] rounded p-3 overflow-x-auto">{{ JSON.stringify(selectedViolation.tamperedData, null, 2) }}</pre>
            </div>

            <!-- IP & Device Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">IP Address</div>
                <div class="text-sm">{{ selectedViolation.ipAddress }}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">User Agent</div>
                <div class="text-sm">{{ selectedViolation.userAgent }}</div>
              </div>
            </div>

            <!-- Action Taken -->
            <div>
              <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">Action Taken</div>
              <div class="text-sm font-semibold text-orange-600">{{ selectedViolation.actionTaken }}</div>
            </div>

            <!-- Review Notes -->
            <div>
              <div class="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-2">Investigation Notes</div>
              <textarea
                v-model="reviewNotes"
                rows="3"
                class="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg text-sm bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
                placeholder="Add investigation notes..."
              ></textarea>
            </div>
          </div>

          <div class="p-6 border-t border-[rgb(var(--border))] flex justify-end gap-2">
            <button
              @click="selectedViolation = null"
              class="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-sm hover:bg-[rgb(var(--muted))] transition"
            >
              Close
            </button>
            <button
              v-if="!selectedViolation.reviewed"
              @click="markAsReviewed(selectedViolation.id, true)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Mark as Reviewed
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const error = ref('')
const violations = ref<any[]>([])
const total = ref(0)
const unreviewedCount = ref(0)
const currentPage = ref(1)
const limit = 50
const selectedViolation = ref<any>(null)
const reviewNotes = ref('')

const filters = ref({
  reviewed: '',
})

const loadViolations = async () => {
  loading.value = true
  error.value = ''

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((currentPage.value - 1) * limit).toString(),
    })

    if (filters.value.reviewed !== '') {
      params.append('reviewed', filters.value.reviewed)
    }

    const response = await $fetch(`/api/security/violations?${params}`)
    violations.value = response.violations
    total.value = response.total

    // Count unreviewed
    const allUnreviewed = await $fetch('/api/security/violations?reviewed=false')
    unreviewedCount.value = allUnreviewed.total
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load security violations'
  } finally {
    loading.value = false
  }
}

const markAsReviewed = async (violationId: string, closeModal = false) => {
  try {
    await $fetch(`/api/security/violations/${violationId}`, {
      method: 'PATCH',
      body: {
        reviewed: true,
        notes: reviewNotes.value || undefined,
      },
    })

    if (closeModal) {
      selectedViolation.value = null
      reviewNotes.value = ''
    }

    // Reload violations
    await loadViolations()
  } catch (err: any) {
    alert(err.data?.message || 'Failed to update violation')
  }
}

const applyFilters = () => {
  currentPage.value = 1
  loadViolations()
}

const clearFilters = () => {
  filters.value.reviewed = ''
  applyFilters()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadViolations()
  }
}

const nextPage = () => {
  if (currentPage.value * limit < total.value) {
    currentPage.value++
    loadViolations()
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const formatViolationType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const getViolationTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    LOCALSTORAGE_TAMPERING: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    JWT_MISMATCH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    INVALID_JWT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    UNAUTHORIZED_ACCESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    API_PERMISSION_DENIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    SESSION_HIJACK_ATTEMPT: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  }
  return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
}

const getSeverityClass = (severity: string) => {
  const classes: Record<string, string> = {
    LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  return classes[severity] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
}

const exportToCSV = async () => {
  try {
    // Fetch all violations (without pagination) for export
    const params = new URLSearchParams()
    if (filters.value.reviewed !== '') {
      params.append('reviewed', filters.value.reviewed)
    }
    params.append('limit', '10000') // Get all records

    const response = await $fetch(`/api/security/violations?${params}`)
    const allViolations = response.violations

    // Define CSV headers
    const headers = [
      'Timestamp',
      'User Name',
      'User Email',
      'User Role',
      'Violation Type',
      'Severity',
      'Description',
      'Attempted Role',
      'Actual Role',
      'IP Address',
      'User Agent',
      'Action Taken',
      'Reviewed',
      'Reviewed At',
      'Notes'
    ]

    // Convert data to CSV rows
    const rows = allViolations.map((v: any) => [
      formatDate(v.createdAt),
      v.user ? `${v.user.firstName} ${v.user.lastName}` : 'Unknown',
      v.user?.email || 'N/A',
      v.user?.role || 'N/A',
      formatViolationType(v.violationType),
      v.severity,
      v.description,
      v.attemptedRole || 'N/A',
      v.actualRole || 'N/A',
      v.ipAddress,
      v.userAgent,
      v.actionTaken,
      v.reviewed ? 'Yes' : 'No',
      v.reviewedAt ? formatDate(v.reviewedAt) : 'N/A',
      v.notes || 'N/A'
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `security-violations-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err: any) {
    alert(err.data?.message || 'Failed to export violations')
  }
}

onMounted(() => {
  loadViolations()
})
</script>
