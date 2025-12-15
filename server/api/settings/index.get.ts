import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // ============================================
    // FIXED: Get auth from middleware (already verified)
    // No need to manually verify token!
    // ============================================
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }

    // Fetch organization settings
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        id: true,
        name: true,
        timezone: true,
        leaveYearStartMonth: true,
        businessDays: true,
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
      throw createError({ 
        statusCode: 404, 
        message: 'Organization not found' 
      })
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