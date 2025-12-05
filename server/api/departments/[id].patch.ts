import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const updateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)
    
    const deptId = getRouterParam(event, 'id')
    if (!deptId) {
      throw createError({ statusCode: 400, message: 'Department ID is required' })
    }
    
    const body = await readBody(event)
    const data = updateDepartmentSchema.parse(body)

    // Verify department exists and belongs to organization
    const existingDept = await prisma.department.findFirst({
      where: {
        id: deptId,
        organizationId: decoded.organizationId,
      },
    })

    if (!existingDept) {
      throw createError({ statusCode: 404, message: 'Department not found' })
    }

    const department = await prisma.department.update({
      where: {
        id: deptId,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    return department
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        message: 'A department with this code already exists',
      })
    }
    
    console.error('Error updating department:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update department',
    })
  }
})
