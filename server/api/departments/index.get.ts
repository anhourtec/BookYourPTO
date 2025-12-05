import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)

    // Get query param to optionally include inactive departments
    const query = getQuery(event)
    const includeInactive = query.includeInactive === 'true'

    const departments = await prisma.department.findMany({
      where: {
        organizationId: decoded.organizationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        headOfDept: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
