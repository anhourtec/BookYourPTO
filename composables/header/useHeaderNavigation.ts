export const useHeaderNavigation = (
  isAuthenticated: Ref<boolean>, 
  currentUserId: Ref<string | null>
) => {
  const { canAccessUsers, canAccessSettings, canApproveRequests } = usePermissions()
  
  const userCalendarPath = computed(() => {
    return currentUserId.value ? `/calendar/${currentUserId.value}` : '/calendar'
  })
  
  const navLinks = computed(() => [
    { to: '/', label: 'Home', show: true },
    { to: '/features', label: 'Features', show: true },
    { to: '#', label: 'Docs', show: true },
    // Calendar visible only when logged in
    { to: '/users', label: 'Users', show: isAuthenticated.value && canAccessUsers() },
    { to: '/settings', label: 'Settings', icon: 'lucide:settings', show: isAuthenticated.value && canAccessSettings() },
    { to: '/approvals', label: 'Approvals', icon: 'lucide:check-circle', show: isAuthenticated.value && canApproveRequests() }
  ])
  
  const visibleNavLinks = computed(() => navLinks.value.filter(link => link.show))
  
  const userMenuItems = computed(() => {
    const items = [
      { to: userCalendarPath.value, label: 'My calendar', icon: 'lucide:calendar', show: isAuthenticated.value && !!currentUserId.value },       
      { to: '/dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard', show: true },
    ]
    return items.filter(item => item.show)
  })
  
  return {
    visibleNavLinks,
    userMenuItems,
    userCalendarPath
  }
}