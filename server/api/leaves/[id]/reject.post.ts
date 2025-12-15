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

    // Get request body for rejection reason
    const body = await readBody(event)
    const rejectionReason = body?.reason || 'No reason provided'

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { 
        role: true, 
        departmentId: true,
        isApprover: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // Check permissions
    const canReject = 
      currentUser.isApprover ||
      ['ADMINISTRATOR', 'EXECUTIVE', 'HR', 'DEPARTMENT_HEAD', 'MANAGER'].includes(currentUser.role)

    if (!canReject) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to reject requests',
      })
    }

    // Get the leave request
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            departmentId: true,
            email: true,
          },
        },
        leaveType: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!leave) {
      throw createError({
        statusCode: 404,
        message: 'Leave request not found',
      })
    }

    // Verify organization
    if (leave.organizationId !== auth.organizationId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    // Check if already processed
    if (leave.status !== 'PENDING') {
      throw createError({
        statusCode: 400,
        message: `Leave request is already ${leave.status.toLowerCase()}`,
      })
    }

    // Department heads can only reject their department's requests
    if (currentUser.role === 'DEPARTMENT_HEAD') {
      if (leave.user.departmentId !== currentUser.departmentId) {
        throw createError({
          statusCode: 403,
          message: 'You can only reject requests from your department',
        })
      }
    }

    // Reject the leave
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: 'REJECTED',
        firstLevelApproverId: auth.userId,
        firstLevelApprovedAt: new Date(),
        rejectionReason,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        leaveType: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        firstLevelApprover: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    console.log(`❌ Leave rejected: ${leaveId} by ${currentUser.firstName} ${currentUser.lastName}`)

    // TODO: Send notification email to the user
    // await sendLeaveRejectedEmail(leave.user.email, updatedLeave, rejectionReason)

    return updatedLeave
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('❌ Error rejecting leave:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to reject leave request',
    })
  }
})