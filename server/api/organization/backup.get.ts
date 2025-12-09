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

    // CRITICAL: Only EXECUTIVE role can download backups
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser || currentUser.role !== 'EXECUTIVE') {
      throw createError({
        statusCode: 403,
        message: 'Only Executives can download organization backups',
      })
    }

    // Fetch ALL organization data for backup
    const [
      organization,
      users,
      departments,
      leaveTypes,
      leaves,
      leaveBalances,
      publicHolidays,
      documents,
      notifications,
      auditLogs,
    ] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: auth.organizationId },
      }),
      prisma.user.findMany({
        where: { organizationId: auth.organizationId },
        include: {
          department: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.department.findMany({
        where: { organizationId: auth.organizationId },
        include: {
          headOfDept: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.leaveType.findMany({
        where: { organizationId: auth.organizationId },
      }),
      prisma.leave.findMany({
        where: { organizationId: auth.organizationId },
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
              code: true,
            },
          },
        },
      }),
      prisma.leaveBalance.findMany({
        where: { organizationId: auth.organizationId },
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
              code: true,
            },
          },
        },
      }),
      prisma.publicHoliday.findMany({
        where: { organizationId: auth.organizationId },
      }),
      prisma.document.findMany({
        where: { organizationId: auth.organizationId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.notification.findMany({
        where: { organizationId: auth.organizationId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.findMany({
        where: { organizationId: auth.organizationId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ])

    if (!organization) {
      throw createError({ 
        statusCode: 404, 
        message: 'Organization not found' 
      })
    }

    // Remove sensitive data from users
    const sanitizedUsers = users.map(user => {
      const { password, passwordResetToken, emailVerificationToken, ...safeUser } = user
      return safeUser
    })

    // Create backup object
    const backup = {
      exportDate: new Date().toISOString(),
      organization,
      users: sanitizedUsers,
      departments,
      leaveTypes,
      leaves,
      leaveBalances,
      publicHolidays,
      documents: documents.map(doc => ({
        ...doc,
        filePath: '[FILE PATH REDACTED - Files not included in backup]',
      })),
      notifications,
      auditLogs,
      metadata: {
        totalUsers: users.length,
        totalDepartments: departments.length,
        totalLeaveTypes: leaveTypes.length,
        totalLeaves: leaves.length,
        totalLeaveBalances: leaveBalances.length,
        totalPublicHolidays: publicHolidays.length,
        totalDocuments: documents.length,
        totalNotifications: notifications.length,
        totalAuditLogs: auditLogs.length,
      },
    }

    // Set headers for JSON download
    setResponseHeaders(event, {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${organization.name}-backup-${new Date().toISOString().split('T')[0]}.json"`,
    })

    return backup
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error creating backup:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create backup',
    })
  }
})