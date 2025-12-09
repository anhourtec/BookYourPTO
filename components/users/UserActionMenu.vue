<template>
  <Teleport to="body">
    <div
      v-if="user"
      v-click-outside="handleClickOutside"
      :style="menuStyle"
      class="fixed w-52 bg-[rgb(var(--card))] rounded-lg shadow-2xl border border-[rgb(var(--border))] z-[100] py-1.5"
    >
      <button
        @click="$emit('edit', user)"
        class="w-full px-4 py-2.5 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors flex items-center gap-3"
      >
        <Icon name="lucide:edit" class="w-4 h-4" />
        <span>Edit User</span>
      </button>

      <button
        @click="$emit('toggle-status', user)"
        class="w-full px-4 py-2.5 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors flex items-center gap-3"
      >
        <Icon
          :name="user.isActive ? 'lucide:user-x' : 'lucide:user-check'"
          class="w-4 h-4"
        />
        <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
      </button>

      <div class="h-px bg-[rgb(var(--border))] my-1.5"></div>

      <button
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

defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [user: User]
  'toggle-status': [user: User]
  delete: [user: User]
}>()

// The v-click-outside directive expects a function, not an emit call
const handleClickOutside = () => {
  emit('close')
}
</script>