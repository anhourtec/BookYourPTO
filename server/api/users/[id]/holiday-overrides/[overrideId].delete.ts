import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)
    const userId = getRouterParam(event, 'id')
    const overrideId = getRouterParam(event, 'overrideId')

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

    // Verify override exists and belongs to user
    const override = await prisma.userHolidayOverride.findFirst({
      where: {
        id: overrideId,
        userId: userId,
        organizationId: decoded.organizationId
      }
    })

    if (!override) {
      throw createError({
        statusCode: 404,
        message: 'Holiday override not found'
      })
    }

    // Delete the override
    await prisma.userHolidayOverride.delete({
      where: { id: overrideId }
    })

    console.log(`✅ Deleted holiday override ${overrideId} for user ${userId}`)

    return { success: true, message: 'Holiday override deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Error deleting holiday override:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete holiday override'
    })
  }
})
