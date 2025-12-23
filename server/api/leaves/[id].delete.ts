import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth

    if (!auth) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const leaveId = getRouterParam(event, 'id')
    if (!leaveId) {
      throw createError({
        statusCode: 400,
        message: 'Leave ID is required',
      })
    }

    // Get current user
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

    // Get leave request
    const leave = await prisma.leave.findFirst({
      where: {
        id: leaveId,
        organizationId: auth.organizationId,
      },
      include: {
        leaveType: true,
      },
    })

    if (!leave) {
      throw createError({
        statusCode: 404,
        message: 'Leave request not found',
      })
    }

    // Permission check - FIXED: Proper admin check
    const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)
    const isOwner = leave.userId === auth.userId

    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: 'You can only cancel your own leave requests',
      })
    }

    // Can only cancel pending or approved leaves
    if (!['PENDING', 'APPROVED'].includes(leave.status)) {
      console.error(`Cannot cancel leave ${leaveId}: status is ${leave.status}`)
      throw createError({
        statusCode: 400,
        message: `Cannot cancel leave with status: ${leave.status}. Only PENDING or APPROVED leaves can be cancelled.`,
      })
    }

    // Check if leave has already started (use ISO date strings to avoid timezone issues)
    const todayStr = new Date().toISOString().split('T')[0]
    const leaveStartStr = new Date(leave.startDate).toISOString().split('T')[0]

    // FIXED: Owners cannot cancel leaves that have already started; admins CAN
    if (!isAdmin && leaveStartStr < todayStr) {
      console.error(`Cannot cancel leave ${leaveId}: leave started on ${leaveStartStr}, today is ${todayStr}`)
      throw createError({
        statusCode: 400,
        message: `Cannot cancel a leave that has already started (start date: ${leaveStartStr})`,
      })
    }

    // Update leave status to cancelled
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
        // Store cancellation metadata in notes or a JSON field if available
        notes: leave.notes 
          ? `${leave.notes}\n\nCancelled by ${isAdmin ? 'administrator' : 'user'} on ${new Date().toISOString()}`
          : `Cancelled by ${isAdmin ? 'administrator' : 'user'} on ${new Date().toISOString()}`,
      },
    })

    return {
      success: true,
      message: 'Leave request cancelled successfully',
      leave: updatedLeave,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error cancelling leave:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to cancel leave request',
    })
  }
})
