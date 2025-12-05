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

    // Get update data from request body
    const body = await readBody(event)

    // Update user with explicit updatedAt
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
        organizationId: decoded.organizationId
      },
      data: {
        ...body,
        updatedAt: new Date() // Force update timestamp
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
            lastName: true
          }
        }
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    return userWithoutPassword
  } catch (error: any) {
    console.error('Error updating user:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update user'
    })
  }
})
