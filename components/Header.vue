<template>
  <header class="border-b bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <AppLogo />
        </NuxtLink>
        
        <nav class="flex items-center gap-6">
          <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Home
          </NuxtLink>
          <NuxtLink to="/features" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Features
          </NuxtLink>
          <NuxtLink to="/docs" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Docs
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

              <div class="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div class="py-2">
                    <NuxtLink 
                      to="/dashboard"
                      class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon name="lucide:layout-dashboard" class="w-4 h-4" />
                      Dashboard
                    </NuxtLink>
                    <NuxtLink 
                      to="/profile"
                      class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon name="lucide:user" class="w-4 h-4" />
                      Profile
                    </NuxtLink>
                    <NuxtLink 
                      to="/settings"
                      class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon name="lucide:settings" class="w-4 h-4" />
                      Settings
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
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const router = useRouter()

const user = ref<any>(null)
const isAuthenticated = ref(false)

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
  localStorage.removeItem('user')
  user.value = null
  isAuthenticated.value = false
  router.push('/')
}

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

onMounted(() => {
  checkAuth()
  
  router.afterEach(() => {
    checkAuth()
  })
})
</script>