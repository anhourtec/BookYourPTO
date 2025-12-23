<template>
  <CustomModal v-model="isOpen" max-width="md">
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgb(var(--border))]">
        <h2 class="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">Filter Users</h2>
        <button 
          @click="handleClose" 
          class="p-1.5 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
        >
          <Icon name="lucide:x" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
        </button>
      </div>

      <!-- Filter Content -->
      <div class="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <Filter
          :sections="filterSections"
          @update:filter="handleFilterUpdate"
        />
      </div>

      <!-- Footer -->
      <div class="border-t border-[rgb(var(--border))] px-4 sm:px-6 py-3 sm:py-4 bg-[rgb(var(--muted))]/20">
        <div class="flex gap-2 sm:gap-3">
          <button
            @click="clearAllFilters"
            class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-sm font-medium text-[rgb(var(--foreground))]"
          >
            Clear All
          </button>
          <button
            @click="applyFilters"
            class="flex-1 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
import Filter from '~/components/users/Filter.vue'

interface Department {
  id: string
  name: string
  color?: string
  _count?: {
    users: number
  }
}

interface Filters {
  userFilter: 'all' | 'selected'
  sortBy: 'firstName' | 'lastName' | 'department'
  accountType: 'all' | 'managers' | 'approvers' | 'favourites'
  departmentIds: string[]
}

interface FilterOption {
  label: string
  value: string
  badge?: string
}

interface Props {
  open: boolean
  departments: Department[]
  currentUserDepartmentId?: string
  currentUserRole?: string
  canViewAllDepartments?: boolean
  initialFilters?: Partial<Filters>
}

const props = withDefaults(defineProps<Props>(), {
  canViewAllDepartments: true,
  initialFilters: () => ({}),
})

const emit = defineEmits<{
  close: []
  'apply-filters': [filters: Filters]
}>()

// Use computed for two-way binding with CustomModal
const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const defaultFilters: Filters = {
  userFilter: 'all',
  sortBy: 'firstName',
  accountType: 'all',
  departmentIds: [],
}

// Local filter state
const localFilters = reactive<Filters>({
  ...defaultFilters,
  ...props.initialFilters,
})

// Watch for prop changes to sync filters
watch(() => props.initialFilters, (newFilters) => {
  Object.assign(localFilters, { ...defaultFilters, ...newFilters })
}, { deep: true })

// Watch for open state to reset or sync filters
watch(() => props.open, (isOpenVal) => {
  if (isOpenVal) {
    Object.assign(localFilters, { ...defaultFilters, ...props.initialFilters })
  }
})

// Department options for checkbox filter
const departmentOptions = computed((): FilterOption[] => {
  const options: FilterOption[] = [
    { label: 'All departments', value: 'all' }
  ]
  
  if (props.canViewAllDepartments) {
    props.departments.forEach(dept => {
      const badge = props.currentUserDepartmentId === dept.id 
        ? 'My Dept' 
        : (dept._count?.users ? `${dept._count.users}` : undefined)
      
      options.push({
        label: dept.name,
        value: dept.id,
        badge
      })
    })
  }
  
  return options
})

// Compute selected departments for checkbox display
const selectedDepartments = computed(() => {
  if (localFilters.departmentIds.length === 0) {
    // If no filter applied, show all as selected
    return ['all', ...props.departments.map(d => d.id)]
  }
  return localFilters.departmentIds
})

// Filter sections configuration (matching users page pattern)
const filterSections = computed(() => {
  const sections: Array<{ id: string; label: string; type: 'radio' | 'checkbox'; value: any; options: any[] }> = [
    {
      id: 'sortBy',
      label: 'Sort Order',
      type: 'radio' as const,
      value: localFilters.sortBy,
      options: [
        { label: 'Sort by first name', value: 'firstName' },
        { label: 'Sort by last name', value: 'lastName' },
        { label: 'Sort by department', value: 'department' },
      ]
    },
    {
      id: 'accountType',
      label: 'Account Type',
      type: 'radio' as const,
      value: localFilters.accountType,
      options: [
        { label: 'All accounts', value: 'all' },
        { label: 'Department managers', value: 'managers' },
        // Only show "Users I approve" for Department Heads, Administrators, and Executives
        ...(props.currentUserRole && ['DEPARTMENT_HEAD', 'ADMINISTRATOR', 'EXECUTIVE'].includes(props.currentUserRole)
          ? [{ label: 'Users I approve', value: 'approvers' }]
          : [])
      ]
    }
  ]
  
  // Only show departments filter if user can view all departments
  if (props.canViewAllDepartments && props.departments.length > 0) {
    sections.push({
      id: 'departments',
      label: 'Departments',
      type: 'checkbox' as const,
      value: selectedDepartments.value,
      options: departmentOptions.value
    })
  }
  
  return sections
})

// Handle filter updates from Filter component
const handleFilterUpdate = (id: string, value: string | string[]) => {
  switch (id) {
    case 'sortBy':
      localFilters.sortBy = value as Filters['sortBy']
      break
    case 'accountType':
      localFilters.accountType = value as Filters['accountType']
      break
    case 'departments':
      const deptValues = value as string[]
      // If 'all' is included, clear the filter (show all)
      if (deptValues.includes('all')) {
        localFilters.departmentIds = []
      } else {
        // Store only specific department IDs
        localFilters.departmentIds = deptValues
      }
      break
  }
}

const clearAllFilters = () => {
  Object.assign(localFilters, defaultFilters)
}

const applyFilters = () => {
  emit('apply-filters', { ...localFilters })
  emit('close')
}

const handleClose = () => {
  emit('close')
}
</script>