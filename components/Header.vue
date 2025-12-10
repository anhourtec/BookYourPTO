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
          <NuxtLink 
            v-for="link in visibleNavLinks" 
            :key="link.to"
            :to="link.to" 
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
          
          <template v-if="!isAuthenticated">
            <NuxtLink 
              to="/login"
              class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium px-4 py-2"
            >
              Log in
            </NuxtLink>
            
            <NuxtLink 
              to="/register"
              class="relative bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-lg hover:scale-105 overflow-hidden group"
            >
              <span class="relative z-10">Get started</span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
          </template>

          <template v-else>
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
                      v-for="item in userMenuItems"
                      :key="item.to"
                      :to="item.to"
                      class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon :name="item.icon" class="w-4 h-4" />
                      {{ item.label }}
                    </NuxtLink>
                    
                    <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button 
                      @click="handleLogout"
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
          
          <button
            @click="toggleTheme"
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :aria-label="`Switch to ${colorMode.value === 'dark' ? 'light' : 'dark'} mode`"
          >
            <Icon v-if="colorMode.value === 'dark'" name="lucide:moon" class="w-5 h-5" />
            <Icon v-else name="lucide:sun" class="w-5 h-5" />
          </button>
        </nav>

        <!-- Mobile Menu Button & Theme Toggle -->
        <div class="flex lg:hidden items-center gap-2">
          <button
            @click="toggleTheme"
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :aria-label="`Switch to ${colorMode.value === 'dark' ? 'light' : 'dark'} mode`"
          >
            <Icon v-if="colorMode.value === 'dark'" name="lucide:moon" class="w-5 h-5" />
            <Icon v-else name="lucide:sun" class="w-5 h-5" />
          </button>

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
            @click="mobileMenuOpen = false"
            class="block px-4 py-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {{ link.label }}
          </NuxtLink>

          <template v-if="!isAuthenticated">
            <div class="pt-4 space-y-2">
              <NuxtLink 
                to="/login"
                @click="mobileMenuOpen = false"
                class="block text-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Log in
              </NuxtLink>
              
              <NuxtLink 
                to="/register"
                @click="mobileMenuOpen = false"
                class="block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-sm"
              >
                Get started
              </NuxtLink>
            </div>
          </template>

          <template v-else>
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
                v-for="item in userMenuItems"
                :key="item.to"
                :to="item.to"
                @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Icon :name="item.icon" class="w-5 h-5" />
                {{ item.label }}
              </NuxtLink>
              
              <button 
                @click="handleLogout"
                class="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full text-left mt-2"
              >
                <Icon name="lucide:log-out" class="w-5 h-5" />
                Logout
              </button>
            </div>
          </template>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const router = useRouter()
const { canAccessUsers, canAccessSettings } = usePermissions()

const user = ref<any>(null)
const isAuthenticated = ref(false)
const mobileMenuOpen = ref(false)

// Define all navigation links in one place
const navLinks = computed(() => [
  { to: '/', label: 'Home', show: true },
  { to: '#', label: 'Features', show: true },
  { to: '#', label: 'Docs', show: true },
  { to: '/users', label: 'Users', show: isAuthenticated.value && canAccessUsers() },
  { to: '/settings', label: 'Settings', show: isAuthenticated.value && canAccessSettings() }
])

// Filter visible links
const visibleNavLinks = computed(() => navLinks.value.filter(link => link.show))

// Define user menu items in one place
const userMenuItems = computed(() => {
  const items = [
    { to: '/#', label: 'Dashboard', icon: 'lucide:layout-dashboard', show: true },
    { to: '/users', label: 'Users', icon: 'lucide:users', show: canAccessUsers() },
    { to: '/#', label: 'Profile', icon: 'lucide:user', show: true },
    { to: '/settings', label: 'Settings', icon: 'lucide:settings', show: canAccessSettings() }
  ]
  return items.filter(item => item.show)
})

const userName = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName} ${user.value.lastName}`
})

const userInitials = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
})

const checkAuth = () => {
  const token = localStorage.getItem('auth_token')
  const userData = localStorage.getItem('user')
  
  if (token && userData) {
    user.value = JSON.parse(userData)
    isAuthenticated.value = true
  } else {
    user.value = null
    isAuthenticated.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  user.value = null
  isAuthenticated.value = false
  mobileMenuOpen.value = false
  router.push('/')
}

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Close mobile menu on route change
watch(() => router.currentRoute.value.path, () => {
  mobileMenuOpen.value = false
})

onMounted(() => {
  checkAuth()
  
  router.afterEach(() => {
    checkAuth()
  })
})
</script>