<template>
  <header class="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl backdrop-saturate-150 shadow-sm">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 z-50 group">
          <div class="transform transition-all duration-300 group-hover:scale-105">
            <AppLogo />
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-1">
          <!-- Navigation Links -->
          <NuxtLink
            v-for="link in visibleNavLinks"
            :key="link.to"
            :to="link.to"
            class="relative px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
          >
            {{ link.label }}
          </NuxtLink>

          <!-- Divider -->
          <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

          <!-- Auth Buttons or User Menu -->
          <HeaderAuthButtons
            v-if="!isAuthenticated"
            :is-authenticated="isAuthenticated"
          />

          <HeaderDesktopUserMenu
            v-else
            :user="user"
            :user-name="userName"
            :user-initials="userInitials"
            :menu-items="userMenuItems"
            @logout="handleLogout"
            @profile-updated="handleProfileUpdated"
          />

          <!-- Theme Toggle -->
          <HeaderThemeToggle />
        </nav>

        <!-- Mobile Menu Button & Theme Toggle -->
        <div class="flex lg:hidden items-center gap-1">
          <HeaderThemeToggle />

          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="relative text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 active:scale-95"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          >
            <Icon v-if="!mobileMenuOpen" name="lucide:menu" class="w-5 h-5" />
            <Icon v-else name="lucide:x" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" class="lg:hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg shadow-lg">
        <nav class="container mx-auto px-4 py-6 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <!-- Main Navigation Links -->
          <NuxtLink
            v-for="link in visibleNavLinks"
            :key="link.to"
            :to="link.to"
            @click="closeMobileMenu"
            class="block px-4 py-3.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            {{ link.label }}
          </NuxtLink>

          <!-- Mobile Auth Buttons or User Menu -->
          <div v-if="!isAuthenticated" class="pt-4 space-y-3">
            <NuxtLink
              to="/login"
              @click="closeMobileMenu"
              class="block text-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-[0.98] border border-gray-200 dark:border-gray-700"
            >
              Log in
            </NuxtLink>

            <NuxtLink
              to="/register"
              @click="closeMobileMenu"
              class="block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              Get started
            </NuxtLink>
          </div>

          <HeaderMobileUserMenu
            v-else
            :user="user"
            :user-name="userName"
            :user-initials="userInitials"
            :menu-items="userMenuItems"
            @logout="handleLogoutMobile"
            @profile-updated="handleProfileUpdated"
            @close="closeMobileMenu"
          />
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useHeaderAuth } from '~/composables/header/useHeaderAuth'
import { useHeaderNavigation } from '~/composables/header/useHeaderNavigation'

// Composables
const { 
  user, 
  isAuthenticated,
  currentUserId,
  userName, 
  userInitials, 
  checkAuth, 
  handleLogout: logout,
  handleProfileUpdated 
} = useHeaderAuth()

// Pass currentUserId to navigation composable
const { visibleNavLinks, userMenuItems } = useHeaderNavigation(isAuthenticated, currentUserId)
const router = useRouter()

// State
const mobileMenuOpen = ref(false)

// Methods
const handleLogout = () => {
  logout()
  // No need to close mobile menu as logout redirects
}

const handleLogoutMobile = () => {
  closeMobileMenu()
  logout()
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Watchers
watch(() => router.currentRoute.value.path, closeMobileMenu)

// Lifecycle
onMounted(() => {
  checkAuth()
  router.afterEach(checkAuth)
})
</script>