import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'

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
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)

    const query = getQuery(event)
    const year = query.year != null ? parseInt(query.year as string, 10) : new Date().getFullYear()

    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: { timezone: true },
    })
    
    if (!organization) {
      throw createError({ statusCode: 404, message: 'Organization not found' })
    }

    const yearStartStr = `${year}-01-01T00:00:00.000Z`
    const yearEndStr = `${year}-12-31T23:59:59.999Z`
    
    const yearStart = new Date(yearStartStr)
    const yearEnd = new Date(yearEndStr)

    console.log(`📅 Fetching holidays for year ${year}`)

    // Fetch existing holidays from database
    let holidays = await prisma.publicHoliday.findMany({
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

    // ✅ If no holidays found, check for active locations and fetch from API
    if (holidays.length === 0) {
      console.log(`📅 No holidays in DB for ${year}, checking for active locations...`)
      
      // Get all unique country/region combinations from any year
      const locations = await prisma.publicHoliday.findMany({
        where: {
          organizationId: decoded.organizationId,
        },
        select: {
          country: true,
          region: true,
        },
        distinct: ['country', 'region'],
      })

      if (locations.length > 0) {
        console.log(`📅 Found ${locations.length} active locations, fetching holidays for ${year}...`)
        
        // Fetch and save holidays for each location
        for (const location of locations) {
          try {
            let apiHolidays = await fetchHolidaysFromAPI(location.country, year)
            
            // Filter by subdivision if specified
            if (location.region) {
              apiHolidays = apiHolidays.filter(h => 
                h.global || (h.counties && h.counties.includes(location.region!))
              )
            }

            // Save holidays to database
            const created = await Promise.all(
              apiHolidays.map(holiday =>
                prisma.publicHoliday.create({
                  data: {
                    organizationId: decoded.organizationId,
                    country: location.country,
                    name: holiday.name,
                    date: parseHolidayDate(holiday.date),
                    isRecurring: holiday.fixed === false,
                    region: location.region,
                    affectedDepartments: [],
                    isHalfDay: false,
                  },
                })
              )
            )

            console.log(`✅ Created ${created.length} holidays for ${location.country}${location.region ? ` (${location.region})` : ''} in ${year}`)
            holidays.push(...created)
          } catch (error) {
            console.error(`❌ Failed to fetch holidays for ${location.country}:`, error)
          }
        }

        // Sort by date
        holidays.sort((a, b) => a.date.getTime() - b.date.getTime())
      }
    }

    console.log(`✅ Returning ${holidays.length} holidays for ${year}`)
    return holidays
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('❌ Error fetching public holidays:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch public holidays',
    })
  }
})