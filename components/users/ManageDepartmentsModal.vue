<template>
  <!-- Main Manage Departments Modal -->
  <CustomModal v-model="isOpen">
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
        <h2 class="text-2xl font-bold text-[rgb(var(--foreground))]">Manage Departments</h2>
        <button @click="closeModal" class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
          <Icon name="lucide:x" class="w-6 h-6" />
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto px-6 py-4">
        <div class="space-y-6">
          <!-- Add Department Button -->
          <div>
            <button
              @click="showAddForm = true"
              class="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 transition-opacity"
            >
              <Icon name="lucide:plus" class="w-4 h-4" />
              Add Department
            </button>
          </div>

          <!-- Add Department Form -->
          <div v-if="showAddForm" class="p-4 bg-[rgb(var(--muted))] rounded-lg">
            <h3 class="font-semibold text-[rgb(var(--foreground))] mb-3">New Department</h3>
            <form @submit.prevent="handleAddDepartment" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">
                  Department Name <span class="text-[rgb(var(--destructive))]">*</span>
                </label>
                <input
                  v-model="newDepartment.name"
                  type="text"
                  required
                  placeholder="e.g., Human Resources"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))]"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">
                  Code (Optional)
                </label>
                <input
                  v-model="newDepartment.code"
                  type="text"
                  placeholder="Leave empty to auto-generate"
                  maxlength="10"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))]"
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  Auto-generated: <span class="font-medium">{{ previewCode }}</span>
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">
                  Description (Optional)
                </label>
                <input
                  v-model="newDepartment.description"
                  type="text"
                  placeholder="Brief description"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))]"
                />
              </div>

              <div v-if="formError" class="bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg p-3">
                <p class="text-sm text-[rgb(var(--destructive))]">{{ formError }}</p>
              </div>

              <div class="flex gap-2">
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                >
                  <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                  <span>{{ loading ? 'Adding...' : 'Add Department' }}</span>
                </button>
                <button
                  type="button"
                  @click="cancelAddForm"
                  class="px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Departments List -->
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="dept in departments"
              :key="dept.id"
              class="flex items-center justify-between p-4 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg"
            >
              <div class="flex-1">
                <h3 class="font-semibold text-[rgb(var(--foreground))]">{{ dept.name }}</h3>
                <p class="text-sm text-[rgb(var(--muted-foreground))]">
                  {{ dept.code }} • {{ dept._count?.users || 0 }} {{ dept._count?.users === 1 ? 'member' : 'members' }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="toggleDepartmentStatus(dept)"
                  :class="[
                    'px-3 py-1 rounded text-sm transition-colors',
                    dept.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  ]"
                >
                  {{ dept.isActive ? 'Active' : 'Inactive' }}
                </button>
                
                <!-- Delete Button (Only for ADMINISTRATOR and EXECUTIVE) -->
                <button
                  v-if="canDeleteDepartments"
                  @click="confirmDeleteDepartment(dept)"
                  :disabled="(dept._count?.users || 0) > 0"
                  :title="(dept._count?.users || 0) > 0 ? 'Cannot delete department with members' : 'Delete department'"
                  class="p-2 text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CustomModal>

  <!-- Delete Confirmation Modal -->
  <CustomModal v-model="showDeleteConfirm">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center">
          <Icon name="lucide:alert-triangle" class="w-6 h-6 text-[rgb(var(--destructive))]" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Delete Department</h3>
          <p class="text-sm text-[rgb(var(--muted-foreground))]">This action cannot be undone</p>
        </div>
      </div>

      <p class="text-sm text-[rgb(var(--foreground))] mb-6">
        Are you sure you want to delete <strong>{{ departmentToDelete?.name }}</strong>?
      </p>

      <div class="flex gap-3">
        <button
          @click="showDeleteConfirm = false"
          class="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))]"
        >
          Cancel
        </button>
        <button
          @click="handleDeleteDepartment"
          :disabled="deleting"
          class="flex-1 px-4 py-2 bg-[rgb(var(--destructive))] text-white rounded-lg hover:bg-[rgb(var(--destructive))]/90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          <Icon v-if="deleting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ deleting ? 'Deleting...' : 'Delete' }}</span>
        </button>
      </div>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
interface Department {
  id: string
  name: string
  code: string
  isActive: boolean
  _count?: {
    users: number
  }
}

const props = defineProps<{
  modelValue: boolean
  departments: Department[]
  currentUserRole?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'departmentsUpdated': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Check if user can delete departments
const canDeleteDepartments = computed(() => {
  return props.currentUserRole === 'ADMINISTRATOR' || props.currentUserRole === 'EXECUTIVE'
})

const showAddForm = ref(false)
const loading = ref(false)
const formError = ref('')

// Delete confirmation
const showDeleteConfirm = ref(false)
const departmentToDelete = ref<Department | null>(null)
const deleting = ref(false)

const newDepartment = ref({
  name: '',
  code: '',
  description: '',
})

// Preview auto-generated code
const previewCode = computed(() => {
  if (newDepartment.value.code) {
    return newDepartment.value.code.toUpperCase()
  }
  
  if (!newDepartment.value.name) {
    return 'DEPT'
  }
  
  const words = newDepartment.value.name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
  
  if (words.length === 0) return 'DEPT'
  
  if (words.length === 1) {
    return words[0]?.substring(0, 4).toUpperCase() || 'DEPT'
  } else {
    return words
      .slice(0, 4)
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }
})

const closeModal = () => {
  isOpen.value = false
  showAddForm.value = false
  resetForm()
}

const resetForm = () => {
  newDepartment.value = { name: '', code: '', description: '' }
  formError.value = ''
}

const cancelAddForm = () => {
  showAddForm.value = false
  resetForm()
}

const handleAddDepartment = async () => {
  loading.value = true
  formError.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    
    await $fetch('/api/departments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: {
        name: newDepartment.value.name,
        ...(newDepartment.value.code && { code: newDepartment.value.code }),
        ...(newDepartment.value.description && { description: newDepartment.value.description }),
      },
    })

    resetForm()
    showAddForm.value = false
    emit('departmentsUpdated')
  } catch (err: any) {
    formError.value = err.data?.message || 'Failed to add department'
  } finally {
    loading.value = false
  }
}

const toggleDepartmentStatus = async (dept: Department) => {
  try {
    const token = localStorage.getItem('auth_token')
    
    await $fetch(`/api/departments/${dept.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: { isActive: !dept.isActive },
    })

    emit('departmentsUpdated')
  } catch (err: any) {
    alert(err.data?.message || 'Failed to update department')
  }
}

const confirmDeleteDepartment = (dept: Department) => {
  departmentToDelete.value = dept
  showDeleteConfirm.value = true
}

const handleDeleteDepartment = async () => {
  if (!departmentToDelete.value) return
  
  deleting.value = true
  try {
    const token = localStorage.getItem('auth_token')
    
    await $fetch(`/api/departments/${departmentToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    showDeleteConfirm.value = false
    departmentToDelete.value = null
    emit('departmentsUpdated')
  } catch (err: any) {
    formError.value = err.data?.message || 'Failed to delete department'
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}
</script>
