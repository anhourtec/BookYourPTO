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
          <NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Features
          </NuxtLink>
          <NuxtLink to="#" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Docs
          </NuxtLink>
          
          <!-- Users Link - Only for authorized users -->
          <NuxtLink 
            v-if="isAuthenticated && canAccessUsers()"
            to="/users" 
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Users
          </NuxtLink>

          <NuxtLink 
            v-if="isAuthenticated && canAccessUsers()"
            to="/settings" 
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Settings
          </NuxtLink>
          
          <!-- TOKEN EXPIRY COUNTDOWN (Testing Only) -->
          <div 
            v-if="isAuthenticated && tokenExpiresIn > 0"
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="tokenExpiresIn < 10 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'"
          >
            Token expires in: {{ tokenExpiresIn }}s
          </div>
          
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
                      v-if="canAccessUsers()"
                      to="/users"
                      class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon name="lucide:users" class="w-4 h-4" />
                      Users
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
const { canAccessUsers } = usePermissions()

const user = ref<any>(null)
const isAuthenticated = ref(false)
const tokenExpiresIn = ref(0)

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
    updateTokenExpiry()
  } else {
    user.value = null
    isAuthenticated.value = false
    tokenExpiresIn.value = 0
  }
}

const updateTokenExpiry = () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    tokenExpiresIn.value = 0
    return
  }

  try {
    // Decode JWT token
    const parts = token.split('.')
    if (parts.length !== 3) return

    // TypeScript: parts[1] is guaranteed to exist due to length check
    const payloadBase64 = parts[1]!
    const payload = JSON.parse(atob(payloadBase64))
    const currentTime = Math.floor(Date.now() / 1000)
    
    if (payload.exp) {
      tokenExpiresIn.value = Math.max(0, payload.exp - currentTime)
    }
  } catch (error) {
    tokenExpiresIn.value = 0
  }
}

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  user.value = null
  isAuthenticated.value = false
  tokenExpiresIn.value = 0
  router.push('/')
}

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Update countdown every second and auto-logout on expiry
let expiryInterval: NodeJS.Timeout | null = null

onMounted(() => {
  checkAuth()
  
  // Update token expiry every second and check for expiration
  expiryInterval = setInterval(() => {
    if (isAuthenticated.value) {
      updateTokenExpiry()
      
      // ============================================
      // AUTO-LOGOUT: If token has expired, logout immediately
      // ============================================
      if (tokenExpiresIn.value <= 0) {
        console.log('Token expired - auto logging out...')
        handleLogout()
      }
    }
  }, 1000)
  
  router.afterEach(() => {
    checkAuth()
  })
})

onUnmounted(() => {
  if (expiryInterval) {
    clearInterval(expiryInterval)
  }
})
</script>