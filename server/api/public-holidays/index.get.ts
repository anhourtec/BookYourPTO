import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'

// Define the API response type from Nager.Date API
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

// Fetch holidays from Nager.Date API (only public holidays)
async function fetchPublicHolidaysFromAPI(countryCode: string, year: number): Promise<NagerHoliday[]> {
  try {
    const response = await $fetch<NagerHoliday[]>(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    
    // Filter to only include Public holidays
    const publicHolidays = Array.isArray(response) 
      ? response.filter(h => h.types && h.types.includes('Public'))
      : []
    
    return publicHolidays
  } catch (error) {
    console.error(`Error fetching holidays from Nager.Date API for ${countryCode}:`, error)
    return []
  }
}

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

    // Fetch all public holidays for the organization in current year
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

    // Group by country+subdivision combination
    const locationMap = new Map<string, any>()
    
    holidays.forEach(holiday => {
      // Create unique key for country+subdivision combination
      const locationKey = `${holiday.country}||${holiday.region || ''}`
      
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          id: holiday.id,
          country: holiday.country,
          subdivision: holiday.region,
          holidayCount: 0,
          createdAt: holiday.createdAt,
        })
      }
      
      // Increment holiday count for this location
      const location = locationMap.get(locationKey)
      if (location) {
        location.holidayCount++
      }
    })

    // Now fetch actual public holidays from API for accurate counts
    const locationsArray = Array.from(locationMap.values())
    
    // Update counts with actual public holiday counts from API
    await Promise.all(
      locationsArray.map(async (location) => {
        try {
          let publicHolidays = await fetchPublicHolidaysFromAPI(location.country, currentYear)
          
          // Filter by subdivision if specified
          if (location.subdivision) {
            publicHolidays = publicHolidays.filter(h => 
              h.global || (h.counties && h.counties.includes(location.subdivision))
            )
          }
          
          // Update the count with actual public holidays
          location.holidayCount = publicHolidays.length
        } catch (error) {
          console.error(`Error fetching holidays for ${location.country}:`, error)
          // Keep the database count as fallback
        }
      })
    )

    return locationsArray
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Error fetching public holidays:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch public holidays',
    })
  }
})