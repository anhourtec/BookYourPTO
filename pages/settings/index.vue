<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <!-- Header -->
    <div class="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))] sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))] mb-1 truncate">Settings</h1>
            <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] truncate">
              Manage your organization's configuration
            </p>
          </div>
          
          <!-- Mobile Settings Menu Toggle -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="lg:hidden p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors flex-shrink-0"
            :aria-label="showMobileMenu ? 'Close menu' : 'Open settings menu'"
          >
            <Icon 
              :name="showMobileMenu ? 'lucide:x' : 'lucide:panel-left'" 
              class="w-6 h-6 text-[rgb(var(--foreground))]" 
            />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex min-h-[calc(100vh-9rem)] sm:min-h-[calc(100vh-11rem)]">
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
            style="top: 0;"
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
            class="fixed lg:static left-0 w-64 sm:w-72 lg:w-64 flex-shrink-0 bg-[rgb(var(--card))] lg:bg-transparent border-r border-[rgb(var(--border))] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:pr-6 lg:pl-0 z-50 overflow-y-auto shadow-xl lg:shadow-none"
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
        <main class="flex-1 py-4 sm:py-6 lg:py-8 lg:pl-6 xl:pl-8 min-w-0">
          <!-- Use v-if instead of v-show for lazy loading -->
          <GeneralSettings v-if="activeSection === 'general'" />
          <CarryForwardSettings v-if="activeSection === 'carryforward'" />
          <LeaveTypesSettings v-if="activeSection === 'leavetypes'" />
          <DepartmentsSettings v-if="activeSection === 'departments'" />
          <PublicHolidaysSettings v-if="activeSection === 'holidays'" />
          <EmailSettings v-if="activeSection === 'email'" />
          <DeleteOrganizationSettings v-if="activeSection === 'dangerzone'" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GeneralSettings from '../../components/settings/GeneralSettings.vue'
import CarryForwardSettings from '../../components/settings/CarryForwardSettings.vue'
import LeaveTypesSettings from '../../components/settings/LeaveTypesSettings.vue'
import DepartmentsSettings from '../../components/settings/DepartmentsSettings.vue'
import PublicHolidaysSettings from '../../components/settings/PublicHolidaysSettings.vue'
import EmailSettings from '../../components/settings/EmailSettings.vue'
import DeleteOrganizationSettings from '../../components/settings/DeleteOrganizationSettings.vue'

const { canAccessSettings, getUser } = usePermissions()

const currentUser = computed(() => getUser())
const isExecutive = computed(() => currentUser.value?.role === 'EXECUTIVE')

const activeSection = ref('general')
const showMobileMenu = ref(false)
const isLargeScreen = ref(false)
const headerHeight = ref(0)

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 1024
}

const updateHeaderHeight = () => {
  // Calculate header height dynamically
  const header = document.querySelector('header')
  if (header) {
    headerHeight.value = header.offsetHeight
  } else {
    // Fallback heights based on breakpoints
    if (window.innerWidth >= 640) {
      headerHeight.value = 108 // sm and above
    } else {
      headerHeight.value = 92 // mobile
    }
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
  window.addEventListener('resize', () => {
    updateScreenSize()
    updateHeaderHeight()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
  window.removeEventListener('resize', updateHeaderHeight)
})

const navigationItems = [
  { id: 'general', label: 'General', icon: 'lucide:settings', isDanger: false },
  { id: 'carryforward', label: 'Carry forward', icon: 'lucide:calendar-arrow-up', isDanger: false },
  { id: 'leavetypes', label: 'Leave types', icon: 'lucide:calendar-days', isDanger: false },
  { id: 'departments', label: 'Departments', icon: 'lucide:building-2', isDanger: false },
  { id: 'holidays', label: 'Public holidays', icon: 'lucide:calendar', isDanger: false },
  { id: 'email', label: 'Email', icon: 'lucide:mail', isDanger: false },
  { id: 'dangerzone', label: 'Danger zone', icon: 'lucide:alert-triangle', isDanger: true, executiveOnly: true },
]

// Only show items that user has access to
const visibleNavigationItems = computed(() => {
  return navigationItems.filter(item => {
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