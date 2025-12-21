/**
 * ============================================
 * PUBLIC API: Get Organization Branding
 * ============================================
 * Fetches organization branding without authentication
 * Used to display branding on login page and after logout
 */

import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const orgId = getRouterParam(event, 'orgId')

    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required',
      })
    }

    // Fetch organization branding
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        brandName: true,
        logoLightUrl: true,
        logoDarkUrl: true,
        faviconUrl: true,
        faviconDarkUrl: true,
      },
    })

    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found',
      })
    }

    return {
      brandName: organization.brandName || 'BookYourPTO',
      logoLightUrl: organization.logoLightUrl,
      logoDarkUrl: organization.logoDarkUrl,
      faviconUrl: organization.faviconUrl,
      faviconDarkUrl: organization.faviconDarkUrl,
    }
  } catch (error: any) {
    console.error('Error fetching public branding:', error)

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch organization branding',
    })
  }
})
