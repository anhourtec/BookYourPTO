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

    // CRITICAL: Only EXECUTIVE role can access organization stats for deletion
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser || currentUser.role !== 'EXECUTIVE') {
      throw createError({
        statusCode: 403,
        message: 'Only Executives can access organization deletion features',
      })
    }

    // Fetch organization statistics
    const [organization, users, departments, leaveTypes, leaves] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: auth.organizationId },
        select: { name: true },
      }),
      prisma.user.count({
        where: { organizationId: auth.organizationId },
      }),
      prisma.department.count({
        where: { organizationId: auth.organizationId },
      }),
      prisma.leaveType.count({
        where: { organizationId: auth.organizationId },
      }),
      prisma.leave.count({
        where: { organizationId: auth.organizationId },
      }),
    ])

    if (!organization) {
      throw createError({ 
        statusCode: 404, 
        message: 'Organization not found' 
      })
    }

    return {
      name: organization.name,
      totalUsers: users,
      totalDepartments: departments,
      totalLeaveTypes: leaveTypes,
      totalLeaves: leaves,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching organization stats:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch organization statistics',
    })
  }
})