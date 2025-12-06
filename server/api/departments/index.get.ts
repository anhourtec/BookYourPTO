import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // ============================================
    // FIXED: Get auth from middleware (already verified)
    // No need to manually verify token!
    // ============================================
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }

    // Get query param to optionally include inactive departments
    const query = getQuery(event)
    const includeInactive = query.includeInactive === 'true'

    const departments = await prisma.department.findMany({
      where: {
        organizationId: auth.organizationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        headOfDept: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return departments
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching departments:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch departments',
    })
  }
})