export const useUserRoleColors = () => {
  const roleColors = {
    EMPLOYEE: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      border: 'border-blue-200 dark:border-blue-800',
      avatar: 'bg-blue-100 dark:bg-blue-900/30',
      avatarText: 'text-blue-700 dark:text-blue-300',
      ring: 'ring-2 ring-blue-600 dark:ring-blue-400',
      hasStarBadge: false
    },
    MANAGER: { 
      bg: 'bg-purple-100 dark:bg-purple-900/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-800',
      avatar: 'bg-purple-100 dark:bg-purple-900/30',
      avatarText: 'text-purple-700 dark:text-purple-300',
      ring: 'ring-2 ring-purple-600 dark:ring-purple-400',
      hasStarBadge: false
    },
    DEPARTMENT_HEAD: { 
      bg: 'bg-indigo-100 dark:bg-indigo-900/30', 
      text: 'text-indigo-700 dark:text-indigo-300', 
      border: 'border-indigo-200 dark:border-indigo-800',
      avatar: 'bg-indigo-100 dark:bg-indigo-900/30',
      avatarText: 'text-indigo-700 dark:text-indigo-300',
      ring: 'ring-2 ring-indigo-600 dark:ring-indigo-400',
      hasStarBadge: false
    },
    ADMINISTRATOR: { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-700 dark:text-orange-300', 
      border: 'border-orange-200 dark:border-orange-800',
      avatar: 'bg-orange-100 dark:bg-orange-900/30',
      avatarText: 'text-orange-700 dark:text-orange-300',
      ring: 'ring-2 ring-orange-600 dark:ring-orange-400',
      hasStarBadge: true
    },
    EXECUTIVE: { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-700 dark:text-red-300', 
      border: 'border-red-200 dark:border-red-800',
      avatar: 'bg-red-100 dark:bg-red-900/30',
      avatarText: 'text-red-700 dark:text-red-300',
      ring: 'ring-2 ring-red-600 dark:ring-red-400',
      hasStarBadge: true
    }
  }

  const levelColors = {
    STANDARD: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    DIRECTOR: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
    EXECUTIVE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
    ADMINISTRATOR: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' }
  }

  const getRoleColor = (role: string) => roleColors[role as keyof typeof roleColors] || roleColors.EMPLOYEE
  const getLevelColor = (level: string) => levelColors[level as keyof typeof levelColors] || levelColors.STANDARD

  return {
    roleColors,
    levelColors,
    getRoleColor,
    getLevelColor
  }
}
