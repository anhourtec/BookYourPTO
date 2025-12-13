// types/user.ts
export interface User {
  id: string
  organizationId: string
  
  // Authentication
  email: string
  
  // Basic Info
  firstName: string
  lastName: string
  middleName?: string
  preferredName?: string
  avatar?: string
  dateOfBirth?: string
  gender?: string
  
  // Employment
  employeeId?: string
  jobTitle?: string
  departmentId?: string
  reportsToId?: string
  employmentStartDate?: string
  employmentEndDate?: string
  employmentType?: 'FULLTIME' | 'PARTTIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY' | 'SEASONAL'
  
  // Role & Permissions - ONLY 4 ROLES
  role: 'EMPLOYEE' | 'DEPARTMENT_HEAD' | 'ADMINISTRATOR' | 'EXECUTIVE'
  // ONLY 4 LEVELS
  level?: 'STANDARD' | 'DIRECTOR' | 'EXECUTIVE' | 'ADMINISTRATOR'
  isApprover?: boolean
  
  // Contact Information
  phoneMobile?: string
  phoneLandline?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  
  // Emergency Contact
  emergencyContact?: {
    name?: string
    relationship?: string
    phonePrimary?: string
    phoneSecondary?: string
    address?: string
  }
  
  // Payroll & Banking
  payrollId?: string
  
  // Leave Balances (Required fields)
  annualLeaveBalance: number
  sickLeaveBalance: number
  carryOverBalance: number
  customLeaveAllowance?: number
  
  // ✅ NEW: Carry Forward Settings
  allowCarryForward?: boolean
  maxCarryForwardDays?: number
  
  // Relations (populated)
  department?: {
    id: string
    name: string
    code?: string
  }
  manager?: {
    id: string
    firstName: string
    lastName: string
    email?: string
    jobTitle?: string
  }
  
  // Status
  isActive: boolean
  emailVerified?: boolean
  lastLoginAt?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
  jobTitle?: string
  departmentId?: string
  role?: User['role']
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  middleName?: string | null
  preferredName?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  jobTitle?: string | null
  employeeId?: string | null
  departmentId?: string | null
  reportsToId?: string | null
  employmentType?: User['employmentType']
  employmentStartDate?: string | null
  role?: User['role']
  payrollId?: string | null
  isActive?: boolean
  phoneMobile?: string | null
  phoneLandline?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  carryOverBalance?: number
  customLeaveAllowance?: number | null
  allowCarryForward?: boolean
  maxCarryForwardDays?: number | null
  emergencyContact?: {
    name?: string
    relationship?: string
    phonePrimary?: string
    phoneSecondary?: string
  } | null
}