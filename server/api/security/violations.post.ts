import { prisma } from '~/server/utils/db'

/**
 * ============================================
 * LOG SECURITY VIOLATION
 * ============================================
 * Creates a security violation record
 * Can be called even without valid JWT
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const {
      userId,
      organizationId,
      violationType,
      description,
      severity = 'MEDIUM',
      attemptedRole,
      actualRole,
      tamperedData,
      actionTaken = 'FORCE_LOGOUT',
    } = body

    // Get request metadata
    const ipAddress = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // Create security violation record
    const violation = await prisma.securityViolation.create({
      data: {
        organizationId,
        userId: userId || null,
        violationType,
        description,
        severity,
        attemptedRole,
        actualRole,
        tamperedData: tamperedData || null,
        ipAddress,
        userAgent,
        actionTaken,
      },
    })

    console.log('🚨 Security violation logged:', {
      id: violation.id,
      type: violationType,
      userId,
      severity,
    })

    return {
      success: true,
      violationId: violation.id,
    }
  } catch (error: any) {
    console.error('Failed to log security violation:', error)

    // Don't throw error - we don't want to prevent logout
    // Just log the failure
    return {
      success: false,
      error: error.message,
    }
  }
})
