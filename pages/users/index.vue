<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <!-- Header -->
    <div class="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-[rgb(var(--foreground))] mb-1">Users</h1>
            <p class="text-sm text-[rgb(var(--muted-foreground))]">
              Manage your organization's team members ({{ filteredAndSortedUsers.length }} {{ filteredAndSortedUsers.length === 1 ? 'user' : 'users' }})
            </p>
          </div>
          <div class="flex gap-3">
            <button
              v-if="canManageDepartments()"
              @click="showDepartmentModal = true"
              class="px-4 py-2.5 border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] rounded-lg flex items-center gap-2 transition-colors text-sm font-medium text-[rgb(var(--foreground))]"
            >
              <Icon name="lucide:building-2" class="w-4 h-4" />
              <span class="hidden sm:inline">Manage Departments</span>
              <span class="sm:hidden">Departments</span>
            </button>
            <button
              v-if="canManageUsers()"
              @click="showAddUserModal = true"
              class="px-4 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90 rounded-lg flex items-center gap-2 transition-opacity text-sm font-medium shadow-sm"
            >
              <Icon name="lucide:user-plus" class="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="flex-1 relative">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))] pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            class="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-shadow text-sm"
          />
        </div>

        <button
          @click="showFilterModal = true"
          class="px-4 py-2.5 border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium text-[rgb(var(--foreground))] relative"
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
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-[rgb(var(--primary))] mb-3" />
        <p class="text-[rgb(var(--muted-foreground))] text-sm">Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
        <div class="w-16 h-16 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center mb-4">
          <Icon name="lucide:alert-circle" class="w-8 h-8 text-[rgb(var(--destructive))]" />
        </div>
        <h3 class="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Failed to load users</h3>
        <p class="text-sm text-[rgb(var(--muted-foreground))] mb-6 text-center max-w-md">{{ error }}</p>
        <button
          @click="loadData"
          class="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAndSortedUsers.length === 0" class="flex flex-col items-center justify-center py-16 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]">
        <div class="w-16 h-16 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center mb-4">
          <Icon name="lucide:users" class="w-8 h-8 text-[rgb(var(--muted-foreground))]" />
        </div>
        <h3 class="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">No users found</h3>
        <p class="text-sm text-[rgb(var(--muted-foreground))] mb-6 text-center max-w-md">
          {{ searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first user' }}
        </p>
        <div class="flex gap-3">
          <button 
            v-if="activeFiltersCount > 0 || searchQuery"
            @click="clearAllFilters" 
            class="px-5 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
          <button
            v-if="canManageUsers()"
            @click="showAddUserModal = true"
            class="bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2"
          >
            <Icon name="lucide:plus" class="w-4 h-4" />
            Add Your First User
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div v-else class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm overflow-hidden">
        <!-- Table Header -->
        <div class="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[rgb(var(--muted))]/50 border-b border-[rgb(var(--border))] text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
          <div class="col-span-3">Name</div>
          <div class="col-span-3">Email</div>
          <div class="col-span-2">Department</div>
          <div class="col-span-2">Role</div>
          <div class="col-span-2 text-right">Actions</div>
        </div>

        <!-- User Rows -->
        <div class="divide-y divide-[rgb(var(--border))]">
          <div
            v-for="user in filteredAndSortedUsers"
            :key="user.id"
            class="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-4 sm:px-6 py-4 hover:bg-[rgb(var(--muted))]/30 transition-colors"
            :class="{ 'opacity-50': !user.isActive }"
          >
            <!-- Name with Avatar (Role-based color with ring) -->
              <div class="col-span-1 lg:col-span-3 flex items-center gap-3">
                <div class="relative">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                    :class="[
                      getRoleColor(user.role).avatar, 
                      getRoleColor(user.role).avatarText,
                      getRoleColor(user.role).ring
                    ]"
                  >
                    {{ getUserInitials(user) }}
                  </div>
                  <!-- Star Badge for Administrator -->
                  <div
                    v-if="user.role === 'ADMINISTRATOR'"
                    class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center ring-2 ring-[rgb(var(--card))]"
                  >
                    <Icon name="lucide:star" class="w-2.5 h-2.5 text-yellow-900 dark:text-yellow-950 fill-current" />
                  </div>
                  <!-- Crown Badge for Executive -->
                  <div
                    v-else-if="user.role === 'EXECUTIVE'"
                    class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center ring-2 ring-[rgb(var(--card))]"
                  >
                    <Icon name="lucide:crown" class="w-2.5 h-2.5 text-yellow-900 dark:text-yellow-950 fill-current" />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-[rgb(var(--foreground))] truncate text-sm">
                    {{ user.firstName }} {{ user.lastName }}
                  </p>
                  <p v-if="!user.isActive" class="text-xs text-[rgb(var(--destructive))] mt-0.5">
                    Left {{ formatDate(user.updatedAt) }}
                  </p>
                  <p class="lg:hidden text-xs text-[rgb(var(--muted-foreground))] truncate mt-0.5">
                    {{ user.email }}
                  </p>
                </div>
              </div>

            <!-- Email (Desktop only) -->
            <div class="hidden lg:block col-span-3">
              <p class="text-sm text-[rgb(var(--muted-foreground))] truncate">
                {{ user.email }}
              </p>
            </div>

            <!-- Department -->
            <div class="col-span-1 lg:col-span-2 flex items-center">
              <span
                v-if="user.department"
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]"
              >
                {{ user.department.name }}
              </span>
              <span v-else class="text-xs text-[rgb(var(--muted-foreground))] italic">
                No department
              </span>
            </div>

            <!-- Role -->
            <div class="col-span-1 lg:col-span-2 flex items-center">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
                :class="[
                  getRoleColor(user.role).bg,
                  getRoleColor(user.role).text,
                  getRoleColor(user.role).border
                ]"
              >
                {{ formatRole(user.role) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="col-span-1 lg:col-span-2 flex items-center justify-end" v-if="canManageUsers()">
              <button
                :ref="el => setButtonRef(user.id, el)"
                @click="toggleUserMenu(user.id)"
                class="p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
                :class="{ 'bg-[rgb(var(--muted))]': openMenuUserId === user.id }"
              >
                <Icon name="lucide:more-vertical" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Info -->
      <div v-if="!loading && !error && filteredAndSortedUsers.length > 0" class="mt-4 text-center">
        <p class="text-sm text-[rgb(var(--muted-foreground))]">
          Showing {{ filteredAndSortedUsers.length }} {{ filteredAndSortedUsers.length === 1 ? 'user' : 'users' }}
        </p>
      </div>
    </div>

    <!-- User Action Menu (Teleported) -->
    <Teleport to="body">
      <div
        v-if="openMenuUserId"
        v-click-outside="closeUserMenu"
        :style="menuStyle"
        class="fixed w-52 bg-[rgb(var(--card))] rounded-lg shadow-2xl border border-[rgb(var(--border))] z-[100] py-1.5"
      >
        <button
          @click="editUser(getCurrentUser())"
          class="w-full px-4 py-2.5 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors flex items-center gap-3"
        >
          <Icon name="lucide:edit" class="w-4 h-4" />
          <span>Edit User</span>
        </button>

        <button
          @click="toggleUserStatus(getCurrentUser())"
          class="w-full px-4 py-2.5 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors flex items-center gap-3"
        >
          <Icon
            :name="getCurrentUser()?.isActive ? 'lucide:user-x' : 'lucide:user-check'"
            class="w-4 h-4"
          />
          <span>{{ getCurrentUser()?.isActive ? 'Deactivate' : 'Activate' }}</span>
        </button>

        <div class="h-px bg-[rgb(var(--border))] my-1.5"></div>

        <button
          @click="confirmDeleteUser(getCurrentUser())"
          class="w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(var(--destructive))]/10 transition-colors flex items-center gap-3 text-[rgb(var(--destructive))]"
        >
          <Icon name="lucide:trash-2" class="w-4 h-4" />
          <span>Delete User</span>
        </button>
      </div>
    </Teleport>

    <!-- Filter Modal -->
    <CustomModal v-model="showFilterModal">
      <div class="flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
          <h2 class="text-xl font-bold text-[rgb(var(--foreground))]">Filter Users</h2>
          <button 
            @click="showFilterModal = false" 
            class="p-1.5 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
          >
            <Icon name="lucide:x" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        <div class="overflow-y-auto px-6 py-6">
          <Filter
            :sections="filterSections"
            @update:filter="handleFilterUpdate"
          />
        </div>

        <div class="border-t border-[rgb(var(--border))] px-6 py-4 bg-[rgb(var(--muted))]/20">
          <div class="flex gap-3">
            <button
              @click="clearAllFilters"
              class="flex-1 px-4 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-sm font-medium"
            >
              Clear All
            </button>
            <button
              @click="showFilterModal = false"
              class="flex-1 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
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
import ManageDepartmentsModal from '~/components/users/ManageDepartmentsModal.vue'
import Filter from '~/components/users/Filter.vue'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  department?: {
    id: string
    name: string
  }
  manager?: {
    id: string
    firstName: string
    lastName: string
  }
  updatedAt: string
}

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
const { getRoleColor } = useUserRoleColors()
const { canAccessUsers, canManageUsers, canManageDepartments, getUser } = usePermissions()

usePermissions() 
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
const showDepartmentModal = ref(false)
const showFilterModal = ref(false)

// UI State
const openMenuUserId = ref<string | null>(null)
const buttonRefs = ref<Map<string, HTMLElement>>(new Map())
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
      { label: 'Department managers', value: 'managers' },
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

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((user) =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  if (userTypeFilter.value === 'active') {
    filtered = filtered.filter((user) => user.isActive)
  } else if (userTypeFilter.value === 'inactive') {
    filtered = filtered.filter((user) => !user.isActive)
  }

  if (accountTypeFilter.value === 'managers') {
    filtered = filtered.filter(
      (user) => user.role === 'MANAGER' || user.role === 'DEPARTMENT_HEAD'
    )
  } else if (accountTypeFilter.value === 'admins') {
    filtered = filtered.filter(
      (user) => user.role === 'ADMINISTRATOR' || user.role === 'EXECUTIVE'
    )
  }

  if (!selectedDepartments.value.includes('all') && selectedDepartments.value.length > 0) {
    filtered = filtered.filter(
      (user) => user.department && selectedDepartments.value.includes(user.department.id)
    )
  }

  // Sort: Active users first, then by selected field
  filtered.sort((a, b) => {
    // Primary sort: Active users first (isActive true comes before false)
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1
    }

    // Secondary sort: by selected field
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


const setButtonRef = (userId: string, el: any) => {
  if (el) {
    buttonRefs.value.set(userId, el as HTMLElement)
  }
}

const toggleUserMenu = (userId: string) => {
  if (openMenuUserId.value === userId) {
    openMenuUserId.value = null
    return
  }

  openMenuUserId.value = userId

  nextTick(() => {
    const button = buttonRefs.value.get(userId)
    if (button) {
      const rect = button.getBoundingClientRect()
      const menuWidth = 208 // w-52 = 13rem = 208px
      const menuHeight = 150 // approximate
      
      let top = rect.bottom + 8
      let left = rect.right - menuWidth

      // Adjust if menu would go off bottom of screen
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 8
      }

      // Adjust if menu would go off left of screen
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
  return users.value.find(u => u.id === openMenuUserId.value)
}

const getUserInitials = (user: User) =>
  `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

const formatRole = (role: string) =>
  role
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

const editUser = (user: User | undefined) => {
  if (!user) return
  console.log('Edit user:', user)
  closeUserMenu()
  // TODO: Implement edit functionality
}

const toggleUserStatus = async (user: User | undefined) => {
  if (!user) return
  
  try {
    // Call API and get updated user data
    const updatedUser = await api.updateUser(user.id, { 
      isActive: !user.isActive 
    }) as User
    
    // Find and replace the user in the array
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    
    closeUserMenu()
  } catch (err: any) {
    console.error('Error toggling user status:', err)
    alert('Failed to update user status')
  }
}


const confirmDeleteUser = async (user: User | undefined) => {
  if (!user) return
  
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

const refreshDepartments = async () => {
  try {
    const departmentsData = await api.fetchDepartments()
    departments.value = departmentsData as Department[]
  } catch (err: any) {
    console.error('Error refreshing departments:', err)
  }
}

const handleUserAdded = async (newUser: User) => {
  users.value.push(newUser)
  await refreshDepartments() // Refresh to get updated counts
}
</script>
