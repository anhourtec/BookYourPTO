export const useHeaderNavigation = (isAuthenticated: Ref<boolean>) => {
  const { canAccessUsers, canAccessSettings } = usePermissions()

  const navLinks = computed(() => [
    { to: '/', label: 'Home', show: true },
    { to: '#', label: 'Features', show: true },
    { to: '#', label: 'Docs', show: true },
    // Calendar visible only when logged in
    { to: userCalendarPath.value, label: 'My calendar', show: isAuthenticated.value && !!currentUserId.value },
    { to: '/users', label: 'Users', show: isAuthenticated.value && canAccessUsers() },
    { to: '/settings', label: 'Settings', show: isAuthenticated.value && canAccessSettings() }
  ])

  const currentUserId = computed(() => {
    if (process.server) return null
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      return parsed?.id ?? null
    } catch {
      return null
    }
  })

  const userCalendarPath = computed(() => {
    return currentUserId.value ? `/calendar/${currentUserId.value}` : '/calendar'
  })

  const visibleNavLinks = computed(() => navLinks.value.filter(link => link.show))

  const userMenuItems = computed(() => {
    const items = [
      { to: userCalendarPath.value, label: 'My calendar', icon: 'lucide:calendar', show: isAuthenticated.value && !!currentUserId.value },
      { to: '/#', label: 'Dashboard', icon: 'lucide:layout-dashboard', show: true },
      { to: '/users', label: 'Users', icon: 'lucide:users', show: canAccessUsers() },
      { to: '/settings', label: 'Settings', icon: 'lucide:settings', show: canAccessSettings() }
    ]
    return items.filter(item => item.show)
  })

  return {
    visibleNavLinks,
    userMenuItems
  }
}
