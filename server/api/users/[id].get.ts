import { prisma } from '~/server/utils/db'
import { verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    // Get user ID from route params
    const userId = event.context.params?.id
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }

    // Fetch the user
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: decoded.organizationId
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true
          }
        },
        workSchedules: {
          orderBy: {
            effectiveFrom: 'desc'
          }
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return userWithoutPassword
  } catch (error: any) {
    console.error('Error fetching user:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch user'
    })
  }
})
