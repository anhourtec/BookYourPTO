import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  jobTitle: z.string().optional(),
  departmentId: z.string().optional(),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'DEPARTMENT_HEAD', 'ADMINISTRATOR', 'EXECUTIVE']).default('EMPLOYEE'),
})

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)
    
    // Check if user has permission to add users
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to add users',
      })
    }
    
    const body = await readBody(event)
    const data = createUserSchema.parse(body)

    // Check if email already exists in organization
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

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        jobTitle: data.jobTitle,
        departmentId: data.departmentId || null,
        role: data.role,
        organizationId: decoded.organizationId,
        isActive: true,
      },
      include: {
        department: true,
      },
    })

    // Don't return password in response
    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
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
    
    console.error('Error creating user:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create user',
    })
  }
})
