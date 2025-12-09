<template>
  <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--destructive))]/30 shadow-sm p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>

    <template v-else>
      <!-- Warning Banner -->
      <div class="mb-6 p-4 bg-[rgb(var(--destructive))]/10 border-2 border-[rgb(var(--destructive))]/30 rounded-lg">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-full bg-[rgb(var(--destructive))] flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:alert-triangle" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-[rgb(var(--destructive))] mb-1">
              Warning: This action is irreversible.
            </h3>
            <p class="text-sm text-[rgb(var(--foreground))]">
              It will permanently delete your company's data with no possibility of recovery.
            </p>
          </div>
        </div>
      </div>

      <!-- Organization Info -->
      <div class="mb-6 p-4 bg-[rgb(var(--muted))] rounded-lg">
        <h3 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Current Organization</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-[rgb(var(--muted-foreground))]">Company Name:</span>
            <span class="font-semibold text-[rgb(var(--foreground))]">{{ orgStats.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[rgb(var(--muted-foreground))]">Total Users:</span>
            <span class="font-semibold text-[rgb(var(--foreground))]">{{ orgStats.totalUsers }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[rgb(var(--muted-foreground))]">Departments:</span>
            <span class="font-semibold text-[rgb(var(--foreground))]">{{ orgStats.totalDepartments }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[rgb(var(--muted-foreground))]">Leave Types:</span>
            <span class="font-semibold text-[rgb(var(--foreground))]">{{ orgStats.totalLeaveTypes }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[rgb(var(--muted-foreground))]">Leave Requests:</span>
            <span class="font-semibold text-[rgb(var(--foreground))]">{{ orgStats.totalLeaves }}</span>
          </div>
        </div>
      </div>

      <!-- Deletion Details -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-[rgb(var(--foreground))] mb-4">
          Cancel company account
        </h2>
        
        <p class="text-sm text-[rgb(var(--foreground))] mb-4">
          This will <strong>immediately</strong> delete all users and data.
        </p>

        <ul class="space-y-2 text-sm text-[rgb(var(--foreground))] mb-4">
          <li class="flex items-start gap-2">
            <Icon name="lucide:x-circle" class="w-4 h-4 text-[rgb(var(--destructive))] mt-0.5 flex-shrink-0" />
            <span>You will no longer be billed for BookYourPTO.</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:x-circle" class="w-4 h-4 text-[rgb(var(--destructive))] mt-0.5 flex-shrink-0" />
            <span>Everyone will be immediately logged out.</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:x-circle" class="w-4 h-4 text-[rgb(var(--destructive))] mt-0.5 flex-shrink-0" />
            <span>Calendar integrations, Webhooks and API integrations will immediately stop working.</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:x-circle" class="w-4 h-4 text-[rgb(var(--destructive))] mt-0.5 flex-shrink-0" />
            <span>We will permanently delete all of your data.</span>
          </li>
        </ul>

        <div class="p-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg mb-4">
          <p class="text-sm font-bold text-[rgb(var(--destructive))]">
            There is no going back, this is permanent.
          </p>
        </div>

        <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p class="text-sm text-blue-600 dark:text-blue-400">
            <strong>Please download a full backup before you proceed.</strong>
          </p>
          <button
            @click="downloadBackup"
            :disabled="downloading"
            class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
          >
            <Icon v-if="downloading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:download" class="w-4 h-4" />
            <span>{{ downloading ? 'Downloading...' : 'Download Backup' }}</span>
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 p-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-5 h-5 text-[rgb(var(--destructive))]" />
          <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
        </div>
      </div>

      <!-- Delete Button -->
      <div class="pt-4 border-t border-[rgb(var(--border))]">
        <button
          @click="openConfirmModal"
          class="px-6 py-2.5 bg-[rgb(var(--destructive))] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium"
        >
          <Icon name="lucide:trash-2" class="w-4 h-4" />
          Cancel company account
        </button>
      </div>
    </template>
  </div>

  <!-- Confirmation Modal -->
  <CustomModal v-model="showConfirmModal">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center">
          <Icon name="lucide:alert-triangle" class="w-6 h-6 text-[rgb(var(--destructive))]" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Delete Organization</h3>
          <p class="text-sm text-[rgb(var(--muted-foreground))]">This action cannot be undone</p>
        </div>
      </div>

      <div class="mb-6">
        <p class="text-sm text-[rgb(var(--foreground))] mb-4">
          To confirm deletion, please type <strong class="text-[rgb(var(--destructive))]">{{ orgStats.name }}</strong> below:
        </p>
        
        <input
          v-model="confirmationText"
          type="text"
          :placeholder="`Type ${orgStats.name} to confirm`"
          class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--destructive))] focus:border-transparent outline-none transition"
        />
      </div>

      <div class="flex gap-3">
        <button
          @click="closeConfirmModal"
          :disabled="deleting"
          class="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="handleDelete"
          :disabled="!isConfirmationValid || deleting"
          class="flex-1 px-4 py-2 bg-[rgb(var(--destructive))] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          <Icon v-if="deleting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ deleting ? 'Deleting...' : 'Delete Permanently' }}</span>
        </button>
      </div>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
const { getUser } = usePermissions()

// Only EXECUTIVE role can access this
const currentUser = computed(() => getUser())
const canDeleteOrganization = computed(() => currentUser.value?.role === 'EXECUTIVE')

// Redirect if not authorized
onMounted(() => {
  if (!canDeleteOrganization.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true,
    })
  }
  fetchOrganizationStats()
})

const loading = ref(true)
const downloading = ref(false)
const deleting = ref(false)
const error = ref('')
const showConfirmModal = ref(false)
const confirmationText = ref('')

const orgStats = ref({
  name: '',
  totalUsers: 0,
  totalDepartments: 0,
  totalLeaveTypes: 0,
  totalLeaves: 0,
})

const isConfirmationValid = computed(() => {
  return confirmationText.value === orgStats.value.name
})

const fetchOrganizationStats = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    
    const data = await $fetch('/api/organization/stats', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    
    orgStats.value = data
  } catch (err: any) {
    console.error('Error fetching organization stats:', err)
    error.value = err.data?.message || err.message || 'Failed to load organization data'
  } finally {
    loading.value = false
  }
}

const downloadBackup = async () => {
  downloading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    
    const response = await fetch('/api/organization/backup', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    
    if (!response.ok) {
      throw new Error('Failed to download backup')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${orgStats.value.name}-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err: any) {
    console.error('Error downloading backup:', err)
    error.value = 'Failed to download backup. Please try again.'
  } finally {
    downloading.value = false
  }
}

const openConfirmModal = () => {
  confirmationText.value = ''
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmationText.value = ''
}

const handleDelete = async () => {
  if (!isConfirmationValid.value) return
  
  deleting.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    
    await $fetch('/api/organization', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    
    // Clear local storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    // Redirect to login with message
    navigateTo('/login?deleted=true')
  } catch (err: any) {
    console.error('Error deleting organization:', err)
    error.value = err.data?.message || err.message || 'Failed to delete organization'
    closeConfirmModal()
  } finally {
    deleting.value = false
  }
}
</script>