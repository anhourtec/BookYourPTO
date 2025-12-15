import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth

    if (!auth) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const query = getQuery(event)
    const year = query.year ? parseInt(query.year as string) : new Date().getFullYear()
    const month = query.month !== undefined ? parseInt(query.month as string) : new Date().getMonth()
    const departmentIds = query.departmentIds ? (query.departmentIds as string).split(',').filter(Boolean) : []
    const sortBy = (query.sortBy as string) || 'firstName'
    const accountType = (query.accountType as string) || 'all'
    const searchQuery = (query.search as string) || ''

    // Get current user with their role and department
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        role: true,
        departmentId: true,
        isApprover: true,
      },
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found',
      })
    }

    // Get organization privacy settings
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        calendarViewRestricted: true,
        departmentViewRestricted: true,
        weekStartDay: true,
      },
    })

    const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)
    const isDepartmentHead = currentUser.role === 'DEPARTMENT_HEAD'

    // Build user filter based on privacy settings and role
    const userWhere: any = {
      organizationId: auth.organizationId,
      isActive: true,
    }

    // Apply department restriction based on privacy settings
    if (!isAdmin && organization?.departmentViewRestricted) {
      // Non-admins can only see their own department
      if (currentUser.departmentId) {
        userWhere.departmentId = currentUser.departmentId
      }
    } else if (departmentIds.length > 0) {
      // Filter by selected departments
      userWhere.departmentId = { in: departmentIds }
    }

    // Apply account type filter
    if (accountType === 'managers') {
      userWhere.OR = [
        { role: 'DEPARTMENT_HEAD' },
        { isApprover: true },
      ]
    } else if (accountType === 'approvers') {
      userWhere.isApprover = true
    }

    // Apply search filter
    if (searchQuery) {
      userWhere.OR = [
        { firstName: { contains: searchQuery, mode: 'insensitive' } },
        { lastName: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
      ]
    }

    // Calculate date range for the visible period
    // We need to show about 5 weeks of data centered around the current month
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)
    
    // Get the week start day (0 = Sunday, 1 = Monday)
    const weekStartDay = organization?.weekStartDay ?? 0
    
    // Calculate the first visible day (start of the week containing the 1st)
    const firstDayOfWeek = startOfMonth.getDay()
    const daysToSubtract = weekStartDay === 1 
      ? (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
      : firstDayOfWeek
    
    const startDate = new Date(year, month, 1 - daysToSubtract)
    
    // Calculate end date (show about 5 weeks total, extending into next month)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 34) // 5 weeks

    // Build sort order
    let orderBy: any = {}
    if (sortBy === 'firstName') {
      orderBy = { firstName: 'asc' }
    } else if (sortBy === 'lastName') {
      orderBy = { lastName: 'asc' }
    } else if (sortBy === 'department') {
      orderBy = { department: { name: 'asc' } }
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        jobTitle: true,
        role: true,
        departmentId: true,
        annualLeaveBalance: true,
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy,
    })

    // Fetch leaves for all visible users in the date range
    const userIds = users.map(u => u.id)

    const leaves = userIds.length > 0 ? await prisma.leave.findMany({
      where: {
        userId: { in: userIds },
        organizationId: auth.organizationId,
        status: { in: ['PENDING', 'APPROVED'] },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    }) : []

    // Group leaves by user
    const leavesByUser: Record<string, typeof leaves> = {}
    for (const leave of leaves) {
      if (!leavesByUser[leave.userId]) {
        leavesByUser[leave.userId] = []
      }
      leavesByUser[leave.userId].push(leave)
    }

    // Fetch public holidays for the date range
    const publicHolidays = await prisma.publicHoliday.findMany({
      where: {
        organizationId: auth.organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Build response
    const usersWithLeaves = users.map(user => ({
      ...user,
      leaves: leavesByUser[user.id] || [],
    }))

    return {
      users: usersWithLeaves,
      publicHolidays,
      totalUsers: users.length,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      settings: {
        weekStartDay: organization?.weekStartDay ?? 0,
      },
      permissions: {
        canViewAllDepartments: isAdmin || !organization?.departmentViewRestricted,
        canViewCalendar: isAdmin || !organization?.calendarViewRestricted || isDepartmentHead,
        isAdmin,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching dashboard users:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch dashboard data',
    })
  }
})