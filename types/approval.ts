// types/approval.ts
// Shared types for the approval system

export interface LeaveRequest {
  id: string
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
  status: string
  createdAt: string
  submittedAt: string
  
  // Relations
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    jobTitle?: string
    department?: {
      id: string
      name: string
      color: string
    }
  }
  
  leaveType: {
    id: string
    name: string
    code: string
    color: string
    icon?: string
  }
  
  // Optional approval details
  firstLevelApproverId?: string
  firstLevelApprovedAt?: string
  firstLevelComment?: string
  rejectionReason?: string
}

export interface ApprovalFilterSection {
  id: string
  label: string
  type: 'radio' | 'checkbox'
  value: string | string[]
  options: ApprovalFilterOption[]
}

export interface ApprovalFilterOption {
  label: string
  value: string
  badge?: string
}