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

    // Get organization privacy settings and leave configuration
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        calendarViewRestricted: true,
        departmentViewRestricted: true,
        weekStartDay: true,
        leaveYearStartMonth: true,
        defaultLeaveAllowance: true,
        defaultSickLeaveAllowance: true,
      },
    })

    console.log('Organization settings:', {
      defaultLeaveAllowance: organization?.defaultLeaveAllowance,
      leaveYearStartMonth: organization?.leaveYearStartMonth,
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
        customLeaveAllowance: true,
        allowCarryForward: true,
        maxCarryForwardDays: true,
        carryOverBalance: true,
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

    // Calculate leave balances for each user
    // Use the current fiscal year (not the query year which is for the calendar view)
    const fiscalStartMonth = organization?.leaveYearStartMonth ?? 1
    const now = new Date()
    const currentMonth = now.getMonth() + 1

    // Determine fiscal year
    const fiscalYear = currentMonth >= fiscalStartMonth ? now.getFullYear() : now.getFullYear() - 1
    const fiscalPeriodStart = new Date(fiscalYear, fiscalStartMonth - 1, 1)
    const fiscalPeriodEnd = new Date(fiscalYear + 1, fiscalStartMonth - 1, 0)

    console.log('Dashboard balance calculation:', {
      fiscalStartMonth,
      fiscalYear,
      fiscalPeriodStart: fiscalPeriodStart.toISOString(),
      fiscalPeriodEnd: fiscalPeriodEnd.toISOString()
    })

    // Fetch all leaves for balance calculation
    const allLeavesForBalance = await prisma.leave.findMany({
      where: {
        userId: { in: users.map(u => u.id) },
        organizationId: auth.organizationId,
        startDate: {
          gte: fiscalPeriodStart,
          lte: fiscalPeriodEnd,
        },
        status: {
          in: ['APPROVED', 'PENDING'],
        },
      },
      include: {
        leaveType: true,
      },
    })

    // Group leaves by user for balance calculation
    const leavesByUserForBalance: Record<string, typeof allLeavesForBalance> = {}
    for (const leave of allLeavesForBalance) {
      if (!leavesByUserForBalance[leave.userId]) {
        leavesByUserForBalance[leave.userId] = []
      }
      leavesByUserForBalance[leave.userId].push(leave)
    }

    // Build response with calculated balances
    const usersWithLeaves = users.map(user => {
      // Get all leaves for this user in the fiscal period
      const userLeaves = leavesByUserForBalance[user.id] || []

      // Separate leaves by deduction bucket (same logic as balance.get.ts)
      const annualBucketLeaves = userLeaves.filter(
        (l) => l.leaveType && (l.leaveType.deductionBucket === 'ANNUAL' ||
          // Backward compatibility: if no deductionBucket but has annualAllowance and not SICK_PAID
          (!l.leaveType.deductionBucket && l.leaveType.annualAllowance != null && l.leaveType.annualAllowance > 0 && l.leaveType.code !== 'SICK_PAID'))
      )
      const sickBucketLeaves = userLeaves.filter(
        (l) => l.leaveType && (l.leaveType.deductionBucket === 'SICK' ||
          // Backward compatibility: SICK_PAID with annualAllowance set
          (!l.leaveType.deductionBucket && l.leaveType.code === 'SICK_PAID' && l.leaveType.annualAllowance != null && l.leaveType.annualAllowance > 0))
      )

      // Calculate Annual bucket
      const annualBaseAllowance = user.customLeaveAllowance ?? organization?.defaultLeaveAllowance ?? 0
      const annualCarriedOver = (user.allowCarryForward !== false) ? (user.carryOverBalance || 0) : 0
      const annualUsed = annualBucketLeaves.reduce((sum, leave) => sum + (leave.totalDays || 0), 0)
      const annualTotalAllowance = annualBaseAllowance + annualCarriedOver
      const annualRemaining = annualTotalAllowance - annualUsed

      // Calculate Sick bucket
      const sickBaseAllowance = organization?.defaultSickLeaveAllowance ?? 0
      const sickUsed = sickBucketLeaves.reduce((sum, leave) => sum + (leave.totalDays || 0), 0)
      const sickRemaining = sickBaseAllowance - sickUsed

      // Total remaining = Annual remaining + Sick remaining
      const totalRemaining = annualRemaining + sickRemaining

      if (annualUsed > 0 || sickUsed > 0 || annualTotalAllowance > 0 || sickBaseAllowance > 0) {
        console.log(`User ${user.firstName} ${user.lastName} balance:`, {
          annual: {
            baseAllowance: annualBaseAllowance,
            carriedOver: annualCarriedOver,
            totalAllowance: annualTotalAllowance,
            used: annualUsed,
            remaining: annualRemaining,
          },
          sick: {
            baseAllowance: sickBaseAllowance,
            used: sickUsed,
            remaining: sickRemaining,
          },
          totalRemaining,
          leavesInPeriod: userLeaves.length,
        })
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        jobTitle: user.jobTitle,
        role: user.role,
        departmentId: user.departmentId,
        annualLeaveBalance: totalRemaining, // Total remaining (annual + sick)
        department: user.department,
        leaves: leavesByUser[user.id] || [],
      }
    })

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