import { prisma } from '~/server/utils/db'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const testEmailSchema = z.object({
  smtpHost: z.string().min(1),
  smtpPort: z.number().min(1).max(65535),
  smtpUser: z.string().min(1),
  smtpPassword: z.string().optional(),
  emailFromName: z.string().min(1),
  emailFromAddress: z.string().email(),
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

    // Check if user has permission to test email
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { 
        role: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only Administrators and Executives can test email configuration',
      })
    }

    const body = await readBody(event)
    const config = testEmailSchema.parse(body)

    // If no password provided, get it from database
    let password = config.smtpPassword
    if (!password) {
      const org = await prisma.organization.findUnique({
        where: { id: auth.organizationId },
        select: { smtpPassword: true },
      })
      password = org?.smtpPassword || ''
    }

    if (!password) {
      throw createError({
        statusCode: 400,
        message: 'SMTP password is required for testing',
      })
    }

    // Create transporter with provided settings
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.useSSL ?? (config.smtpPort === 465), // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: password,
      },
      tls: {
        rejectUnauthorized: config.rejectUnauthorized ?? true,
      },
      requireTLS: config.useSTARTTLS ?? false,
    })

    // Verify connection
    console.log('Testing SMTP connection...')
    await transporter.verify()
    console.log('SMTP connection verified')

    // Send test email
    const testEmail = {
      from: `"${config.emailFromName}" <${config.emailFromAddress}>`,
      to: currentUser.email,
      subject: 'BookYourPTO - Email Configuration Test',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .success { background: #10b981; color: white; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
              .config-box { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; }
              .config-item { margin: 8px 0; }
              .config-label { font-weight: bold; color: #1f2937; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Test Successful! </h1>
              </div>
              <div class="content">
                <div class="success">
                  <strong>Your email configuration is working correctly!</strong>
                </div>
                
                <p>Hello ${currentUser.firstName} ${currentUser.lastName},</p>
                
                <p>This is a test email from BookYourPTO to confirm that your SMTP settings are configured correctly.</p>
                
                <div class="config-box">
                  <h3 style="margin-top: 0;">Configuration Details:</h3>
                  <div class="config-item">
                    <span class="config-label">SMTP Host:</span> ${config.smtpHost}
                  </div>
                  <div class="config-item">
                    <span class="config-label">SMTP Port:</span> ${config.smtpPort}
                  </div>
                  <div class="config-item">
                    <span class="config-label">SMTP User:</span> ${config.smtpUser}
                  </div>
                  <div class="config-item">
                    <span class="config-label">From Address:</span> ${config.emailFromAddress}
                  </div>
                  <div class="config-item">
                    <span class="config-label">Encryption:</span> ${config.useSSL ? 'SSL/TLS' : config.useSTARTTLS ? 'STARTTLS' : 'None'}
                  </div>
                </div>
                
                <p>You can now use email features such as:</p>
                <ul>
                  <li>Password reset emails</li>
                  <li>User invitation emails</li>
                  <li>Leave request notifications</li>
                  <li>System alerts and announcements</li>
                </ul>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  If you didn't request this test, you can safely ignore this email.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} BookYourPTO. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Email Test Successful!

Hello ${currentUser.firstName} ${currentUser.lastName},

This is a test email from BookYourPTO to confirm that your SMTP settings are configured correctly.

Configuration Details:
- SMTP Host: ${config.smtpHost}
- SMTP Port: ${config.smtpPort}
- SMTP User: ${config.smtpUser}
- From Address: ${config.emailFromAddress}
- Encryption: ${config.useSSL ? 'SSL/TLS' : config.useSTARTTLS ? 'STARTTLS' : 'None'}

You can now use email features such as:
- Password reset emails
- User invitation emails
- Leave request notifications
- System alerts and announcements

If you didn't request this test, you can safely ignore this email.

© ${new Date().getFullYear()} BookYourPTO. All rights reserved.
      `,
    }

    console.log('Sending test email to:', currentUser.email)
    const info = await transporter.sendMail(testEmail)
    console.log('Test email sent:', info.messageId)

    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      recipient: currentUser.email,
    }
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

    console.error('Email test failed:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Email connection test failed'
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check your username and password.'
    } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
      errorMessage = 'Could not connect to SMTP server. Please check your host and port.'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timed out. Please check your firewall settings.'
    } else if (error.message) {
      errorMessage = error.message
    }

    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})