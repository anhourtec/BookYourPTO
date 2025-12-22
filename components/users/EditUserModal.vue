<template>
  <CustomModal v-model="isOpen" :max-width="'4xl'">
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgb(var(--border))]">
        <div class="min-w-0 flex-1 pr-4">
          <h2 class="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))] truncate">Edit User</h2>
          <p class="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] mt-1 truncate">
            {{ form.firstName }} {{ form.lastName }}
          </p>
        </div>
        <button @click="closeModal" class="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] shrink-0">
          <Icon name="lucide:x" class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loadingUser" class="flex items-center justify-center py-12">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
      </div>

      <!-- Scrollable Content -->
      <div v-else class="overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4">
        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600 shrink-0" />
            <p class="text-sm font-semibold text-green-600">{{ successMessage }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6 max-w-full">
          <!-- Tabs -->
          <div class="border-b border-[rgb(var(--border))] -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div class="flex gap-1 overflow-x-auto scrollbar-hide pb-px">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                @click="activeTab = tab.id"
                :class="[
                  'px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shrink-0',
                  activeTab === tab.id
                    ? 'text-[rgb(var(--primary))] border-b-2 border-[rgb(var(--primary))]'
                    : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                ]"
              >
                <Icon :name="tab.icon" class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span class="hidden sm:inline">{{ tab.label }}</span>
                <span class="sm:hidden">{{ tab.label.split(' ')[0] }}</span>
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
      <Icon 
        v-if="!canManageReportsTo()" 
        name="lucide:lock" 
        class="w-3 h-3 inline ml-1 text-[rgb(var(--muted-foreground))]" 
      />
    </label>
    <select
      v-model="form.reportsToId"
      :disabled="!canManageReportsTo()"
      class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))] disabled:bg-[rgb(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">No manager</option>
      <option v-for="manager in potentialManagers" :key="manager.id" :value="manager.id">
        {{ manager.firstName }} {{ manager.lastName }}
        <template v-if="manager.jobTitle"> ({{ manager.jobTitle }})</template>
        <template v-else> (No title)</template>
      </option>
    </select>
    <p v-if="!canManageReportsTo()" class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5 flex items-center gap-1">
      <Icon name="lucide:info" class="w-3 h-3" />
      Only administrators can modify reporting structure
    </p>
    <p v-else class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
      Select the person this user reports to directly
    </p>
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
                  {{ userRoles.find((r: { value: any }) => r.value === form.role)?.description }}
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

          <!-- Leave Allowance Tab - IMPROVED with Carry Forward -->
          <div v-show="activeTab === 'allowance'" class="space-y-4">
            <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Leave Balances</h3>
            
            <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <div class="flex gap-2">
                <Icon name="lucide:info" class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-blue-600">
                  <template v-if="canManageLeaveSettings">
                    Current balances are calculated from approved/pending leaves. Configure carry forward and custom allowances below.
                  </template>
                  <template v-else>
                    Current balances are calculated from approved/pending leaves.
                  </template>
                </p>
              </div>
            </div>

            <!-- Loading Balance -->
            <div v-if="loadingBalance" class="flex items-center justify-center py-8">
              <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-[rgb(var(--primary))]" />
            </div>

            <!-- Current Balance Summary -->
            <div v-else-if="balanceData" class="mb-6 space-y-4">
              <!-- Annual Leave Balance -->
              <div v-if="balanceData.annual" class="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <p class="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Annual Leave Balance</p>
                </div>
                <div class="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p class="text-[10px] text-blue-600 dark:text-blue-400 uppercase">Allowance</p>
                    <div class="flex items-center justify-center gap-1">
                      <p class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ effectiveAllowance }}</p>
                      <span
                        v-if="effectiveAllowance !== balanceData.annual.allowance"
                        class="text-[10px] text-amber-600 font-semibold"
                      >
                        (was {{ balanceData.annual.allowance }})
                      </span>
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] text-blue-600 dark:text-blue-400 uppercase">Used</p>
                    <p class="text-xl font-bold text-rose-600">{{ balanceData.annual.used }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-blue-600 dark:text-blue-400 uppercase">Carried</p>
                    <p class="text-xl font-bold text-amber-600">{{ balanceData.annual.carriedOver }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-blue-600 dark:text-blue-400 uppercase">Remaining</p>
                    <div class="flex items-center justify-center gap-1">
                      <p class="text-xl font-bold text-green-600">{{ effectiveRemaining }}</p>
                      <span
                        v-if="effectiveRemaining !== balanceData.annual.remaining"
                        class="text-[10px] text-amber-600 font-semibold"
                      >
                        (was {{ balanceData.annual.remaining }})
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  v-if="effectiveAllowance !== balanceData.annual.allowance"
                  class="mt-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800"
                >
                  <p class="text-xs text-amber-700 dark:text-amber-400 text-center">
                    💡 Preview: Values will update after saving changes
                  </p>
                </div>
              </div>

              <!-- Sick Leave Balance -->
              <div v-if="balanceData.sick && balanceData.sick.allowance > 0" class="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-1 h-4 bg-green-500 rounded-full"></div>
                  <p class="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Sick Leave Balance</p>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p class="text-[10px] text-green-600 dark:text-green-400 uppercase">Allowance</p>
                    <p class="text-xl font-bold text-green-700 dark:text-green-300">{{ balanceData.sick.allowance }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-green-600 dark:text-green-400 uppercase">Used</p>
                    <p class="text-xl font-bold text-rose-600">{{ balanceData.sick.used }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-green-600 dark:text-green-400 uppercase">Remaining</p>
                    <p class="text-xl font-bold text-green-700 dark:text-green-300">{{ balanceData.sick.remaining }}</p>
                  </div>
                </div>
                <p class="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                  Sick leave allowance is set organization-wide in General Settings
                </p>
              </div>

              <!-- Fallback for legacy data -->
              <div v-if="!balanceData.annual && !balanceData.sick" class="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p class="text-xs text-[rgb(var(--muted-foreground))] mb-2 font-semibold">Current Year Balance</p>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p class="text-xs text-[rgb(var(--muted-foreground))]">Total Allowance</p>
                    <p class="text-2xl font-bold text-green-600">{{ effectiveAllowance }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-[rgb(var(--muted-foreground))]">Used</p>
                    <p class="text-2xl font-bold text-orange-600">{{ balanceData.totalUsed }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-[rgb(var(--muted-foreground))]">Remaining</p>
                    <p class="text-2xl font-bold text-blue-600">{{ effectiveRemaining }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Balance Configuration -->
            <div v-if="canManageLeaveSettings" class="space-y-6">
              <!-- Custom Leave Allowance -->
              <div class="p-4 bg-[rgb(var(--muted))]/30 rounded-lg border border-[rgb(var(--border))]">
                <h4 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                  <Icon name="lucide:calendar-check" class="w-4 h-4" />
                  Annual Leave Allowance
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Organization Default
                    </label>
                    <input
                      :value="organizationDefaultAllowance"
                      type="number"
                      readonly
                      class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] cursor-not-allowed"
                    />
                    <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                      Default allowance for all employees
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Custom Allowance (Override)
                    </label>
                    <input
                      v-model.number="form.customLeaveAllowance"
                      type="number"
                      step="0.5"
                      min="0"
                      class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                      placeholder="Leave empty to use default"
                    />
                    <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                      Set custom allowance for this user (optional)
                    </p>
                  </div>
                </div>

                <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                  <p class="text-xs text-blue-600 dark:text-blue-400">
                    <strong>Effective Allowance:</strong> {{ form.customLeaveAllowance || organizationDefaultAllowance }} days per year
                  </p>
                </div>
              </div>

              <!-- Carry Forward Settings -->
              <div class="p-4 bg-[rgb(var(--muted))]/30 rounded-lg border border-[rgb(var(--border))]">
                <h4 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                  <Icon name="lucide:arrow-right-circle" class="w-4 h-4" />
                  Carry Forward Settings
                </h4>

                <!-- Toggle Carry Forward -->
                <div class="mb-4 p-3 bg-[rgb(var(--background))] rounded-lg border border-[rgb(var(--border))]">
                  <div class="flex items-center justify-between">
                    <div class="flex items-start gap-3">
                      <Icon 
                        :name="form.allowCarryForward ? 'lucide:check-circle' : 'lucide:x-circle'" 
                        class="w-5 h-5 flex-shrink-0 mt-0.5"
                        :class="form.allowCarryForward ? 'text-green-600' : 'text-[rgb(var(--muted-foreground))]'"
                      />
                      <div>
                        <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                          Allow Carry Forward
                        </label>
                        <p class="text-xs text-[rgb(var(--muted-foreground))]">
                          {{ form.allowCarryForward 
                            ? 'User can carry forward unused leave to next year' 
                            : 'Unused leave will not carry forward (use it or lose it)' 
                          }}
                        </p>
                      </div>
                    </div>
                    <SwitchToggle v-model="form.allowCarryForward" />
                  </div>
                </div>

                <!-- Carry Forward Limit (only shown if enabled) -->
                <div v-if="form.allowCarryForward" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Organization Default Carry Forward
                    </label>
                    <input
                      :value="organizationCarryForwardDays"
                      type="number"
                      readonly
                      class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] cursor-not-allowed"
                    />
                    <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                      Maximum days all employees can carry forward
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Custom Carry Forward Limit (Override)
                    </label>
                    <input
                      v-model.number="form.maxCarryForwardDays"
                      type="number"
                      step="0.5"
                      min="0"
                      class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                      placeholder="Leave empty to use default"
                    />
                    <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                      Set custom carry forward limit (optional)
                    </p>
                  </div>
                </div>

                <div v-if="form.allowCarryForward" class="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                  <p class="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Max Carry Forward:</strong> {{ form.maxCarryForwardDays || organizationCarryForwardDays }} days
                    <span v-if="organizationCarryForwardExpires"> 
                      (expires after {{ organizationCarryForwardExpiryMonths }} months)
                    </span>
                  </p>
                </div>
              </div>

              <!-- Current Carry Over -->
              <div class="p-4 bg-[rgb(var(--muted))]/30 rounded-lg border border-[rgb(var(--border))]">
                <h4 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                  <Icon name="lucide:calendar-arrow-down" class="w-4 h-4" />
                  Current Carried Over Balance
                </h4>

                <div>
                  <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Days Carried From Previous Year
                  </label>
                  <input
                    v-model.number="form.carryOverBalance"
                    type="number"
                    step="0.5"
                    min="0"
                    class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                  <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                    Days this user carried over from last year (manual adjustment)
                  </p>
                </div>
              </div>

              <!-- Read-Only Calculated Balances -->
              <div class="p-4 bg-[rgb(var(--muted))]/30 rounded-lg border border-[rgb(var(--border))]">
                <h4 class="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                  <Icon name="lucide:calculator" class="w-4 h-4" />
                  Current Balance Breakdown
                </h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Annual Leave Remaining
                    </label>
                    <input
                      :value="balanceData?.totalRemaining ?? 0"
                      type="number"
                      readonly
                      class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] cursor-not-allowed font-semibold"
                    />
                    <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                      Calculated: {{ balanceData?.totalAllowance ?? 0 }} allowance - {{ balanceData?.totalUsed ?? 0 }} used
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Sick Leave Remaining
                    </label>
                    <input
                      :value="getSickLeaveRemaining"
                      type="number"
                      readonly
                      class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] cursor-not-allowed font-semibold"
                    />
                    <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                      Based on sick leave type configuration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Holiday Overrides Tab -->
          <div v-show="activeTab === 'holidays'" class="space-y-6">
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Holiday Location Override</h3>
                <p class="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                  Set a different country/region for this user's public holidays. Leave empty to use organization defaults.
                </p>
              </div>

              <!-- Country Search -->
              <div class="relative">
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Search Country
                </label>
                <div class="relative">
                  <input
                    v-model="countrySearchQuery"
                    @focus="showCountryDropdown = true"
                    @input="onCountrySearch"
                    type="text"
                    placeholder="Search for a country..."
                    class="w-full px-4 py-2.5 pr-10 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition"
                  />
                  <Icon name="lucide:search" class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />

                  <!-- Country Dropdown -->
                  <div
                    v-if="showCountryDropdown && filteredCountries.length > 0"
                    class="absolute z-50 w-full mt-1 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <button
                      v-for="country in filteredCountries"
                      :key="country.countryCode"
                      @click="selectCountry(country)"
                      type="button"
                      class="w-full px-4 py-2.5 text-left hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--foreground))] text-sm"
                    >
                      {{ country.name }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Selected Country Display -->
              <div v-if="selectedCountry" class="flex items-center gap-2 p-3 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg">
                <Icon name="lucide:map-pin" class="w-4 h-4 text-[rgb(var(--primary))]" />
                <span class="text-sm font-medium text-[rgb(var(--foreground))]">{{ getCountryName(selectedCountry) }}</span>
                <button
                  @click="clearCountrySelection"
                  type="button"
                  class="ml-auto p-1 hover:bg-[rgb(var(--muted))] rounded transition-colors"
                >
                  <Icon name="lucide:x" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>

              <!-- State/Province Selection (if available) -->
              <div v-if="selectedCountry && countryHasSubdivisions" class="space-y-2">
                <label class="block text-sm font-medium text-[rgb(var(--foreground))]">
                  State/Province (Optional)
                </label>
                <select
                  v-model="selectedSubdivision"
                  :disabled="loadingSubdivisions"
                  class="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent outline-none transition disabled:opacity-50"
                >
                  <option value="">All states/provinces (National holidays only)</option>
                  <option v-for="subdivision in availableSubdivisions" :key="subdivision.code" :value="subdivision.code">
                    {{ subdivision.name }}
                  </option>
                </select>
                <p class="text-xs text-[rgb(var(--muted-foreground))]">
                  Select a specific state/province to include regional holidays
                </p>
              </div>
            </div>

            <!-- Exclude Organization Holidays -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-[rgb(var(--foreground))] mb-2 flex items-center gap-2">
                  <Icon name="lucide:calendar-x" class="w-5 h-5" />
                  Exclude Organization Holidays
                </h3>
                <p class="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                  Select holidays that should NOT apply to this user
                </p>
              </div>

              <div v-if="loadingHolidays" class="flex items-center justify-center py-8">
                <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-[rgb(var(--primary))]" />
              </div>

              <div v-else-if="orgHolidays.length === 0" class="text-sm text-[rgb(var(--muted-foreground))] p-4 bg-[rgb(var(--muted))]/30 rounded-lg">
                No organization holidays found for current year
              </div>

              <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                <div
                  v-for="holiday in orgHolidays"
                  :key="holiday.id"
                  class="flex items-center gap-3 p-3 bg-[rgb(var(--muted))]/30 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/50 transition"
                >
                  <input
                    type="checkbox"
                    :id="`exclude-${holiday.id}`"
                    :checked="isHolidayExcluded(holiday.id)"
                    @change="toggleExcludeHoliday(holiday)"
                    class="w-4 h-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]"
                  />
                  <label :for="`exclude-${holiday.id}`" class="flex-1 cursor-pointer">
                    <div class="font-medium text-sm text-[rgb(var(--foreground))]">{{ holiday.name }}</div>
                    <div class="text-xs text-[rgb(var(--muted-foreground))]">
                      {{ formatDateUTC(holiday.date) }}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Add Custom Holidays -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-[rgb(var(--foreground))] mb-2 flex items-center gap-2">
                  <Icon name="lucide:calendar-plus" class="w-5 h-5" />
                  Add Custom Holidays
                </h3>
                <p class="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                  Add holidays specific to this user
                </p>
              </div>

              <div class="p-4 bg-[rgb(var(--muted))]/30 rounded-lg border border-[rgb(var(--border))] space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Holiday Name
                    </label>
                    <input
                      v-model="newCustomHoliday.name"
                      type="text"
                      placeholder="e.g., Regional Day"
                      class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Date
                    </label>
                    <input
                      v-model="newCustomHoliday.date"
                      type="date"
                      class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="newCustomHoliday.isRecurring"
                      type="checkbox"
                      class="w-4 h-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]"
                    />
                    <span class="text-sm text-[rgb(var(--foreground))]">Recurring Annually</span>
                  </label>

                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="newCustomHoliday.isHalfDay"
                      type="checkbox"
                      class="w-4 h-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]"
                    />
                    <span class="text-sm text-[rgb(var(--foreground))]">Half Day</span>
                  </label>
                </div>

                <button
                  @click="addCustomHoliday"
                  type="button"
                  class="w-full bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-lg hover:bg-[rgb(var(--primary))]/90 transition font-medium flex items-center justify-center gap-2"
                >
                  <Icon name="lucide:plus" class="w-4 h-4" />
                  Add Custom Holiday
                </button>
              </div>

              <!-- List of custom holidays -->
              <div v-if="userOverrides.filter(o => o.type === 'ADD').length > 0" class="space-y-2">
                <h4 class="text-sm font-semibold text-[rgb(var(--foreground))]">Custom Holidays</h4>
                <div
                  v-for="override in userOverrides.filter(o => o.type === 'ADD')"
                  :key="override.id"
                  class="flex items-center justify-between p-3 bg-[rgb(var(--muted))]/30 rounded-lg border border-[rgb(var(--border))]"
                >
                  <div>
                    <div class="font-medium text-sm text-[rgb(var(--foreground))]">{{ override.name }}</div>
                    <div class="text-xs text-[rgb(var(--muted-foreground))]">
                      {{ formatDateUTC(override.date) }}
                      <span v-if="override.isRecurring" class="ml-2">(Recurring)</span>
                      <span v-if="override.isHalfDay" class="ml-2">(Half Day)</span>
                    </div>
                  </div>
                  <button
                    @click="deleteOverride(override.id)"
                    type="button"
                    class="text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10 p-2 rounded transition"
                  >
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Work Schedule Tab -->
          <div v-show="activeTab === 'schedule'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">Work Schedule</h3>
              <div v-if="!canManageSchedule" class="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                <Icon name="lucide:eye" class="w-3 h-3" />
                <span>View Only</span>
              </div>
            </div>

            <!-- Schedule Repeats Weekly Toggle -->
            <div class="p-4 bg-[rgb(var(--muted))]/30 rounded-lg border border-[rgb(var(--border))]">
              <div class="flex items-center justify-between">
                <div class="flex items-start gap-3">
                  <Icon
                    :name="form.scheduleRepeatsWeekly ? 'lucide:repeat' : 'lucide:calendar'"
                    class="w-5 h-5 flex-shrink-0 mt-0.5"
                    :class="form.scheduleRepeatsWeekly ? 'text-green-600' : 'text-[rgb(var(--muted-foreground))]'"
                  />
                  <div>
                    <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                      Repeating Weekly Schedule
                    </label>
                    <p class="text-xs text-[rgb(var(--muted-foreground))]">
                      {{ form.scheduleRepeatsWeekly
                        ? 'This schedule repeats every week'
                        : 'This is a one-time schedule for a specific date range'
                      }}
                    </p>
                  </div>
                </div>
                <SwitchToggle
                  v-model="form.scheduleRepeatsWeekly"
                  :disabled="!canManageSchedule"
                />
              </div>
            </div>

            <!-- Schedule Date Range (shown when NOT repeating weekly) -->
            <div v-if="!form.scheduleRepeatsWeekly" class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Effective From <span class="text-[rgb(var(--destructive))]">*</span>
                </label>
                <input
                  v-model="form.scheduleEffectiveFrom"
                  type="date"
                  :disabled="!canManageSchedule"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  Start date for this schedule
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Effective To <span class="text-[rgb(var(--destructive))]">*</span>
                </label>
                <input
                  v-model="form.scheduleEffectiveTo"
                  type="date"
                  :disabled="!canManageSchedule"
                  class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <p class="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  End date for this schedule
                </p>
              </div>
            </div>

            <!-- Quick Actions -->
            <div v-if="canManageSchedule" class="flex flex-wrap gap-2">
              <button
                type="button"
                @click="copyMondayToAllWorkDays"
                class="px-3 py-2 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-500/20 transition flex items-center gap-1.5"
              >
                <Icon name="lucide:copy" class="w-3.5 h-3.5" />
                <span>Copy Monday to all work days</span>
              </button>
              <button
                type="button"
                @click="setStandardWorkWeek"
                class="px-3 py-2 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-500/20 transition flex items-center gap-1.5"
              >
                <Icon name="lucide:calendar-clock" class="w-3.5 h-3.5" />
                <span>Set standard 9-5 (Mon-Fri)</span>
              </button>
            </div>

            <!-- Weekly Schedule -->
            <div class="space-y-3">
              <div
                v-for="dayName in orderedDays"
                :key="dayName"
                class="p-4 bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))]"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      :id="`${dayName}-workday`"
                      v-model="workSchedule[dayName].isWorkday"
                      :disabled="!canManageSchedule"
                      class="w-4 h-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label :for="`${dayName}-workday`" class="text-sm font-semibold text-[rgb(var(--foreground))] capitalize">
                      {{ dayName }}
                    </label>
                  </div>
                  <div v-if="workSchedule[dayName].isWorkday" class="text-xs font-medium text-[rgb(var(--primary))]">
                    {{ workSchedule[dayName].hours }} hours
                  </div>
                  <div v-else class="text-xs text-[rgb(var(--muted-foreground))]">
                    Rest day
                  </div>
                </div>

                <div v-if="workSchedule[dayName].isWorkday" class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <!-- Start Time -->
                  <div>
                    <label class="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">
                      Start Time
                    </label>
                    <input
                      v-model="workSchedule[dayName].startTime"
                      type="time"
                      :disabled="!canManageSchedule"
                      @change="calculateDayHours(dayName as string)"
                      class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <!-- End Time -->
                  <div>
                    <label class="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">
                      End Time
                    </label>
                    <input
                      v-model="workSchedule[dayName].endTime"
                      type="time"
                      :disabled="!canManageSchedule"
                      @change="calculateDayHours(dayName as string)"
                      class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <!-- Break (minutes) -->
                  <div>
                    <label class="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">
                      Break (min)
                    </label>
                    <input
                      v-model.number="workSchedule[dayName].breakMinutes"
                      type="number"
                      min="0"
                      :disabled="!canManageSchedule"
                      @change="calculateDayHours(dayName as string)"
                      class="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <!-- Hours (calculated) -->
                  <div>
                    <label class="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">
                      Hours
                    </label>
                    <input
                      :value="workSchedule[dayName].hours"
                      type="number"
                      step="0.5"
                      readonly
                      class="w-full px-3 py-2 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg text-sm cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Weekly Hours -->
            <div class="p-4 bg-[rgb(var(--primary))]/10 border-2 border-[rgb(var(--primary))]/30 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:clock" class="w-5 h-5 text-[rgb(var(--primary))]" />
                  <span class="text-sm font-semibold text-[rgb(var(--foreground))]">Total Weekly Hours</span>
                </div>
                <div class="text-2xl font-bold text-[rgb(var(--primary))]">
                  {{ totalWeeklyHours }} hrs
                </div>
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
          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2.5 sm:py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition text-[rgb(var(--foreground))] font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2.5 sm:py-2 rounded-lg hover:bg-[rgb(var(--primary))]/90 disabled:opacity-50 flex items-center justify-center gap-2 transition font-medium text-sm sm:text-base"
            >
              <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin shrink-0" />
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

const { fetchUser, updateUser } = useApi()

interface Department {
  id: string
  name: string
}

interface BalanceData {
  totalAllowance: number
  totalUsed: number
  totalRemaining: number
  annual?: {
    allowance: number
    used: number
    remaining: number
    carriedOver: number
  }
  sick?: {
    allowance: number
    used: number
    remaining: number
  }
  balances: Array<{
    leaveType: {
      id: string
      name: string
      color: string
    }
    allowance: number
    used: number
    remaining: number
  }>
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

const { roles: userRoles } = useUserRoles()
const { getUser, canManageReportsTo } = usePermissions() // Add canManageReportsTo here
const currentUser = computed(() => getUser())

// Check if current user can manage leave settings (only ADMINISTRATOR and EXECUTIVE)
const canManageLeaveSettings = computed(() => {
  return currentUser.value && ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.value.role)
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const cannotDeactivate = computed(() => {
  if (props.userId === currentUser.value?.id) return true
  if (form.value.role === 'EXECUTIVE') return true
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

// Only show Employment and Holiday Overrides tabs for ADMINISTRATOR and EXECUTIVE
const tabs = computed(() => {
  const baseTabs = [
    { id: 'profile', label: 'Profile', icon: 'lucide:user' },
    { id: 'contact', label: 'Contact', icon: 'lucide:phone' },
  ]

  // Add Employment tab only for ADMINISTRATOR and EXECUTIVE
  if (currentUser.value && ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.value.role)) {
    baseTabs.push({ id: 'employment', label: 'Employment', icon: 'lucide:briefcase' })
  }

  // Add Work Schedule tab (all users can view, only ADMIN/EXECUTIVE can edit)
  baseTabs.push({ id: 'schedule', label: 'Work Schedule', icon: 'lucide:clock' })

  baseTabs.push({ id: 'allowance', label: 'Leave Allowance', icon: 'lucide:calendar-days' })

  // Add Holiday Overrides tab only for ADMINISTRATOR and EXECUTIVE
  if (currentUser.value && ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.value.role)) {
    baseTabs.push({ id: 'holidays', label: 'Holiday Overrides', icon: 'lucide:calendar-check' })
  }

  return baseTabs
})

const activeTab = ref('profile')

const sortedDepartments = computed(() => {
  return [...props.departments].sort((a, b) => a.name.localeCompare(b.name))
})

const potentialManagers = computed(() => {
  return props.allUsers.filter(u => u.id !== props.userId)
})

// Get sick leave remaining from balance data
const getSickLeaveRemaining = computed(() => {
  if (!balanceData.value?.balances) return 0
  
  const sickLeave = balanceData.value.balances.find(b => 
    b.leaveType.name.toLowerCase().includes('sick')
  )
  
  return sickLeave ? sickLeave.remaining : 0
})

// ✅ NEW: Calculate effective allowance (what it will be after save)
const effectiveAllowance = computed(() => {
  return form.value.customLeaveAllowance || organizationDefaultAllowance.value
})

// ✅ NEW: Calculate effective remaining (preview)
const effectiveRemaining = computed(() => {
  if (!balanceData.value) return 0
  // Use annual bucket if available, otherwise use legacy totalUsed
  const usedDays = balanceData.value.annual?.used ?? balanceData.value.totalUsed
  const carriedOver = balanceData.value.annual?.carriedOver ?? 0
  return effectiveAllowance.value + carriedOver - usedDays
})

// ============================================
// REFS - Must be defined before helper functions
// ============================================

// Organization settings ref (for business days)
const organizationSettings = ref<any>(null)

// Work Schedule state - Define BEFORE helper functions use it
const workSchedule = ref({
  monday: { isWorkday: false, startTime: '', endTime: '', hours: 0, breakMinutes: 60 },
  tuesday: { isWorkday: false, startTime: '', endTime: '', hours: 0, breakMinutes: 60 },
  wednesday: { isWorkday: false, startTime: '', endTime: '', hours: 0, breakMinutes: 60 },
  thursday: { isWorkday: false, startTime: '', endTime: '', hours: 0, breakMinutes: 60 },
  friday: { isWorkday: false, startTime: '', endTime: '', hours: 0, breakMinutes: 60 },
  saturday: { isWorkday: false, startTime: '', endTime: '', hours: 0, breakMinutes: 0 },
  sunday: { isWorkday: false, startTime: '', endTime: '', hours: 0, breakMinutes: 0 },
})

// Ordered days for display (Monday-Sunday)
const orderedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

// ============================================
// WORK SCHEDULE HELPERS
// ============================================

// Check if current user can manage work schedules
const canManageSchedule = computed(() => {
  return currentUser.value && ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.value.role)
})

// Helper to get default schedule from org business days
const getDefaultScheduleFromOrg = () => {
  const dayMap: Record<string, keyof typeof workSchedule.value> = {
    'mon': 'monday',
    'tue': 'tuesday',
    'wed': 'wednesday',
    'thu': 'thursday',
    'fri': 'friday',
    'sat': 'saturday',
    'sun': 'sunday'
  }

  const businessDays = organizationSettings.value?.businessDays || ['mon', 'tue', 'wed', 'thu', 'fri']
  const defaultSchedule: any = {}

  for (const [abbr, fullDay] of Object.entries(dayMap)) {
    const isBusinessDay = businessDays.includes(abbr)
    defaultSchedule[fullDay] = {
      isWorkday: isBusinessDay,
      startTime: isBusinessDay ? '09:00' : '',
      endTime: isBusinessDay ? '17:00' : '',
      hours: isBusinessDay ? 8 : 0,
      breakMinutes: isBusinessDay ? 60 : 0,
    }
  }

  return defaultSchedule
}

// Calculate total weekly hours
const totalWeeklyHours = computed(() => {
  return Object.values(workSchedule.value).reduce((total, day: any) => {
    return total + (day.isWorkday ? (day.hours || 0) : 0)
  }, 0)
})

// Calculate hours for a specific day
const calculateDayHours = (dayName: string) => {
  const day = workSchedule.value[dayName as keyof typeof workSchedule.value]

  if (!day.isWorkday || !day.startTime || !day.endTime) {
    day.hours = 0
    return
  }

  // Parse times
  const startParts = day.startTime.split(':').map(Number)
  const endParts = day.endTime.split(':').map(Number)
  const [startHour = 0, startMin = 0] = startParts
  const [endHour = 0, endMin = 0] = endParts

  // Calculate total minutes
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const totalMinutes = endMinutes - startMinutes

  // Subtract break
  const workMinutes = totalMinutes - (day.breakMinutes || 0)

  // Convert to hours (rounded to 0.5)
  day.hours = Math.max(0, Math.round((workMinutes / 60) * 2) / 2)
}

// Copy Monday's schedule to all work days
const copyMondayToAllWorkDays = () => {
  const mondaySchedule = workSchedule.value.monday
  const workDays = ['tuesday', 'wednesday', 'thursday', 'friday'] as const

  workDays.forEach(day => {
    const daySchedule = workSchedule.value[day]
    if (daySchedule.isWorkday) {
      daySchedule.startTime = mondaySchedule.startTime
      daySchedule.endTime = mondaySchedule.endTime
      daySchedule.breakMinutes = mondaySchedule.breakMinutes
      calculateDayHours(day)
    }
  })
}

// Set standard 9-5 work week (Mon-Fri)
const setStandardWorkWeek = () => {
  const workDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
  const weekendDays = ['saturday', 'sunday'] as const

  workDays.forEach(day => {
    const daySchedule = workSchedule.value[day]
    daySchedule.isWorkday = true
    daySchedule.startTime = '09:00'
    daySchedule.endTime = '17:00'
    daySchedule.breakMinutes = 60
    daySchedule.hours = 8
  })

  weekendDays.forEach(day => {
    const daySchedule = workSchedule.value[day]
    daySchedule.isWorkday = false
    daySchedule.startTime = ''
    daySchedule.endTime = ''
    daySchedule.breakMinutes = 0
    daySchedule.hours = 0
  })
}

// Watch for workday toggle
watch(() => Object.values(workSchedule.value).map(d => d.isWorkday), () => {
  Object.keys(workSchedule.value).forEach(dayName => {
    const day = workSchedule.value[dayName as keyof typeof workSchedule.value]
    if (!day.isWorkday) {
      day.hours = 0
    } else {
      calculateDayHours(dayName)
    }
  })
}, { deep: true })

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
  holidayCountry: '',
  holidayRegion: '',
  carryOverBalance: 0,
  customLeaveAllowance: null,
  allowCarryForward: true,
  maxCarryForwardDays: null,
  // Work Schedule fields
  scheduleRepeatsWeekly: true,
  scheduleEffectiveFrom: null,
  scheduleEffectiveTo: null,
})

// Organization defaults (fetched from org settings)
const organizationDefaultAllowance = ref(25)
const organizationCarryForwardDays = ref(5)
const organizationCarryForwardExpires = ref(false)
const organizationCarryForwardExpiryMonths = ref(12)

const emergencyContact = ref({
  name: '',
  relationship: '',
  phonePrimary: '',
  phoneSecondary: '',
})

const balanceData = ref<BalanceData | null>(null)
const loading = ref(false)
const loadingUser = ref(false)
const loadingBalance = ref(false)
const error = ref('')
const successMessage = ref('')

// Holiday override state
const orgHolidays = ref<any[]>([])
const userOverrides = ref<any[]>([])
const loadingHolidays = ref(false)
const newCustomHoliday = ref({
  name: '',
  date: '',
  isRecurring: true,
  isHalfDay: false
})

// Country/subdivision search
const availableCountries = ref<any[]>([])
const availableSubdivisions = ref<any[]>([])
const countrySearchQuery = ref('')
const showCountryDropdown = ref(false)
const filteredCountries = ref<any[]>([])
const selectedCountry = ref('')
const selectedSubdivision = ref('')
const loadingSubdivisions = ref(false)

// Auto-set schedule effective from to employment start date
watch(() => form.value.employmentStartDate, (newDate) => {
  if (newDate && !form.value.scheduleEffectiveFrom) {
    form.value.scheduleEffectiveFrom = newDate
  }
})

// Fetch balance data from API
const fetchBalanceData = async (userId: string) => {
  loadingBalance.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const data = await $fetch<BalanceData>(`/api/leaves/balance?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    balanceData.value = data
  } catch (err) {
    console.error('Failed to fetch balance:', err)
  } finally {
    loadingBalance.value = false
  }
}

// Fetch organization holidays
const fetchOrgHolidays = async () => {
  loadingHolidays.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const currentYear = new Date().getFullYear()
    const data = await $fetch<any[]>(`/api/public-holidays?year=${currentYear}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    orgHolidays.value = data || []
  } catch (err) {
    console.error('Failed to fetch holidays:', err)
    orgHolidays.value = []
  } finally {
    loadingHolidays.value = false
  }
}

// Fetch user holiday overrides
const fetchUserOverrides = async (userId: string) => {
  try {
    const token = localStorage.getItem('auth_token')
    const data = await $fetch<any[]>(`/api/users/${userId}/holiday-overrides`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    userOverrides.value = data || []
  } catch (err) {
    console.error('Failed to fetch user overrides:', err)
    userOverrides.value = []
  }
}

// Check if a holiday is excluded for this user
const isHolidayExcluded = (holidayId: string) => {
  return userOverrides.value.some(o => o.type === 'EXCLUDE' && o.publicHolidayId === holidayId)
}

// Toggle exclude holiday
const toggleExcludeHoliday = async (holiday: any) => {
  if (!props.userId) return

  const token = localStorage.getItem('auth_token')
  const isCurrentlyExcluded = isHolidayExcluded(holiday.id)

  try {
    if (isCurrentlyExcluded) {
      // Find and delete the override
      const override = userOverrides.value.find(o => o.publicHolidayId === holiday.id)
      if (override) {
        await $fetch(`/api/users/${props.userId}/holiday-overrides/${override.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      }
    } else {
      // Create new EXCLUDE override
      await $fetch(`/api/users/${props.userId}/holiday-overrides`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: {
          type: 'EXCLUDE',
          publicHolidayId: holiday.id
        }
      })
    }

    // Refresh overrides
    await fetchUserOverrides(props.userId)
  } catch (err: any) {
    console.error('Failed to toggle holiday exclusion:', err)
    error.value = err.data?.message || 'Failed to update holiday override'
  }
}

// Add custom holiday
const addCustomHoliday = async () => {
  if (!props.userId || !newCustomHoliday.value.name || !newCustomHoliday.value.date) {
    error.value = 'Please provide holiday name and date'
    return
  }

  const token = localStorage.getItem('auth_token')

  try {
    await $fetch(`/api/users/${props.userId}/holiday-overrides`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        type: 'ADD',
        name: newCustomHoliday.value.name,
        date: newCustomHoliday.value.date,
        isRecurring: newCustomHoliday.value.isRecurring,
        isHalfDay: newCustomHoliday.value.isHalfDay
      }
    })

    // Reset form and refresh
    newCustomHoliday.value = {
      name: '',
      date: '',
      isRecurring: true,
      isHalfDay: false
    }
    await fetchUserOverrides(props.userId)
    successMessage.value = 'Custom holiday added successfully!'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (err: any) {
    console.error('Failed to add custom holiday:', err)
    error.value = err.data?.message || 'Failed to add custom holiday'
  }
}

// Delete override
const deleteOverride = async (overrideId: string) => {
  if (!props.userId) return

  const token = localStorage.getItem('auth_token')

  try {
    await $fetch(`/api/users/${props.userId}/holiday-overrides/${overrideId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })

    await fetchUserOverrides(props.userId)
    successMessage.value = 'Override deleted successfully!'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (err: any) {
    console.error('Failed to delete override:', err)
    error.value = err.data?.message || 'Failed to delete override'
  }
}

// Format date using UTC parts to avoid timezone issues
const formatDateUTC = (date: Date | string) => {
  const d = new Date(date)
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const day = d.getUTCDate()
  const year = d.getUTCFullYear()
  return `${month} ${day}, ${year}`
}

// Fetch available countries from API
const fetchAvailableCountries = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    const countries = await $fetch<any[]>('/api/public-holidays/countries', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    availableCountries.value = countries.sort((a, b) => a.name.localeCompare(b.name))
    filteredCountries.value = availableCountries.value
  } catch (err) {
    console.error('Error fetching countries:', err)
  }
}

// Fetch subdivisions for a country
const fetchSubdivisionsForCountry = async (countryCode: string) => {
  loadingSubdivisions.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const subdivisions = await $fetch<any[]>(`/api/public-holidays/subdivisions/${countryCode}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    availableSubdivisions.value = subdivisions
  } catch (err) {
    console.error('Error fetching subdivisions:', err)
    availableSubdivisions.value = []
  } finally {
    loadingSubdivisions.value = false
  }
}

// Check if country has subdivisions (try to fetch them)
const countryHasSubdivisions = computed(() => {
  return availableSubdivisions.value.length > 0
})

// Handle country search
const onCountrySearch = () => {
  const query = countrySearchQuery.value.toLowerCase().trim()

  if (!query) {
    filteredCountries.value = availableCountries.value
  } else {
    filteredCountries.value = availableCountries.value.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.countryCode.toLowerCase().includes(query)
    )
  }

  showCountryDropdown.value = true
}

// Select country from dropdown
const selectCountry = async (country: any) => {
  selectedCountry.value = country.countryCode
  countrySearchQuery.value = country.name
  showCountryDropdown.value = false

  // Update form
  form.value.holidayCountry = country.countryCode

  // Reset subdivision
  selectedSubdivision.value = ''
  form.value.holidayRegion = ''
  availableSubdivisions.value = []

  // Try to fetch subdivisions
  await fetchSubdivisionsForCountry(country.countryCode)
}

// Clear country selection
const clearCountrySelection = () => {
  selectedCountry.value = ''
  countrySearchQuery.value = ''
  selectedSubdivision.value = ''
  form.value.holidayCountry = ''
  form.value.holidayRegion = ''
  availableSubdivisions.value = []
  filteredCountries.value = availableCountries.value
}

// Get country name from code
const getCountryName = (countryCode: string) => {
  if (!countryCode) return ''
  const country = availableCountries.value.find(c => c.countryCode === countryCode)
  return country?.name || countryCode
}

// Watch subdivision selection
watch(selectedSubdivision, (newVal) => {
  form.value.holidayRegion = newVal || ''
})

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showCountryDropdown.value = false
  }
}

// Mount/unmount listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch([() => props.userId, () => props.modelValue], async ([newUserId, isOpen]) => {
  if (newUserId && isOpen) {
    resetForm()
    await fetchUserData(newUserId)
    await fetchBalanceData(newUserId)
    await fetchOrgHolidays()
    await fetchUserOverrides(newUserId)
    await fetchAvailableCountries()
  }
}, { immediate: true })

const fetchUserData = async (userId: string) => {
  loadingUser.value = true
  error.value = ''

  try {
    const user = await fetchUser(userId)

    // Fetch organization settings for defaults
    const token = localStorage.getItem('auth_token')
    const orgSettings = await $fetch('/api/organization/settings', {
      headers: { 'Authorization': `Bearer ${token}` },
    }) as any

    // Update organization defaults
    organizationDefaultAllowance.value = orgSettings.defaultLeaveAllowance || 25
    organizationCarryForwardDays.value = orgSettings.carryForwardDays || 5
    organizationCarryForwardExpires.value = orgSettings.carryForwardExpires || false
    organizationCarryForwardExpiryMonths.value = orgSettings.carryForwardExpiryMonths || 12
    organizationSettings.value = orgSettings // Store for business days

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
      holidayCountry: user.holidayCountry || '',
      holidayRegion: user.holidayRegion || '',
      carryOverBalance: user.carryOverBalance || 0,
      customLeaveAllowance: user.customLeaveAllowance || null,
      allowCarryForward: user.allowCarryForward !== undefined ? user.allowCarryForward : true,
      maxCarryForwardDays: user.maxCarryForwardDays || null,
      // Work Schedule fields
      scheduleRepeatsWeekly: user.scheduleRepeatsWeekly ?? true,
      scheduleEffectiveFrom: user.scheduleEffectiveFrom ? new Date(user.scheduleEffectiveFrom).toISOString().split('T')[0] : null,
      scheduleEffectiveTo: user.scheduleEffectiveTo ? new Date(user.scheduleEffectiveTo).toISOString().split('T')[0] : null,
    }

    // Load work schedule
    if (user.workSchedule) {
      workSchedule.value = user.workSchedule as any
    } else {
      // Set defaults based on organization's business days
      workSchedule.value = getDefaultScheduleFromOrg()
    }

    if (user.emergencyContact) {
      const ec = user.emergencyContact as any
      emergencyContact.value = {
        name: ec.name || '',
        relationship: ec.relationship || '',
        phonePrimary: ec.phonePrimary || '',
        phoneSecondary: ec.phoneSecondary || '',
      }
    } else {
      emergencyContact.value = {
        name: '',
        relationship: '',
        phonePrimary: '',
        phoneSecondary: '',
      }
    }

    // Initialize country/subdivision if set
    if (user.holidayCountry) {
      selectedCountry.value = user.holidayCountry
      const country = availableCountries.value.find(c => c.countryCode === user.holidayCountry)
      if (country) {
        countrySearchQuery.value = country.name
        // Fetch subdivisions if country is set
        await fetchSubdivisionsForCountry(user.holidayCountry)
      }
    }
    if (user.holidayRegion) {
      selectedSubdivision.value = user.holidayRegion
    }
  } catch (err: any) {
    console.error('❌ Failed to fetch user:', err)
    error.value = err.data?.message || err.message || 'Failed to load user data'
  } finally {
    loadingUser.value = false
  }
}

const handleSubmit = async () => {
  if (!props.userId) return

  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const updateData: any = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      middleName: form.value.middleName || null,
      preferredName: form.value.preferredName || null,
      dateOfBirth: form.value.dateOfBirth || undefined,
      gender: form.value.gender || null,
      jobTitle: form.value.jobTitle || null,
      employeeId: form.value.employeeId || null,
      departmentId: form.value.departmentId || null,
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
      holidayCountry: form.value.holidayCountry || null,
      holidayRegion: form.value.holidayRegion || null,
      carryOverBalance: form.value.carryOverBalance,
      customLeaveAllowance: form.value.customLeaveAllowance || null,
      allowCarryForward: form.value.allowCarryForward,
      maxCarryForwardDays: form.value.maxCarryForwardDays || null,
      emergencyContact: emergencyContact.value.name ? emergencyContact.value : null,
    }

    // ✅ Only include reportsToId if user has permission to change it
    if (canManageReportsTo()) {
      updateData.reportsToId = form.value.reportsToId || null
    }

    // ✅ Only include work schedule if user has permission to manage it
    if (canManageSchedule.value) {
      updateData.workSchedule = workSchedule.value
      updateData.scheduleRepeatsWeekly = form.value.scheduleRepeatsWeekly
      updateData.scheduleEffectiveFrom = form.value.scheduleEffectiveFrom || null
      updateData.scheduleEffectiveTo = form.value.scheduleEffectiveTo || null
      updateData.hoursPerWeek = totalWeeklyHours.value
    }

    const updatedUser = await updateUser(props.userId, updateData)

    successMessage.value = 'User updated successfully!'
    
    emit('userUpdated', updatedUser)

    // Refresh balance after update
    await fetchBalanceData(props.userId)

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
  balanceData.value = null
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
    holidayCountry: '',
    holidayRegion: '',
    carryOverBalance: 0,
    customLeaveAllowance: null,
    allowCarryForward: true,
    maxCarryForwardDays: null,
  }
  emergencyContact.value = {
    name: '',
    relationship: '',
    phonePrimary: '',
    phoneSecondary: '',
  }

  // Reset holiday override state
  selectedCountry.value = ''
  selectedSubdivision.value = ''
  countrySearchQuery.value = ''
  showCountryDropdown.value = false
  availableSubdivisions.value = []
  orgHolidays.value = []
  userOverrides.value = []
  newCustomHoliday.value = {
    name: '',
    date: '',
    isRecurring: true,
    isHalfDay: false
  }
}
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>