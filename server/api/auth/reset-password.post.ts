// ============================================
// FILE: server/api/auth/reset-password.post.ts
// ============================================
import { prisma } from '~/server/utils/db'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { generatePasswordChangedEmail } from '~/server/utils/password-changedTemplate'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

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
    },
  })

  if (!org?.smtpHost || !org?.smtpPort || !org?.smtpUser || !org?.smtpPassword || !org?.emailFromAddress) {
    return null
  }

  return nodemailer.createTransport({
    host: org.smtpHost!,
    port: org.smtpPort!,
    secure: org.smtpPort === 465,
    auth: {
      user: org.smtpUser!,
      pass: org.smtpPassword!,
    },
  })
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = resetPasswordSchema.parse(body)

    console.log('Resetting password with token:', data.token)

    // Get all active users with non-expired reset tokens
    const users = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpiry: {
          gt: new Date(),
        },
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            emailFromName: true,
            emailFromAddress: true,
          },
        },
      },
    })

    console.log(`Found ${users.length} users with active reset tokens`)

    // Find user by matching token (handle both formats)
    const user = users.find(u => {
      if (!u.passwordResetToken) return false

      const storedToken = u.passwordResetToken

      // Check if stored token contains a colon (combined format)
      if (storedToken.includes(':')) {
        const [code, fullToken] = storedToken.split(':')
        // Match either the 6-digit code OR the full token
        const matches = data.token === code || data.token === fullToken
        if (matches) {
          console.log(`Token matched for user: ${u.email}`)
        }
        return matches
      }

      // Direct match (backward compatibility)
      const matches = storedToken === data.token
      if (matches) {
        console.log(`Token matched for user: ${u.email}`)
      }
      return matches
    })

    if (!user) {
      console.log('No matching user found')
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired reset token',
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    })

    console.log('Password updated for user:', user.email)

    // Delete all refresh tokens (force re-login on all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    })

    console.log('Refresh tokens cleared')

    // Send password changed confirmation email
    try {
      const transporter = await createEmailTransporter(user.organizationId)
      
      if (transporter && user.organization.emailFromName && user.organization.emailFromAddress) {
        const emailContent = generatePasswordChangedEmail(
          { firstName: user.firstName, email: user.email },
          {
            name: user.organization.name!,
            emailFromName: user.organization.emailFromName!,
            emailFromAddress: user.organization.emailFromAddress!,
          }
        )
        
        await transporter.sendMail({
          from: `"${user.organization.emailFromName}" <${user.organization.emailFromAddress}>`,
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })

        console.log('Password changed confirmation email sent')
      }
    } catch (emailErr) {
      console.error('Failed to send password changed email:', emailErr)
    }

    return {
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    }
  } catch (error: any) {
    console.error('Password reset error:', error.message)

    if (error.statusCode) {
      throw error
    }

    if (error.issues) {
      throw createError({
        statusCode: 400,
        message: error.issues[0].message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Password reset failed',
    })
  }
})