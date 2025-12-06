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
    
    // Fetch users for the authenticated user's organization
    const users = await prisma.user.findMany({
      where: {
        organizationId: auth.organizationId,
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