<template>
  <div class="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
    <div class="flex items-center gap-3 px-4 py-3 mb-2">
      <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
        {{ userInitials }}
      </div>
      <div>
        <div class="font-medium text-gray-900 dark:text-white">{{ userName }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">{{ user?.email }}</div>
      </div>
    </div>

    <NuxtLink 
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      @click="$emit('close')"
      class="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      <Icon :name="item.icon" class="w-5 h-5" />
      {{ item.label }}
    </NuxtLink>
    
    <UserProfileButton 
      :user="user"
      :is-mobile="true"
      @profile-updated="$emit('profile-updated', $event)"
      @close-mobile-menu="$emit('close')"
    />
    
    <button 
      @click="$emit('logout')"
      class="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full text-left mt-2"
    >
      <Icon name="lucide:log-out" class="w-5 h-5" />
      Logout
    </button>
  </div>
</template>

<script setup lang="ts">
import UserProfileButton from '~/components/UserProfileButton.vue'
import type { User } from '~/types/user'

interface MenuItem {
  to: string
  label: string
  icon: string
}

interface Props {
  user: any
  userName: string
  userInitials: string
  menuItems: MenuItem[]
}

defineProps<Props>()

defineEmits<{
  'logout': []
  'profile-updated': [user: User]
  'close': []
}>()
</script>
