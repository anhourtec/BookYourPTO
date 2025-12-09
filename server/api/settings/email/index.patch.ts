import { prisma } from '~/server/utils/db'
import { z } from 'zod'

const updateEmailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().min(1).max(65535),
  smtpUser: z.string().min(1, 'SMTP user is required'),
  smtpPassword: z.string().optional(), // Optional - only update if provided
  emailFromName: z.string().min(1, 'From name is required'),
  emailFromAddress: z.string().email('Invalid email address'),
  useSSL: z.boolean().optional(),
  useSTARTTLS: z.boolean().optional(),
  rejectUnauthorized: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }

    // Check if user has permission to update email settings
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only Administrators and Executives can update email settings',
      })
    }

    const body = await readBody(event)
    const data = updateEmailSettingsSchema.parse(body)

    // Prepare update data
    const updateData: any = {
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUser: data.smtpUser,
      emailFromName: data.emailFromName,
      emailFromAddress: data.emailFromAddress,
    }

    // Only update password if provided
    // In production, you should encrypt this!
    if (data.smtpPassword) {
      updateData.smtpPassword = data.smtpPassword
    }

    // Update organization email settings
    const organization = await prisma.organization.update({
      where: { id: auth.organizationId },
      data: updateData,
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        emailFromName: true,
        emailFromAddress: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: auth.organizationId,
        userId: auth.userId,
        action: 'SETTINGS_CHANGE',
        entityType: 'ORGANIZATION',
        entityId: auth.organizationId,
        changes: {
          field: 'email_settings',
          action: 'updated',
          smtpHost: data.smtpHost,
          smtpPort: data.smtpPort,
        },
        ipAddress: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
        userAgent: getHeader(event, 'user-agent') || 'unknown',
      },
    })

    return organization
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.issues) {
      throw createError({
        statusCode: 400,
        message: error.issues[0].message,
      })
    }

    console.error('Error updating email settings:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update email settings',
    })
  }
})