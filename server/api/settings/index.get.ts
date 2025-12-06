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

    // Fetch organization settings
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: {
        id: true,
        name: true,
        timezone: true,
        leaveYearStartMonth: true,
        defaultLeaveAllowance: true,
        weekStartDay: true,
        calendarViewRestricted: true,
        departmentViewRestricted: true,
        carryForwardDays: true,
        carryForwardHours: true,
        carryForwardExpires: true,
        carryForwardExpiryMonths: true,
      },
    })

    if (!organization) {
      throw createError({ statusCode: 404, message: 'Organization not found' })
    }

    return organization
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching settings:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch settings',
    })
  }
})
