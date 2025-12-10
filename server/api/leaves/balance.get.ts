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
    const year =
      query.year != null ? parseInt(query.year as string, 10) : new Date().getFullYear()

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
    }

    // Org settings
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        leaveYearStartMonth: true,
        defaultLeaveAllowance: true,
      },
    })

    if (!organization) {
      throw createError({
        statusCode: 404,
        message: 'Organization not found',
      })
    }

    // Fiscal period
    const fiscalStartMonth = organization.leaveYearStartMonth
    const fiscalPeriodStart = new Date(year, fiscalStartMonth - 1, 1)
    const fiscalPeriodEnd = new Date(year + 1, fiscalStartMonth - 1, 0)

    // Leave types
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        organizationId: auth.organizationId,
        isActive: true,
      },
    })

    // Balances (per leave type)
    const balances = await prisma.leaveBalance.findMany({
      where: {
        userId,
        year,
        organizationId: auth.organizationId,
      },
      include: {
        leaveType: true,
      },
    })

    // Used leaves in fiscal period
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

    const nonDeductibleCodes = ['WFH', 'MEETING', 'SICK_PAID', 'SPECIAL']

    const deductibleLeaves = usedLeaves.filter(
      (l) => l.leaveType && !nonDeductibleCodes.includes(l.leaveType.code),
    )
    const nonDeductibleLeaves = usedLeaves.filter(
      (l) => l.leaveType && nonDeductibleCodes.includes(l.leaveType.code),
    )

    // Totals using totalDays
    const totalUsed = deductibleLeaves.reduce(
      (sum, leave) => sum + (leave.totalDays || 0),
      0,
    )
    const totalAllowance = organization.defaultLeaveAllowance
    const carriedOver = balances.reduce((sum, b) => sum + (b.carriedOver || 0), 0)
    const totalRemaining = totalAllowance + carriedOver - totalUsed

    // Deductible breakdown (by leave type)
    const deductibleMap: Record<
      string,
      { leaveType: any; days: number }
    > = {}

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
      .filter((lt) => !nonDeductibleCodes.includes(lt.code))
      .map((leaveType) => {
        const balance = balances.find((b) => b.leaveTypeId === leaveType.id)
        const used = deductibleLeaves
          .filter((l) => l.leaveTypeId === leaveType.id)
          .reduce((sum, l) => sum + (l.totalDays || 0), 0)

        const allowance = leaveType.annualAllowance || 0
        const remaining = (balance?.currentBalance ?? allowance) - used

        return {
          leaveType,
          allowance,
          used,
          remaining,
        }
      })

    // Non‑deductible breakdown
    const nonDeductibleBreakdown = leaveTypes
      .filter((lt) => nonDeductibleCodes.includes(lt.code))
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
      deductible,       // <-- for sidebar deductibleDisplay
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
