import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth

    if (!auth) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    // Get organization branding settings
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        brandName: true,
        logoLightUrl: true,
        logoDarkUrl: true,
        faviconUrl: true,
        faviconDarkUrl: true,
        customCSS: true,
      },
    })

    if (!organization) {
      throw createError({
        statusCode: 404,
        message: 'Organization not found',
      })
    }

    return organization
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching branding settings:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch branding settings',
    })
  }
})
