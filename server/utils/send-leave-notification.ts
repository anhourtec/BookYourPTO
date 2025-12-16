// server/utils/send-leave-notification.ts

import nodemailer from 'nodemailer'
import { prisma } from '~/server/utils/db'
import {
  generateLeaveSubmittedEmail,
  generateLeaveApprovedEmail,
  generateLeaveRejectedEmail,
} from '~/server/utils/leave-notificationTemplates'

/**
 * Create email transporter from organization SMTP settings
 */
async function createEmailTransporter(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      smtpPassword: true,
      emailFromName: true,
      emailFromAddress: true,
      name: true,
      brandName: true,
      logoLightUrl: true,
    },
  })

  if (!org?.smtpHost || !org?.smtpPort || !org?.smtpUser || !org?.smtpPassword || !org?.emailFromAddress) {
    return null
  }

  return {
    transporter: nodemailer.createTransport({
      host: org.smtpHost,
      port: org.smtpPort,
      secure: org.smtpPort === 465,
      auth: {
        user: org.smtpUser,
        pass: org.smtpPassword,
      },
    }),
    fromName: org.emailFromName || org.name,
    fromAddress: org.emailFromAddress,
    orgName: org.name,
    brandName: org.brandName || 'BookYourPTO',
    logoLightUrl: org.logoLightUrl,
  }
}

/**
 * Get approvers who should be notified about leave submissions
 * - All department heads if user has a department
 * - All administrators
 * - All executives
 */
async function getApproversForNotification(organizationId: string, userDepartmentId?: string | null) {
  const approvers = await prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      OR: [
        // All administrators
        { role: 'ADMINISTRATOR' as const },
        // All executives
        { role: 'EXECUTIVE' as const },
        // Department heads of the user's department
        ...(userDepartmentId ? [{
          role: 'DEPARTMENT_HEAD' as const,
          departmentId: userDepartmentId,
        }] : []),
        // Custom approvers
        { isApprover: true },
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  })

  // Remove duplicates by email
  const uniqueApprovers = approvers.filter(
    (approver, index, self) => index === self.findIndex((a) => a.email === approver.email)
  )

  return uniqueApprovers
}

/**
 * Send leave submission notification to approvers
 */
export async function sendLeaveSubmissionNotification(
  leaveId: string,
  organizationId: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  try {
    // Get email configuration
    const emailConfig = await createEmailTransporter(organizationId)
    if (!emailConfig) {
      console.log('SMTP not configured, skipping leave submission notification')
      return { sent: 0, failed: 0, errors: ['SMTP not configured'] }
    }

    // Get leave details
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        leaveType: {
          select: {
            name: true,
            color: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            departmentId: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!leave) {
      console.error('Leave not found:', leaveId)
      return { sent: 0, failed: 0, errors: ['Leave not found'] }
    }

    // Get approvers to notify
    const approvers = await getApproversForNotification(organizationId, leave.user.departmentId)

    if (approvers.length === 0) {
      console.log('No approvers found to notify')
      return { sent: 0, failed: 0, errors: ['No approvers found'] }
    }

    console.log(`Sending leave submission notifications to ${approvers.length} approver(s)`)

    // Generate email content
    const emailContent = generateLeaveSubmittedEmail(leave as any, {
      name: emailConfig.orgName,
      brandName: emailConfig.brandName,
      logoLightUrl: emailConfig.logoLightUrl,
    })

    // Send emails
    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const approver of approvers) {
      try {
        await emailConfig.transporter.sendMail({
          from: `"${emailConfig.fromName}" <${emailConfig.fromAddress}>`,
          to: approver.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })
        sent++
        console.log(`Notification sent to ${approver.email}`)
      } catch (error: any) {
        failed++
        const errorMsg = `Failed to send to ${approver.email}: ${error.message}`
        errors.push(errorMsg)
        console.error(`${errorMsg}`)
      }
    }

    return { sent, failed, errors }
  } catch (error: any) {
    console.error('Error sending leave submission notifications:', error)
    return { sent: 0, failed: 0, errors: [error.message || 'Unknown error'] }
  }
}

/**
 * Send leave approval notification to employee
 */
export async function sendLeaveApprovalNotification(
  leaveId: string,
  organizationId: string,
  approverId: string
): Promise<boolean> {
  try {
    // Get email configuration
    const emailConfig = await createEmailTransporter(organizationId)
    if (!emailConfig) {
      console.log('SMTP not configured, skipping leave approval notification')
      return false
    }

    // Get leave details
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        leaveType: {
          select: {
            name: true,
            color: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!leave) {
      console.error('Leave not found:', leaveId)
      return false
    }

    // Get approver details
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: {
        firstName: true,
        lastName: true,
      },
    })

    if (!approver) {
      console.error('Approver not found:', approverId)
      return false
    }

    console.log(`Sending leave approval notification to ${leave.user.email}`)

    // Generate email content
    const emailContent = generateLeaveApprovedEmail(
      leave as any,
      approver,
      {
        name: emailConfig.orgName,
        brandName: emailConfig.brandName,
        logoLightUrl: emailConfig.logoLightUrl,
      }
    )

    // Send email
    await emailConfig.transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromAddress}>`,
      to: leave.user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    console.log(`Approval notification sent to ${leave.user.email}`)
    return true
  } catch (error: any) {
    console.error('Error sending leave approval notification:', error)
    return false
  }
}

/**
 * Send leave rejection notification to employee
 */
export async function sendLeaveRejectionNotification(
  leaveId: string,
  organizationId: string,
  approverId: string,
  rejectionReason: string
): Promise<boolean> {
  try {
    // Get email configuration
    const emailConfig = await createEmailTransporter(organizationId)
    if (!emailConfig) {
      console.log('SMTP not configured, skipping leave rejection notification')
      return false
    }

    // Get leave details
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        leaveType: {
          select: {
            name: true,
            color: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!leave) {
      console.error('Leave not found:', leaveId)
      return false
    }

    // Get approver details
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: {
        firstName: true,
        lastName: true,
      },
    })

    if (!approver) {
      console.error('Approver not found:', approverId)
      return false
    }

    console.log(`Sending leave rejection notification to ${leave.user.email}`)

    // Generate email content
    const emailContent = generateLeaveRejectedEmail(
      leave as any,
      approver,
      rejectionReason,
      {
        name: emailConfig.orgName,
        brandName: emailConfig.brandName,
        logoLightUrl: emailConfig.logoLightUrl,
      }
    )

    // Send email
    await emailConfig.transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromAddress}>`,
      to: leave.user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    console.log(`Rejection notification sent to ${leave.user.email}`)
    return true
  } catch (error: any) {
    console.error('Error sending leave rejection notification:', error)
    return false
  }
}
