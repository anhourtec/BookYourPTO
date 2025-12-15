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
    const canApprove = 
      currentUser.isApprover ||
      ['ADMINISTRATOR', 'EXECUTIVE', 'HR', 'DEPARTMENT_HEAD', 'MANAGER'].includes(currentUser.role)

    if (!canApprove) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to approve requests',
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

    // Department heads can only approve their department's requests
    if (currentUser.role === 'DEPARTMENT_HEAD') {
      if (leave.user.departmentId !== currentUser.departmentId) {
        throw createError({
          statusCode: 403,
          message: 'You can only approve requests from your department',
        })
      }
    }

    // Approve the leave
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: 'APPROVED',
        firstLevelApproverId: auth.userId,
        firstLevelApprovedAt: new Date(),
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

    console.log(`✅ Leave approved: ${leaveId} by ${currentUser.firstName} ${currentUser.lastName}`)

    // TODO: Send notification email to the user
    // await sendLeaveApprovedEmail(leave.user.email, updatedLeave)

    return updatedLeave
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('❌ Error approving leave:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to approve leave request',
    })
  }
})