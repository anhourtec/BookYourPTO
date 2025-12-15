<template>
  <div class="relative group">
    <button class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium px-4 py-2 rounded-lg">
      <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
        {{ userInitials }}
      </div>
      <span>{{ userName }}</span>
      <Icon name="lucide:chevron-down" class="w-4 h-4" />
    </button>

    <div class="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="py-2">
          <NuxtLink 
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Icon :name="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </NuxtLink>
          
          <UserProfileButton 
            :user="user"
            @profile-updated="$emit('profile-updated', $event)"
          />
          
          <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
          <button 
            @click="$emit('logout')"
            class="flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
          >
            <Icon name="lucide:log-out" class="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
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
}>()
</script>
