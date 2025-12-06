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

  const canAccessSettings = () => {
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

  return {
    getUser,
    hasRole,
    canAccessUsers,
    canManageUsers,
    canManageDepartments,
    canDeleteDepartments,
    canAccessSettings,
    canManageOrganization,
    canManageLeaveTypes,
    canManageCarryForward,
    canApproveRequests,
    isAdmin,
    canEditUser,
  }
}