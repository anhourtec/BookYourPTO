<template>
  <div class="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 mt-4">
    <div class="flex items-center gap-3 px-4 py-4 mb-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-base font-bold shadow-lg shadow-blue-500/20 ring-2 ring-white dark:ring-gray-900">
        {{ userInitials }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-gray-900 dark:text-white truncate">{{ userName }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ user?.email }}</div>
      </div>
    </div>

    <NuxtLink
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      @click="$emit('close')"
      class="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium active:scale-[0.98]"
    >
      <Icon :name="item.icon" class="w-5 h-5" />
      {{ item.label }}
    </NuxtLink>

    <ClientOnly>
      <UserProfileButton
        :user="user"
        :is-mobile="true"
        @profile-updated="$emit('profile-updated', $event)"
        @close-mobile-menu="$emit('close')"
      />
    </ClientOnly>

    <button
      @click="$emit('logout')"
      class="flex items-center gap-3 px-4 py-3.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 w-full text-left mt-2 font-medium active:scale-[0.98]"
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
