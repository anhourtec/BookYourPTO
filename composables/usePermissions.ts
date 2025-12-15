export const usePermissions = () => {
  const getUser = () => {
    if (process.server) return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  const hasRole = (allowedRoles: string[]) => {
    const user = getUser()
    if (!user) return false
    return allowedRoles.includes(user.role)
  }

  const canAccessUsers = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'])
  }

  const canManageUsers = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canManageDepartments = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canDeleteDepartments = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  /**
   * ✅ Can access settings page
   * ALL USERS can access settings (for password change)
   * But only admins see admin settings
   */
  const canAccessSettings = () => {
    // Everyone can access settings page (at minimum for password change)
    return true
  }

  /**
   * ✅ Can access admin settings tabs
   * Only ADMINISTRATOR and EXECUTIVE can see/manage admin settings
   */
  const canAccessAdminSettings = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canManageOrganization = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canManageLeaveTypes = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canManageCarryForward = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canApproveRequests = () => {
    const user = getUser()
    if (!user) return false
    return user.isApprover || hasRole(['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'])
  }

  const isAdmin = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canEditUser = (targetUserId: string) => {
    const user = getUser()
    if (!user) return false
    
    if (isAdmin()) return true
    if (user.id === targetUserId) return true
    
    return false
  }

  /**
   * ✅ Can create group bookings
   * ADMINISTRATOR, EXECUTIVE can create for any department
   * DEPARTMENT_HEAD can create for their own department
   */
  const canCreateGroupBooking = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'])
  }

  /**
   * ✅ Can lock dates
   * Only ADMINISTRATOR and EXECUTIVE
   */
  const canLockDates = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  /**
   * ✅ Can cancel any leave (including others' leaves and started leaves)
   * Only ADMINISTRATOR and EXECUTIVE
   */
  const canCancelAnyLeave = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  /**
   * ✅ Can cancel own leave
   * IMPORTANT: Regular employees CANNOT cancel their own leaves
   * Only ADMINISTRATOR and EXECUTIVE can cancel leaves
   */
  const canCancelOwnLeave = (
    leaveStatus: string,
    leaveStartDate: string | Date,
    leaveUserId: string
  ) => {
    // Employees cannot cancel their own leaves
    // Only admins/executives have this privilege
    return false
  }

  /**
   * ✅ Can cancel a specific leave
   * Only ADMINISTRATOR and EXECUTIVE can cancel any leave
   * Regular employees (including the owner) CANNOT cancel leaves
   */
  const canCancelLeave = (
    leaveStatus: string,
    leaveStartDate: string | Date,
    leaveUserId: string
  ) => {
    // Only admins/executives can cancel leaves
    return canCancelAnyLeave()
  }

  /**
   * ✅ Check if user is a regular employee
   */
  const isEmployee = () => {
    return hasRole(['EMPLOYEE'])
  }

  return {
    getUser,
    hasRole,
    canAccessUsers,
    canManageUsers,
    canManageDepartments,
    canDeleteDepartments,
    canAccessSettings,
    canAccessAdminSettings, // NEW: Separate permission for admin settings
    canManageOrganization,
    canManageLeaveTypes,
    canManageCarryForward,
    canApproveRequests,
    isAdmin,
    canEditUser,
    // Leave cancellation and group booking permissions
    canCreateGroupBooking,
    canLockDates,
    canCancelAnyLeave,
    canCancelOwnLeave,
    canCancelLeave,
    isEmployee,
  }
}