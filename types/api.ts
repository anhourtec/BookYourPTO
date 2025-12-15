// types/api.ts
import type { User, CreateUserInput, UpdateUserInput } from './user'

// ============================================
// DEPARTMENT TYPES
// ============================================
export interface Department {
  id: string
  organizationId: string
  name: string
  code: string
  description?: string
  color?: string
  costCenter?: string
  headOfDepartmentId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  
  // Relations (populated)
  headOfDept?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  _count?: {
    users: number
  }
}

export interface CreateDepartmentInput {
  name: string
  code: string
  description?: string
  color?: string
  headOfDepartmentId?: string
}

export interface UpdateDepartmentInput {
  name?: string
  code?: string
  description?: string
  color?: string
  headOfDepartmentId?: string
  isActive?: boolean
}

// ============================================
// ORGANIZATION/SETTINGS TYPES
// ============================================
export interface OrganizationSettings {
  id: string
  name: string
  slug: string
  
  // Regional Settings
  timezone: string
  dateFormat?: string
  timeFormat?: string
  weekStartDay: number
  currency?: string
  businessDays?: string[]
  country?: string
  
  // Leave Settings
  leaveYearStartMonth: number
  defaultLeaveAllowance: number
  
  // Privacy Settings
  calendarViewRestricted: boolean
  departmentViewRestricted: boolean
  
  // Carry Forward Settings
  carryForwardDays: number
  carryForwardHours: number
  carryForwardExpires: boolean
  carryForwardExpiryMonths?: number | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsInput {
  name?: string
  timezone?: string
  weekStartDay?: number
  leaveYearStartMonth?: number
  defaultLeaveAllowance?: number
  calendarViewRestricted?: boolean
  departmentViewRestricted?: boolean
  carryForwardDays?: number
  carryForwardHours?: number
  carryForwardExpires?: boolean
  carryForwardExpiryMonths?: number | null
}

// ============================================
// LEAVE MANAGEMENT TYPES
// ============================================

export interface LeaveType {
  id: string
  organizationId: string
  name: string
  code: string
  description?: string
  color: string
  icon?: string
  requiresApproval: boolean
  requiresDocumentation: boolean
  maxDaysPerRequest?: number
  minDaysNotice: number
  allowHalfDays: boolean
  allowQuarterDays: boolean
  allowHourly: boolean
  paidLeave: boolean
  annualAllowance?: number
  hasAccrual: boolean
  accrualRate?: number
  carryOverAllowed: boolean
  maxCarryOverDays?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Leave {
  id: string
  organizationId: string
  userId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  startHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  endHalf: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  totalDays: number
  totalHours?: number
  reason?: string
  notes?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WITHDRAWN'
  submittedAt: string
  
  // ✅ CORRECTED: Two-level approval system
  firstLevelApproverId?: string
  firstLevelApprovedAt?: string
  firstLevelComment?: string
  secondLevelApproverId?: string
  secondLevelApprovedAt?: string
  secondLevelComment?: string
  
  rejectionReason?: string
  cancelledAt?: string
  cancelledReason?: string
  createdAt: string
  updatedAt: string
  
  // Relations
  leaveType?: LeaveType
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    jobTitle?: string
    department?: {
      id: string
      name: string
      color?: string
    }
  }
  
  // ✅ CORRECTED: Approval relations
  firstLevelApprover?: {
    id: string
    firstName: string
    lastName: string
  }
  secondLevelApprover?: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface LeaveBalance {
  id: string
  organizationId: string
  userId: string
  leaveTypeId: string
  year: number
  fiscalPeriodStart: string
  fiscalPeriodEnd: string
  openingBalance: number
  earned: number
  used: number
  adjusted: number
  carriedOver: number
  expired: number
  currentBalance: number
  createdAt: string
  updatedAt: string
  
  // Relations
  leaveType?: LeaveType
}

export interface PublicHoliday {
  id: string
  organizationId: string
  country: string
  region?: string | null
  name: string
  date: string
  isRecurring: boolean
  isHalfDay: boolean
  affectedDepartments: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateLeaveInput {
  userId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  startHalf?: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  endHalf?: 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  reason?: string
  notes?: string
}

export interface UpdateLeaveInput {
  status?: 'APPROVED' | 'REJECTED' | 'CANCELLED'
  firstLevelComment?: string
  secondLevelComment?: string
  rejectionReason?: string
  cancelledReason?: string
}

export interface LeaveBalanceSummary {
  year: number
  fiscalPeriodStart: string
  fiscalPeriodEnd: string
  totalAllowance: number
  totalUsed: number
  totalRemaining: number
  carriedOver: number
  
  // Breakdown by leave type
  balances: {
    leaveType: LeaveType
    allowance: number
    used: number
    remaining: number
  }[]
  
  // Deductible leaves breakdown
  deductible: {
    leaveType: LeaveType
    days: number
  }[]
  
  // Non-deductible leaves (for display only)
  nonDeductible: {
    leaveType: LeaveType
    count: number
    days: number
  }[]
}

// ============================================
// AUTH TYPES
// ============================================
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshTokenResponse {
  success: boolean
  accessToken: string
  refreshToken: string
}

// ============================================
// RE-EXPORT USER TYPES FOR CONVENIENCE
// ============================================
export type { User, CreateUserInput, UpdateUserInput }