export const useHeaderNavigation = (isAuthenticated: Ref<boolean>) => {
  const { canAccessUsers, canAccessSettings } = usePermissions()

  const navLinks = computed(() => [
    { to: '/', label: 'Home', show: true },
    { to: '#', label: 'Features', show: true },
    { to: '#', label: 'Docs', show: true },
    { to: '/users', label: 'Users', show: isAuthenticated.value && canAccessUsers() },
    { to: '/settings', label: 'Settings', show: isAuthenticated.value && canAccessSettings() }
  ])

  const visibleNavLinks = computed(() => navLinks.value.filter(link => link.show))

  const userMenuItems = computed(() => {
    const items = [
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
