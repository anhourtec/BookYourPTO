<template>
  <div class="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-sm p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-[rgb(var(--foreground))]">Leave types</h2>
          <p class="text-sm text-[rgb(var(--muted-foreground))]">
            Create different categories for different days off.
          </p>
        </div>
        <button
          v-if="canEditSettings()"
          @click="openAddModal"
          class="px-4 py-2 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          Add a new leave type
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-5 h-5 text-[rgb(var(--destructive))]" />
          <p class="text-sm text-[rgb(var(--destructive))]">{{ error }}</p>
        </div>
      </div>

      <!-- Leave Types List -->
      <div class="space-y-3">
        <div
          v-for="leaveType in leaveTypes"
          :key="leaveType.id"
          class="flex items-center justify-between p-4 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg hover:border-[rgb(var(--primary))]/50 transition-colors group"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: leaveType.color + '20' }"
            >
              <Icon
                v-if="leaveType.icon"
                :name="leaveType.icon"
                class="w-6 h-6"
                :style="{ color: leaveType.color }"
              />
              <Icon
                v-else
                name="lucide:calendar"
                class="w-6 h-6"
                :style="{ color: leaveType.color }"
              />
            </div>
            <div>
              <h3 class="font-semibold text-[rgb(var(--foreground))]">{{ leaveType.name }}</h3>
              <p class="text-sm text-[rgb(var(--muted-foreground))]">
                {{ getLeaveTypeCodeLabel(leaveType.code) }}
                <span v-if="leaveType.annualAllowance"> • {{ leaveType.annualAllowance }} days/year</span>
                <span v-if="!leaveType.isActive" class="text-[rgb(var(--destructive))]"> • Inactive</span>
              </p>
            </div>
          </div>
          
          <div v-if="canEditSettings()" class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="openEditModal(leaveType)"
              class="p-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors"
              title="Edit leave type"
            >
              <Icon name="lucide:pencil" class="w-4 h-4" />
            </button>
            <button
              @click="confirmDelete(leaveType)"
              class="p-2 text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10 rounded transition-colors"
              title="Delete leave type"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-if="leaveTypes.length === 0" class="text-center py-12">
          <Icon name="lucide:calendar-x" class="w-12 h-12 mx-auto text-[rgb(var(--muted-foreground))] mb-3" />
          <p class="text-[rgb(var(--muted-foreground))]">No leave types configured yet.</p>
        </div>
      </div>
    </template>
  </div>

  <!-- Add/Edit Leave Type Modal -->
  <CustomModal v-model="showModal">
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
        <h2 class="text-2xl font-bold text-[rgb(var(--foreground))]">
          {{ isEditMode ? 'Edit Leave Type' : 'Add Leave Type' }}
        </h2>
        <button @click="closeModal" class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
          <Icon name="lucide:x" class="w-6 h-6" />
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto px-6 py-4">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Leave Type Name -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Leave type name <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Annual Leave"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            />
          </div>

          <!-- Leave Type Code -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Leave type code <span class="text-[rgb(var(--destructive))]">*</span>
            </label>
            <select
              v-model="form.code"
              required
              :disabled="isEditMode"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select leave type code</option>
              <option v-for="code in availableLeaveTypeCodes" :key="code.value" :value="code.value">
                {{ code.label }}
              </option>
            </select>
            <p v-if="isEditMode" class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Leave type code cannot be changed after creation
            </p>
          </div>

          <!-- Show in calendar as -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Show in calendar as
            </label>
            <select
              v-model="form.calendarDisplay"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            >
              <option value="BUSY">Busy</option>
              <option value="AVAILABLE">Available</option>
              <option value="OUT_OF_OFFICE">Out of office</option>
            </select>
          </div>

          <!-- Visibility -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Visibility
            </label>
            <select
              v-model="form.visibility"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
            >
              <option value="PUBLIC">Public - Everyone can see</option>
              <option value="PRIVATE">Private - Only user and managers</option>
              <option value="CONFIDENTIAL">Confidential - Only user</option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Optional description"
              class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition resize-none"
            />
          </div>

          <!-- Toggle Switches -->
          <div class="space-y-4 pt-4 border-t border-[rgb(var(--border))]">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-[rgb(var(--foreground))]">
                  Deducts from annual allowance
                </label>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Should this leave type reduce the user's annual allowance?
                </p>
              </div>
              <SwitchToggle v-model="form.deductsFromAllowance" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-[rgb(var(--foreground))]">
                  Needs manager approval
                </label>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Requires approval before it's confirmed
                </p>
              </div>
              <SwitchToggle v-model="form.requiresApproval" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-[rgb(var(--foreground))]">
                  Paid leave
                </label>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Is this a paid leave type?
                </p>
              </div>
              <SwitchToggle v-model="form.paidLeave" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-[rgb(var(--foreground))]">
                  Active
                </label>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Can users request this leave type?
                </p>
              </div>
              <SwitchToggle v-model="form.isActive" />
            </div>
          </div>

          <!-- Annual Allowance -->
          <div v-if="form.deductsFromAllowance" class="pt-4 border-t border-[rgb(var(--border))]">
            <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Annual allowance (days per year)
            </label>
            <input
              v-model.number="form.annualAllowance"
              type="number"
              min="0"
              max="365"
              step="0.5"
              placeholder="e.g., 20"
              class="w-32 px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition text-center"
            />
          </div>

          <!-- Color and Icon -->
          <div class="pt-4 border-t border-[rgb(var(--border))]">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Pick a colour
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="form.color"
                    type="color"
                    class="w-12 h-12 rounded-lg cursor-pointer border-2 border-[rgb(var(--border))]"
                  />
                  <input
                    v-model="form.color"
                    type="text"
                    placeholder="#3b82f6"
                    class="flex-1 px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Pick an icon
                </label>
                <select
                  v-model="form.icon"
                  class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
                >
                  <option value="">Default</option>
                  <option value="lucide:umbrella-off">Umbrella</option>
                  <option value="lucide:heart-pulse">Medical</option>
                  <option value="lucide:baby">Baby</option>
                  <option value="lucide:briefcase">Work</option>
                  <option value="lucide:home">Home</option>
                  <option value="lucide:plane">Travel</option>
                  <option value="lucide:graduation-cap">Study</option>
                  <option value="lucide:users">Meeting</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Form Error -->
          <div v-if="formError" class="bg-[rgb(var(--destructive))]/10 border border-[rgb(var(--destructive))]/20 rounded-lg p-3">
            <p class="text-sm text-[rgb(var(--destructive))]">{{ formError }}</p>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-6 py-2.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <span>{{ saving ? 'Saving...' : 'Save' }}</span>
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </CustomModal>

  <!-- Delete Confirmation Modal -->
  <CustomModal v-model="showDeleteConfirm">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-[rgb(var(--destructive))]/10 flex items-center justify-center">
          <Icon name="lucide:alert-triangle" class="w-6 h-6 text-[rgb(var(--destructive))]" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Delete Leave Type</h3>
          <p class="text-sm text-[rgb(var(--muted-foreground))]">This action cannot be undone</p>
        </div>
      </div>

      <p class="text-sm text-[rgb(var(--foreground))] mb-6">
        Are you sure you want to delete <strong>{{ leaveTypeToDelete?.name }}</strong>?
        This will affect all existing leave requests using this type.
      </p>

      <div class="flex gap-3">
        <button
          @click="showDeleteConfirm = false"
          class="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))]"
        >
          Cancel
        </button>
        <button
          @click="handleDelete"
          :disabled="deleting"
          class="flex-1 px-4 py-2 bg-[rgb(var(--destructive))] text-white rounded-lg hover:bg-[rgb(var(--destructive))]/90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          <Icon v-if="deleting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ deleting ? 'Deleting...' : 'Delete' }}</span>
        </button>
      </div>
    </div>
  </CustomModal>
</template>

<script setup lang="ts">
const { canAccessSettings } = usePermissions()

const canEditSettings = () => {
  return canAccessSettings()
}

interface LeaveType {
  id: string
  name: string
  code: string
  description?: string
  color: string
  icon?: string
  requiresApproval: boolean
  paidLeave: boolean
  annualAllowance?: number
  isActive: boolean
}

// All available leave type codes from enum
const LEAVE_TYPE_CODES = [
  { value: 'ANNUAL', label: 'Annual/Vacation Leave' },
  { value: 'SICK_PAID', label: 'Paid Sick Leave' },
  { value: 'SICK_UNPAID', label: 'Unpaid Sick Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'PATERNITY', label: 'Paternity Leave' },
  { value: 'PARENTAL', label: 'Parental Leave' },
  { value: 'BEREAVEMENT', label: 'Bereavement/Compassionate Leave' },
  { value: 'JURY_DUTY', label: 'Jury Duty' },
  { value: 'MEDICAL', label: 'Medical Leave' },
  { value: 'SABBATICAL', label: 'Sabbatical Leave' },
  { value: 'STUDY', label: 'Study Leave' },
  { value: 'MILITARY', label: 'Military Leave' },
  { value: 'MARRIAGE', label: 'Marriage Leave' },
  { value: 'MOVING', label: 'Moving/Relocation Leave' },
  { value: 'VOLUNTEER', label: 'Volunteer Leave' },
  { value: 'UNPAID', label: 'Unpaid Leave' },
  { value: 'WFH', label: 'Work From Home (tracking)' },
  { value: 'MEETING', label: 'Out for Meeting' },
  { value: 'TRAINING', label: 'Training/Conference' },
  { value: 'SPECIAL', label: 'Special Circumstances' },
  { value: 'EMERGENCY', label: 'Emergency Leave' },
  { value: 'QUARANTINE', label: 'Quarantine/Isolation' },
  { value: 'COMPENSATORY', label: 'Compensatory Time Off' },
  { value: 'RELIGIOUS', label: 'Religious Observance' },
]

const loading = ref(true)
const error = ref('')
const leaveTypes = ref<LeaveType[]>([])

// Modal states
const showModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const formError = ref('')

// Delete confirmation
const showDeleteConfirm = ref(false)
const leaveTypeToDelete = ref<LeaveType | null>(null)
const deleting = ref(false)

// Form data
const form = ref({
  name: '',
  code: '',
  description: '',
  color: '#3b82f6',
  icon: '',
  calendarDisplay: 'BUSY',
  visibility: 'PUBLIC',
  requiresApproval: true,
  deductsFromAllowance: true,
  paidLeave: true,
  annualAllowance: null as number | null,
  isActive: true,
})

const editingId = ref<string | null>(null)

// Computed: Available leave type codes (exclude already used ones in add mode)
const availableLeaveTypeCodes = computed(() => {
  if (isEditMode.value) {
    return LEAVE_TYPE_CODES
  }
  const usedCodes = leaveTypes.value.map(lt => lt.code)
  return LEAVE_TYPE_CODES.filter(code => !usedCodes.includes(code.value))
})

// Get label for leave type code
const getLeaveTypeCodeLabel = (code: string) => {
  return LEAVE_TYPE_CODES.find(c => c.value === code)?.label || code
}

// Fetch leave types on mount
onMounted(async () => {
  await fetchLeaveTypes()
})

const fetchLeaveTypes = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    const data = await $fetch('/api/leave-types', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    leaveTypes.value = data as LeaveType[]
  } catch (err: any) {
    console.error('Error fetching leave types:', err)
    error.value = err.data?.message || err.message || 'Failed to load leave types'
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditMode.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (leaveType: LeaveType) => {
  isEditMode.value = true
  editingId.value = leaveType.id
  form.value = {
    name: leaveType.name,
    code: leaveType.code,
    description: leaveType.description || '',
    color: leaveType.color,
    icon: leaveType.icon || '',
    calendarDisplay: 'BUSY',
    visibility: 'PUBLIC',
    requiresApproval: leaveType.requiresApproval,
    deductsFromAllowance: !!leaveType.annualAllowance,
    paidLeave: leaveType.paidLeave,
    annualAllowance: leaveType.annualAllowance || null,
    isActive: leaveType.isActive,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    description: '',
    color: '#3b82f6',
    icon: '',
    calendarDisplay: 'BUSY',
    visibility: 'PUBLIC',
    requiresApproval: true,
    deductsFromAllowance: true,
    paidLeave: true,
    annualAllowance: null,
    isActive: true,
  }
  formError.value = ''
}

const handleSubmit = async () => {
  saving.value = true
  formError.value = ''
  
  try {
    const token = localStorage.getItem('auth_token')
    const payload = {
      name: form.value.name,
      code: form.value.code,
      description: form.value.description || null,
      color: form.value.color,
      icon: form.value.icon || null,
      requiresApproval: form.value.requiresApproval,
      paidLeave: form.value.paidLeave,
      annualAllowance: form.value.deductsFromAllowance ? form.value.annualAllowance : null,
      isActive: form.value.isActive,
    }

    if (isEditMode.value && editingId.value) {
      await $fetch(`/api/leave-types/${editingId.value}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload,
      })
    } else {
      await $fetch('/api/leave-types', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload,
      })
    }

    closeModal()
    await fetchLeaveTypes()
  } catch (err: any) {
    formError.value = err.data?.message || 'Failed to save leave type'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (leaveType: LeaveType) => {
  leaveTypeToDelete.value = leaveType
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!leaveTypeToDelete.value) return
  
  deleting.value = true
  try {
    const token = localStorage.getItem('auth_token')
    await $fetch(`/api/leave-types/${leaveTypeToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })

    showDeleteConfirm.value = false
    leaveTypeToDelete.value = null
    await fetchLeaveTypes()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to delete leave type'
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}
</script>