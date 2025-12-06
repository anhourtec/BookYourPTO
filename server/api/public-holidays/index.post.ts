import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const addHolidayLocationSchema = z.object({
  country: z.string().length(2, 'Country code must be 2 characters'),
  subdivision: z.string().optional().nullable(),
  year: z.number().int().min(2020).max(2050),
})

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

// Fetch holidays from Nager.Date API (Free, no rate limit, CORS enabled)
async function fetchHolidaysFromAPI(countryCode: string, year: number): Promise<NagerHoliday[]> {
  try {
    const response = await $fetch<NagerHoliday[]>(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    return Array.isArray(response) ? response : []
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
    
    const body = await readBody(event)
    const data = addHolidayLocationSchema.parse(body)

    // Check if country/subdivision combination already exists
    const existing = await prisma.publicHoliday.findFirst({
      where: {
        organizationId: decoded.organizationId,
        country: data.country,
        region: data.subdivision || null,
      },
    })

    if (existing) {
      const locationName = data.subdivision 
        ? `${data.country} (${data.subdivision})` 
        : data.country
      throw createError({
        statusCode: 400,
        message: `${locationName} is already added to your holiday locations`,
      })
    }

    // Fetch holidays from Nager.Date API
    const allHolidays = await fetchHolidaysFromAPI(data.country, data.year)

    if (allHolidays.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No holidays found for this country. Please verify the country code.',
      })
    }

    // Filter holidays based on subdivision if specified
    let holidaysToSave: NagerHoliday[] = allHolidays

    if (data.subdivision) {
      // If subdivision is specified, only include:
      // 1. Global holidays (apply to entire country)
      // 2. Holidays specific to this subdivision
      holidaysToSave = allHolidays.filter(holiday => 
        holiday.global || 
        (holiday.counties && holiday.counties.includes(data.subdivision!))
      )

      if (holidaysToSave.length === 0) {
        throw createError({
          statusCode: 404,
          message: `No holidays found for ${data.country} - ${data.subdivision}`,
        })
      }
    }

    // Save holidays to database
    const createdHolidays = await Promise.all(
      holidaysToSave.map(holiday =>
        prisma.publicHoliday.create({
          data: {
            organizationId: decoded.organizationId,
            country: data.country,
            name: holiday.name,
            date: new Date(holiday.date),
            isRecurring: holiday.fixed === false,
            region: data.subdivision || (holiday.counties?.join(', ') || null),
            affectedDepartments: [],
            isHalfDay: false,
          },
        })
      )
    )

    const locationName = data.subdivision 
      ? `${data.country} (${data.subdivision})` 
      : data.country

    return {
      success: true,
      message: `Added ${createdHolidays.length} holidays for ${locationName}`,
      count: createdHolidays.length,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: error.errors[0]?.message || 'Validation failed',
      })
    }
    
    console.error('Error adding holiday location:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to add holiday location',
    })
  }
})
