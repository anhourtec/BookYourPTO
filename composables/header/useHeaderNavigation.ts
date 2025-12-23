export const useHeaderNavigation = (
  isAuthenticated: Ref<boolean>, 
  currentUserId: Ref<string | null>
) => {
  const { canAccessUsers, canAccessSettings, canApproveRequests } = usePermissions()
  
  const userCalendarPath = computed(() => {
    return currentUserId.value ? `/calendar/${currentUserId.value}` : '/calendar'
  })
  
  const navLinks = computed(() => [
    // Show Home only when NOT logged in
    { to: '/', label: 'Home', show: !isAuthenticated.value },
    // Show Dashboard only when logged in
    { to: '/dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard', show: isAuthenticated.value },
    { to: '/users', label: 'Users', show: isAuthenticated.value && canAccessUsers() },
    { to: userCalendarPath.value, label: 'My calendar', icon: 'lucide:calendar', show: isAuthenticated.value && !!currentUserId.value },       
    { to: '/approvals', label: 'Approvals', icon: 'lucide:check-circle', show: isAuthenticated.value && canApproveRequests() },
  ])
  
  const visibleNavLinks = computed(() => navLinks.value.filter(link => link.show))
  
  const userMenuItems = computed(() => {
    const items = [
      { to: '/settings', label: 'Settings', icon: 'lucide:settings', show: isAuthenticated.value && canAccessSettings() },
    ]
    return items.filter(item => item.show)
  })
  
  return {
    visibleNavLinks,
    userMenuItems,
    userCalendarPath
  }
}