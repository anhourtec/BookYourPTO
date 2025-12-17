import { prisma } from '~/server/utils/db'
import { z } from 'zod'

const brandingSchema = z.object({
  brandName: z.string().min(1).max(100).optional(),
  logoLightUrl: z.string().url().optional().nullable(),
  logoDarkUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  faviconDarkUrl: z.string().url().optional().nullable(),
  customCSS: z.any().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth

    if (!auth) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    // Check if user has permission to update branding
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser || currentUser.role !== 'EXECUTIVE') {
      throw createError({
        statusCode: 403,
        message: 'Only Executives can update branding settings',
      })
    }

    const body = await readBody(event)
    const data = brandingSchema.parse(body)

    // Update organization branding
    const updatedOrganization = await prisma.organization.update({
      where: { id: auth.organizationId },
      data: {
        ...(data.brandName !== undefined && { brandName: data.brandName }),
        ...(data.logoLightUrl !== undefined && { logoLightUrl: data.logoLightUrl }),
        ...(data.logoDarkUrl !== undefined && { logoDarkUrl: data.logoDarkUrl }),
        ...(data.faviconUrl !== undefined && { faviconUrl: data.faviconUrl }),
        ...(data.faviconDarkUrl !== undefined && { faviconDarkUrl: data.faviconDarkUrl }),
        ...(data.customCSS !== undefined && { customCSS: data.customCSS }),
      },
      select: {
        brandName: true,
        logoLightUrl: true,
        logoDarkUrl: true,
        faviconUrl: true,
        faviconDarkUrl: true,
        customCSS: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: auth.organizationId,
        userId: auth.userId,
        action: 'SETTINGS_CHANGE',
        entityType: 'ORGANIZATION',
        entityId: auth.organizationId,
        changes: {
          branding: data,
        },
        ipAddress: getHeader(event, 'x-forwarded-for') || 'unknown',
        userAgent: getHeader(event, 'user-agent') || 'unknown',
      },
    })

    console.log('Branding settings updated')

    return updatedOrganization
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.issues) {
      throw createError({
        statusCode: 400,
        message: `Validation failed: ${error.issues[0].message}`,
      })
    }

    console.error('Error updating branding settings:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update branding settings',
    })
  }
})
