import { prisma } from '~/server/utils/db'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { generateAccessToken, generateRefreshToken, generateTokenId } from '~/server/utils/jwt'

const registerSchema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationSlug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
})

function generateDepartmentCode(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)

  if (words.length === 0) return 'EXEC'
  if (words.length === 1) return words[0].substring(0, 4).toUpperCase()

  return words
    .slice(0, 4)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = registerSchema.parse(body) // Email is now lowercase

    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.organizationSlug },
    })

    if (existingOrg) {
      throw createError({
        statusCode: 400,
        message: 'Organization slug already taken',
      })
    }

    // Check for existing user with lowercase email
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

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug: data.organizationSlug,
        },
      })

      const departmentCode = generateDepartmentCode(data.organizationName)
      const department = await tx.department.create({
        data: {
          name: data.organizationName,
          code: departmentCode,
          description: 'Default department created during registration',
          color: '#3b82f6',
          organizationId: organization.id,
          isActive: true,
        },
      })

      const user = await tx.user.create({
        data: {
          email: data.email, // Already lowercase from schema transform
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationId: organization.id,
          departmentId: department.id,
          role: 'EXECUTIVE',
          level: 'EXECUTIVE',
          isApprover: true,
          isActive: true,
        },
      })

      await tx.department.update({
        where: { id: department.id },
        data: {
          headOfDepartmentId: user.id,
        },
      })

      return { organization, department, user }
    })

    const accessToken = generateAccessToken({
      userId: result.user.id,
      organizationId: result.organization.id,
      role: result.user.role,
      email: result.user.email,
    })

    const tokenId = generateTokenId()
    const refreshToken = generateRefreshToken(result.user.id, tokenId)

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        token: refreshToken,
        userId: result.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        organizationId: result.organization.id,
        organizationSlug: result.organization.slug,
        departmentId: result.department.id,
      },
      department: {
        id: result.department.id,
        name: result.department.name,
        code: result.department.code,
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

    console.error('Registration failed:', error)
    throw createError({
      statusCode: 500,
      message: 'Registration failed',
    })
  }
})