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
    
    // Check if user is ADMINISTRATOR or EXECUTIVE
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    })

    if (!currentUser || (currentUser.role !== 'ADMINISTRATOR' && currentUser.role !== 'EXECUTIVE')) {
      throw createError({ 
        statusCode: 403, 
        message: 'Only Administrators and Executives can delete departments' 
      })
    }

    const deptId = getRouterParam(event, 'id')
    if (!deptId) {
      throw createError({ statusCode: 400, message: 'Department ID is required' })
    }

    // Verify department exists and belongs to organization
    const department = await prisma.department.findFirst({
      where: {
        id: deptId,
        organizationId: decoded.organizationId,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    if (!department) {
      throw createError({ statusCode: 404, message: 'Department not found' })
    }

    // Check if department has users
    if (department._count.users > 0) {
      throw createError({ 
        statusCode: 400, 
        message: `Cannot delete department with ${department._count.users} active member(s). Please reassign users first.` 
      })
    }

    // Delete the department
    await prisma.department.delete({
      where: {
        id: deptId,
      },
    })

    return { success: true, message: 'Department deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error deleting department:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete department',
    })
  }
})
