import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
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

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        organizationId: decoded.organizationId,
        isActive: true,
      },
      include: {
        department: true,
      },
    })

    // TODO: Send email with temporary password

    return user
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