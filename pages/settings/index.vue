<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex min-h-[calc(100vh-5rem)]">
        <!-- Mobile Overlay -->
        <Transition
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showMobileMenu"
            @click="showMobileMenu = false"
            class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          ></div>
        </Transition>
        
        <!-- Left Sidebar Navigation -->
        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-300 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
        >
          <aside
            v-show="showMobileMenu || isLargeScreen"
            class="fixed lg:static left-0 w-64 sm:w-72 lg:w-64 flex-shrink-0 bg-[rgb(var(--card))] lg:bg-transparent border-r border-[rgb(var(--border))] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:pr-6 lg:pl-0 overflow-y-auto shadow-xl lg:shadow-none z-50 lg:z-auto"
            :style="{ top: headerHeight + 'px', bottom: 0, height: `calc(100vh - ${headerHeight}px)` }"
          >
            <!-- Mobile Header in Sidebar -->
            <div class="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-[rgb(var(--border))]">
              <span class="text-sm font-semibold text-[rgb(var(--foreground))]">Settings Menu</span>
              <button
                @click="showMobileMenu = false"
                class="p-1.5 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
              >
                <Icon name="lucide:x" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              </button>
            </div>
            
            <nav class="space-y-1">
              <button
                v-for="item in visibleNavigationItems"
                :key="item.id"
                @click="selectSection(item.id)"
                class="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all"
                :class="[
                  activeSection === item.id 
                    ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow-sm' 
                    : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]',
                  item.isDanger ? 'border border-[rgb(var(--destructive))]/30' : ''
                ]"
              >
                <div class="flex items-center gap-3">
                  <Icon :name="item.icon" class="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                  <span class="truncate">{{ item.label }}</span>
                </div>
              </button>
            </nav>
          </aside>
        </Transition>
        
        <!-- Right Content Area -->
        <main class="flex-1 py-4 sm:py-6 lg:py-8 lg:pl-6 xl:pl-8 min-w-0 overflow-x-hidden">
          <!-- Mobile menu toggle button (visible only on mobile when sidebar is hidden) -->
          <div class="lg:hidden mb-4 flex items-center justify-between">
            <h1 class="text-2xl font-bold text-[rgb(var(--foreground))]">Settings</h1>
            <button
              @click="showMobileMenu = !showMobileMenu"
              class="p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
              :aria-label="showMobileMenu ? 'Close menu' : 'Open settings menu'"
            >
              <Icon 
                name="lucide:panel-left" 
                class="w-6 h-6 text-[rgb(var(--foreground))]" 
              />
            </button>
          </div>

          <!-- Change Password - Available to ALL users -->
          <ChangePasswordSettings v-if="activeSection === 'password'" />

          <!-- Admin-only sections - Only for ADMINISTRATOR and EXECUTIVE -->
          <template v-if="canAccessAdminSettings()">
            <GeneralSettings v-if="activeSection === 'general'" />
            <CarryForwardSettings v-if="activeSection === 'carryforward'" />
            <LeaveTypesSettings v-if="activeSection === 'leavetypes'" />
            <DepartmentsSettings v-if="activeSection === 'departments'" />
            <PublicHolidaysSettings v-if="activeSection === 'holidays'" />
            <EmailSettings v-if="activeSection === 'email'" />
            <DeleteOrganizationSettings v-if="activeSection === 'dangerzone'" />
          </template>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GeneralSettings from '../../components/settings/GeneralSettings.vue'
import ChangePasswordSettings from '../../components/settings/ChangePasswordSettings.vue'
import CarryForwardSettings from '../../components/settings/CarryForwardSettings.vue'
import LeaveTypesSettings from '../../components/settings/LeaveTypesSettings.vue'
import DepartmentsSettings from '../../components/settings/DepartmentsSettings.vue'
import PublicHolidaysSettings from '../../components/settings/PublicHolidaysSettings.vue'
import EmailSettings from '../../components/settings/EmailSettings.vue'
import DeleteOrganizationSettings from '../../components/settings/DeleteOrganizationSettings.vue'

const { canAccessSettings, canAccessAdminSettings, getUser } = usePermissions()

const currentUser = computed(() => getUser())
const isExecutive = computed(() => currentUser.value?.role === 'EXECUTIVE')
const isAdmin = computed(() => canAccessAdminSettings())

const showMobileMenu = ref(false)
const isLargeScreen = ref(false)
const headerHeight = ref(0)

// Default to 'password' for employees, 'general' for admins
const activeSection = ref(isAdmin.value ? 'general' : 'password')

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 1024
}

const updateHeaderHeight = () => {
  // Calculate header height dynamically from the app's main header
  const header = document.querySelector('header') || document.querySelector('nav')
  if (header) {
    headerHeight.value = header.offsetHeight
  } else {
    // Fallback heights based on breakpoints
    headerHeight.value = window.innerWidth >= 640 ? 80 : 72
  }
}

onMounted(() => {
  if (!canAccessSettings()) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true,
    })
  }
  updateScreenSize()
  updateHeaderHeight()
  
  const resizeHandler = () => {
    updateScreenSize()
    updateHeaderHeight()
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // Also update header height when DOM changes (in case header renders late)
  setTimeout(updateHeaderHeight, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
  window.removeEventListener('resize', updateHeaderHeight)
})

// Base navigation items with access control
const navigationItems = [
  // Change Password - Available to ALL users (placed first for employees)
  { id: 'password', label: 'Change Password', icon: 'lucide:key-round', isDanger: false, adminOnly: false },
  
  // Admin-only sections
  { id: 'general', label: 'General', icon: 'lucide:settings', isDanger: false, adminOnly: true },
  { id: 'carryforward', label: 'Carry forward', icon: 'lucide:calendar-arrow-up', isDanger: false, adminOnly: true },
  { id: 'leavetypes', label: 'Leave types', icon: 'lucide:calendar-days', isDanger: false, adminOnly: true },
  { id: 'departments', label: 'Departments', icon: 'lucide:building-2', isDanger: false, adminOnly: true },
  { id: 'holidays', label: 'Public holidays', icon: 'lucide:calendar', isDanger: false, adminOnly: true },
  { id: 'email', label: 'Email', icon: 'lucide:mail', isDanger: false, adminOnly: true },
  { id: 'dangerzone', label: 'Danger zone', icon: 'lucide:alert-triangle', isDanger: true, executiveOnly: true, adminOnly: true },
]

// Filter navigation items based on user permissions
const visibleNavigationItems = computed(() => {
  return navigationItems.filter(item => {
    // Show Change Password to everyone
    if (!item.adminOnly) {
      return true
    }
    
    // Show admin sections only to admins
    if (item.adminOnly && !canAccessAdminSettings()) {
      return false
    }
    
    // Show danger zone only to executives
    if (item.executiveOnly) {
      return isExecutive.value
    }
    
    return true
  })
})

const selectSection = (sectionId: string) => {
  activeSection.value = sectionId
  showMobileMenu.value = false
}
</script>