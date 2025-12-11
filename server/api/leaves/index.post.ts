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
    
    // Log the incoming request
    console.log('📥 Create leave request:', body)
    
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

    // FIXED: Normalize dates to midnight UTC to avoid timezone issues
    const startDate = new Date(data.startDate)
    startDate.setUTCHours(0, 0, 0, 0)
    
    const endDate = new Date(data.endDate)
    endDate.setUTCHours(0, 0, 0, 0)
    
    console.log('📅 Normalized dates:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
    
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

    // Check minimum notice period only if it exists
    if (leaveType.minDaysNotice) {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      const daysDiff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff < leaveType.minDaysNotice) {
        throw createError({
          statusCode: 400,
          message: `This leave type requires at least ${leaveType.minDaysNotice} days notice`
        })
      }
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

    // Check max days per request only if it exists
    if (leaveType.maxDaysPerRequest && totalDays > leaveType.maxDaysPerRequest) {
      throw createError({
        statusCode: 400,
        message: `This leave type allows maximum ${leaveType.maxDaysPerRequest} days per request`
      })
    }

    // FIXED: Check for overlapping leaves with detailed logging
    console.log('🔍 Checking for overlaps between:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      userId: data.userId
    })

    // Get all active leaves for this user
    const existingLeaves = await prisma.leave.findMany({
      where: {
        userId: data.userId,
        organizationId: auth.organizationId,
        status: {
          in: ['PENDING', 'APPROVED']
        }
      },
      include: {
        leaveType: true
      }
    })

    // Filter overlapping leaves manually with proper date comparison
    const overlappingLeaves = existingLeaves.filter(existing => {
      const existingStart = new Date(existing.startDate)
      existingStart.setUTCHours(0, 0, 0, 0)
      
      const existingEnd = new Date(existing.endDate)
      existingEnd.setUTCHours(0, 0, 0, 0)

      // Two date ranges overlap if they share any common days
      // Ranges DON'T overlap if one ends before the other starts
      // So overlap exists if: NOT (end1 < start2 OR start1 > end2)
      // Which simplifies to: start1 <= end2 AND end1 >= start2
      // BUT we need to check if they're on DIFFERENT days, not just touching
      
      // Get timestamps for comparison
      const reqStartTime = startDate.getTime()
      const reqEndTime = endDate.getTime()
      const existStartTime = existingStart.getTime()
      const existEndTime = existingEnd.getTime()
      
      // Overlap if the ranges intersect (not just touch at boundaries)
      const overlaps = reqStartTime <= existEndTime && reqEndTime >= existStartTime

      console.log('🔍 Comparing with existing leave:', {
        existingId: existing.id,
        existingType: existing.leaveType?.name,
        existingStart: existingStart.toISOString(),
        existingEnd: existingEnd.toISOString(),
        requestedStart: startDate.toISOString(),
        requestedEnd: endDate.toISOString(),
        existingStartTime: existStartTime,
        existingEndTime: existEndTime,
        requestedStartTime: reqStartTime,
        requestedEndTime: reqEndTime,
        comparison: {
          'reqStart <= existEnd': reqStartTime <= existEndTime,
          'reqEnd >= existStart': reqEndTime >= existStartTime,
        },
        overlaps
      })

      return overlaps
    })

    console.log(`🔍 Found ${overlappingLeaves.length} overlapping leaves`)

    if (overlappingLeaves.length > 0) {
      // Log detailed information about overlapping leaves for debugging
      console.error('❌ OVERLAP DETECTED:', {
        requestedStart: startDate.toISOString(),
        requestedEnd: endDate.toISOString(),
        overlapping: overlappingLeaves.map(l => ({
          id: l.id,
          leaveType: l.leaveType?.name,
          startDate: new Date(l.startDate).toISOString(),
          endDate: new Date(l.endDate).toISOString(),
          status: l.status,
          createdAt: new Date(l.createdAt).toISOString()
        }))
      })

      const firstOverlap = overlappingLeaves[0]
      const overlapStart = new Date(firstOverlap.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      const overlapEnd = new Date(firstOverlap.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })

      throw createError({
        statusCode: 400,
        message: `You already have a ${firstOverlap.status.toLowerCase()} leave request (${firstOverlap.leaveType?.name || 'Leave'}) from ${overlapStart} to ${overlapEnd}`
      })
    }

    // Check leave balance only for deductible leave types
    if (leaveType.annualAllowance && leaveType.annualAllowance > 0) {
      const organization = await prisma.organization.findUnique({
        where: { id: auth.organizationId },
        select: { 
          defaultLeaveAllowance: true,
          leaveYearStartMonth: true
        }
      })

      const year = new Date().getFullYear()
      const fiscalStartMonth = organization?.leaveYearStartMonth || 1
      const fiscalPeriodStart = new Date(year, fiscalStartMonth - 1, 1)
      const fiscalPeriodEnd = new Date(year + 1, fiscalStartMonth - 1, 0)

      // Get used leaves this year
      const usedLeaves = await prisma.leave.findMany({
        where: {
          userId: data.userId,
          organizationId: auth.organizationId,
          startDate: {
            gte: fiscalPeriodStart,
            lte: fiscalPeriodEnd
          },
          status: {
            in: ['APPROVED', 'PENDING']
          }
        },
        include: {
          leaveType: true
        }
      })

      // Calculate used days (only deductible types)
      const totalUsed = usedLeaves
        .filter(l => l.leaveType && l.leaveType.annualAllowance && l.leaveType.annualAllowance > 0)
        .reduce((sum, l) => sum + (l.totalDays || 0), 0)

      const totalAllowance = organization?.defaultLeaveAllowance || 0
      const remaining = totalAllowance - totalUsed

      console.log('💰 Leave balance check:', {
        totalAllowance,
        totalUsed,
        remaining,
        requestedDays: totalDays
      })

      if (totalDays > remaining) {
        throw createError({
          statusCode: 400,
          message: `Insufficient leave balance. You have ${remaining} days remaining but are requesting ${totalDays} days.`
        })
      }
    }

    // Determine approval requirements
    const requiresApproval = leaveType.requiresApproval
    const initialStatus = requiresApproval ? 'PENDING' : 'APPROVED'

    console.log('📝 Creating leave with status:', initialStatus)

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
          totalDays,
          status: initialStatus
        },
        ipAddress: getHeader(event, 'x-forwarded-for') || 'unknown',
        userAgent: getHeader(event, 'user-agent') || 'unknown'
      }
    })

    console.log('✅ Leave created successfully:', {
      id: leave.id,
      leaveType: leave.leaveType?.name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays: leave.totalDays,
      status: leave.status
    })

    return leave
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    if (error.issues) {
      console.error('❌ Validation error:', error.issues)
      throw createError({
        statusCode: 400,
        message: `Validation failed: ${error.issues[0].message}`
      })
    }
    
    console.error('❌ Error creating leave request:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create leave request'
    })
  }
})