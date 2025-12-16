// server/utils/geolocation.ts

/**
 * Get country from IP address using ip-api.com (free, no API key required)
 * Rate limit: 45 requests/minute for free tier
 */
export async function getCountryFromIP(ipAddress: string): Promise<string | null> {
  try {
    // Skip for localhost/private IPs
    if (
      ipAddress === 'unknown' ||
      ipAddress === '::1' ||
      ipAddress === '127.0.0.1' ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.')
    ) {
      return null
    }

    // Call ip-api.com (free, no API key needed)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.warn(`IP geolocation API returned ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.status === 'success' && data.country) {
      return data.country
    }

    return null
  } catch (error) {
    // Don't throw - geolocation failure shouldn't block login
    console.warn('Failed to get country from IP:', error)
    return null
  }
}
