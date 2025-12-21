<template>
  <div
    class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[rgb(var(--muted))]/30 transition-colors"
    :class="{ 'opacity-50': !user.isActive }"
  >
    <!-- Name with Avatar (reduced from col-span-3 to col-span-2) -->
    <div class="col-span-2 flex items-center gap-3">
      <div class="relative">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
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
          Inactive {{ formatDate(user.updatedAt) }}
        </p>
      </div>
    </div>

    <!-- Email (reduced from col-span-3 to col-span-2) -->
    <div class="col-span-2">
      <p class="text-sm text-[rgb(var(--muted-foreground))] truncate">
        {{ user.email }}
      </p>
    </div>

    <!-- Department -->
    <div class="col-span-2 flex items-center">
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
    <div class="col-span-2 flex items-center">
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

    <!-- Reports To -->
    <div class="col-span-2 flex items-center">
      <div v-if="reportsToName" class="flex items-center gap-1.5">
        <Icon name="lucide:user-check" class="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
        <span class="text-sm text-[rgb(var(--foreground))] truncate">
          {{ reportsToName }}
        </span>
      </div>
      <span v-else class="text-xs text-[rgb(var(--muted-foreground))] italic flex items-center gap-1.5">
        <Icon name="lucide:minus" class="w-3.5 h-3.5" />
        {{ noManagerText }}
      </span>
    </div>

    <!-- Actions -->
    <div class="col-span-2 flex items-center justify-end">
      <button
        v-if="canManageUsers"
        ref="actionButton"
        @click="handleMenuClick"
        class="p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
      >
        <Icon name="lucide:more-vertical" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
      </button>
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
  
  // Executives don't report to anyone
  if (userRole === 'EXECUTIVE') {
    return null
  }
  
  // Administrators report to Executives (but we don't have that data)
  if (userRole === 'ADMINISTRATOR') {
    return null
  }
  
  // Department Heads report to Administrators/Executives
  if (userRole === 'DEPARTMENT_HEAD') {
    return null
  }
  
  // Regular employees: try department head
  if (props.user.department?.headOfDept) {
    const head = props.user.department.headOfDept
    // Don't show if the department head is the user themselves
    if (head.id !== props.user.id) {
      return `${head.firstName} ${head.lastName}`
    }
  }
  
  return null
})

// Contextual "no manager" text based on role
const noManagerText = computed(() => {
  const role = props.user.role
  
  if (role === 'EXECUTIVE') return 'Board/CEO'
  if (role === 'ADMINISTRATOR') return 'Executive team'
  if (role === 'DEPARTMENT_HEAD') return 'Management'
  
  return 'No manager'
})

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

const actionButton = ref<HTMLElement | null>(null)

const handleMenuClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  emit('toggle-menu', props.user.id, target)
}

defineExpose({ actionButton })
</script>