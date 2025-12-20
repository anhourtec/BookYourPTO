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
    const userId = getRouterParam(event, 'id')

    // Verify user belongs to organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: decoded.organizationId
      }
    })

    if (!user) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    // Get user's holiday overrides with related holiday details
    const overrides = await prisma.userHolidayOverride.findMany({
      where: {
        userId: userId,
        organizationId: decoded.organizationId
      },
      include: {
        publicHoliday: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return overrides
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Error fetching user holiday overrides:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch holiday overrides'
    })
  }
})
