<template>
  <div class="space-y-4">
    <!-- Filters and Export -->
    <div v-if="!loading && !error" class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div class="flex flex-wrap gap-2 flex-1">
        <!-- Status Filter -->
        <select
          v-model="filters.success"
          @change="applyFilters"
          class="px-3 py-2 border border-[rgb(var(--border))] rounded-lg text-sm bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
        >
          <option value="">All Status</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>

        <!-- Date Range -->
        <input
          v-model="filters.startDate"
          type="date"
          @change="applyFilters"
          class="px-3 py-2 border border-[rgb(var(--border))] rounded-lg text-sm bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
          placeholder="Start Date"
        />
        <input
          v-model="filters.endDate"
          type="date"
          @change="applyFilters"
          class="px-3 py-2 border border-[rgb(var(--border))] rounded-lg text-sm bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
          placeholder="End Date"
        />

        <!-- Email Search -->
        <input
          v-model="filters.email"
          type="text"
          @input="applyFilters"
          placeholder="Search by email..."
          class="px-3 py-2 border border-[rgb(var(--border))] rounded-lg text-sm bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
        />

        <!-- Clear Filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition"
        >
          <Icon name="lucide:x" class="w-4 h-4 inline mr-1" />
          Clear
        </button>
      </div>

      <!-- Export Button -->
      <button
        @click="exportLogs"
        :disabled="exporting"
        class="px-4 py-2 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
      >
        <Icon
          :name="exporting ? 'lucide:loader-2' : 'lucide:download'"
          :class="{ 'animate-spin': exporting }"
          class="w-4 h-4"
        />
        {{ exporting ? 'Exporting...' : 'Export CSV' }}
      </button>
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

    <!-- Table -->
    <div v-if="!loading && !error" class="overflow-x-auto border border-[rgb(var(--border))] rounded-lg">
      <table class="w-full text-sm">
        <thead class="bg-[rgb(var(--muted))] border-b border-[rgb(var(--border))]">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-[rgb(var(--foreground))]">Timestamp</th>
            <th class="px-4 py-3 text-left font-medium text-[rgb(var(--foreground))]">Email</th>
            <th class="px-4 py-3 text-left font-medium text-[rgb(var(--foreground))]">Status</th>
            <th class="px-4 py-3 text-left font-medium text-[rgb(var(--foreground))]">IP Address</th>
            <th class="px-4 py-3 text-left font-medium text-[rgb(var(--foreground))]">Device</th>
            <th class="px-4 py-3 text-left font-medium text-[rgb(var(--foreground))]">Location</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[rgb(var(--border))]">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-[rgb(var(--muted))/50] transition">
            <td class="px-4 py-3 text-[rgb(var(--foreground))]">
              {{ formatDate(log.timestamp) }}
            </td>
            <td class="px-4 py-3 text-[rgb(var(--foreground))]">
              {{ log.email }}
            </td>
            <td class="px-4 py-3">
              <span v-if="log.success" class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Success
              </span>
              <span v-else class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                Failed
              </span>
            </td>
            <td class="px-4 py-3 text-[rgb(var(--muted-foreground))]">
              {{ log.ipAddress }}
            </td>
            <td class="px-4 py-3 text-[rgb(var(--muted-foreground))]">
              {{ log.browser || 'Unknown' }} / {{ log.os || 'Unknown' }}
            </td>
            <td class="px-4 py-3 text-[rgb(var(--muted-foreground))]">
              {{ log.country || 'Unknown' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination" class="flex items-center justify-between px-4">
      <p class="text-sm text-[rgb(var(--muted-foreground))]">
        Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} entries
      </p>
      <div class="flex gap-2">
        <button
          @click="loadPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-3 py-1.5 border border-[rgb(var(--border))] rounded text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          @click="loadPage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages"
          class="px-3 py-1.5 border border-[rgb(var(--border))] rounded text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SignInLog {
  id: string
  email: string
  timestamp: string
  success: boolean
  ipAddress: string
  browser: string | null
  os: string | null
  city: string | null
  country: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const loading = ref(true)
const error = ref('')
const logs = ref<SignInLog[]>([])
const pagination = ref<Pagination | null>(null)
const currentPage = ref(1)
const exporting = ref(false)

// Filters
const filters = ref({
  success: '',
  email: '',
  startDate: '',
  endDate: '',
})

const hasActiveFilters = computed(() => {
  return filters.value.success || filters.value.email || filters.value.startDate || filters.value.endDate
})

const buildQueryString = (page: number) => {
  const params = new URLSearchParams({ page: page.toString() })

  if (filters.value.success) params.append('success', filters.value.success)
  if (filters.value.email) params.append('email', filters.value.email)
  if (filters.value.startDate) params.append('startDate', filters.value.startDate)
  if (filters.value.endDate) params.append('endDate', filters.value.endDate)

  return params.toString()
}

const loadPage = async (page: number) => {
  loading.value = true
  error.value = ''

  try {
    const queryString = buildQueryString(page)
    const response = await $fetch(`/api/security/signin-logs?${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })

    logs.value = response.logs
    pagination.value = response.pagination
    currentPage.value = page
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load sign-in logs'
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  loadPage(1)
}

const clearFilters = () => {
  filters.value = {
    success: '',
    email: '',
    startDate: '',
    endDate: '',
  }
  loadPage(1)
}

const exportLogs = async () => {
  exporting.value = true

  try {
    const response = await fetch('/api/security/signin-logs/export?format=csv', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to export logs')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `signin-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err: any) {
    error.value = err.message || 'Failed to export logs'
  } finally {
    exporting.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  loadPage(1)
})
</script>
