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

    // CRITICAL: Only EXECUTIVE role can delete the organization
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { 
        role: true,
        organizationId: true,
      },
    })

    if (!currentUser || currentUser.role !== 'EXECUTIVE') {
      throw createError({
        statusCode: 403,
        message: 'Only Executives can delete the organization',
      })
    }

    if (currentUser.organizationId !== auth.organizationId) {
      throw createError({
        statusCode: 403,
        message: 'You can only delete your own organization',
      })
    }

    const organizationId = auth.organizationId

    // Log the deletion attempt
    console.log(`⚠️  ORGANIZATION DELETION INITIATED by user ${auth.userId} for organization ${organizationId}`)

    // Create a final audit log before deletion
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: auth.userId,
        action: 'DELETE',
        entityType: 'ORGANIZATION',
        entityId: organizationId,
        changes: {
          action: 'ORGANIZATION_DELETED',
          deletedBy: auth.userId,
          deletedAt: new Date().toISOString(),
        },
        ipAddress: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
        userAgent: getHeader(event, 'user-agent') || 'unknown',
      },
    })

    // ============================================
    // CASCADE DELETE - Prisma will handle this automatically
    // due to onDelete: Cascade in schema
    // ============================================
    // This single delete will cascade to:
    // - Users (and their refresh tokens)
    // - Departments
    // - Leave Types
    // - Leaves
    // - Leave Balances
    // - Public Holidays
    // - Documents
    // - Approval Workflows
    // - Notifications
    // - Audit Logs
    // - Email Templates
    
    await prisma.organization.delete({
      where: { id: organizationId },
    })

    console.log(`✅ ORGANIZATION ${organizationId} DELETED SUCCESSFULLY`)

    return {
      success: true,
      message: 'Organization and all associated data have been permanently deleted',
      deletedAt: new Date().toISOString(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('❌ Error deleting organization:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete organization. Please contact support.',
    })
  }
})