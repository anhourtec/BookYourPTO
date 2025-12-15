import { prisma } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/jwt'
import { z } from 'zod'

const updateSettingsSchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  timezone: z.string().optional(),
  businessDays: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).min(1, 'At least one business day is required').optional(), // ✅ ADD THIS LINE
  leaveYearStartMonth: z.number().min(1).max(12).optional(),
  defaultLeaveAllowance: z.number().min(0).max(365).optional(),
  weekStartDay: z.number().min(0).max(6).optional(),
  calendarViewRestricted: z.boolean().optional(),
  departmentViewRestricted: z.boolean().optional(),
  carryForwardDays: z.number().min(0).optional(),
  carryForwardHours: z.number().min(0).optional(),
  carryForwardExpires: z.boolean().optional(),
  carryForwardExpiryMonths: z.number().min(1).max(24).nullable().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyJWT(token)

    // Check if user has permission to update settings
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only Administrators and Executives can update organization settings',
      })
    }

    const body = await readBody(event)
    const data = updateSettingsSchema.parse(body)

    // Update organization
    const organization = await prisma.organization.update({
      where: { id: decoded.organizationId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.businessDays !== undefined && { businessDays: data.businessDays }), // ✅ ADD THIS LINE
        ...(data.leaveYearStartMonth !== undefined && { leaveYearStartMonth: data.leaveYearStartMonth }),
        ...(data.defaultLeaveAllowance !== undefined && { defaultLeaveAllowance: data.defaultLeaveAllowance }),
        ...(data.weekStartDay !== undefined && { weekStartDay: data.weekStartDay }),
        ...(data.calendarViewRestricted !== undefined && { calendarViewRestricted: data.calendarViewRestricted }),
        ...(data.departmentViewRestricted !== undefined && { departmentViewRestricted: data.departmentViewRestricted }),
        ...(data.carryForwardDays !== undefined && { carryForwardDays: data.carryForwardDays }),
        ...(data.carryForwardHours !== undefined && { carryForwardHours: data.carryForwardHours }),
        ...(data.carryForwardExpires !== undefined && { carryForwardExpires: data.carryForwardExpires }),
        ...(data.carryForwardExpiryMonths !== undefined && { carryForwardExpiryMonths: data.carryForwardExpiryMonths }),
      },
      select: {
        id: true,
        name: true,
        timezone: true,
        businessDays: true, // ✅ ADD THIS LINE
        leaveYearStartMonth: true,
        defaultLeaveAllowance: true,
        weekStartDay: true,
        calendarViewRestricted: true,
        departmentViewRestricted: true,
        carryForwardDays: true,
        carryForwardHours: true,
        carryForwardExpires: true,
        carryForwardExpiryMonths: true,
      },
    })

    return organization
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

    console.error('Error updating settings:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update settings',
    })
  }
})