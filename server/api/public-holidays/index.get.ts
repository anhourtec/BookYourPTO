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
    const userId = query.userId as string | undefined // Optional: get holidays for specific user

    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: { timezone: true },
    })

    if (!organization) {
      throw createError({ statusCode: 404, message: 'Organization not found' })
    }

    // Get user-specific holiday settings if userId is provided
    let targetUser = null
    if (userId) {
      targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          organizationId: decoded.organizationId
        },
        select: {
          id: true,
          holidayCountry: true,
          holidayRegion: true
        }
      })
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

    // Apply user-specific country/region if userId is provided
    if (userId && targetUser && targetUser.holidayCountry) {
      console.log(`🌍 User has custom holiday country: ${targetUser.holidayCountry}${targetUser.holidayRegion ? ` (${targetUser.holidayRegion})` : ''}`)

      // Fetch holidays from API for user's country (don't save to org's public holidays)
      console.log(`📥 Fetching holidays from API for ${targetUser.holidayCountry}...`)
      try {
        let apiHolidays = await fetchHolidaysFromAPI(targetUser.holidayCountry, year)

        // Filter by subdivision if specified
        if (targetUser.holidayRegion) {
          apiHolidays = apiHolidays.filter(h =>
            h.global || (h.counties && h.counties.includes(targetUser.holidayRegion!))
          )
        }

        // Convert to the expected format but DON'T save to database
        // This keeps holidays user-specific and doesn't pollute org holidays
        holidays = apiHolidays.map(holiday => ({
          id: `temp-${targetUser.holidayCountry}-${holiday.date}`, // Temporary ID
          organizationId: decoded.organizationId,
          country: targetUser.holidayCountry!,
          name: holiday.name,
          date: parseHolidayDate(holiday.date),
          isRecurring: holiday.fixed === false,
          region: targetUser.holidayRegion || null,
          recurringPattern: null,
          affectedDepartments: [],
          isHalfDay: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        console.log(`✅ Fetched ${holidays.length} holidays for user's country (not saved to DB)`)
      } catch (error) {
        console.error(`❌ Failed to fetch holidays for ${targetUser.holidayCountry}:`, error)
        // Keep organization holidays if fetch fails
      }
    }

    // Apply user-specific overrides if userId is provided
    if (userId && targetUser) {
      console.log(`🎯 Applying user-specific holiday overrides for user ${userId}`)

      // Get user's holiday overrides
      const userOverrides = await prisma.userHolidayOverride.findMany({
        where: {
          userId: userId,
          organizationId: decoded.organizationId
        }
      })

      // Process EXCLUDE overrides - remove holidays
      const excludedHolidayIds = userOverrides
        .filter(o => o.type === 'EXCLUDE' && o.publicHolidayId)
        .map(o => o.publicHolidayId)

      holidays = holidays.filter(h => !excludedHolidayIds.includes(h.id))

      // Process ADD overrides - add custom holidays
      const customHolidays = userOverrides
        .filter(o => o.type === 'ADD' && o.date)
        .map(o => ({
          id: o.id,
          organizationId: decoded.organizationId,
          country: targetUser.holidayCountry || 'CUSTOM',
          region: targetUser.holidayRegion || null,
          name: o.name || 'Custom Holiday',
          date: o.date!,
          isRecurring: o.isRecurring,
          recurringPattern: null,
          affectedDepartments: [],
          isHalfDay: o.isHalfDay,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt
        }))

      holidays.push(...customHolidays)

      // Sort again after applying overrides
      holidays.sort((a, b) => a.date.getTime() - b.date.getTime())

      console.log(`✅ Applied ${userOverrides.length} overrides (${excludedHolidayIds.length} excluded, ${customHolidays.length} added)`)
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