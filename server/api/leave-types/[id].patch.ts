
import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const updateLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Leave type name is required').optional(),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().nullable().optional(),
  requiresApproval: z.boolean().optional(),
  requiresDocumentation: z.boolean().optional(),
  maxDaysPerRequest: z.number().positive().nullable().optional(),
  minDaysNotice: z.number().min(0).optional(),
  allowHalfDays: z.boolean().optional(),
  allowQuarterDays: z.boolean().optional(),
  allowHourly: z.boolean().optional(),
  paidLeave: z.boolean().optional(),
  annualAllowance: z.number().min(0).max(365).nullable().optional(),
  hasAccrual: z.boolean().optional(),
  accrualRate: z.number().positive().nullable().optional(),
  carryOverAllowed: z.boolean().optional(),
  maxCarryOverDays: z.number().positive().nullable().optional(),
  requiresFirstLevelApproval: z.boolean().optional(),
  requiresSecondLevelApproval: z.boolean().optional(),
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
    const leaveTypeId = getRouterParam(event, 'id')

    // Check if user has permission to update leave types
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE', 'HR'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only Administrators, Executives, and HR can update leave types',
      })
    }

    // Verify leave type belongs to user's organization
    const existingLeaveType = await prisma.leaveType.findFirst({
      where: {
        id: leaveTypeId,
        organizationId: decoded.organizationId,
      },
    })

    if (!existingLeaveType) {
      throw createError({
        statusCode: 404,
        message: 'Leave type not found',
      })
    }

    const body = await readBody(event)
    const data = updateLeaveTypeSchema.parse(body)

    // Update leave type
    const leaveType = await prisma.leaveType.update({
      where: { id: leaveTypeId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.requiresApproval !== undefined && { requiresApproval: data.requiresApproval }),
        ...(data.requiresDocumentation !== undefined && { requiresDocumentation: data.requiresDocumentation }),
        ...(data.maxDaysPerRequest !== undefined && { maxDaysPerRequest: data.maxDaysPerRequest }),
        ...(data.minDaysNotice !== undefined && { minDaysNotice: data.minDaysNotice }),
        ...(data.allowHalfDays !== undefined && { allowHalfDays: data.allowHalfDays }),
        ...(data.allowQuarterDays !== undefined && { allowQuarterDays: data.allowQuarterDays }),
        ...(data.allowHourly !== undefined && { allowHourly: data.allowHourly }),
        ...(data.paidLeave !== undefined && { paidLeave: data.paidLeave }),
        ...(data.annualAllowance !== undefined && { annualAllowance: data.annualAllowance }),
        ...(data.hasAccrual !== undefined && { hasAccrual: data.hasAccrual }),
        ...(data.accrualRate !== undefined && { accrualRate: data.accrualRate }),
        ...(data.carryOverAllowed !== undefined && { carryOverAllowed: data.carryOverAllowed }),
        ...(data.maxCarryOverDays !== undefined && { maxCarryOverDays: data.maxCarryOverDays }),
        ...(data.requiresFirstLevelApproval !== undefined && { requiresFirstLevelApproval: data.requiresFirstLevelApproval }),
        ...(data.requiresSecondLevelApproval !== undefined && { requiresSecondLevelApproval: data.requiresSecondLevelApproval }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        color: true,
        icon: true,
        requiresApproval: true,
        paidLeave: true,
        annualAllowance: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return leaveType
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

    console.error('Error updating leave type:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update leave type',
    })
  }
})