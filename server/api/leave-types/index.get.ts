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

    // Get current year
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

    // Fetch all public holiday locations for the organization
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        organizationId: decoded.organizationId,
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Group by country and count holidays
    const locationMap = new Map<string, any>()
    
    holidays.forEach(holiday => {
      if (!locationMap.has(holiday.country)) {
        locationMap.set(holiday.country, {
          id: holiday.id,
          country: holiday.country,
          holidayCount: 0,
          createdAt: holiday.createdAt,
        })
      }
      
      // Increment holiday count for this country
      const location = locationMap.get(holiday.country)
      location.holidayCount++
    })

    return Array.from(locationMap.values())
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Error fetching public holidays:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch public holidays',
    })
  }
})
