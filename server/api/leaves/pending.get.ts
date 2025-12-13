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

    // Get current user with role
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { 
        role: true, 
        departmentId: true,
        isApprover: true,
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
        message: 'Insufficient permissions to view pending requests',
      })
    }

    // Build where clause based on role
    let whereClause: any = {
      organizationId: auth.organizationId,
      status: 'PENDING',
    }

    // Department heads only see their department's requests
    if (currentUser.role === 'DEPARTMENT_HEAD' && currentUser.departmentId) {
      whereClause.user = {
        departmentId: currentUser.departmentId,
      }
    }
    // HR and Managers see all requests (no additional filter needed)
    // Administrators and Executives see all requests (no additional filter needed)

    // Fetch pending leave requests
    const pendingRequests = await prisma.leave.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            department: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
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
      orderBy: [
        { createdAt: 'asc' }, // Oldest first (FIFO)
      ],
    })

    console.log(`📋 Found ${pendingRequests.length} pending requests for ${currentUser.role}`)

    return pendingRequests
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('❌ Error fetching pending requests:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch pending requests',
    })
  }
})