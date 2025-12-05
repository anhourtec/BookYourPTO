import { prisma } from '~/server/utils/db'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationSlug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = registerSchema.parse(body)

    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.organizationSlug },
    })

    if (existingOrg) {
      throw createError({
        statusCode: 400,
        message: 'Organization slug already taken',
      })
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: data.email },
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'Email already registered',
      })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const organization = await prisma.organization.create({
      data: {
        name: data.organizationName,
        slug: data.organizationSlug,
      },
    })

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationId: organization.id,
        role: 'ADMINISTRATOR',
        level: 'ADMINISTRATOR',
        isApprover: true,
        isActive: true,
      },
    })

    const token = generateJWT({
      userId: user.id,
      organizationId: organization.id,
      role: user.role,
      email: user.email,
    })

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: organization.id,
        organizationSlug: organization.slug,
      },
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
      message: 'Registration failed',
    })
  }
})