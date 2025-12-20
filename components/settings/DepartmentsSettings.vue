<template>
  <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>


    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-[rgb(var(--foreground))]">Departments</h2>
          <p class="text-sm text-[rgb(var(--muted-foreground))]">
            Group staff into departments and give them a manager to approve their leave.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- ✅ ADDED: Toggle for inactive departments -->
          <button
            @click="toggleShowInactive"
            class="px-3 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors flex items-center gap-2 text-sm"
            :title="showInactive ? 'Hide inactive departments' : 'Show inactive departments'"
          >
            <Icon :name="showInactive ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ showInactive ? 'Hide' : 'Show' }} Inactive</span>
          </button>
          
          <button
            v-if="canEditSettings()"
            @click="openAddModal"
            class="px-4 py-2 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium"
          >
            <Icon name="lucide:plus" class="w-4 h-4" />
            Add a new department
          </button>
        </div>
      </div>


      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-5 h-5 text-[rgb(var(--destructive))]" />
          <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
        </div>
      </div>


      <!-- Departments List -->
      <div class="space-y-3">
        <div
          v-for="dept in departments"
          :key="dept.id"
          class="flex items-center justify-between p-4 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg hover:border-[rgb(var(--primary))]/50 transition-colors group"
          :class="{ 'opacity-60': !dept.isActive }"
        >
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <!-- Department Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-[rgb(var(--foreground))]">{{ dept.name }}</h3>
                <!-- ✅ ADDED: Inactive badge -->
                <span v-if="!dept.isActive" class="px-2 py-0.5 text-xs font-medium bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] rounded">
                  Inactive
                </span>
              </div>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-[rgb(var(--muted-foreground))]">
                  {{ dept.code }}
                </span>
                <span class="text-xs text-[rgb(var(--muted-foreground))]">
                  {{ dept._count?.users || 0 }} {{ dept._count?.users === 1 ? 'person' : 'people' }}
                </span>
              </div>
            </div>


            <!-- Manager Badge -->
            <div v-if="dept.headOfDept" class="flex items-center gap-2 px-3 py-1.5 bg-[rgb(var(--muted))] rounded-md">
              <div class="w-6 h-6 rounded-full bg-[rgb(var(--primary))]/10 flex items-center justify-center text-[rgb(var(--primary))] text-xs font-semibold">
                {{ getManagerInitials(dept.headOfDept) }}
              </div>
              <span class="text-xs text-[rgb(var(--foreground))] font-medium hidden sm:inline">
                {{ dept.headOfDept.firstName }} {{ dept.headOfDept.lastName }}
              </span>
            </div>
            <div v-else class="text-xs text-[rgb(var(--muted-foreground))] italic">
              No manager
            </div>
          </div>
          
          <div v-if="canEditSettings()" class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="openEditModal(dept)"
              class="p-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors"
              title="Edit department"
            >
              <Icon name="lucide:pencil" class="w-4 h-4" />
            </button>
            <button
              @click="confirmDelete(dept)"
              :disabled="(dept._count?.users || 0) > 0"
              :title="(dept._count?.users || 0) > 0 ? 'Cannot delete department with members' : 'Delete department'"
              class="p-2 text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>


        <div v-if="departments.length === 0" class="text-center py-12">
          <Icon name="lucide:building-2" class="w-12 h-12 mx-auto text-[rgb(var(--muted-foreground))] mb-3" />
          <p class="text-[rgb(var(--muted-foreground))]">{{ showInactive ? 'No departments found.' : 'No active departments configured yet.' }}</p>
        </div>
      </div>
    </template>
  </div>


  <!-- Add/Edit Department Modal -->
<CustomModal v-model="showModal" maxWidth="2xl">
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
        <h2 class="text-2xl font-bold text-[rgb(var(--foreground))]">
          {{ isEditMode ? 'Edit Department' : 'Add Department' }}
        </h2>
        <button @click="closeModal" class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
          <Icon name="lucide:x" class="w-6 h-6" />
        </button>
      </div>


      <!-- Scrollable Content -->
      <div class="overflow-y-auto px-6 py-4">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Department Name -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Name <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="New department name"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            />
          </div>


          <!-- Department Code -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Code
            </label>
            <input
              v-model="form.code"
              type="text"
              placeholder="Leave empty to auto-generate"
              maxlength="10"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            />
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Auto-generated: <span class="font-medium">{{ previewCode }}</span>
            </p>
          </div>


          <!-- Manager Dropdown -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Manager
              <Icon name="lucide:info" class="w-3.5 h-3.5 inline-block ml-1 text-[rgb(var(--muted-foreground))]" title="Department head who can approve leave requests" />
            </label>
            <select
              v-model="form.headOfDepartmentId"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            >
              <option :value="null">No manager</option>
              <option v-for="user in availableManagers" :key="user.id" :value="user.id">
                {{ user.firstName }} {{ user.lastName }}
                <span v-if="user.email"> ({{ user.email }})</span>
              </option>
            </select>
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Select a manager to approve leave for this department
            </p>
          </div>


          <!-- Maximum Absent -->

          <!--
             <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Maximum absent
              <Icon name="lucide:info" class="w-3.5 h-3.5 inline-block ml-1 text-[rgb(var(--muted-foreground))]" title="Maximum number of people who can be absent at the same time" />
            </label>
            <select
              v-model.number="form.maxAbsent"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            >
              <option :value="null">No limit</option>
              <option v-for="n in 10" :key="n" :value="n">{{ n }} {{ n === 1 ? 'user' : 'users' }}</option>
            </select>
          </div>

          -->
       

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Optional description"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition resize-none"
            />
          </div>


          <!-- Color Picker -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Color
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.color"
                type="color"
                class="w-12 h-12 rounded-lg cursor-pointer border-2 border-[rgb(var(--border))]"
              />
              <input
                v-model="form.color"
                type="text"
                placeholder="#3b82f6"
                class="flex-1 px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
              />
            </div>
            <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Used for visual identification in calendars and reports
            </p>
          </div>


          <!-- Active Toggle -->
          <div class="flex items-center justify-between pt-4 border-t border-[rgb(var(--border))]">
            <div>
              <label class="text-sm font-medium text-[rgb(var(--foreground))]">
                Active
              </label>
              <p class="text-xs text-[rgb(var(--muted-foreground))]">
                Inactive departments cannot be assigned to users
              </p>
            </div>
            <SwitchToggle v-model="form.isActive" />
          </div>


          <!-- Form Error -->
          <div v-if="formError" class="bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg p-3">
            <p class="text-sm text-[rgb(var(--destructive))]">{{ formError }}</p>
          </div>


          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <span>{{ saving ? 'Saving...' : 'Save' }}</span>
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))]"
            >
              Cancel
            </button>
          </div>
        </form>
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
        <span v-if="(departmentToDelete?._count?.users || 0) > 0" class="block mt-2 text-[rgb(var(--destructive))]">
          This department has {{ departmentToDelete?._count?.users }} member(s) and cannot be deleted.
        </span>
      </p>


      <div class="flex gap-3">
        <button
          @click="showDeleteConfirm = false"
          class="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))]"
        >
          Cancel
        </button>
        <button
          @click="handleDelete"
          :disabled="deleting || (departmentToDelete?._count?.users || 0) > 0"
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
const { canAccessSettings } = usePermissions()


const canEditSettings = () => {
  return canAccessSettings()
}


interface Department {
  id: string
  name: string
  code: string
  description?: string
  color?: string
  headOfDepartmentId?: string
  headOfDept?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  isActive: boolean
  _count?: {
    users: number
  }
}


interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}


const loading = ref(true)
const error = ref('')
const departments = ref<Department[]>([])
const users = ref<User[]>([])

// ✅ ADDED: Toggle state for inactive departments
const showInactive = ref(false)

// Modal states
const showModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const formError = ref('')


// Delete confirmation
const showDeleteConfirm = ref(false)
const departmentToDelete = ref<Department | null>(null)
const deleting = ref(false)


// Form data
const form = ref({
  name: '',
  code: '',
  description: '',
  color: '#3b82f6',
  headOfDepartmentId: null as string | null,
  maxAbsent: null as number | null,
  isActive: true,
})


const editingId = ref<string | null>(null)


// Preview auto-generated code
const previewCode = computed(() => {
  if (form.value.code) {
    return form.value.code.toUpperCase()
  }
  
  if (!form.value.name) {
    return 'DEPT'
  }
  
  const words = form.value.name
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


// Available managers (users who can be department heads)
const availableManagers = computed(() => {
  return users.value.filter(user => 
    ['MANAGER', 'DEPARTMENT_HEAD', 'HR', 'ADMINISTRATOR', 'EXECUTIVE'].includes(user.role)
  )
})


const getManagerInitials = (manager: { firstName: string, lastName: string }) => {
  return `${manager.firstName[0]}${manager.lastName[0]}`.toUpperCase()
}


// Fetch data on mount
onMounted(async () => {
  await fetchData()
})

// ✅ ADDED: Toggle function
const toggleShowInactive = async () => {
  showInactive.value = !showInactive.value
  await fetchData()
}

// ✅ MODIFIED: Include query parameter for inactive departments
const fetchData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    
    const [departmentsData, usersData] = await Promise.all([
      $fetch('/api/departments', {
        headers: { 'Authorization': `Bearer ${token}` },
        query: { includeInactive: showInactive.value ? 'true' : 'false' }
      }),
      $fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
    ])
    
    departments.value = departmentsData as Department[]
    users.value = usersData as User[]
  } catch (err: any) {
    console.error('Error fetching data:', err)
    error.value = err.data?.message || err.message || 'Failed to load departments'
  } finally {
    loading.value = false
  }
}


const openAddModal = () => {
  isEditMode.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}


const openEditModal = (dept: Department) => {
  isEditMode.value = true
  editingId.value = dept.id
  form.value = {
    name: dept.name,
    code: dept.code,
    description: dept.description || '',
    color: dept.color || '#3b82f6',
    headOfDepartmentId: dept.headOfDepartmentId || null,
    maxAbsent: null, // Not in schema yet, but ready for future
    isActive: dept.isActive,
  }
  showModal.value = true
}


const closeModal = () => {
  showModal.value = false
  resetForm()
}


const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    description: '',
    color: '#3b82f6',
    headOfDepartmentId: null,
    maxAbsent: null,
    isActive: true,
  }
  formError.value = ''
}


const handleSubmit = async () => {
  saving.value = true
  formError.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    const payload = {
      name: form.value.name,
      code: form.value.code || undefined,
      description: form.value.description || undefined,
      color: form.value.color,
      headOfDepartmentId: form.value.headOfDepartmentId || undefined,
      isActive: form.value.isActive,
    }


    if (isEditMode.value && editingId.value) {
      await $fetch(`/api/departments/${editingId.value}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload,
      })
    } else {
      await $fetch('/api/departments', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload,
      })
    }


    closeModal()
    await fetchData()
  } catch (err: any) {
    formError.value = err.data?.message || 'Failed to save department'
  } finally {
    saving.value = false
  }
}


const confirmDelete = (dept: Department) => {
  departmentToDelete.value = dept
  showDeleteConfirm.value = true
}


const handleDelete = async () => {
  if (!departmentToDelete.value) return
  
  if ((departmentToDelete.value._count?.users || 0) > 0) {
    formError.value = 'Cannot delete department with members'
    return
  }
  
  deleting.value = true
  try {
    const token = localStorage.getItem('auth_token')
    await $fetch(`/api/departments/${departmentToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })


    showDeleteConfirm.value = false
    departmentToDelete.value = null
    await fetchData()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to delete department'
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}
</script>
