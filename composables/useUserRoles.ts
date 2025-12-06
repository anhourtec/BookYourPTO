export const useUserRoles = () => {
  // Only 4 roles as requested
  const roles = [
    { 
      value: 'EMPLOYEE', 
      label: 'Employee', 
      description: 'Standard employee with basic access',
      icon: 'lucide:user',
      level: 1
    },
    { 
      value: 'DEPARTMENT_HEAD', 
      label: 'Department Head', 
      description: 'Oversees entire department operations',
      icon: 'lucide:briefcase',
      level: 2
    },
    { 
      value: 'ADMINISTRATOR', 
      label: 'Administrator', 
      description: 'Full system access and user management',
      icon: 'lucide:shield',
      level: 3
    },
    { 
      value: 'EXECUTIVE', 
      label: 'Executive', 
      description: 'C-level executive with organization-wide access',
      icon: 'lucide:crown',
      level: 4
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

  const getRoleLevel = (role: string) => {
    return roles.find(r => r.value === role)?.level || 0
  }

  return {
    roles,
    getRoleLabel,
    getRoleDescription,
    getRoleIcon,
    getRoleLevel
  }
}