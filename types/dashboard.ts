// types/dashboard.ts
// Shared types for dashboard components

import type { Leave, PublicHoliday, LeaveType, Department } from './api'

export interface DashboardUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  jobTitle?: string
  role: string
  departmentId?: string
  annualLeaveBalance?: number
  department?: {
    id: string
    name: string
    color?: string
  }
  leaves: Leave[]
}

export interface DayInfo {
  date: Date
  dateKey: string
  dayLetter: string
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  isHoliday: boolean
  holiday?: PublicHoliday
  leave?: Leave
}

export interface DashboardFilters {
  userFilter: 'all' | 'selected'
  sortBy: 'firstName' | 'lastName' | 'department'
  accountType: 'all' | 'managers' | 'approvers' | 'favourites'
  departmentIds: string[]
}

export interface DashboardPermissions {
  canViewAllDepartments: boolean
  canViewCalendar: boolean
  isAdmin: boolean
}

export interface DashboardApiResponse {
  users: DashboardUser[]
  publicHolidays: PublicHoliday[]
  totalUsers: number
  dateRange: {
    start: string
    end: string
  }
  settings: {
    weekStartDay: number
  }
  permissions: DashboardPermissions
}