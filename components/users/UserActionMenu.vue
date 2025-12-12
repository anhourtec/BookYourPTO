<template>
  <Teleport to="body">
    <div
      v-if="user"
      v-click-outside="handleClickOutside"
      :style="menuStyle"
      class="fixed w-52 bg-[rgb(var(--card))] rounded-lg shadow-2xl border border-[rgb(var(--border))] z-[100] py-1.5"
    >
      <!-- View Calendar -->
      <button
        @click="handleViewCalendar"
        class="w-full px-4 py-2.5 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors flex items-center gap-3"
      >
        <Icon name="lucide:calendar" class="w-4 h-4" />
        <span>View Calendar</span>
      </button>

      <!-- Edit User - Only show if user has permission -->
      <button
        v-if="canEdit"
        @click="$emit('edit', user)"
        class="w-full px-4 py-2.5 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors flex items-center gap-3"
      >
        <Icon name="lucide:edit" class="w-4 h-4" />
        <span>Edit User</span>
      </button>

      <!-- Toggle Status - Only show if user can be toggled -->
      <button
        v-if="canToggleStatus"
        @click="$emit('toggle-status', user)"
        class="w-full px-4 py-2.5 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors flex items-center gap-3"
      >
        <Icon
          :name="user.isActive ? 'lucide:user-x' : 'lucide:user-check'"
          class="w-4 h-4"
        />
        <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
      </button>

      <!-- Divider - Only show if delete button will be shown -->
      <div v-if="canDelete" class="h-px bg-[rgb(var(--border))] my-1.5"></div>

      <!-- Delete User - Only show if user has permission -->
      <button
        v-if="canDelete"
        @click="$emit('delete', user)"
        class="w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(var(--destructive))]/10 transition-colors flex items-center gap-3 text-[rgb(var(--destructive))]"
      >
        <Icon name="lucide:trash-2" class="w-4 h-4" />
        <span>Delete User</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { User } from '~/types/user'

interface Props {
  user: User | null
  menuStyle: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [user: User]
  'toggle-status': [user: User]
  delete: [user: User]
  'reset-password': [user: User]
}>()

const router = useRouter()
const { getUser } = usePermissions()
const currentUser = computed(() => getUser())

// ============================================
// PERMISSION CHECKS
// ============================================

// Can Edit: Hide edit for executives unless current user is executive
const canEdit = computed(() => {
  if (!props.user || !currentUser.value) return false
  
  // Executives can edit everyone
  if (currentUser.value.role === 'EXECUTIVE') return true
  
  // Cannot edit executives if you're not an executive
  if (props.user.role === 'EXECUTIVE') return false
  
  // Admins can edit non-executives
  if (currentUser.value.role === 'ADMINISTRATOR') return true
  
  // Department heads can edit non-executives
  if (currentUser.value.role === 'DEPARTMENT_HEAD') return true
  
  return false
})

// Can Toggle Status
const canToggleStatus = computed(() => {
  if (!props.user || !currentUser.value) return false
  
  // Can't toggle your own status
  if (props.user.id === currentUser.value.id && props.user.isActive) {
    return false
  }
  
  // Only executives can toggle executive status
  if (props.user.role === 'EXECUTIVE' && props.user.isActive) {
    return currentUser.value.role === 'EXECUTIVE'
  }
  
  return true
})

// Can Delete: Hide delete for executives unless current user is executive
const canDelete = computed(() => {
  if (!props.user || !currentUser.value) return false
  
  // Can't delete yourself
  if (props.user.id === currentUser.value.id) return false
  
  // Executives can delete everyone (except themselves)
  if (currentUser.value.role === 'EXECUTIVE') return true
  
  // Cannot delete executives if you're not an executive
  if (props.user.role === 'EXECUTIVE') return false
  
  // Admins can delete non-executives
  if (currentUser.value.role === 'ADMINISTRATOR') return true
  
  // Department heads can delete non-executives
  if (currentUser.value.role === 'DEPARTMENT_HEAD') return true
  
  return false
})

// ============================================
// HANDLERS
// ============================================

const handleViewCalendar = () => {
  if (!props.user) return
  
  // Close the menu
  emit('close')
  
  // Navigate to the user's calendar
  router.push(`/calendar/${props.user.id}`)
}

const handleClickOutside = () => {
  emit('close')
}
</script>