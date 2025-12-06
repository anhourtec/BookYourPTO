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