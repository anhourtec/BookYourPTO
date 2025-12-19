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
                  Current balances are calculated from approved/pending leaves. Configure carry forward and custom allowances below.
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
            <div class="space-y-6">
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

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'lucide:user' },
  { id: 'contact', label: 'Contact', icon: 'lucide:phone' },
  { id: 'employment', label: 'Employment', icon: 'lucide:briefcase' },
  { id: 'allowance', label: 'Leave Allowance', icon: 'lucide:calendar-days' },
]

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
  carryOverBalance: 0,
  customLeaveAllowance: null,
  allowCarryForward: true,
  maxCarryForwardDays: null,
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

watch([() => props.userId, () => props.modelValue], async ([newUserId, isOpen]) => {
  if (newUserId && isOpen) {
    resetForm()
    await fetchUserData(newUserId)
    await fetchBalanceData(newUserId)
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
      carryOverBalance: user.carryOverBalance || 0,
      customLeaveAllowance: user.customLeaveAllowance || null,
      allowCarryForward: user.allowCarryForward !== undefined ? user.allowCarryForward : true,
      maxCarryForwardDays: user.maxCarryForwardDays || null,
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
}
</script>