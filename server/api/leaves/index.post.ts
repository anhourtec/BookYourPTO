import { prisma } from '~/server/utils/db'
import { z } from 'zod'

const createLeaveSchema = z.object({
  userId: z.string(),
  leaveTypeId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  startHalf: z.enum(['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF']).default('FULL_DAY'),
  endHalf: z.enum(['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF']).default('FULL_DAY'),
  reason: z.string().optional(),
  notes: z.string().optional()
})

// Calculate business days excluding weekends and public holidays
function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  startHalf: string,
  endHalf: string,
  publicHolidays: Date[]
): number {
  let days = 0
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHoliday = publicHolidays.some(h => 
      h.toDateString() === current.toDateString()
    )
    
    if (!isWeekend && !isHoliday) {
      days++
    }
    
    current.setDate(current.getDate() + 1)
  }
  
  // Adjust for half days
  if (startHalf === 'FIRST_HALF' || startHalf === 'SECOND_HALF') {
    days -= 0.5
  }
  if (endHalf === 'FIRST_HALF' || endHalf === 'SECOND_HALF') {
    days -= 0.5
  }
  
  return days
}

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }

    const body = await readBody(event)
    const data = createLeaveSchema.parse(body)

    // Permission check: Users can only create leaves for themselves unless admin
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true }
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found'
      })
    }

    if (data.userId !== auth.userId) {
      const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          message: 'You can only create leave requests for yourself'
        })
      }
    }

    // Validate dates
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    
    if (endDate < startDate) {
      throw createError({
        statusCode: 400,
        message: 'End date must be after start date'
      })
    }

    // Get leave type
    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id: data.leaveTypeId,
        organizationId: auth.organizationId,
        isActive: true
      }
    })

    if (!leaveType) {
      throw createError({
        statusCode: 404,
        message: 'Leave type not found'
      })
    }

    // Check minimum notice period
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysDiff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff < leaveType.minDaysNotice) {
      throw createError({
        statusCode: 400,
        message: `This leave type requires at least ${leaveType.minDaysNotice} days notice`
      })
    }

    // Get public holidays for calculation
    const publicHolidays = await prisma.publicHoliday.findMany({
      where: {
        organizationId: auth.organizationId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })
    
    const holidayDates = publicHolidays.map(h => new Date(h.date))

    // Calculate total days
    const totalDays = calculateBusinessDays(
      startDate,
      endDate,
      data.startHalf,
      data.endHalf,
      holidayDates
    )

    // Check max days per request
    if (leaveType.maxDaysPerRequest && totalDays > leaveType.maxDaysPerRequest) {
      throw createError({
        statusCode: 400,
        message: `This leave type allows maximum ${leaveType.maxDaysPerRequest} days per request`
      })
    }

    // Check for overlapping leaves
    const overlappingLeaves = await prisma.leave.findFirst({
      where: {
        userId: data.userId,
        organizationId: auth.organizationId,
        status: {
          in: ['PENDING', 'APPROVED']
        },
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } }
            ]
          }
        ]
      }
    })

    if (overlappingLeaves) {
      throw createError({
        statusCode: 400,
        message: 'You already have a leave request for these dates'
      })
    }

    // Check leave balance (for deductible leaves)
    const nonDeductibleCodes = ['WFH', 'MEETING', 'SICK_PAID', 'SPECIAL']
    
    if (!nonDeductibleCodes.includes(leaveType.code)) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { annualLeaveBalance: true, carryOverBalance: true }
      })

      const totalAvailable = (user?.annualLeaveBalance || 0) + (user?.carryOverBalance || 0)
      
      if (totalDays > totalAvailable) {
        throw createError({
          statusCode: 400,
          message: 'Insufficient leave balance'
        })
      }
    }

    // Determine approval requirements
    const requiresApproval = leaveType.requiresApproval
    const initialStatus = requiresApproval ? 'PENDING' : 'APPROVED'

    // Create leave request
    const leave = await prisma.leave.create({
      data: {
        organizationId: auth.organizationId,
        userId: data.userId,
        leaveTypeId: data.leaveTypeId,
        startDate,
        endDate,
        startHalf: data.startHalf,
        endHalf: data.endHalf,
        totalDays,
        reason: data.reason,
        notes: data.notes,
        status: initialStatus,
        submittedAt: new Date()
      },
      include: {
        leaveType: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: auth.organizationId,
        userId: auth.userId,
        action: 'CREATE',
        entityType: 'LEAVE',
        entityId: leave.id,
        changes: {
          leaveType: leaveType.name,
          startDate: data.startDate,
          endDate: data.endDate,
          totalDays
        },
        ipAddress: getHeader(event, 'x-forwarded-for') || 'unknown',
        userAgent: getHeader(event, 'user-agent') || 'unknown'
      }
    })

    // TODO: Send notification to approvers if requiresApproval

    return leave
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    if (error.issues) {
      throw createError({
        statusCode: 400,
        message: `Validation failed: ${error.issues[0].message}`
      })
    }
    
    console.error('Error creating leave request:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create leave request'
    })
  }
})
