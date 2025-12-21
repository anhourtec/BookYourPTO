<template>
  <div class="relative group">
    <button class="flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/50">
      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/20 ring-2 ring-white dark:ring-gray-900">
        {{ userInitials }}
      </div>
      <span class="text-sm font-semibold">{{ userName }}</span>
      <Icon name="lucide:chevron-down" class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
    </button>

    <div class="absolute right-0 top-full pt-3 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden backdrop-blur-xl">
        <div class="p-2">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium"
          >
            <Icon :name="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </NuxtLink>

          <UserProfileButton
            :user="user"
            @profile-updated="$emit('profile-updated', $event)"
          />

          <div class="border-t border-gray-200 dark:border-gray-700/50 my-2"></div>
          <button
            @click="$emit('logout')"
            class="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 w-full text-left font-medium"
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
