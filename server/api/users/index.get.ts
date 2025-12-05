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
    
    const users = await prisma.user.findMany({
      where: {
        organizationId: decoded.organizationId,
      },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    })

    return users
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching users:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch users',
    })
  }
})