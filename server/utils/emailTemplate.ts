/**
 * Adjust color brightness (positive = lighter, negative = darker)
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
  )
}

export function generateWelcomeEmail(
  userData: { firstName: string; lastName: string; email: string },
  organization: {
    name: string
    brandName?: string
    logoLightUrl?: string | null
    unused_primaryColor?: string
  },
  plainPassword: string
) {
  const APP_URL = process.env.APP_URL || 'http://localhost:3000'
  const brandName = organization.brandName || organization.name || 'BookYourPTO'
  const unused_primaryColor = organization.unused_primaryColor || '#3b82f6'
  const hasLogo = !!organization.logoLightUrl

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, ${unused_primaryColor} 0%, ${adjustColor(unused_primaryColor, -20)} 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .logo {
            max-width: 200px;
            max-height: 60px;
            margin-bottom: 20px;
          }
          .content { 
            padding: 40px 30px;
          }
          .welcome-message {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 6px;
          }
          .credentials-box { 
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .credential-item { 
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .credential-label { 
            font-weight: 600;
            color: #374151;
            min-width: 90px;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #d1d5db;
            flex: 1;
            word-break: break-all;
          }
          .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer { 
            text-align: center;
            padding: 30px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${hasLogo ? `<img src="${organization.logoLightUrl}" alt="${brandName}" class="logo" />` : ''}
            <h1>Welcome to ${brandName}!</h1>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <h2 style="margin-top: 0; color: ${unused_primaryColor};">Hello ${userData.firstName}!</h2>
              <p style="margin-bottom: 0; color: #1e3a8a;">
                Your account has been created for ${brandName}'s leave management system.
              </p>
            </div>
            
            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #111827;">Your Login Credentials</h3>
              <div class="credential-item">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${userData.email}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Password:</span>
                <span class="credential-value">${plainPassword}</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${APP_URL}/login" class="cta-button">Log In Now</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Please change your password after your first login. Never share your password with anyone.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>${brandName}</strong></p>
            <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const emailText = `
Welcome to ${brandName}!

Hello ${userData.firstName}!

Your account has been created for ${brandName}'s leave management system.

LOGIN CREDENTIALS:
Email: ${userData.email}
Password: ${plainPassword}

Log in at: ${APP_URL}/login

Please change your password after your first login.

---
${brandName}
© ${new Date().getFullYear()} ${brandName}. All rights reserved.
  `

  return {
    subject: `Welcome to ${brandName} - Your Account Details`,
    html: emailHtml,
    text: emailText,
  }
}