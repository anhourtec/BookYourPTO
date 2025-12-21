import { prisma } from '~/server/utils/db'

/**
 * ============================================
 * UPDATE SECURITY VIOLATION
 * ============================================
 * Mark violation as reviewed with notes
 * Only ADMINISTRATOR and EXECUTIVE can access
 */

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth

    if (!auth) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    // Only ADMINISTRATOR and EXECUTIVE can review violations
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to review security violations',
      })
    }

    const violationId = getRouterParam(event, 'id')
    if (!violationId) {
      throw createError({
        statusCode: 400,
        message: 'Violation ID is required',
      })
    }

    const body = await readBody(event)
    const { reviewed, notes } = body

    // Update violation
    const violation = await prisma.securityViolation.update({
      where: {
        id: violationId,
        organizationId: auth.organizationId, // Ensure org isolation
      },
      data: {
        reviewed: reviewed ?? undefined,
        reviewedBy: auth.userId,
        reviewedAt: reviewed ? new Date() : undefined,
        notes: notes ?? undefined,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return {
      success: true,
      violation,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error updating security violation:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update security violation',
    })
  }
})
