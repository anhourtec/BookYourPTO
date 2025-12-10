<template>
  <div>
    <!-- Desktop Profile Button -->
    <button
      v-if="!isMobile"
      @click="openProfileModal"
      class="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
    >
      <Icon name="lucide:user" class="w-4 h-4" />
      My Profile
    </button>

    <!-- Mobile Profile Button -->
    <button
      v-else
      @click="openProfileModal"
      class="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full text-left"
    >
      <Icon name="lucide:user" class="w-5 h-5" />
      My Profile
    </button>

    <!-- Edit User Modal for Profile -->
    <EditUserModal
      v-if="user"
      v-model="showProfileModal"
      :user-id="user?.id || null"
      :departments="departments"
      :all-users="allUsers"
      @user-updated="handleProfileUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import EditUserModal from '~/components/users/EditUserModal.vue'
import type { User } from '~/types/user'

interface Props {
  user: any
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
})

const emit = defineEmits<{
  'profile-updated': [user: User]
  'close-mobile-menu': []
}>()

const api = useApi()

const showProfileModal = ref(false)
const departments = ref<any[]>([])
const allUsers = ref<User[]>([])

const openProfileModal = async () => {
  // Close mobile menu if open
  emit('close-mobile-menu')
  
  // Load departments and users data for the modal
  try {
    const [departmentsData, usersData] = await Promise.all([
      api.fetchDepartments(),
      api.fetchUsers()
    ])
    
    departments.value = departmentsData
    allUsers.value = usersData as User[]
    
    showProfileModal.value = true
  } catch (err) {
    console.error('Error loading data for profile modal:', err)
    alert('Failed to load profile data')
  }
}

const handleProfileUpdated = (updatedUser: User) => {
  // Update localStorage
  localStorage.setItem('user', JSON.stringify(updatedUser))
  
  // Emit event to parent to update header display
  emit('profile-updated', updatedUser)
}
</script>