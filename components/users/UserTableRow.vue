<template>
  <div
    class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[rgb(var(--muted))]/30 transition-colors"
    :class="{ 'opacity-50': !user.isActive }"
  >
    <!-- Name with Avatar -->
    <div class="col-span-3 flex items-center gap-3">
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

    <!-- Email -->
    <div class="col-span-3">
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

    <!-- Actions -->
    <div class="col-span-2 flex items-center justify-end">
      <button
        v-if="canManageUsers"
        ref="actionButton"
        @click="$emit('toggle-menu', user.id)"
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
  }
  updatedAt: string
}

interface Props {
  user: User
  canManageUsers: boolean
}

const props = defineProps<Props>()

defineEmits<{
  'toggle-menu': [userId: string]
}>()

const { getRoleColor } = useUserRoleColors()

const userInitials = computed(() => 
  `${props.user.firstName[0]}${props.user.lastName[0]}`.toUpperCase()
)

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

// Expose the action button ref for parent positioning
const actionButton = ref<HTMLElement | null>(null)
defineExpose({ actionButton })
</script>