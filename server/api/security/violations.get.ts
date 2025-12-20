import { prisma } from '~/server/utils/db'

/**
 * ============================================
 * GET SECURITY VIOLATIONS
 * ============================================
 * Retrieves security violations for admin review
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

    // Only ADMINISTRATOR and EXECUTIVE can view security logs
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to view security logs',
      })
    }

    // Get query parameters
    const query = getQuery(event)
    const limit = Number(query.limit) || 50
    const offset = Number(query.offset) || 0
    const reviewed = query.reviewed === 'true' ? true : query.reviewed === 'false' ? false : undefined

    // Build where clause
    const where: any = {
      organizationId: auth.organizationId,
    }

    if (reviewed !== undefined) {
      where.reviewed = reviewed
    }

    // Fetch violations with user details
    const [violations, total] = await Promise.all([
      prisma.securityViolation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.securityViolation.count({ where }),
    ])

    return {
      violations,
      total,
      limit,
      offset,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching security violations:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch security violations',
    })
  }
})
