import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const updateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  headOfDepartmentId: z.string().nullable().optional(),
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

    // Use transaction to handle manager assignment changes
    const department = await prisma.$transaction(async (tx) => {
      // Update the department
      const updatedDept = await tx.department.update({
        where: { id: deptId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.code && { code: data.code.toUpperCase() }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.color && { color: data.color }),
          ...(data.headOfDepartmentId !== undefined && { headOfDepartmentId: data.headOfDepartmentId }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          headOfDept: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
      })

      // Handle manager changes
      if (data.headOfDepartmentId !== undefined) {
        // If the old manager was only in this department, keep them or handle as needed
        // (Optional: you might want to unassign the old manager)
        
        // If removing manager (set to null)
        if (data.headOfDepartmentId === null && existingDept.headOfDepartmentId) {
          // Optionally handle old manager - for now we'll leave them in the department
        }
        
        // If setting a new manager
        if (data.headOfDepartmentId) {
          const manager = await tx.user.findUnique({
            where: { id: data.headOfDepartmentId },
            select: { departmentId: true },
          })
          
          // Only update if manager is not already in this department
          if (manager && manager.departmentId !== deptId) {
            await tx.user.update({
              where: { id: data.headOfDepartmentId },
              data: { departmentId: deptId },
            })
          }
        }
      }

      return updatedDept
    })

    return department
  } catch (error: any) {
    if (error.statusCode) throw error
    
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
