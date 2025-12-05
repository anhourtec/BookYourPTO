import { prisma } from '~/server/utils/db'
import { z } from 'zod'

const onboardingSchema = z.object({
  // Removed companyName - it's already saved during registration
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
    // Company name was already set during registration
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

    // Create default leave types for the organization
    const defaultLeaveTypes = [
      {
        organizationId: organization.id,
        name: 'Annual Leave',
        code: 'ANNUAL',
        color: '#3b82f6',
        requiresApproval: true,
        allowHalfDays: true,
        paidLeave: true,
        annualAllowance: data.annualLeaveAllowance,
        carryOverAllowed: true,
        maxCarryOverDays: 5,
      },
      {
        organizationId: organization.id,
        name: 'Sick Leave - Paid',
        code: 'SICK_PAID',
        color: '#ef4444',
        requiresApproval: false,
        allowHalfDays: true,
        paidLeave: true,
        requiresDocumentation: true,
        annualAllowance: 10,
      },
      {
        organizationId: organization.id,
        name: 'Work From Home',
        code: 'WFH',
        color: '#10b981',
        requiresApproval: true,
        allowHalfDays: true,
        paidLeave: true,
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