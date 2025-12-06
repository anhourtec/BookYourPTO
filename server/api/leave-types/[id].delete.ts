
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
    const leaveTypeId = getRouterParam(event, 'id')

    // Check if user has permission to delete leave types
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only Administrators and Executives can delete leave types',
      })
    }

    // Verify leave type belongs to user's organization
    const existingLeaveType = await prisma.leaveType.findFirst({
      where: {
        id: leaveTypeId,
        organizationId: decoded.organizationId,
      },
      include: {
        _count: {
          select: {
            leaves: true,
          },
        },
      },
    })

    if (!existingLeaveType) {
      throw createError({
        statusCode: 404,
        message: 'Leave type not found',
      })
    }

    // Check if leave type has existing leave requests
    if (existingLeaveType._count.leaves > 0) {
      throw createError({
        statusCode: 400,
        message: `Cannot delete leave type with ${existingLeaveType._count.leaves} existing leave request(s). Consider deactivating it instead.`,
      })
    }

    // Delete leave type
    await prisma.leaveType.delete({
      where: { id: leaveTypeId },
    })

    return {
      success: true,
      message: 'Leave type deleted successfully',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error deleting leave type:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete leave type',
    })
  }
})