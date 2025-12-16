// server/utils/signin-logger.ts
import { prisma } from '~/server/utils/db'
import type { H3Event } from 'h3'
import { getCountryFromIP } from '~/server/utils/geolocation'

/**
 * Parse user agent to extract device, browser, and OS information
 */
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()

  // Detect device type
  let deviceType = 'desktop'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet'
  }

  // Detect browser
  let browser = 'Unknown'
  if (ua.includes('edg/')) {
    browser = 'Edge'
  } else if (ua.includes('chrome/') && !ua.includes('edg/')) {
    browser = 'Chrome'
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox'
  } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
    browser = 'Safari'
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera'
  }

  // Detect OS
  let os = 'Unknown'
  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('mac os')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS'
  }

  return { deviceType, browser, os }
}

/**
 * Get client IP address from request
 */
function getClientIP(event: H3Event): string {
  // Try to get IP from common headers (for proxies/load balancers)
  const headers = getHeaders(event)
  const forwarded = headers['x-forwarded-for']
  const realIP = headers['x-real-ip']
  const cfIP = headers['cf-connecting-ip'] // Cloudflare

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return (forwarded as string).split(',')[0].trim()
  }

  if (realIP) {
    return realIP as string
  }

  if (cfIP) {
    return cfIP as string
  }

  // Fallback to event.node.req
  return event.node.req.socket.remoteAddress || 'unknown'
}

/**
 * Log a sign-in attempt (successful or failed)
 */
export async function logSignInAttempt(
  event: H3Event,
  email: string,
  organizationId: string,
  userId: string | null,
  success: boolean,
  failureReason?: string
) {
  try {
    const userAgent = getHeader(event, 'user-agent') || 'Unknown'
    const ipAddress = getClientIP(event)
    const { deviceType, browser, os } = parseUserAgent(userAgent)

    // Get country from IP (non-blocking)
    const country = await getCountryFromIP(ipAddress)

    await prisma.signInLog.create({
      data: {
        organizationId,
        userId,
        email: email.toLowerCase(),
        success,
        failureReason: failureReason || null,
        ipAddress,
        userAgent,
        deviceType,
        browser,
        os,
        country,
        city: null, // Not fetching city to keep it simple
      },
    })

    console.log(`Sign-in attempt logged: ${email} - ${success ? 'Success' : 'Failed'} - IP: ${ipAddress} - Country: ${country || 'Unknown'}`)
  } catch (error) {
    // Don't throw - logging shouldn't block login
    console.error('Failed to log sign-in attempt:', error)
  }
}
