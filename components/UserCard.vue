<template>
  <div 
    class="bg-card rounded-lg border border-border p-4 hover:shadow-lg transition-all duration-300 group"
    :class="{ 'opacity-60': !user.isActive }"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3 flex-1">
        <div 
          class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
          :class="getRoleColor(user.role).bg"
        >
          {{ getUserInitials(user) }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold text-foreground truncate">
              {{ user.firstName }} {{ user.lastName }}
            </h3>
            <span 
              v-if="!user.isActive"
              class="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            >
              Left: {{ formatDate(user.updatedAt) }}
            </span>
          </div>
          
          <p class="text-sm text-muted-foreground truncate">{{ user.email }}</p>
          
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <span 
              class="text-xs px-2 py-1 rounded-full border"
              :class="[getRoleColor(user.role).bg, getRoleColor(user.role).text, getRoleColor(user.role).border]"
            >
              {{ formatRole(user.role) }}
            </span>

            <span 
              v-if="user.department"
              class="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {{ user.department.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="relative">
        <button 
          @click="showMenu = !showMenu"
          class="p-2 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <Icon name="lucide:more-vertical" class="w-5 h-5 text-muted-foreground" />
        </button>

        <div 
          v-if="showMenu"
          v-click-outside="() => showMenu = false"
          class="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-xl border border-border z-10 py-1"
        >
          <button 
            @click="handleEdit"
            class="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Icon name="lucide:edit" class="w-4 h-4" />
            Edit
          </button>
          
          <button 
            @click="handleToggleStatus"
            class="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Icon :name="user.isActive ? 'lucide:user-x' : 'lucide:user-check'" class="w-4 h-4" />
            {{ user.isActive ? 'Deactivate' : 'Activate' }}
          </button>

          <div class="border-t border-border my-1"></div>
          
          <button 
            @click="handleDelete"
            class="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 text-red-600 dark:text-red-400"
          >
            <Icon name="lucide:trash-2" class="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  user: any
}>()

const emit = defineEmits(['edit', 'toggle-status', 'delete'])

const { getRoleColor } = useUserRoleColors()
const showMenu = ref(false)

const getUserInitials = (user: any) => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
}

const formatRole = (role: string) => {
  return role.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const handleEdit = () => {
  emit('edit', props.user)
  showMenu.value = false
}

const handleToggleStatus = () => {
  emit('toggle-status', props.user)
  showMenu.value = false
}

const handleDelete = () => {
  emit('delete', props.user)
  showMenu.value = false
}
</script>