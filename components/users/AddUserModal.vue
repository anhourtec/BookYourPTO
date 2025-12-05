<template>
  <CustomModal v-model="isOpen">
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
        <h2 class="text-2xl font-bold text-[rgb(var(--foreground))]">Add New User</h2>
        <button @click="closeModal" class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
          <Icon name="lucide:x" class="w-6 h-6" />
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto px-6 py-4">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                First Name <span class="text-[rgb(var(--destructive))]">*</span>
              </label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                placeholder="John"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Last Name <span class="text-[rgb(var(--destructive))]">*</span>
              </label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                placeholder="Doe"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Email <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
              placeholder="john@company.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Password <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-3 py-2 pr-10 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition"
              >
                <Icon v-if="showPassword" name="lucide:eye-off" class="w-4 h-4" />
                <Icon v-else name="lucide:eye" class="w-4 h-4" />
              </button>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <button
                type="button"
                @click="generatePassword"
                class="text-xs text-[rgb(var(--primary))] hover:underline font-medium"
              >
                Generate Password
              </button>
              <span class="text-xs text-[rgb(var(--muted-foreground))]">• At least 8 characters</span>
            </div>
          </div>

          <!-- Job Title -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Job Title
            </label>
            <input
              v-model="form.jobTitle"
              type="text"
              class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
              placeholder="Software Engineer"
            />
          </div>

          <!-- Department with Quick Add -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-[rgb(var(--foreground))]">
                Department
              </label>
              <button
                v-if="!showQuickAddDept"
                type="button"
                @click="showQuickAddDept = true"
                class="text-xs text-[rgb(var(--primary))] hover:underline font-medium flex items-center gap-1"
              >
                <Icon name="lucide:plus" class="w-3 h-3" />
                Quick Add
              </button>
            </div>

            <!-- Quick Add Department Form -->
            <div v-if="showQuickAddDept" class="mb-3 p-3 bg-[rgb(var(--muted))]/50 border border-[rgb(var(--border))] rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-[rgb(var(--foreground))]">New Department</p>
                <button
                  type="button"
                  @click="cancelQuickAddDept"
                  class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                >
                  <Icon name="lucide:x" class="w-4 h-4" />
                </button>
              </div>
              
              <div class="mb-2">
                <input
                  v-model="quickDept.name"
                  type="text"
                  placeholder="Department Name"
                  class="w-full px-2 py-1.5 text-sm bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              <div class="mb-2">
                <input
                  v-model="quickDept.code"
                  type="text"
                  placeholder="Code (optional)"
                  maxlength="10"
                  class="w-full px-2 py-1.5 text-sm bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  Preview: <span class="font-medium">{{ quickDeptCodePreview }}</span>
                </p>
              </div>

              <button
                type="button"
                @click="handleQuickAddDept"
                :disabled="!quickDept.name || addingDept"
                class="w-full px-3 py-1.5 text-sm bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded hover:bg-[rgb(var(--primary))]/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icon v-if="addingDept" name="lucide:loader-2" class="w-3 h-3 animate-spin" />
                <span>{{ addingDept ? 'Adding...' : 'Add Department' }}</span>
              </button>
            </div>

            <select
              v-model="form.departmentId"
              class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
            >
              <option value="">No department</option>
              <option v-for="dept in sortedDepartments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Role
            </label>
            <select
              v-model="form.role"
              class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
            >
              <option v-for="role in userRoles" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
            <p v-if="form.role" class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
              {{ userRoles.find(r => r.value === form.role)?.description }}
            </p>
          </div>

          <!-- Info Notice -->
          <div class="bg-[rgb(var(--muted))]/50 border border-[rgb(var(--border))] rounded-lg p-3">
            <div class="flex gap-2">
              <Icon name="lucide:info" class="w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0 mt-0.5" />
              <p class="text-xs text-[rgb(var(--muted-foreground))]">
                The user will be able to log in immediately with this password. Make sure to share it securely with them.
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg p-3">
            <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition text-[rgb(var(--foreground))]"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-lg hover:bg-[rgb(var(--primary))]/90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <span>{{ loading ? 'Adding...' : 'Add User' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
interface Department {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: boolean
  departments: Department[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'userAdded': [user: any]
  'departmentAdded': [department: Department]
}>()

// Use the composable
const { roles: userRoles } = useUserRoles()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Local departments list (includes newly added ones)
const localDepartments = ref<Department[]>([...props.departments])

// Watch for prop changes
watch(() => props.departments, (newDepts) => {
  localDepartments.value = [...newDepts]
}, { deep: true })

// Sort departments alphabetically
const sortedDepartments = computed(() => {
  return [...localDepartments.value].sort((a, b) => a.name.localeCompare(b.name))
})

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  jobTitle: '',
  departmentId: '',
  role: 'EMPLOYEE',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

// Quick Add Department
const showQuickAddDept = ref(false)
const addingDept = ref(false)
const quickDept = ref({
  name: '',
  code: ''
})

// Helper function for code generation (same as backend)
const generateCodePreview = (name: string, customCode?: string): string => {
  if (customCode) {
    return customCode.toUpperCase()
  }
  
  if (!name) {
    return 'DEPT'
  }
  
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
  
  if (words.length === 0) return 'DEPT'
  
  if (words.length === 1) {
    return words[0]?.substring(0, 4).toUpperCase() || 'DEPT'
  } else {
    return words
      .slice(0, 4)
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }
}

// Preview code for quick add department
const quickDeptCodePreview = computed(() => {
  return generateCodePreview(quickDept.value.name, quickDept.value.code)
})

const handleQuickAddDept = async () => {
  if (!quickDept.value.name) return
  
  addingDept.value = true
  try {
    const token = localStorage.getItem('auth_token')
    
    const newDept = await $fetch<Department>('/api/departments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: {
        name: quickDept.value.name,
        ...(quickDept.value.code && { code: quickDept.value.code.toUpperCase() }),
      },
    })

    // Add to local list
    localDepartments.value.push(newDept)
    
    // Auto-select the new department
    form.value.departmentId = newDept.id
    
    // Emit event so parent can refresh
    emit('departmentAdded', newDept)
    
    // Reset and close quick add form
    quickDept.value = { name: '', code: '' }
    showQuickAddDept.value = false
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to add department'
  } finally {
    addingDept.value = false
  }
}

const cancelQuickAddDept = () => {
  quickDept.value = { name: '', code: '' }
  showQuickAddDept.value = false
}

const generatePassword = () => {
  const length = 12
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  const allChars = uppercase + lowercase + numbers + symbols
  
  let password = ''
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  password = password.split('').sort(() => Math.random() - 0.5).join('')
  
  form.value.password = password
  showPassword.value = true
}

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobTitle: '',
    departmentId: '',
    role: 'EMPLOYEE',
  }
  error.value = ''
  showPassword.value = false
  showQuickAddDept.value = false
  quickDept.value = { name: '', code: '' }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('auth_token')
    
    const response = await $fetch('/api/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: form.value,
    })

    emit('userAdded', response)
    closeModal()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to add user'
  } finally {
    loading.value = false
  }
}
</script>
