import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }

    // Get organization settings
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        defaultLeaveAllowance: true,
        carryForwardDays: true,
        carryForwardHours: true,
        carryForwardExpires: true,
        carryForwardExpiryMonths: true,
        leaveYearStartMonth: true,
        timezone: true,
        dateFormat: true,
        timeFormat: true,
        weekStartDay: true,
        currency: true,
        fiscalYearStart: true,
        country: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
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

    console.error('❌ Error fetching organization settings:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch organization settings',
    })
  }
})