interface NagerCountry {
  countryCode: string
  name: string
}

export default defineEventHandler(async (event) => {
  try {
    // Fetch available countries from Nager.Date API
    const countries = await $fetch<NagerCountry[]>(
      'https://date.nager.at/api/v3/AvailableCountries',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    return Array.isArray(countries) ? countries : []
  } catch (error) {
    console.error('Error fetching countries from Nager.Date API:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch available countries',
    })
  }
})
