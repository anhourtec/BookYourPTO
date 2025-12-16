// server/utils/forgot-passwordTemplate.ts

interface UserData {
  firstName: string
  email: string
}

interface OrganizationData {
  name: string
  emailFromName: string
  emailFromAddress: string
}

export function generateForgotPasswordEmail(
  user: UserData,
  organization: OrganizationData,
  resetCode: string,
  resetUrl: string
): { subject: string; html: string; text: string } {
  const subject = `Password Reset Request - ${organization.name}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .code-box { background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${user.firstName},</p>
            <p>We received a request to reset your password for your ${organization.name} account.</p>
            <div class="code-box">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your reset code:</p>
              <div class="code">${resetCode}</div>
            </div>
            <p>Or click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This link expires in 15 minutes</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this code or link with anyone</li>
              </ul>
            </div>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              If you didn't request a password reset, please contact your administrator immediately.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${organization.name}. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Password Reset Request

Hello ${user.firstName},

We received a request to reset your password for your ${organization.name} account.

Your reset code: ${resetCode}

Or use this link: ${resetUrl}

This link expires in 15 minutes.

If you didn't request this, please ignore this email and contact your administrator.

© ${new Date().getFullYear()} ${organization.name}
  `

  return { subject, html, text }
}
