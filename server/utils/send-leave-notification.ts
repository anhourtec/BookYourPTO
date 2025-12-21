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
 * Get the appropriate approver for a leave request based on organizational hierarchy
 * Priority:
 * 1. Direct manager (reportsToId)
 * 2. Department head (if user is not the department head)
 * 3. Any administrator or executive
 */
async function getLeaveApprover(userId: string, organizationId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      manager: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        }
      },
      department: {
        include: {
          headOfDept: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          }
        }
      }
    }
  })

  if (!user) return null

  // Priority 1: Direct manager (reportsTo)
  if (user.manager && user.manager.id !== userId && user.manager.email) {
    console.log(`✅ Approver found: Direct manager ${user.manager.firstName} ${user.manager.lastName}`)
    return user.manager
  }

  // Priority 2: Department head (if user is not the department head themselves)
  if (user.department?.headOfDept && user.department.headOfDept.id !== userId && user.department.headOfDept.email) {
    console.log(`✅ Approver found: Department head ${user.department.headOfDept.firstName} ${user.department.headOfDept.lastName}`)
    return user.department.headOfDept
  }

  // Priority 3: Find any administrator or executive
  const fallbackApprover = await prisma.user.findFirst({
    where: {
      organizationId,
      role: { in: ['ADMINISTRATOR', 'EXECUTIVE'] },
      isActive: true,
      id: { not: userId } // Don't return the user themselves
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    orderBy: {
      role: 'desc' // EXECUTIVE comes before ADMINISTRATOR alphabetically
    }
  })

  if (fallbackApprover) {
    console.log(`✅ Approver found: Fallback ${fallbackApprover.role} ${fallbackApprover.firstName} ${fallbackApprover.lastName}`)
  } else {
    console.warn(`⚠️ No approver found for user ${userId}`)
  }

  return fallbackApprover
}

/**
 * Get all approvers who should be notified about leave submissions
 * This includes the primary approver PLUS any additional stakeholders
 */
async function getApproversForNotification(
  userId: string,
  organizationId: string,
  userDepartmentId?: string | null
): Promise<Array<{ id: string; email: string; firstName: string; lastName: string; role: string }>> {
  const approvers: Array<{ id: string; email: string; firstName: string; lastName: string; role: string }> = []

  // Get the primary approver (the person who should approve)
  const primaryApprover = await getLeaveApprover(userId, organizationId)
  if (primaryApprover) {
    approvers.push(primaryApprover)
  }

  // Optionally, also notify all administrators and executives for visibility
  // (You can comment this out if you only want the direct approver to be notified)
  const additionalApprovers = await prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      id: { not: userId }, // Don't notify the user themselves
      OR: [
        { role: 'ADMINISTRATOR' as const },
        { role: 'EXECUTIVE' as const },
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

  // Add additional approvers, avoiding duplicates
  for (const approver of additionalApprovers) {
    if (!approvers.find(a => a.email === approver.email)) {
      approvers.push(approver)
    }
  }

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
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
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

    // Get approvers to notify (primary approver + optional additional approvers)
    const approvers = await getApproversForNotification(
      leave.user.id,
      organizationId,
      leave.user.departmentId
    )

    if (approvers.length === 0) {
      console.log('No approvers found to notify')
      return { sent: 0, failed: 0, errors: ['No approvers found'] }
    }

    console.log(`📧 Sending leave submission notifications to ${approvers.length} approver(s):`)
    approvers.forEach(a => console.log(`   - ${a.firstName} ${a.lastName} (${a.role}) <${a.email}>`))

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
        console.log(`✅ Notification sent to ${approver.email}`)
      } catch (error: any) {
        failed++
        const errorMsg = `Failed to send to ${approver.email}: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    return { sent, failed, errors }
  } catch (error: any) {
    console.error('❌ Error sending leave submission notifications:', error)
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

    console.log(`📧 Sending leave approval notification to ${leave.user.email}`)

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

    console.log(`✅ Approval notification sent to ${leave.user.email}`)
    return true
  } catch (error: any) {
    console.error('❌ Error sending leave approval notification:', error)
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

    console.log(`📧 Sending leave rejection notification to ${leave.user.email}`)

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

    console.log(`✅ Rejection notification sent to ${leave.user.email}`)
    return true
  } catch (error: any) {
    console.error('❌ Error sending leave rejection notification:', error)
    return false
  }
}