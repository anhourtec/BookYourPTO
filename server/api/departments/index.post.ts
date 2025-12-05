import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().optional(), // Optional now
  description: z.string().optional(),
})

// Helper function to generate code from name
function generateDepartmentCode(name: string): string {
  // Remove special characters and get first letters of words
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
  
  if (words.length === 0) {
    return 'DEPT'
  }
  
  if (words.length === 1) {
    // Single word: take first 3-4 letters
    return words[0].substring(0, 4).toUpperCase()
  } else {
    // Multiple words: take first letter of each (max 4)
    return words
      .slice(0, 4)
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }
}

// Check if code already exists and add number suffix if needed
async function generateUniqueCode(baseName: string, organizationId: string, providedCode?: string): Promise<string> {
  let code = providedCode?.toUpperCase() || generateDepartmentCode(baseName)
  
  // Check if code exists
  const existing = await prisma.department.findFirst({
    where: {
      organizationId,
      code,
    },
  })
  
  if (!existing) {
    return code
  }
  
  // If exists, add number suffix
  let counter = 1
  let newCode = `${code}${counter}`
  
  while (true) {
    const existingWithNumber = await prisma.department.findFirst({
      where: {
        organizationId,
        code: newCode,
      },
    })
    
    if (!existingWithNumber) {
      return newCode
    }
    
    counter++
    newCode = `${code}${counter}`
    
    // Safety limit
    if (counter > 99) {
      throw new Error('Unable to generate unique department code')
    }
  }
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

    // Generate unique code
    const uniqueCode = await generateUniqueCode(data.name, decoded.organizationId, data.code)

    const department = await prisma.department.create({
      data: {
        name: data.name,
        code: uniqueCode,
        description: data.description || null,
        organizationId: decoded.organizationId,
        isActive: true,
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
