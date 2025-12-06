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
    
    const holidayId = getRouterParam(event, 'id')
    if (!holidayId) {
      throw createError({ statusCode: 400, message: 'Holiday ID is required' })
    }

    // Verify holiday exists and get country code
    const holiday = await prisma.publicHoliday.findFirst({
      where: {
        id: holidayId,
        organizationId: decoded.organizationId,
      },
    })

    if (!holiday) {
      throw createError({ statusCode: 404, message: 'Holiday location not found' })
    }

    // Delete all holidays for this country
    await prisma.publicHoliday.deleteMany({
      where: {
        organizationId: decoded.organizationId,
        country: holiday.country,
      },
    })

    return { 
      success: true, 
      message: 'Holiday location removed successfully' 
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Error deleting holiday location:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete holiday location',
    })
  }
})
