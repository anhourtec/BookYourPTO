<template>
  <div
    class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-4 hover:shadow-md transition-all"
    :class="{ 'opacity-50': !user.isActive }"
  >
    <!-- Mobile Card View -->
    <div class="flex items-start gap-3">
      <!-- Avatar with Badge -->
      <div class="relative flex-shrink-0">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm"
          :class="[
            getRoleColor(user.role).avatar, 
            getRoleColor(user.role).avatarText,
            getRoleColor(user.role).ring
          ]"
        >
          {{ userInitials }}
        </div>
        
        <!-- Star Badge for Administrator -->
        <div
          v-if="user.role === 'ADMINISTRATOR'"
          class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center ring-2 ring-[rgb(var(--card))]"
        >
          <Icon name="lucide:star" class="w-3 h-3 text-yellow-900 dark:text-yellow-950 fill-current" />
        </div>
        
        <!-- Crown Badge for Executive -->
        <div
          v-else-if="user.role === 'EXECUTIVE'"
          class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center ring-2 ring-[rgb(var(--card))]"
        >
          <Icon name="lucide:crown" class="w-3 h-3 text-yellow-900 dark:text-yellow-950 fill-current" />
        </div>
      </div>

      <!-- User Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold text-[rgb(var(--foreground))] truncate">
              {{ user.firstName }} {{ user.lastName }}
            </h3>
            <p class="text-sm text-[rgb(var(--muted-foreground))] truncate">
              {{ user.email }}
            </p>
          </div>
          
          <!-- Actions Button -->
          <button
            v-if="canManageUsers"
            ref="actionButton"
            @click="handleMenuClick"
            class="p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors flex-shrink-0"
          >
            <Icon name="lucide:more-vertical" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        <!-- Status Badge -->
        <div v-if="!user.isActive" class="mb-2">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[rgb(var(--destructive))]/10 text-[rgb(var(--destructive))]">
            <Icon name="lucide:circle" class="w-2 h-2 mr-1 fill-current" />
            Inactive since {{ formatDate(user.updatedAt) }}
          </span>
        </div>

        <!-- Department, Reports To & Role Tags -->
        <div class="flex flex-wrap gap-2">
          <span
            v-if="user.department"
            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]"
          >
            <Icon name="lucide:building-2" class="w-3 h-3 mr-1" />
            {{ user.department.name }}
          </span>
          <span
            v-else
            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[rgb(var(--muted))]/50 text-[rgb(var(--muted-foreground))] italic"
          >
            No department
          </span>

          <!-- Reports To Badge - Shows direct manager -->
          <span
            v-if="reportsToName"
            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          >
            <Icon name="lucide:user-check" class="w-3 h-3 mr-1" />
            Reports to {{ reportsToName }}
          </span>
          
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
    headOfDept?: {
      id: string
      firstName: string
      lastName: string
      role?: string
    } | null
  }
  manager?: {
    id: string
    firstName: string
    lastName: string
    role?: string
  }
  updatedAt: string
}

interface Props {
  user: User
  canManageUsers: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggle-menu': [userId: string, buttonElement: HTMLElement]
}>()

const { getRoleColor } = useUserRoleColors()

const userInitials = computed(() => 
  `${props.user.firstName[0]}${props.user.lastName[0]}`.toUpperCase()
)

// Compute the "Reports To" name based on role hierarchy
const reportsToName = computed(() => {
  // If user has a direct manager assigned, use that
  if (props.user.manager) {
    return `${props.user.manager.firstName} ${props.user.manager.lastName}`
  }
  
  // Otherwise, use role-based fallback logic
  const userRole = props.user.role
  
  // Executives don't report to anyone (or report to board/CEO which isn't in system)
  if (userRole === 'EXECUTIVE') {
    return null
  }
  
  // Administrators report to Executives (but we don't have that data without manager field)
  if (userRole === 'ADMINISTRATOR') {
    return null // Or show "Executive Team" as text
  }
  
  // Department Heads report to Administrators/Executives (use manager if set)
  if (userRole === 'DEPARTMENT_HEAD') {
    return null // Or show "Management Team"
  }
  
  // Regular employees: try department head first, then manager
  if (props.user.department?.headOfDept) {
    const head = props.user.department.headOfDept
    // Don't show if the department head is the user themselves
    if (head.id !== props.user.id) {
      return `${head.firstName} ${head.lastName}`
    }
  }
  
  return null
})

const formatRole = (role: string) =>
  role
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

const actionButton = ref<HTMLElement | null>(null)

const handleMenuClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  emit('toggle-menu', props.user.id, target)
}

defineExpose({ actionButton })
</script>