import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }

    const userId = getRouterParam(event, 'id')
    if (!userId) {
      throw createError({ 
        statusCode: 400, 
        message: 'User ID is required' 
      })
    }

    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found',
      })
    }

    // Verify the user to delete belongs to the same organization
    const userToDelete = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: auth.organizationId,
      },
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!userToDelete) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // ✅ BUSINESS RULE 1: Cannot delete yourself
    if (userId === auth.userId) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete your own account',
      })
    }

    // ✅ BUSINESS RULE 2: Only EXECUTIVES can delete other EXECUTIVES
    if (userToDelete.role === 'EXECUTIVE' && currentUser.role !== 'EXECUTIVE') {
      throw createError({
        statusCode: 403,
        message: 'Only executives can delete executive accounts',
      })
    }

    // ✅ BUSINESS RULE 3: Check minimum permissions
    if (!['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to delete users',
      })
    }

    // Delete the user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: auth.organizationId,
        userId: auth.userId,
        action: 'DELETE',
        entityType: 'USER',
        entityId: userId,
        changes: {
          deletedUser: {
            firstName: userToDelete.firstName,
            lastName: userToDelete.lastName,
            role: userToDelete.role,
          },
        },
        ipAddress: getHeader(event, 'x-forwarded-for') || 'unknown',
        userAgent: getHeader(event, 'user-agent') || 'unknown',
      },
    })

    return { 
      success: true, 
      message: 'User deleted successfully' 
    }
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