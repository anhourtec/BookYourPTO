import { prisma } from '~/server/utils/db'

// Nager.Date API interface
interface NagerHoliday {
  date: string
  localName: string
  name: string
  countryCode: string
  fixed: boolean
  global: boolean
  counties: string[] | null
  launchYear: number | null
  types: string[]
}

// Fetch holidays from Nager.Date API
async function fetchHolidaysFromAPI(countryCode: string, year: number): Promise<NagerHoliday[]> {
  try {
    const response = await $fetch<NagerHoliday[]>(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
      {
        headers: { 'Accept': 'application/json' },
      }
    )

    const publicHolidays = Array.isArray(response)
      ? response.filter(h => h.types && h.types.includes('Public'))
      : []

    return publicHolidays
  } catch (error) {
    console.error(`Error fetching holidays from Nager.Date API for ${countryCode}:`, error)
    return []
  }
}

// Parse date as UTC midnight
function parseHolidayDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`)
}

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
        carryForwardDays: true,
        carryForwardExpires: true,
        carryForwardExpiryMonths: true,
        carryForwardEligibilityYears: true,
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
        employmentStartDate: true,
        holidayCountry: true,
        holidayRegion: true,
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

    // AUTOMATED CARRY FORWARD: Fetch previous year's leaves for all users (batch query)
    const prevFiscalPeriodStart = new Date(fiscalYear - 1, fiscalStartMonth - 1, 1)
    const prevFiscalPeriodEnd = new Date(fiscalYear, fiscalStartMonth - 1, 0)

    const prevYearLeaves = organization?.carryForwardDays && organization.carryForwardDays > 0
      ? await prisma.leave.findMany({
          where: {
            userId: { in: users.map(u => u.id) },
            organizationId: auth.organizationId,
            startDate: {
              gte: prevFiscalPeriodStart,
              lte: prevFiscalPeriodEnd,
            },
            status: {
              in: ['APPROVED', 'PENDING'],
            },
          },
          include: {
            leaveType: true,
          },
        })
      : []

    // Group previous year leaves by user
    const prevLeavesByUser: Record<string, typeof prevYearLeaves> = {}
    for (const leave of prevYearLeaves) {
      if (!prevLeavesByUser[leave.userId]) {
        prevLeavesByUser[leave.userId] = []
      }
      prevLeavesByUser[leave.userId].push(leave)
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

      // AUTOMATED CARRY FORWARD: Calculate from previous fiscal year
      let annualCarriedOver = 0

      if (user.allowCarryForward !== false && organization?.carryForwardDays && organization.carryForwardDays > 0) {
        // Check if employee is eligible for carry forward based on years of employment
        // Eligibility is configurable: 1 (immediate), 2 (2nd year), or 3 (3rd year)
        let skipCarryForward = false

        if (user.employmentStartDate) {
          const employmentDate = new Date(user.employmentStartDate)
          const employmentMonth = employmentDate.getMonth() + 1 // 1-12

          // Determine the first fiscal year of employment
          const firstFiscalYear = employmentMonth >= fiscalStartMonth
            ? employmentDate.getFullYear()
            : employmentDate.getFullYear() - 1

          // Current fiscal year being viewed
          const currentFiscalYear = fiscalYear

          // Calculate which year of employment this is (1, 2, 3, etc.)
          const yearsOfEmployment = currentFiscalYear - firstFiscalYear + 1

          // Get eligibility threshold from organization settings (default to 2 if not set)
          const eligibilityYears = organization.carryForwardEligibilityYears ?? 2

          // Skip carry forward if employee hasn't reached eligibility year yet
          skipCarryForward = yearsOfEmployment < eligibilityYears
        }

        // Only calculate carry forward if employee has reached eligibility year
        if (!skipCarryForward) {
          const userPrevLeaves = prevLeavesByUser[user.id] || []

          // Calculate previous year's annual bucket usage
          const prevAnnualBucketLeaves = userPrevLeaves.filter(
            (l) => l.leaveType && (l.leaveType.deductionBucket === 'ANNUAL' ||
              (!l.leaveType.deductionBucket && l.leaveType.annualAllowance != null && l.leaveType.annualAllowance > 0 && l.leaveType.code !== 'SICK_PAID'))
          )
          const prevAnnualUsed = prevAnnualBucketLeaves.reduce((sum, leave) => sum + (leave.totalDays || 0), 0)

          // Previous year's base allowance
          const prevAnnualBaseAllowance = user.customLeaveAllowance ?? organization.defaultLeaveAllowance ?? 0

          // Calculate remaining from previous year
          const prevYearRemaining = prevAnnualBaseAllowance - prevAnnualUsed

          if (prevYearRemaining > 0) {
            // Apply carry forward cap
            let carriedAmount = Math.min(prevYearRemaining, organization.carryForwardDays)

            // User-specific max carry forward override
            if (user.maxCarryForwardDays != null && user.maxCarryForwardDays > 0) {
              carriedAmount = Math.min(prevYearRemaining, user.maxCarryForwardDays)
            }

            // Check if carry forward has expired
            if (organization.carryForwardExpires && organization.carryForwardExpiryMonths) {
              const expiryDate = new Date(fiscalPeriodStart)
              expiryDate.setMonth(expiryDate.getMonth() + organization.carryForwardExpiryMonths)

              const today = new Date()
              if (today > expiryDate) {
                carriedAmount = 0
              }
            }

            annualCarriedOver = carriedAmount
          }
        } // end if (!skipCarryForward) - employee reached eligibility year
      }

      // Calculate Annual bucket
      const annualBaseAllowance = user.customLeaveAllowance ?? organization?.defaultLeaveAllowance ?? 0
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
        holidayCountry: user.holidayCountry,
        holidayRegion: user.holidayRegion,
        annualLeaveBalance: totalRemaining, // Total remaining (annual + sick)
        department: user.department,
        leaves: leavesByUser[user.id] || [],
      }
    })

    // Fetch holiday overrides for all users
    const userHolidayOverrides = await prisma.userHolidayOverride.findMany({
      where: {
        userId: { in: userIds },
        organizationId: auth.organizationId,
      },
      select: {
        id: true,
        userId: true,
        type: true,
        publicHolidayId: true,
        name: true,
        date: true,
        isRecurring: true,
        isHalfDay: true,
      }
    })

    // Fetch per-user holidays based on their custom countries or organization defaults
    console.log('📅 Fetching per-user holidays for dashboard...')

    const userHolidaysMap: Record<string, any[]> = {}

    // Group users by their holiday country/region combination
    const countryRegionGroups: Record<string, typeof users> = {}
    const defaultCountryUsers: typeof users = []

    for (const user of users) {
      if (user.holidayCountry) {
        const key = `${user.holidayCountry}|${user.holidayRegion || ''}`
        if (!countryRegionGroups[key]) {
          countryRegionGroups[key] = []
        }
        countryRegionGroups[key]!.push(user)
      } else {
        defaultCountryUsers.push(user)
      }
    }

    // Fetch holidays for each unique country/region combination
    for (const [key, groupUsers] of Object.entries(countryRegionGroups)) {
      const [country, region] = key.split('|')
      if (!country) continue

      console.log(`📥 Fetching holidays for ${country}${region ? ` (${region})` : ''} - ${groupUsers.length} users`)

      try {
        let apiHolidays = await fetchHolidaysFromAPI(country, year)

        // Filter by subdivision if specified
        if (region) {
          apiHolidays = apiHolidays.filter(h =>
            h.global || (h.counties && h.counties.includes(region))
          )
        }

        // Convert to expected format
        const holidays = apiHolidays.map(holiday => ({
          id: `${country}-${holiday.date}`,
          organizationId: auth.organizationId,
          country: country,
          name: holiday.name,
          date: parseHolidayDate(holiday.date),
          isRecurring: holiday.fixed === false,
          region: region || null,
          recurringPattern: null,
          affectedDepartments: [],
          isHalfDay: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        // Apply to all users in this group
        for (const user of groupUsers) {
          // Apply user-specific overrides
          const userOverrides = userHolidayOverrides.filter(o => o.userId === user.id)

          // Remove excluded holidays
          const excludedIds = userOverrides
            .filter(o => o.type === 'EXCLUDE' && o.publicHolidayId)
            .map(o => o.publicHolidayId)

          let userHolidays = holidays.filter(h => !excludedIds.includes(h.id))

          // Add custom holidays
          const customHolidays = userOverrides
            .filter(o => o.type === 'ADD' && o.date)
            .map(o => ({
              id: o.id,
              organizationId: auth.organizationId,
              country: country,
              region: region || null,
              name: o.name || 'Custom Holiday',
              date: o.date!,
              isRecurring: o.isRecurring,
              recurringPattern: null,
              affectedDepartments: [],
              isHalfDay: o.isHalfDay,
              createdAt: new Date(),
              updatedAt: new Date()
            }))

          userHolidays.push(...customHolidays)
          userHolidays.sort((a, b) => a.date.getTime() - b.date.getTime())

          userHolidaysMap[user.id] = userHolidays
        }
      } catch (error) {
        console.error(`❌ Failed to fetch holidays for ${country}:`, error)
        // Fallback to empty holidays for these users
        for (const user of groupUsers) {
          userHolidaysMap[user.id] = []
        }
      }
    }

    // For users without custom country, use organization holidays with overrides
    if (defaultCountryUsers.length > 0) {
      console.log(`📅 Using org holidays for ${defaultCountryUsers.length} users without custom country`)

      for (const user of defaultCountryUsers) {
        const userOverrides = userHolidayOverrides.filter(o => o.userId === user.id)

        // Remove excluded holidays
        const excludedIds = userOverrides
          .filter(o => o.type === 'EXCLUDE' && o.publicHolidayId)
          .map(o => o.publicHolidayId)

        let userHolidays = publicHolidays.filter(h => !excludedIds.includes(h.id))

        // Add custom holidays
        const customHolidays = userOverrides
          .filter(o => o.type === 'ADD' && o.date)
          .map(o => ({
            id: o.id,
            organizationId: auth.organizationId,
            country: 'CUSTOM',
            region: null,
            name: o.name || 'Custom Holiday',
            date: o.date!,
            isRecurring: o.isRecurring,
            recurringPattern: null,
            affectedDepartments: [],
            isHalfDay: o.isHalfDay,
            createdAt: new Date(),
            updatedAt: new Date()
          }))

        userHolidays.push(...customHolidays)
        userHolidays.sort((a, b) => a.date.getTime() - b.date.getTime())

        userHolidaysMap[user.id] = userHolidays
      }
    }

    // Safety check: Ensure ALL users have an entry in the map (even if empty)
    for (const user of users) {
      if (!userHolidaysMap[user.id]) {
        console.warn(`⚠️ User ${user.id} (${user.firstName} ${user.lastName}) missing from userHolidaysMap, adding empty holidays`)
        userHolidaysMap[user.id] = []
      }
    }

    console.log(`✅ Fetched per-user holidays for ${Object.keys(userHolidaysMap).length} users`)

    return {
      users: usersWithLeaves,
      publicHolidays,
      userHolidayOverrides,
      userHolidaysMap, // Per-user holidays including custom countries and overrides
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