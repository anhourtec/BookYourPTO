// server/api/organization/onboarding.post.ts
import { prisma } from '~/server/utils/db'
import { z } from 'zod'

const onboardingSchema = z.object({
  leaveYearStart: z.number().min(1).max(12),
  annualLeaveAllowance: z.number().min(0).max(365),
})

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)
    const body = await readBody(event)
    const data = onboardingSchema.parse(body)

    // Update organization with onboarding settings
    const organization = await prisma.organization.update({
      where: { id: decoded.organizationId },
      data: {
        leaveYearStartMonth: data.leaveYearStart,
        defaultLeaveAllowance: data.annualLeaveAllowance,
        onboardingCompleted: true,
      },
    })

    // Update user's leave balance
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        annualLeaveBalance: data.annualLeaveAllowance,
      },
    })

    // ✅ Create all 6 default leave types with user's selected allowance
    const defaultLeaveTypes = [
      {
        organizationId: organization.id,
        name: 'Annual Leave',
        code: 'ANNUAL' as const, // ✅ Add 'as const'
        description: 'Annual/Vacation Leave',
        color: '#3b82f6',
        icon: 'lucide:umbrella-off',
        requiresApproval: true,
        allowHalfDays: true,
        paidLeave: true,
        annualAllowance: data.annualLeaveAllowance,
        deductionBucket: 'ANNUAL' as const,
        carryOverAllowed: true,
        maxCarryOverDays: Math.floor(data.annualLeaveAllowance * 0.2),
        requiresFirstLevelApproval: true,
        requiresSecondLevelApproval: false,
        minDaysNotice: 0,
        allowQuarterDays: false,
        allowHourly: false,
        hasAccrual: false,
      },
      {
        organizationId: organization.id,
        name: 'Sick Leave - Paid',
        code: 'SICK_PAID' as const, // ✅ Add 'as const'
        description: 'Paid Sick Leave',
        color: '#ef4444',
        icon: 'lucide:heart-pulse',
        requiresApproval: false,
        requiresDocumentation: true,
        allowHalfDays: true,
        paidLeave: true,
        annualAllowance: 10,
        deductionBucket: 'SICK' as const,
        requiresFirstLevelApproval: false,
        requiresSecondLevelApproval: false,
        minDaysNotice: 0,
        allowQuarterDays: false,
        allowHourly: false,
        hasAccrual: false,
        carryOverAllowed: false,
      },
      {
        organizationId: organization.id,
        name: 'Unpaid Leave',
        code: 'UNPAID' as const, // ✅ Add 'as const'
        description: 'Unpaid Leave',
        color: '#10b981',
        icon: 'lucide:calendar',
        requiresApproval: true,
        allowHalfDays: true,
        paidLeave: false,
        requiresFirstLevelApproval: true,
        requiresSecondLevelApproval: false,
        minDaysNotice: 0,
        allowQuarterDays: false,
        allowHourly: false,
        hasAccrual: false,
        carryOverAllowed: false,
      },
      {
        organizationId: organization.id,
        name: 'Maternity',
        code: 'MATERNITY' as const, // ✅ Add 'as const'
        description: 'Maternity Leave',
        color: '#ec4899',
        icon: 'lucide:baby',
        requiresApproval: true,
        requiresDocumentation: true,
        allowHalfDays: false,
        paidLeave: true,
        annualAllowance: 90,
        requiresFirstLevelApproval: true,
        requiresSecondLevelApproval: false,
        minDaysNotice: 0,
        allowQuarterDays: false,
        allowHourly: false,
        hasAccrual: false,
        carryOverAllowed: false,
      },
      {
        organizationId: organization.id,
        name: 'Meeting',
        code: 'MEETING' as const, // ✅ Add 'as const'
        description: 'Out for Meeting',
        color: '#f97316',
        icon: 'lucide:users',
        requiresApproval: false,
        allowHalfDays: true,
        paidLeave: true,
        requiresFirstLevelApproval: false,
        requiresSecondLevelApproval: false,
        minDaysNotice: 0,
        allowQuarterDays: false,
        allowHourly: false,
        hasAccrual: false,
        carryOverAllowed: false,
      },
      {
        organizationId: organization.id,
        name: 'Working from home',
        code: 'WFH' as const, // ✅ Add 'as const'
        description: 'Work From Home (tracking)',
        color: '#3b82f6',
        icon: 'lucide:home',
        requiresApproval: true,
        allowHalfDays: true,
        paidLeave: true,
        requiresFirstLevelApproval: true,
        requiresSecondLevelApproval: false,
        minDaysNotice: 0,
        allowQuarterDays: false,
        allowHourly: false,
        hasAccrual: false,
        carryOverAllowed: false,
      },
    ]

    await prisma.leaveType.createMany({
      data: defaultLeaveTypes,
      skipDuplicates: true,
    })

    return {
      success: true,
      organization,
    }
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

    throw createError({
      statusCode: 500,
      message: 'Onboarding failed',
    })
  }
})