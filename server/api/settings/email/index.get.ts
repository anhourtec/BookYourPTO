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

    // Check if user has permission to view email settings
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only Administrators and Executives can view email settings',
      })
    }

    // Fetch organization email settings
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        // NEVER return smtpPassword
        emailFromName: true,
        emailFromAddress: true,
      },
    })

    if (!organization) {
      throw createError({ 
        statusCode: 404, 
        message: 'Organization not found' 
      })
    }

    // Return email settings (password is always excluded for security)
    return {
      smtpHost: organization.smtpHost || '',
      smtpPort: organization.smtpPort || 465,
      smtpUser: organization.smtpUser || '',
      emailFromName: organization.emailFromName || 'BookYourPTO',
      emailFromAddress: organization.emailFromAddress || '',
      useSSL: true, // Default values - you may want to add these to schema
      useSTARTTLS: false,
      rejectUnauthorized: true,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching email settings:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch email settings',
    })
  }
})