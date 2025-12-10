<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <!-- Header -->
    <div class="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))] mb-1">Users</h1>
            <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
              Manage your organization's team members ({{ filteredAndSortedUsers.length }} {{ filteredAndSortedUsers.length === 1 ? 'user' : 'users' }})
            </p>
          </div>
          
          <div class="flex gap-2 sm:gap-3">
            <button
              v-if="canManageDepartments()"
              @click="showDepartmentModal = true"
              class="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm font-medium text-[rgb(var(--foreground))]"
            >
              <Icon name="lucide:building-2" class="w-4 h-4" />
              <span class="hidden sm:inline">Manage Departments</span>
              <span class="sm:hidden">Departments</span>
            </button>
            
            <button
              v-if="canManageUsers()"
              @click="showAddUserModal = true"
              class="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90 rounded-lg flex items-center justify-center gap-2 transition-opacity text-xs sm:text-sm font-medium shadow-sm"
            >
              <Icon name="lucide:user-plus" class="w-4 h-4" />
              <span>Add User</span>
            </button>
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
            placeholder="Search by name or email..."
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
        <p class="text-[rgb(var(--muted-foreground))] text-sm">Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 sm:py-16 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
        <div class="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center mb-3 sm:mb-4">
          <Icon name="lucide:alert-circle" class="w-6 sm:w-8 h-6 sm:h-8 text-[rgb(var(--destructive))]" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Failed to load users</h3>
        <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mb-4 sm:mb-6 text-center max-w-md px-4">{{ error }}</p>
        <button
          @click="loadData"
          class="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAndSortedUsers.length === 0" class="flex flex-col items-center justify-center py-12 sm:py-16 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
        <div class="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center mb-3 sm:mb-4">
          <Icon name="lucide:users" class="w-6 sm:w-8 h-6 sm:h-8 text-[rgb(var(--muted-foreground))]" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-[rgb(var(--foreground))] mb-2">No users found</h3>
        <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mb-4 sm:mb-6 text-center max-w-md px-4">
          {{ searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first user' }}
        </p>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 px-4">
          <button 
            v-if="activeFiltersCount > 0 || searchQuery"
            @click="clearAllFilters" 
            class="px-4 sm:px-5 py-2 sm:py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
          <button
            v-if="canManageUsers()"
            @click="showAddUserModal = true"
            class="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-2"
          >
            <Icon name="lucide:plus" class="w-4 h-4" />
            Add Your First User
          </button>
        </div>
      </div>

      <!-- Users Display -->
      <div v-else>
        <!-- Mobile Card View (< lg) -->
        <div class="lg:hidden space-y-3">
          <UserCard
            v-for="user in filteredAndSortedUsers"
            :key="user.id"
            :ref="(el: any) => setComponentRef(user.id, el)"
            :user="user"
            :can-manage-users="canManageUsers()"
            @toggle-menu="toggleUserMenu"
          />
        </div>

        <!-- Desktop Table View (>= lg) -->
        <div class="hidden lg:block bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm overflow-hidden">
          <!-- Table Header -->
          <div class="grid grid-cols-12 gap-4 px-6 py-3.5 bg-[rgb(var(--muted))]/50 border-b border-[rgb(var(--border))] text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
            <div class="col-span-3">Name</div>
            <div class="col-span-3">Email</div>
            <div class="col-span-2">Department</div>
            <div class="col-span-2">Role</div>
            <div class="col-span-2 text-right">Actions</div>
          </div>

          <!-- User Rows -->
          <div class="divide-y divide-[rgb(var(--border))]">
            <UserTableRow
              v-for="user in filteredAndSortedUsers"
              :key="user.id"
              :ref="(el: any) => setComponentRef(user.id, el)"
              :user="user"
              :can-manage-users="canManageUsers()"
              @toggle-menu="toggleUserMenu"
            />
          </div>
        </div>

        <!-- Pagination Info -->
        <div class="mt-4 text-center">
          <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
            Showing {{ filteredAndSortedUsers.length }} {{ filteredAndSortedUsers.length === 1 ? 'user' : 'users' }}
          </p>
        </div>
      </div>
    </div>

    <!-- User Action Menu -->
    <UserActionMenu
      :user="getCurrentUser()"
      :menu-style="menuStyle"
      @close="closeUserMenu"
      @edit="handleEdit"
      @toggle-status="handleToggleStatus"
      @delete="handleDelete"
    />

    <!-- Filter Modal -->
    <CustomModal v-model="showFilterModal">
      <div class="flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgb(var(--border))]">
          <h2 class="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">Filter Users</h2>
          <button 
            @click="showFilterModal = false" 
            class="p-1.5 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
          >
            <Icon name="lucide:x" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        <div class="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <Filter
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

    <!-- Add User Modal -->
    <AddUserModal
      v-if="canManageUsers()"
      v-model="showAddUserModal"
      :departments="departments"
      @user-added="handleUserAdded"
    />

    <!-- Edit User Modal -->
    <EditUserModal
      v-if="canManageUsers()"
      v-model="showEditUserModal"
      :user-id="selectedUserId"
      :departments="departments"
      :all-users="users"
      @user-updated="handleUserUpdated"
    />

    <!-- Manage Departments Modal -->
    <ManageDepartmentsModal
      v-if="canManageDepartments()"
      v-model="showDepartmentModal"
      :departments="departments"
      :current-user-role="currentUser?.role"
      @departments-updated="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import AddUserModal from '~/components/users/AddUserModal.vue'
import EditUserModal from '~/components/users/EditUserModal.vue'
import ManageDepartmentsModal from '~/components/users/ManageDepartmentsModal.vue'
import Filter from '~/components/users/Filter.vue'
import UserCard from '~/components/users/UserCard.vue'
import UserTableRow from '~/components/users/UserTableRow.vue'
import UserActionMenu from '~/components/users/UserActionMenu.vue'
import type { User } from '~/types/user'

interface Department {
  id: string
  name: string
  code: string
  isActive: boolean
  _count?: {
    users: number
  }
}

const api = useApi()
const { canAccessUsers, canManageUsers, canManageDepartments, getUser } = usePermissions()
const currentUser = computed(() => getUser())

// Check access on mount
onMounted(async () => {
  if (!canAccessUsers()) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true,
    })
  }
  await loadData()
})

// Data
const users = ref<User[]>([])
const departments = ref<Department[]>([])
const loading = ref(true)
const error = ref('')

// Modals
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDepartmentModal = ref(false)
const showFilterModal = ref(false)
const selectedUserId = ref<string | null>(null)

// UI State
const openMenuUserId = ref<string | null>(null)
const componentRefs = ref<Map<string, any>>(new Map())
const menuStyle = ref({})

// Filters
const searchQuery = ref('')
const userTypeFilter = ref('all')
const sortByField = ref('firstName')
const accountTypeFilter = ref('all')
const selectedDepartments = ref<string[]>([])

const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const [usersData, departmentsData] = await Promise.all([
      api.fetchUsers(),
      api.fetchDepartments()
    ])

    users.value = usersData as User[]
    departments.value = departmentsData as Department[]

    selectedDepartments.value = [
      'all',
      ...departmentsData.map((d: Department) => d.id)
    ]
  } catch (err: any) {
    console.error('Error loading data:', err)
    error.value = err.data?.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

const departmentOptions = computed(() => [
  { label: 'All departments', value: 'all' },
  ...departments.value.map((dept) => ({
    label: dept.name,
    value: dept.id,
    badge: dept._count?.users ? `${dept._count.users}` : undefined
  }))
])

const filterSections = computed(() => [
  {
    id: 'userType',
    label: 'User Status',
    type: 'select' as const,
    value: userTypeFilter.value,
    options: [
      { label: 'All users', value: 'all' },
      { label: 'Active users', value: 'active' },
      { label: 'Inactive users', value: 'inactive' }
    ]
  },
  {
    id: 'sortBy',
    label: 'Sort Order',
    type: 'radio' as const,
    value: sortByField.value,
    options: [
      { label: 'First name', value: 'firstName' },
      { label: 'Last name', value: 'lastName' },
      { label: 'Department', value: 'department' }
    ]
  },
  {
    id: 'accountType',
    label: 'Account Type',
    type: 'radio' as const,
    value: accountTypeFilter.value,
    options: [
      { label: 'All accounts', value: 'all' },
      { label: 'Department heads', value: 'department_heads' },
      { label: 'Administrators', value: 'admins' }
    ]
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
  if (userTypeFilter.value !== 'all') count++
  if (accountTypeFilter.value !== 'all') count++
  if (sortByField.value !== 'firstName') count++
  if (!selectedDepartments.value.includes('all')) count++
  return count
})

const handleFilterUpdate = (id: string, value: string | string[]) => {
  switch (id) {
    case 'userType':
      userTypeFilter.value = value as string
      break
    case 'sortBy':
      sortByField.value = value as string
      break
    case 'accountType':
      accountTypeFilter.value = value as string
      break
    case 'departments':
      selectedDepartments.value = value as string[]
      break
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  userTypeFilter.value = 'all'
  sortByField.value = 'firstName'
  accountTypeFilter.value = 'all'
  selectedDepartments.value = [
    'all',
    ...departments.value.map((d) => d.id)
  ]
}

const filteredAndSortedUsers = computed(() => {
  let filtered = [...users.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((user) =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  // User status filter
  if (userTypeFilter.value === 'active') {
    filtered = filtered.filter((user) => user.isActive)
  } else if (userTypeFilter.value === 'inactive') {
    filtered = filtered.filter((user) => !user.isActive)
  }

  // Account type filter
  if (accountTypeFilter.value === 'department_heads') {
    filtered = filtered.filter(
      (user) => user.role === 'DEPARTMENT_HEAD'
    )
  } else if (accountTypeFilter.value === 'admins') {
    filtered = filtered.filter(
      (user) => user.role === 'ADMINISTRATOR' || user.role === 'EXECUTIVE'
    )
  }

  // Department filter
  if (!selectedDepartments.value.includes('all') && selectedDepartments.value.length > 0) {
    filtered = filtered.filter(
      (user) => user.department && selectedDepartments.value.includes(user.department.id)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    // Active users first
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1
    }

    if (sortByField.value === 'department') {
      const deptA = a.department?.name || ''
      const deptB = b.department?.name || ''
      return deptA.localeCompare(deptB)
    }

    const aVal = a[sortByField.value as keyof User]
    const bVal = b[sortByField.value as keyof User]
    return String(aVal || '').localeCompare(String(bVal || ''))
  })

  return filtered
})

const setComponentRef = (userId: string, el: any) => {
  if (el) {
    componentRefs.value.set(userId, el)
  }
}

const toggleUserMenu = (userId: string) => {
  if (openMenuUserId.value === userId) {
    openMenuUserId.value = null
    return
  }

  openMenuUserId.value = userId

  nextTick(() => {
    const component = componentRefs.value.get(userId)
    if (component && component.actionButton) {
      const button = component.actionButton
      const rect = button.getBoundingClientRect()
      const menuWidth = 208
      const menuHeight = 150
      
      let top = rect.bottom + 8
      let left = rect.right - menuWidth

      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 8
      }

      if (left < 8) {
        left = 8
      }

      menuStyle.value = {
        top: `${top}px`,
        left: `${left}px`
      }
    }
  })
}

const closeUserMenu = () => {
  openMenuUserId.value = null
}

const getCurrentUser = () => {
  return users.value.find(u => u.id === openMenuUserId.value) || null
}

const handleEdit = (user: User) => {
  selectedUserId.value = user.id
  showEditUserModal.value = true
  closeUserMenu()
}

const handleToggleStatus = async (user: User) => {
  // Prevent self-deactivation
  if (user.id === currentUser.value?.id && user.isActive) {
    alert('You cannot deactivate your own account')
    closeUserMenu()
    return
  }

  // Prevent executive deactivation
  if (user.role === 'EXECUTIVE' && user.isActive) {
    alert('Executive accounts cannot be deactivated')
    closeUserMenu()
    return
  }

  try {
    const updatedUser = await api.updateUser(user.id, { 
      isActive: !user.isActive 
    }) as User
    
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    
    closeUserMenu()
  } catch (err: any) {
    console.error('Error toggling user status:', err)
    alert(err.data?.message || 'Failed to update user status')
    closeUserMenu()
  }
}

const handleDelete = async (user: User) => {
  closeUserMenu()
  
  if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
    try {
      await api.deleteUser(user.id)
      users.value = users.value.filter((u) => u.id !== user.id)
    } catch (err: any) {
      console.error('Error deleting user:', err)
      alert('Failed to delete user')
    }
  }
}

const handleUserAdded = async (newUser: User) => {
  users.value.push(newUser)
  const departmentsData = await api.fetchDepartments()
  departments.value = departmentsData as Department[]
}

const handleUserUpdated = async (updatedUser: User) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = updatedUser
  }
  
  // Refresh departments in case counts changed
  const departmentsData = await api.fetchDepartments()
  departments.value = departmentsData as Department[]
}
</script>