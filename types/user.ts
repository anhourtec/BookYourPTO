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
  
  // Employment
  employeeId?: string
  jobTitle?: string
  departmentId?: string
  reportsToId?: string
  employmentStartDate?: string
  employmentType?: 'FULLTIME' | 'PARTTIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY' | 'SEASONAL'
  
  // Role & Permissions - ONLY 4 ROLES
  role: 'EMPLOYEE' | 'DEPARTMENT_HEAD' | 'ADMINISTRATOR' | 'EXECUTIVE'
  // ONLY 4 LEVELS
  level?: 'STANDARD' | 'DIRECTOR' | 'EXECUTIVE' | 'ADMINISTRATOR'
  isApprover?: boolean
  
  // Relations (populated)
  department?: {
    id: string
    name: string
    code: string
  }
  manager?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  
  // Status
  isActive: boolean
  emailVerified: boolean
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
  jobTitle?: string
  departmentId?: string
  role?: User['role']
  isActive?: boolean
}