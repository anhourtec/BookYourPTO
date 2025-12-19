
import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const createLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Leave type name is required'),
  code: z.enum([
    'ANNUAL', 'SICK_PAID', 'SICK_UNPAID', 'MATERNITY', 'PATERNITY', 'PARENTAL',
    'BEREAVEMENT', 'JURY_DUTY', 'MEDICAL', 'SABBATICAL', 'STUDY', 'MILITARY',
    'MARRIAGE', 'MOVING', 'VOLUNTEER', 'UNPAID', 'WFH', 'MEETING', 'TRAINING',
    'SPECIAL', 'EMERGENCY', 'QUARANTINE', 'COMPENSATORY', 'RELIGIOUS'
  ]),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#3b82f6'),
  icon: z.string().nullable().optional(),
  requiresApproval: z.boolean().default(true),
  requiresDocumentation: z.boolean().default(false),
  maxDaysPerRequest: z.number().positive().nullable().optional(),
  minDaysNotice: z.number().min(0).default(0),
  allowHalfDays: z.boolean().default(true),
  allowQuarterDays: z.boolean().default(false),
  allowHourly: z.boolean().default(false),
  paidLeave: z.boolean().default(true),
  deductionBucket: z.enum(['NONE', 'ANNUAL', 'SICK']).default('NONE'),
  hasAccrual: z.boolean().default(false),
  accrualRate: z.number().positive().nullable().optional(),
  carryOverAllowed: z.boolean().default(false),
  maxCarryOverDays: z.number().positive().nullable().optional(),
  requiresFirstLevelApproval: z.boolean().default(true),
  requiresSecondLevelApproval: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)

    // Check if user has permission to create leave types
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE', 'HR'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only Administrators, Executives, and HR can create leave types',
      })
    }

    const body = await readBody(event)
    const data = createLeaveTypeSchema.parse(body)

    // Check if leave type code already exists for this organization
    const existingLeaveType = await prisma.leaveType.findFirst({
      where: {
        organizationId: decoded.organizationId,
        code: data.code,
      },
    })

    if (existingLeaveType) {
      throw createError({
        statusCode: 400,
        message: `A leave type with code "${data.code}" already exists`,
      })
    }

    // Create leave type
    const leaveType = await prisma.leaveType.create({
      data: {
        organizationId: decoded.organizationId,
        name: data.name,
        code: data.code,
        description: data.description,
        color: data.color,
        icon: data.icon,
        requiresApproval: data.requiresApproval,
        requiresDocumentation: data.requiresDocumentation || false,
        maxDaysPerRequest: data.maxDaysPerRequest,
        minDaysNotice: data.minDaysNotice,
        allowHalfDays: data.allowHalfDays,
        allowQuarterDays: data.allowQuarterDays || false,
        allowHourly: data.allowHourly || false,
        paidLeave: data.paidLeave,
        deductionBucket: data.deductionBucket,
        hasAccrual: data.hasAccrual || false,
        accrualRate: data.accrualRate,
        carryOverAllowed: data.carryOverAllowed || false,
        maxCarryOverDays: data.maxCarryOverDays,
        requiresFirstLevelApproval: data.requiresFirstLevelApproval,
        requiresSecondLevelApproval: data.requiresSecondLevelApproval || false,
        isActive: data.isActive,
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
        deductionBucket: true,
        annualAllowance: true,
        isActive: true,
        createdAt: true,
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

    console.error('Error creating leave type:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create leave type',
    })
  }
})
