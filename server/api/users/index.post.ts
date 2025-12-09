import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { generateWelcomeEmail } from '~/server/utils/emailTemplate'

// Robust schema that handles all edge cases
const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  // Handle empty strings by transforming to undefined
  jobTitle: z.any().transform(val => val && val !== '' ? String(val) : undefined).optional(),
  departmentId: z.any().transform(val => val && val !== '' ? String(val) : undefined).optional(),
  role: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD', 'ADMINISTRATOR', 'EXECUTIVE']).default('EMPLOYEE'),
  // Handle boolean for sendWelcomeEmail
  sendWelcomeEmail: z.any().transform(val => val === false ? false : true),
})

function generateSecurePassword(): string {
  const length = 12
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}

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
    host: org.smtpHost,
    port: org.smtpPort,
    secure: org.smtpPort === 465,
    auth: {
      user: org.smtpUser,
      pass: org.smtpPassword,
    },
  })
}

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)
    
    const body = await readBody(event)
    const data = createUserSchema.parse(body)

    // Check permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to create users',
      })
    }

    // Check if email already exists
    const existing = await prisma.user.findFirst({
      where: {
        email: data.email,
        organizationId: decoded.organizationId,
      },
    })

    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'Email already exists in your organization',
      })
    }

    // Generate secure password
    const plainPassword = generateSecurePassword()
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        organizationId: decoded.organizationId,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle || null,
        departmentId: data.departmentId || null,
        role: data.role,
        isActive: true,
        emailVerified: true,
        profileCompleteness: 60,
      },
      include: {
        department: true,
      },
    })

    // Get organization for leave balances and email
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: { 
        defaultLeaveAllowance: true,
        name: true,
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPassword: true,
        emailFromName: true,
        emailFromAddress: true,
      },
    })

    // Initialize leave balances
    if (organization) {
      await prisma.user.update({
        where: { id: newUser.id },
        data: {
          annualLeaveBalance: organization.defaultLeaveAllowance,
          sickLeaveBalance: 10,
        },
      })
    }

    // Send welcome email
    let emailSent = false
    let emailError: string | null = null

    if (data.sendWelcomeEmail && organization) {
      try {
        const transporter = await createEmailTransporter(decoded.organizationId)
        
        if (transporter) {
          const emailContent = generateWelcomeEmail(newUser, organization, plainPassword)
          
          await transporter.sendMail({
            from: `"${organization.emailFromName}" <${organization.emailFromAddress}>`,
            to: newUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          })
          
          emailSent = true
        } else {
          emailError = 'SMTP not configured'
        }
      } catch (emailErr: any) {
        emailError = emailErr.message || 'Unknown email error'
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: decoded.organizationId,
        userId: decoded.userId,
        action: 'CREATE',
        entityType: 'USER',
        entityId: newUser.id,
        changes: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        },
        ipAddress: getHeader(event, 'x-forwarded-for') || 'unknown',
        userAgent: getHeader(event, 'user-agent') || 'unknown',
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    // Return response with email status AND the plain password
    return {
      ...userWithoutPassword,
      emailSent,
      emailError,
      generatedPassword: plainPassword, // Always return the password so admin can share it
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    if (error.issues) {
      throw createError({
        statusCode: 400,
        message: `Validation failed: ${error.issues[0].message}`,
      })
    }
    
    console.error('Error creating user:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create user',
    })
  }
})