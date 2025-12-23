// server/utils/password-changedTemplate.ts

interface UserData {
  firstName: string
  email: string
}

interface OrganizationData {
  name: string
  emailFromName: string
  emailFromAddress: string
}

export function generatePasswordChangedEmail(
  user: UserData,
  organization: OrganizationData
): { subject: string; html: string; text: string } {
  const subject = `Password Changed Successfully - ${organization.name}`
  
  const origin = 'https://your-app.com' // Replace with your actual domain or use getRequestURL()
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .success-icon { font-size: 48px; color: #10b981; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed Successfully</h1>
          </div>
          <div class="content">
            <p>Hello ${user.firstName},</p>
            
            <div class="success-box">
              <h2>Your password has been updated!</h2>
            </div>
            
            <p>Your password for ${organization.name} has been successfully changed.</p>
            
            <div style="text-align: center;">
              <a href="${origin}/login" class="button">Login Now</a>
            </div>
            
            <div class="warning">
              <strong>Security Tips:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Don't share your password with anyone</li>
                <li>Use a unique password for this account</li>
                <li>Enable 2FA when available</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't change your password, please contact your administrator immediately.
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
Password Changed Successfully

Hello ${user.firstName},

Your password for ${organization.name} has been successfully updated.

You can now login with your new password.

Login: ${origin}/login

Security Tips:
• Don't share your password with anyone
• Use a unique password for this account
• Enable 2FA when available

If you didn't change your password, contact your administrator immediately.

© ${new Date().getFullYear()} ${organization.name}
  `

  return { subject, html, text }
}
