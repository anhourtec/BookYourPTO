interface CountryInfo {
  commonName: string
  officialName: string
  countryCode: string
  region: string
  borders: Array<{
    commonName: string
    officialName: string
    countryCode: string
    region: string
  }> | null
}

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

interface Subdivision {
  code: string
  name: string
}

export default defineEventHandler(async (event) => {
  try {
    const countryCode = getRouterParam(event, 'countryCode')
    if (!countryCode) {
      throw createError({ statusCode: 400, message: 'Country code is required' })
    }

    // Fetch a sample year of holidays to extract subdivisions
    const currentYear = new Date().getFullYear()
    
    let holidays: NagerHoliday[] = []
    try {
      holidays = await $fetch<NagerHoliday[]>(
        `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )
    } catch (err) {
      console.error('Error fetching holidays:', err)
      return []
    }

    if (!Array.isArray(holidays)) {
      return []
    }

    // Extract unique subdivisions from holidays
    const subdivisionSet = new Set<string>()
    
    for (const holiday of holidays) {
      if (holiday.counties && Array.isArray(holiday.counties)) {
        for (const county of holiday.counties) {
          if (county && typeof county === 'string') {
            subdivisionSet.add(county)
          }
        }
      }
    }

    // Convert to array of objects with code and name
    const subdivisions: Subdivision[] = Array.from(subdivisionSet)
      .map(code => ({
        code,
        name: code, // Nager.Date uses ISO-3166-2 codes
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return subdivisions
  } catch (error: any) {
    console.error('Error fetching subdivisions:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch subdivisions',
    })
  }
})
