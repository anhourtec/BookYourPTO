import { prisma } from '~/server/utils/db'
import { z } from 'zod'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { generateForgotPasswordEmail } from '~/server/utils/forgot-passwordTemplate'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase()),
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
    const data = forgotPasswordSchema.parse(body) // Email is now lowercase

    const user = await prisma.user.findFirst({
      where: {
        email: data.email, // Already lowercase from transform
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

    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      }
    }

    // Generate 6-digit code (this will be used for BOTH manual entry AND URL)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Generate long token for URL-based reset (more secure)
    const resetToken = crypto.randomBytes(32).toString('hex')

    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)

    // Store BOTH: code in passwordResetToken, full token in a combined format
    // Format: "CODE:FULLTOKEN" - this way we can verify both
    const combinedToken = `${resetCode}:${resetToken}`

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: combinedToken,  // Store combined token
        passwordResetExpiry: resetTokenExpiry,
      },
    })

    try {
      const transporter = await createEmailTransporter(user.organizationId)

      if (transporter && user.organization.emailFromName && user.organization.emailFromAddress) {
        const resetUrl = `${getRequestURL(event).origin}/reset-password?token=${resetToken}`

        const emailContent = generateForgotPasswordEmail(
          { firstName: user.firstName, email: user.email },
          {
            name: user.organization.name!,
            emailFromName: user.organization.emailFromName!,
            emailFromAddress: user.organization.emailFromAddress!,
          },
          resetCode,
          resetUrl
        )

        await transporter.sendMail({
          from: `"${user.organization.emailFromName}" <${user.organization.emailFromAddress}>`,
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })
      }
    } catch (emailErr) {
      console.error('Failed to send password reset email:', emailErr)
    }

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
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

    throw createError({
      statusCode: 500,
      message: 'Password reset request failed',
    })
  }
})