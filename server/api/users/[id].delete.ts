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

    // Verify the user belongs to the same organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: decoded.organizationId,
      },
    })

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // Prevent deleting yourself
    if (userId === decoded.userId) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete your own account',
      })
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    })

    return { success: true, message: 'User deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error deleting user:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete user',
    })
  }
})