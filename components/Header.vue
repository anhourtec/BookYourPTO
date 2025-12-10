<template>
  <header class="border-b bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 sticky top-0 z-50">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 z-50">
          <AppLogo />
        </NuxtLink>
        
        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-6">
          <!-- Navigation Links -->
          <NuxtLink 
            v-for="link in visibleNavLinks" 
            :key="link.to"
            :to="link.to" 
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
          
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
        <div class="flex lg:hidden items-center gap-2">
          <HeaderThemeToggle />
          
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          >
            <Icon v-if="!mobileMenuOpen" name="lucide:menu" class="w-6 h-6" />
            <Icon v-else name="lucide:x" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-screen"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 max-h-screen"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="mobileMenuOpen" class="lg:hidden border-t border-gray-200 dark:border-gray-800 overflow-hidden">
        <nav class="container mx-auto px-4 py-4 space-y-1">
          <!-- Main Navigation Links -->
          <NuxtLink 
            v-for="link in visibleNavLinks"
            :key="link.to"
            :to="link.to"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {{ link.label }}
          </NuxtLink>

          <!-- Mobile Auth Buttons or User Menu -->
          <div v-if="!isAuthenticated" class="pt-4 space-y-2">
            <NuxtLink 
              to="/login"
              @click="closeMobileMenu"
              class="block text-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Log in
            </NuxtLink>
            
            <NuxtLink 
              to="/register"
              @click="closeMobileMenu"
              class="block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-sm"
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
  userName, 
  userInitials, 
  checkAuth, 
  handleLogout: logout,
  handleProfileUpdated 
} = useHeaderAuth()

const { visibleNavLinks, userMenuItems } = useHeaderNavigation(isAuthenticated)
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
