import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const createOverrideSchema = z.object({
  type: z.enum(['EXCLUDE', 'ADD']),
  publicHolidayId: z.string().optional(), // Required for EXCLUDE
  name: z.string().optional(), // Required for ADD
  date: z.string().optional(), // Required for ADD
  isRecurring: z.boolean().default(true),
  isHalfDay: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)
    const userId = getRouterParam(event, 'id')

    // Check permissions - must be admin/exec/HR or the user themselves
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (
      !currentUser ||
      (!['ADMINISTRATOR', 'EXECUTIVE', 'HR'].includes(currentUser.role) && decoded.userId !== userId)
    ) {
      throw createError({
        statusCode: 403,
        message: 'Only administrators, executives, HR, or the user themselves can manage holiday overrides'
      })
    }

    // Verify user belongs to organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: decoded.organizationId
      }
    })

    if (!user) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    const body = await readBody(event)
    const data = createOverrideSchema.parse(body)

    // Validate based on type
    if (data.type === 'EXCLUDE' && !data.publicHolidayId) {
      throw createError({
        statusCode: 400,
        message: 'publicHolidayId is required for EXCLUDE type'
      })
    }

    if (data.type === 'ADD' && (!data.name || !data.date)) {
      throw createError({
        statusCode: 400,
        message: 'name and date are required for ADD type'
      })
    }

    // Create the override
    const override = await prisma.userHolidayOverride.create({
      data: {
        userId: userId!,
        organizationId: decoded.organizationId,
        type: data.type,
        publicHolidayId: data.publicHolidayId,
        name: data.name,
        date: data.date ? new Date(data.date) : null,
        isRecurring: data.isRecurring,
        isHalfDay: data.isHalfDay
      },
      include: {
        publicHoliday: true
      }
    })

    console.log(`✅ Created holiday override for user ${userId}:`, {
      type: data.type,
      name: data.name || override.publicHoliday?.name
    })

    return override
  } catch (error: any) {
    if (error.statusCode) throw error

    if (error.issues) {
      throw createError({
        statusCode: 400,
        message: error.issues[0].message
      })
    }

    console.error('Error creating holiday override:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create holiday override'
    })
  }
})
