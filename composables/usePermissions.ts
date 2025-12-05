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
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD', 'MANAGER'])
  }

  const canManageUsers = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canManageDepartments = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  // ✅ Add this new method
  const canDeleteDepartments = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canApproveRequests = () => {
    const user = getUser()
    if (!user) return false
    return user.isApprover || hasRole(['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD', 'MANAGER'])
  }

  const isAdmin = () => {
    return hasRole(['ADMINISTRATOR', 'EXECUTIVE'])
  }

  const canEditUser = (targetUserId: string) => {
    const user = getUser()
    if (!user) return false
    
    // Admins can edit anyone
    if (isAdmin()) return true
    
    // Users can edit themselves
    if (user.id === targetUserId) return true
    
    return false
  }

  return {
    getUser,
    hasRole,
    canAccessUsers,
    canManageUsers,
    canManageDepartments,
    canDeleteDepartments, // ✅ Export it
    canApproveRequests,
    isAdmin,
    canEditUser,
  }
}
