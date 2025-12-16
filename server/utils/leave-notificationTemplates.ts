// server/utils/leave-notificationTemplates.ts

interface LeaveData {
  id: string
  startDate: Date
  endDate: Date
  totalDays: number
  reason?: string | null
  leaveType: {
    name: string
    color?: string | null
  }
  user: {
    firstName: string
    lastName: string
    email: string
    department?: {
      name: string
    } | null
  }
}

interface ApproverData {
  firstName: string
  lastName: string
}

interface OrganizationData {
  name: string
  brandName?: string
  logoLightUrl?: string | null
  unused_primaryColor?: string
}

/**
 * Adjust color brightness for gradients
 */
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
      .toUpperCase()
  )
}

/**
 * Format date to readable string
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format date range
 */
function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)

  if (start === end) {
    return start
  }

  return `${start} to ${end}`
}

/**
 * Email template for leave submission notification (to approvers)
 */
export function generateLeaveSubmittedEmail(
  leave: LeaveData,
  organization: OrganizationData
): { subject: string; html: string; text: string } {
  const brandName = organization.brandName || 'BookYourPTO'
  const unused_primaryColor = organization.unused_primaryColor || '#3b82f6'
  const hasLogo = organization.logoLightUrl && organization.logoLightUrl.trim() !== ''

  const subject = `New Leave Request from ${leave.user.firstName} ${leave.user.lastName} - ${brandName}`

  const dateRange = formatDateRange(leave.startDate, leave.endDate)
  const leaveColor = leave.leaveType.color || '#3b82f6'
  const APP_URL = process.env.APP_URL || 'http://localhost:3000'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${unused_primaryColor} 0%, ${adjustColor(unused_primaryColor, -10)} 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .leave-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e5e7eb; }
          .detail-row { margin: 12px 0; display: flex; }
          .detail-label { font-weight: bold; color: #374151; min-width: 140px; }
          .detail-value { color: #1f2937; }
          .leave-type-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: 600; }
          .button-approve { background: #10b981; }
          .button-reject { background: #ef4444; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${hasLogo ? `<img src="${organization.logoLightUrl}" alt="${brandName}" style="max-height: 50px; margin-bottom: 15px;" />` : ''}
            <h1>New Leave Request</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <strong>⏰ Action Required</strong>
              <p style="margin: 8px 0 0 0;">A leave request requires your approval.</p>
            </div>

            <p>Hello,</p>

            <p><strong>${leave.user.firstName} ${leave.user.lastName}</strong> has submitted a new leave request that requires your approval.</p>

            <div class="leave-details">
              <h3 style="margin-top: 0; color: #111827;">Leave Request Details</h3>

              <div class="detail-row">
                <span class="detail-label">Employee:</span>
                <span class="detail-value">${leave.user.firstName} ${leave.user.lastName}</span>
              </div>

              ${leave.user.department ? `
              <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${leave.user.department.name}</span>
              </div>
              ` : ''}

              <div class="detail-row">
                <span class="detail-label">Leave Type:</span>
                <span class="detail-value">
                  <span class="leave-type-badge" style="background: ${leaveColor}20; color: ${leaveColor}; border: 1px solid ${leaveColor}40;">
                    ${leave.leaveType.name}
                  </span>
                </span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Dates:</span>
                <span class="detail-value">${dateRange}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}</span>
              </div>

              ${leave.reason ? `
              <div class="detail-row">
                <span class="detail-label">Reason:</span>
                <span class="detail-value">${leave.reason}</span>
              </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/calendar" class="button">View in Calendar</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Please review this request at your earliest convenience.
            </p>
          </div>
          <div class="footer">
            <p><strong>${organization.name}</strong></p>
            <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 10px;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
New Leave Request - ${brandName}

⏰ ACTION REQUIRED

${leave.user.firstName} ${leave.user.lastName} has submitted a new leave request that requires your approval.

LEAVE REQUEST DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Employee: ${leave.user.firstName} ${leave.user.lastName}
${leave.user.department ? `Department: ${leave.user.department.name}` : ''}
Leave Type: ${leave.leaveType.name}
Dates: ${dateRange}
Duration: ${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}
${leave.reason ? `Reason: ${leave.reason}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please review this request at your earliest convenience.

View in Calendar: ${APP_URL}/calendar

${organization.name}
© ${new Date().getFullYear()} ${brandName}. All rights reserved.
  `

  return { subject, html, text }
}

/**
 * Email template for leave approval notification (to employee)
 */
export function generateLeaveApprovedEmail(
  leave: LeaveData,
  approver: ApproverData,
  organization: OrganizationData
): { subject: string; html: string; text: string } {
  const brandName = organization.brandName || 'BookYourPTO'
  const unused_primaryColor = organization.unused_primaryColor || '#10b981'
  const hasLogo = organization.logoLightUrl && organization.logoLightUrl.trim() !== ''

  const subject = `Leave Request Approved - ${brandName}`

  const dateRange = formatDateRange(leave.startDate, leave.endDate)
  const leaveColor = leave.leaveType.color || '#10b981'
  const APP_URL = process.env.APP_URL || 'http://localhost:3000'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${unused_primaryColor} 0%, ${adjustColor(unused_primaryColor, -10)} 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .success-icon { font-size: 48px; color: #10b981; }
          .leave-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e5e7eb; }
          .detail-row { margin: 12px 0; display: flex; }
          .detail-label { font-weight: bold; color: #374151; min-width: 140px; }
          .detail-value { color: #1f2937; }
          .leave-type-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 14px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${hasLogo ? `<img src="${organization.logoLightUrl}" alt="${brandName}" style="max-height: 50px; margin-bottom: 15px;" />` : ''}
            <h1>Leave Request Approved</h1>
          </div>
          <div class="content">
            <div class="success-box">
              <div class="success-icon">✅</div>
              <h2 style="color: #065f46; margin: 10px 0;">Your leave has been approved!</h2>
            </div>

            <p>Hello ${leave.user.firstName},</p>

            <p>Great news! Your leave request has been approved by <strong>${approver.firstName} ${approver.lastName}</strong>.</p>

            <div class="leave-details">
              <h3 style="margin-top: 0; color: #111827;">Approved Leave Details</h3>

              <div class="detail-row">
                <span class="detail-label">Leave Type:</span>
                <span class="detail-value">
                  <span class="leave-type-badge" style="background: ${leaveColor}20; color: ${leaveColor}; border: 1px solid ${leaveColor}40;">
                    ${leave.leaveType.name}
                  </span>
                </span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Dates:</span>
                <span class="detail-value">${dateRange}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Approved By:</span>
                <span class="detail-value">${approver.firstName} ${approver.lastName}</span>
              </div>

              ${leave.reason ? `
              <div class="detail-row">
                <span class="detail-label">Reason:</span>
                <span class="detail-value">${leave.reason}</span>
              </div>
              ` : ''}
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/calendar" class="button">View in Calendar</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Enjoy your time off! 🎉
            </p>
          </div>
          <div class="footer">
            <p><strong>${organization.name}</strong></p>
            <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 10px;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Leave Request Approved - ${brandName}

YOUR LEAVE HAS BEEN APPROVED!

Hello ${leave.user.firstName},

Great news! Your leave request has been approved by ${approver.firstName} ${approver.lastName}.

APPROVED LEAVE DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leave Type: ${leave.leaveType.name}
Dates: ${dateRange}
Duration: ${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}
Approved By: ${approver.firstName} ${approver.lastName}
${leave.reason ? `Reason: ${leave.reason}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enjoy your time off! 🎉

View in Calendar: ${APP_URL}/calendar

${organization.name}
© ${new Date().getFullYear()} ${brandName}. All rights reserved.
  `

  return { subject, html, text }
}

/**
 * Email template for leave rejection notification (to employee)
 */
export function generateLeaveRejectedEmail(
  leave: LeaveData,
  approver: ApproverData,
  rejectionReason: string,
  organization: OrganizationData
): { subject: string; html: string; text: string } {
  const brandName = organization.brandName || 'BookYourPTO'
  const unused_primaryColor = organization.unused_primaryColor || '#ef4444'
  const hasLogo = organization.logoLightUrl && organization.logoLightUrl.trim() !== ''

  const subject = `Leave Request Declined - ${brandName}`

  const dateRange = formatDateRange(leave.startDate, leave.endDate)
  const leaveColor = leave.leaveType.color || '#ef4444'
  const APP_URL = process.env.APP_URL || 'http://localhost:3000'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${unused_primaryColor} 0%, ${adjustColor(unused_primaryColor, -10)} 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .alert-icon { font-size: 48px; color: #ef4444; }
          .leave-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e5e7eb; }
          .detail-row { margin: 12px 0; display: flex; }
          .detail-label { font-weight: bold; color: #374151; min-width: 140px; }
          .detail-value { color: #1f2937; }
          .leave-type-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 14px; }
          .reason-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 6px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${hasLogo ? `<img src="${organization.logoLightUrl}" alt="${brandName}" style="max-height: 50px; margin-bottom: 15px;" />` : ''}
            <h1>Leave Request Declined</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <div class="alert-icon">❌</div>
              <h2 style="color: #991b1b; margin: 10px 0;">Your leave request was not approved</h2>
            </div>

            <p>Hello ${leave.user.firstName},</p>

            <p>We regret to inform you that your leave request has been declined by <strong>${approver.firstName} ${approver.lastName}</strong>.</p>

            <div class="leave-details">
              <h3 style="margin-top: 0; color: #111827;">Leave Request Details</h3>

              <div class="detail-row">
                <span class="detail-label">Leave Type:</span>
                <span class="detail-value">
                  <span class="leave-type-badge" style="background: ${leaveColor}20; color: ${leaveColor}; border: 1px solid ${leaveColor}40;">
                    ${leave.leaveType.name}
                  </span>
                </span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Dates:</span>
                <span class="detail-value">${dateRange}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Reviewed By:</span>
                <span class="detail-value">${approver.firstName} ${approver.lastName}</span>
              </div>
            </div>

            <div class="reason-box">
              <strong>Reason for Decline:</strong>
              <p style="margin: 8px 0 0 0;">${rejectionReason}</p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/calendar" class="button">View Calendar</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you have questions about this decision, please contact your manager or HR department.
            </p>
          </div>
          <div class="footer">
            <p><strong>${organization.name}</strong></p>
            <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 10px;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Leave Request Declined - ${brandName}

YOUR LEAVE REQUEST WAS NOT APPROVED

Hello ${leave.user.firstName},

We regret to inform you that your leave request has been declined by ${approver.firstName} ${approver.lastName}.

LEAVE REQUEST DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leave Type: ${leave.leaveType.name}
Dates: ${dateRange}
Duration: ${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}
Reviewed By: ${approver.firstName} ${approver.lastName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REASON FOR DECLINE:
${rejectionReason}

If you have questions about this decision, please contact your manager or HR department.

View Calendar: ${APP_URL}/calendar

${organization.name}
© ${new Date().getFullYear()} ${brandName}. All rights reserved.
  `

  return { subject, html, text }
}
