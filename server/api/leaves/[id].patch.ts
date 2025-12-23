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

    const leaveId = getRouterParam(event, 'id')
    if (!leaveId) {
      throw createError({
        statusCode: 400,
        message: 'Leave ID is required'
      })
    }

    const body = await readBody(event)

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true, isApprover: true }
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found'
      })
    }

    // Get leave request
    const leave = await prisma.leave.findFirst({
      where: {
        id: leaveId,
        organizationId: auth.organizationId
      },
      include: {
        leaveType: true,
        user: true
      }
    })

    if (!leave) {
      throw createError({
        statusCode: 404,
        message: 'Leave request not found'
      })
    }

    // Permission checks
    const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)
    const isApprover = currentUser.isApprover || currentUser.role === 'DEPARTMENT_HEAD'
    const isOwner = leave.userId === auth.userId

    // Status update (approve/reject) - only approvers
    if (body.status && body.status !== leave.status) {
      if (!isApprover && !isAdmin) {
        throw createError({
          statusCode: 403,
          message: 'Insufficient permissions to update leave status'
        })
      }

      const updateData: any = {
        status: body.status,
        updatedAt: new Date()
      }

      if (body.status === 'APPROVED') {
        updateData.firstLevelApprovedAt = new Date()
        updateData.firstLevelApproverId = auth.userId
        updateData.firstLevelComment = body.firstLevelComment
      } else if (body.status === 'REJECTED') {
        updateData.rejectionReason = body.rejectionReason
      }

      const updatedLeave = await prisma.leave.update({
        where: { id: leaveId },
        data: updateData,
        include: {
          leaveType: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      // TODO: Send notification to user

      return updatedLeave
    }

    throw createError({
      statusCode: 400,
      message: 'No valid update provided'
    })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error updating leave:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update leave request'
    })
  }
})
