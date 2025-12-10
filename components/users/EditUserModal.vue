<template>
  <CustomModal v-model="isOpen" :max-width="'4xl'">
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
        <div>
          <h2 class="text-2xl font-bold text-[rgb(var(--foreground))]">Edit User</h2>
          <p class="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            {{ form.firstName }} {{ form.lastName }}
          </p>
        </div>
        <button @click="closeModal" class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
          <Icon name="lucide:x" class="w-6 h-6" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loadingUser" class="flex items-center justify-center py-12">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
      </div>

      <!-- Scrollable Content -->
      <div v-else class="overflow-y-auto px-6 py-4">
        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600" />
            <p class="text-sm font-semibold text-green-600">{{ successMessage }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Tabs -->
          <div class="border-b border-[rgb(var(--border))]">
            <div class="flex gap-1 overflow-x-auto">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                @click="activeTab = tab.id"
                :class="[
                  'px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2',
                  activeTab === tab.id
                    ? 'text-[rgb(var(--primary))] border-b-2 border-[rgb(var(--primary))]'
                    : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                ]"
              >
                <Icon :name="tab.icon" class="w-4 h-4" />
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Profile Tab -->
          <div v-show="activeTab === 'profile'" class="space-y-4">
            <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Personal Information</h3>
            
            <!-- Name Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  First Name <span class="text-[rgb(var(--destructive))]">*</span>
                </label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
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
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Middle Name
                </label>
                <input
                  v-model="form.middleName"
                  type="text"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Preferred Name
                </label>
                <input
                  v-model="form.preferredName"
                  type="text"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>
            </div>

            <!-- Date of Birth & Gender -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Date of Birth
                </label>
                <input
                  v-model="form.dateOfBirth"
                  type="date"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Gender
                </label>
                <select
                  v-model="form.gender"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                >
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact Tab -->
          <div v-show="activeTab === 'contact'" class="space-y-4">
            <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Contact Information</h3>
            
            <!-- Email (readonly) -->
            <div>
              <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Email <span class="text-[rgb(var(--destructive))]">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                readonly
                class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--muted-foreground))] cursor-not-allowed"
                title="Email cannot be changed"
              />
              <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                Email address cannot be changed for security reasons
              </p>
            </div>

            <!-- Phone Numbers -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Mobile Phone
                </label>
                <input
                  v-model="form.phoneMobile"
                  type="tel"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Landline
                </label>
                <input
                  v-model="form.phoneLandline"
                  type="tel"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Address Line 1
              </label>
              <input
                v-model="form.addressLine1"
                type="text"
                class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Address Line 2
              </label>
              <input
                v-model="form.addressLine2"
                type="text"
                class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  City
                </label>
                <input
                  v-model="form.city"
                  type="text"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  State/Province
                </label>
                <input
                  v-model="form.state"
                  type="text"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Postal Code
                </label>
                <input
                  v-model="form.postalCode"
                  type="text"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Country
              </label>
              <input
                v-model="form.country"
                type="text"
                class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
              />
            </div>

            <!-- Emergency Contact -->
            <div class="pt-4 border-t border-[rgb(var(--border))]">
              <h4 class="text-md font-semibold text-[rgb(var(--foreground))] mb-3">Emergency Contact</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Contact Name
                  </label>
                  <input
                    v-model="emergencyContact.name"
                    type="text"
                    class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Relationship
                  </label>
                  <input
                    v-model="emergencyContact.relationship"
                    type="text"
                    class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                    placeholder="Spouse, Parent, etc."
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Primary Phone
                  </label>
                  <input
                    v-model="emergencyContact.phonePrimary"
                    type="tel"
                    class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Secondary Phone
                  </label>
                  <input
                    v-model="emergencyContact.phoneSecondary"
                    type="tel"
                    class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Employment Tab -->
          <div v-show="activeTab === 'employment'" class="space-y-4">
            <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Employment Details</h3>
            
            <!-- Job Title & Employee ID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Employee ID
                </label>
                <input
                  v-model="form.employeeId"
                  type="text"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  placeholder="EMP-001"
                />
              </div>
            </div>

            <!-- Department & Manager -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Department
                </label>
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

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Reports To (Manager)
                </label>
                <select
                  v-model="form.reportsToId"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                >
                  <option value="">No manager</option>
                  <option v-for="manager in potentialManagers" :key="manager.id" :value="manager.id">
                    {{ manager.firstName }} {{ manager.lastName }} ({{ manager.jobTitle || 'No title' }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Employment Type & Dates -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Employment Type
                </label>
                <select
                  v-model="form.employmentType"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                >
                  <option value="FULLTIME">Full-time</option>
                  <option value="PARTTIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="TEMPORARY">Temporary</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Employment Start Date
                </label>
                <input
                  v-model="form.employmentStartDate"
                  type="date"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>
            </div>

            <!-- Role & Payroll ID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {{ userRoles.find((r: { value: any; }) => r.value === form.role)?.description }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Payroll ID
                </label>
                <input
                  v-model="form.payrollId"
                  type="text"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  placeholder="PAY-001"
                />
              </div>
            </div>

            <!-- Status Toggle -->
            <div class="pt-4 border-t border-[rgb(var(--border))]">
              <div class="flex items-center justify-between p-4 bg-[rgb(var(--muted))]/30 rounded-lg">
                <div class="flex items-start gap-3">
                  <Icon 
                    :name="form.isActive ? 'lucide:user-check' : 'lucide:user-x'" 
                    class="w-5 h-5 flex-shrink-0 mt-0.5"
                    :class="form.isActive ? 'text-green-600' : 'text-[rgb(var(--destructive))]'"
                  />
                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                      Account Status
                    </label>
                    <p class="text-xs text-[rgb(var(--muted-foreground))]">
                      {{ form.isActive ? 'User can log in and access the system' : 'User is deactivated and cannot log in' }}
                    </p>
                    <p v-if="cannotDeactivate && form.isActive" class="text-xs text-amber-600 mt-1">
                        {{ cannotDeactivateReason }}
                      </p>
                  </div>
                </div>
              <SwitchToggle 
                v-model="form.isActive" 
                :disabled="cannotDeactivate && form.isActive"
                :class="{ 'opacity-50 cursor-not-allowed': cannotDeactivate && form.isActive }"
              />             
             </div>
            </div>
          </div>

          <!-- Leave Allowance Tab -->
          <div v-show="activeTab === 'allowance'" class="space-y-4">
            <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Leave Balances</h3>
            
            <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <div class="flex gap-2">
                <Icon name="lucide:info" class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-blue-600">
                  These are the current leave balances. Leave requests will automatically deduct from these balances.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Annual Leave Balance (Days)
                </label>
                <input
                  v-model.number="form.annualLeaveBalance"
                  type="number"
                  step="0.5"
                  min="0"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Sick Leave Balance (Days)
                </label>
                <input
                  v-model.number="form.sickLeaveBalance"
                  type="number"
                  step="0.5"
                  min="0"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Carry Over Balance (Days)
                </label>
                <input
                  v-model.number="form.carryOverBalance"
                  type="number"
                  step="0.5"
                  min="0"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Custom Leave Allowance (Override)
                </label>
                <input
                  v-model.number="form.customLeaveAllowance"
                  type="number"
                  step="0.5"
                  min="0"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  placeholder="Leave empty for default"
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                  Override the organization's default leave allowance for this user
                </p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg p-3">
            <div class="flex items-center gap-2">
              <Icon name="lucide:alert-circle" class="w-4 h-4 text-[rgb(var(--destructive))]" />
              <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition text-[rgb(var(--foreground))] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-lg hover:bg-[rgb(var(--primary))]/90 disabled:opacity-50 flex items-center justify-center gap-2 transition font-medium"
            >
              <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <span>{{ loading ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </CustomModal>
</template>
<script setup lang="ts">
import type { User } from '~/types/user'

// ============================================
// USE API COMPOSABLE WITH AUTO-REFRESH
// ============================================
const { fetchUser, updateUser } = useApi()

interface Department {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: boolean
  userId: string | null
  departments: Department[]
  allUsers: User[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'userUpdated': [user: User]
}>()

// Use the composable
const { roles: userRoles } = useUserRoles()
const { getUser } = usePermissions()
const currentUser = computed(() => getUser())

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Computed to check if user can be deactivated
const cannotDeactivate = computed(() => {
  // Can't deactivate yourself
  if (props.userId === currentUser.value?.id) {
    return true
  }
  // Can't deactivate executives
  if (form.value.role === 'EXECUTIVE') {
    return true
  }
  return false
})

const cannotDeactivateReason = computed(() => {
  if (props.userId === currentUser.value?.id) {
    return 'You cannot deactivate your own account'
  }
  if (form.value.role === 'EXECUTIVE') {
    return 'Executive accounts cannot be deactivated'
  }
  return ''
})

// Tabs
const tabs = [
  { id: 'profile', label: 'Profile', icon: 'lucide:user' },
  { id: 'contact', label: 'Contact', icon: 'lucide:phone' },
  { id: 'employment', label: 'Employment', icon: 'lucide:briefcase' },
  { id: 'allowance', label: 'Leave Allowance', icon: 'lucide:calendar-days' },
]

const activeTab = ref('profile')

// Sort departments alphabetically
const sortedDepartments = computed(() => {
  return [...props.departments].sort((a, b) => a.name.localeCompare(b.name))
})

// Potential managers (exclude the current user being edited)
const potentialManagers = computed(() => {
  return props.allUsers.filter(u => u.id !== props.userId)
})

const form = ref<any>({
  firstName: '',
  lastName: '',
  middleName: '',
  preferredName: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  jobTitle: '',
  employeeId: '',
  departmentId: '',
  reportsToId: '',
  employmentType: 'FULLTIME',
  employmentStartDate: '',
  role: 'EMPLOYEE',
  payrollId: '',
  isActive: true,
  phoneMobile: '',
  phoneLandline: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  annualLeaveBalance: 0,
  sickLeaveBalance: 0,
  carryOverBalance: 0,
  customLeaveAllowance: null,
})

const emergencyContact = ref({
  name: '',
  relationship: '',
  phonePrimary: '',
  phoneSecondary: '',
})

const loading = ref(false)
const loadingUser = ref(false)
const error = ref('')
const successMessage = ref('')

// Fetch user data when modal opens OR when userId changes
watch([() => props.userId, () => props.modelValue], async ([newUserId, isOpen]) => {
  if (newUserId && isOpen) {
    // Reset form first to show loading state
    resetForm()
    await fetchUserData(newUserId)
  }
}, { immediate: true })

// ============================================
// FETCH USER DATA - WITH AUTO TOKEN REFRESH
// ============================================
const fetchUserData = async (userId: string) => {
  loadingUser.value = true
  error.value = ''

  try {
    // ✅ Use API composable - automatically handles token refresh
    const user = await fetchUser(userId)

    // Populate form
    form.value = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      middleName: user.middleName || '',
      preferredName: user.preferredName || '',
      email: user.email || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user.gender || '',
      jobTitle: user.jobTitle || '',
      employeeId: user.employeeId || '',
      departmentId: user.departmentId || '',
      reportsToId: user.reportsToId || '',
      employmentType: user.employmentType || 'FULLTIME',
      employmentStartDate: user.employmentStartDate ? new Date(user.employmentStartDate).toISOString().split('T')[0] : '',
      role: user.role || 'EMPLOYEE',
      payrollId: user.payrollId || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
      phoneMobile: user.phoneMobile || '',
      phoneLandline: user.phoneLandline || '',
      addressLine1: user.addressLine1 || '',
      addressLine2: user.addressLine2 || '',
      city: user.city || '',
      state: user.state || '',
      postalCode: user.postalCode || '',
      country: user.country || '',
      annualLeaveBalance: user.annualLeaveBalance || 0,
      sickLeaveBalance: user.sickLeaveBalance || 0,
      carryOverBalance: user.carryOverBalance || 0,
      customLeaveAllowance: user.customLeaveAllowance || null,
    }

    // Populate emergency contact
    if (user.emergencyContact) {
      const ec = user.emergencyContact as any
      emergencyContact.value = {
        name: ec.name || '',
        relationship: ec.relationship || '',
        phonePrimary: ec.phonePrimary || '',
        phoneSecondary: ec.phoneSecondary || '',
      }
    } else {
      // Reset emergency contact if none exists
      emergencyContact.value = {
        name: '',
        relationship: '',
        phonePrimary: '',
        phoneSecondary: '',
      }
    }
  } catch (err: any) {
    console.error('❌ Failed to fetch user:', err)
    error.value = err.data?.message || err.message || 'Failed to load user data'
  } finally {
    loadingUser.value = false
  }
}

// ============================================
// SUBMIT FORM - WITH AUTO TOKEN REFRESH
// ============================================
const handleSubmit = async () => {
  if (!props.userId) return

  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    // Prepare update payload
    const updateData: any = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      middleName: form.value.middleName || null,
      preferredName: form.value.preferredName || null,
  dateOfBirth: form.value.dateOfBirth || undefined, // Changed from null
      gender: form.value.gender || null,
      jobTitle: form.value.jobTitle || null,
      employeeId: form.value.employeeId || null,
      departmentId: form.value.departmentId || null,
      reportsToId: form.value.reportsToId || null,
      employmentType: form.value.employmentType,
      employmentStartDate: form.value.employmentStartDate || null,
      role: form.value.role,
      payrollId: form.value.payrollId || null,
      isActive: form.value.isActive,
      phoneMobile: form.value.phoneMobile || null,
      phoneLandline: form.value.phoneLandline || null,
      addressLine1: form.value.addressLine1 || null,
      addressLine2: form.value.addressLine2 || null,
      city: form.value.city || null,
      state: form.value.state || null,
      postalCode: form.value.postalCode || null,
      country: form.value.country || null,
      annualLeaveBalance: form.value.annualLeaveBalance,
      sickLeaveBalance: form.value.sickLeaveBalance,
      carryOverBalance: form.value.carryOverBalance,
      customLeaveAllowance: form.value.customLeaveAllowance || null,
      emergencyContact: emergencyContact.value.name ? emergencyContact.value : null,
    }

    // ✅ Use API composable - automatically handles token refresh
    const updatedUser = await updateUser(props.userId, updateData)

    successMessage.value = 'User updated successfully!'
    
    // Emit event so parent can refresh
    emit('userUpdated', updatedUser)

    // Close modal after 1.5 seconds
    setTimeout(() => {
      closeModal()
    }, 1500)
  } catch (err: any) {
    console.error('❌ User update error:', err)
    error.value = err.data?.message || err.message || 'Failed to update user'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  isOpen.value = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

const resetForm = () => {
  activeTab.value = 'profile'
  error.value = ''
  successMessage.value = ''
  form.value = {
    firstName: '',
    lastName: '',
    middleName: '',
    preferredName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    jobTitle: '',
    employeeId: '',
    departmentId: '',
    reportsToId: '',
    employmentType: 'FULLTIME',
    employmentStartDate: '',
    role: 'EMPLOYEE',
    payrollId: '',
    isActive: true,
    phoneMobile: '',
    phoneLandline: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    annualLeaveBalance: 0,
    sickLeaveBalance: 0,
    carryOverBalance: 0,
    customLeaveAllowance: null,
  }
  emergencyContact.value = {
    name: '',
    relationship: '',
    phonePrimary: '',
    phoneSecondary: '',
  }
}
</script>
