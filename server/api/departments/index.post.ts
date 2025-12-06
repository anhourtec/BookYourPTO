import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  headOfDepartmentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

function generateDepartmentCode(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
  
  if (words.length === 0) return 'DEPT'
  if (words.length === 1) return words[0].substring(0, 4).toUpperCase()
  
  return words
    .slice(0, 4)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

async function generateUniqueCode(baseName: string, organizationId: string, providedCode?: string): Promise<string> {
  let code = providedCode?.toUpperCase() || generateDepartmentCode(baseName)
  
  const existing = await prisma.department.findFirst({
    where: { organizationId, code },
  })
  
  if (!existing) return code
  
  let counter = 1
  let newCode = `${code}${counter}`
  
  while (counter <= 99) {
    const existingWithNumber = await prisma.department.findFirst({
      where: { organizationId, code: newCode },
    })
    
    if (!existingWithNumber) return newCode
    counter++
    newCode = `${code}${counter}`
  }
  
  throw new Error('Unable to generate unique department code')
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
    const data = createDepartmentSchema.parse(body)

    const uniqueCode = await generateUniqueCode(data.name, decoded.organizationId, data.code)

    // ✅ Use a transaction to ensure manager is assigned to department
    const department = await prisma.$transaction(async (tx) => {
      // Create the department
      const newDept = await tx.department.create({
        data: {
          name: data.name,
          code: uniqueCode,
          description: data.description || null,
          color: data.color || '#3b82f6',
          headOfDepartmentId: data.headOfDepartmentId || null,
          organizationId: decoded.organizationId,
          isActive: data.isActive ?? true,
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

      // ✅ If a manager is assigned, update their departmentId
      if (data.headOfDepartmentId) {
        await tx.user.update({
          where: { id: data.headOfDepartmentId },
          data: { departmentId: newDept.id },
        })
      }

      return newDept
    })

    return department
  } catch (error: any) {
    if (error.statusCode) throw error
    
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: error.errors[0]?.message || 'Validation failed',
      })
    }
    
    console.error('Error creating department:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create department',
    })
  }
})
