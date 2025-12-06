import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)

    // Fetch all leave types for the organization
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        organizationId: decoded.organizationId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        color: true,
        icon: true,
        requiresApproval: true,
        requiresDocumentation: true,
        maxDaysPerRequest: true,
        minDaysNotice: true,
        allowHalfDays: true,
        allowQuarterDays: true,
        allowHourly: true,
        paidLeave: true,
        annualAllowance: true,
        hasAccrual: true,
        accrualRate: true,
        carryOverAllowed: true,
        maxCarryOverDays: true,
        requiresFirstLevelApproval: true,
        requiresSecondLevelApproval: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { isActive: 'desc' }, // Active ones first
        { name: 'asc' },
      ],
    })

    return leaveTypes
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching leave types:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch leave types',
    })
  }
})