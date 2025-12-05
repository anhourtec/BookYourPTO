export const useUserRoles = () => {
  // Matches your Prisma UserRole enum exactly
  const roles = [
    { 
      value: 'EMPLOYEE', 
      label: 'Employee', 
      description: 'Standard employee with basic access',
      icon: 'lucide:user'
    },
    { 
      value: 'MANAGER', 
      label: 'Manager', 
      description: 'Can manage team members and approve requests',
      icon: 'lucide:users'
    },
    { 
      value: 'DEPARTMENT_HEAD', 
      label: 'Department Head', 
      description: 'Oversees entire department operations',
      icon: 'lucide:briefcase'
    },
    { 
      value: 'ADMINISTRATOR', 
      label: 'Administrator', 
      description: 'Full system access and user management',
      icon: 'lucide:shield'
    },
    { 
      value: 'EXECUTIVE', 
      label: 'Executive', 
      description: 'C-level executive with organization-wide access',
      icon: 'lucide:crown'
    }
  ] as const

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role
  }

  const getRoleDescription = (role: string) => {
    return roles.find(r => r.value === role)?.description || ''
  }

  const getRoleIcon = (role: string) => {
    return roles.find(r => r.value === role)?.icon || 'lucide:user'
  }

  return {
    roles,
    getRoleLabel,
    getRoleDescription,
    getRoleIcon
  }
}
