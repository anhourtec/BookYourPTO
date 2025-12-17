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

    // Query params
    const query = getQuery(event)
    const userId = (query.userId as string) || auth.userId
    const year = query.year != null ? parseInt(query.year as string, 10) : new Date().getFullYear()

    // Current user
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true, departmentId: true },
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found',
      })
    }

    // Permissions
    if (userId !== auth.userId) {
      const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)
      if (!isAdmin && currentUser.role !== 'DEPARTMENT_HEAD') {
        throw createError({
          statusCode: 403,
          message: 'Insufficient permissions',
        })
      }
      
      // If department head, verify they can view this user
      if (currentUser.role === 'DEPARTMENT_HEAD') {
        const targetUser = await prisma.user.findFirst({
          where: {
            id: userId,
            departmentId: currentUser.departmentId,
            organizationId: auth.organizationId
          }
        })
        
        if (!targetUser) {
          throw createError({
            statusCode: 403,
            message: 'Insufficient permissions to view this user'
          })
        }
      }
    }

    // Org settings
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        leaveYearStartMonth: true,
        defaultLeaveAllowance: true,
        carryForwardDays: true,
        carryForwardExpires: true,
        carryForwardExpiryMonths: true,
      },
    })

    if (!organization) {
      throw createError({
        statusCode: 404,
        message: 'Organization not found',
      })
    }

    // Get user-specific settings (custom allowances and carry-over)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        customLeaveAllowance: true,
        allowCarryForward: true,
        maxCarryForwardDays: true,
        carryOverBalance: true,
      },
    })

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // Fiscal period
    const fiscalStartMonth = organization.leaveYearStartMonth
    const fiscalPeriodStart = new Date(year, fiscalStartMonth - 1, 1)
    const fiscalPeriodEnd = new Date(year + 1, fiscalStartMonth - 1, 0)

    console.log(`Calculating balance for fiscal period:`, {
      start: fiscalPeriodStart.toISOString(),
      end: fiscalPeriodEnd.toISOString(),
      userId,
      customAllowance: targetUser.customLeaveAllowance,
      carryOverBalance: targetUser.carryOverBalance,
      allowCarryForward: targetUser.allowCarryForward,
    })

    // Leave types
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        organizationId: auth.organizationId,
        isActive: true,
      },
    })

    // Used leaves in fiscal period - ONLY APPROVED and PENDING
    // Cancelled, rejected, and withdrawn leaves do NOT count toward usage
    const usedLeaves = await prisma.leave.findMany({
      where: {
        userId,
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

    console.log(`Found ${usedLeaves.length} used leaves (APPROVED/PENDING only)`)

    // Separate deductible from non-deductible based on annualAllowance field
    const deductibleLeaves = usedLeaves.filter(
      (l) => l.leaveType && l.leaveType.annualAllowance != null && l.leaveType.annualAllowance > 0
    )
    const nonDeductibleLeaves = usedLeaves.filter(
      (l) => l.leaveType && (l.leaveType.annualAllowance == null || l.leaveType.annualAllowance === 0)
    )

    // Calculate totals using user-specific or organization default allowance
    const baseAllowance = targetUser.customLeaveAllowance ?? organization.defaultLeaveAllowance
    
    // Calculate carry-over based on user settings
    let carriedOver = 0
    if (targetUser.allowCarryForward !== false) {
      // Use user's manual carry-over balance if set, otherwise 0
      carriedOver = targetUser.carryOverBalance || 0
    }
    
    const totalUsed = deductibleLeaves.reduce((sum, leave) => sum + (leave.totalDays || 0), 0)
    const totalAllowance = baseAllowance + carriedOver
    const totalRemaining = totalAllowance - totalUsed

    console.log(`Balance summary:`, {
      baseAllowance,
      carriedOver,
      totalAllowance,
      totalUsed,
      totalRemaining,
      deductibleCount: deductibleLeaves.length,
      nonDeductibleCount: nonDeductibleLeaves.length
    })

    // Deductible breakdown (by leave type)
    const deductibleMap: Record<string, { leaveType: any; days: number }> = {}

    for (const l of deductibleLeaves) {
      const lt = l.leaveType
      if (!lt) continue
      if (!deductibleMap[lt.id]) {
        deductibleMap[lt.id] = { leaveType: lt, days: 0 }
      }
      deductibleMap[lt.id].days += l.totalDays || 0
    }

    const deductible = Object.values(deductibleMap)

    // Balance breakdown (allowance/used/remaining per deductible type)
    const balanceBreakdown = leaveTypes
      .filter((lt) => lt.annualAllowance != null && lt.annualAllowance > 0)
      .map((leaveType) => {
        const used = deductibleLeaves
          .filter((l) => l.leaveTypeId === leaveType.id)
          .reduce((sum, l) => sum + (l.totalDays || 0), 0)

        const allowance = leaveType.annualAllowance || 0
        const remaining = allowance - used

        return {
          leaveType,
          allowance,
          used,
          remaining,
        }
      })

    // Non-deductible breakdown
    const nonDeductibleBreakdown = leaveTypes
      .filter((lt) => lt.annualAllowance == null || lt.annualAllowance === 0)
      .map((leaveType) => {
        const leaves = nonDeductibleLeaves.filter((l) => l.leaveTypeId === leaveType.id)
        const days = leaves.reduce((sum, l) => sum + (l.totalDays || 0), 0)
        return {
          leaveType,
          count: leaves.length,
          days,
        }
      })
      .filter((item) => item.count > 0)

    return {
      year,
      fiscalPeriodStart: fiscalPeriodStart.toISOString(),
      fiscalPeriodEnd: fiscalPeriodEnd.toISOString(),
      totalAllowance,
      totalUsed,
      totalRemaining,
      carriedOver,
      balances: balanceBreakdown,
      deductible,
      nonDeductible: nonDeductibleBreakdown,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching leave balance:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch leave balance',
    })
  }
})