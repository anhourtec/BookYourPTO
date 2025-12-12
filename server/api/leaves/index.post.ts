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

/**
 * ✅ FIXED: Calculate business days excluding weekends and public holidays
 * Uses UTC consistently to avoid timezone issues
 */
function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  startHalf: string,
  endHalf: string,
  publicHolidays: Date[]
): number {
  let days = 0
  
  // Clone dates and normalize to UTC midnight
  const current = new Date(startDate)
  current.setUTCHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setUTCHours(0, 0, 0, 0)
  
  console.log('🔢 Calculating business days:', {
    start: current.toISOString(),
    end: end.toISOString(),
    holidayCount: publicHolidays.length
  })
  
  // Normalize all holiday dates to YYYY-MM-DD strings for comparison
  const holidayStrings = publicHolidays.map(h => {
    const d = new Date(h)
    d.setUTCHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
  })
  
  console.log('🗓️ Public holidays:', holidayStrings)
  
  // Count business days
  while (current <= end) {
    const dayOfWeek = current.getUTCDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    // Check if current date is a holiday
    const currentDateStr = current.toISOString().split('T')[0]
    const isHoliday = holidayStrings.includes(currentDateStr)
    
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
    
    console.log(`📅 ${currentDateStr} (${dayName}):`, {
      isWeekend,
      isHoliday,
      counts: !isWeekend && !isHoliday
    })
    
    // Only count if it's not a weekend and not a holiday
    if (!isWeekend && !isHoliday) {
      days++
    }
    
    // Move to next day
    current.setUTCDate(current.getUTCDate() + 1)
  }
  
  console.log('📊 Base business days:', days)
  
  // Adjust for half days
  let adjustments = 0
  if (startHalf === 'FIRST_HALF' || startHalf === 'SECOND_HALF') {
    adjustments += 0.5
    console.log('📉 Start half-day adjustment: -0.5')
  }
  if (endHalf === 'FIRST_HALF' || endHalf === 'SECOND_HALF') {
    adjustments += 0.5
    console.log('📉 End half-day adjustment: -0.5')
  }
  
  const finalDays = days - adjustments
  console.log('✅ Final calculated days:', finalDays, `(${days} - ${adjustments})`)
  
  // ✅ FIXED: Don't allow booking if there are no business days
  if (finalDays <= 0) {
    return 0 // Return 0 instead of forcing 0.5
  }
  
  return Math.max(finalDays, 0.5) // Minimum 0.5 days only if there are business days
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

    // ✅ Normalize dates to midnight UTC to avoid timezone issues
    const startDate = new Date(data.startDate)
    startDate.setUTCHours(0, 0, 0, 0)
    
    const endDate = new Date(data.endDate)
    endDate.setUTCHours(0, 0, 0, 0)
    
    console.log('📅 Normalized dates:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][startDate.getUTCDay()],
      endDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][endDate.getUTCDay()]
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
    
    console.log(`🗓️ Found ${publicHolidays.length} public holidays in date range`)
    const holidayDates = publicHolidays.map(h => new Date(h.date))

    // ✅ Calculate total days with improved function
    const totalDays = calculateBusinessDays(
      startDate,
      endDate,
      data.startHalf,
      data.endHalf,
      holidayDates
    )

    console.log('📊 Calculated total days:', totalDays)

    // ✅ FIXED: Prevent booking weekends/holidays only
    if (totalDays === 0) {
      throw createError({
        statusCode: 400,
        message: 'You cannot book leave for weekends or public holidays only. Please select at least one business day.'
      })
    }

    // Check max days per request only if it exists
    if (leaveType.maxDaysPerRequest && totalDays > leaveType.maxDaysPerRequest) {
      throw createError({
        statusCode: 400,
        message: `This leave type allows maximum ${leaveType.maxDaysPerRequest} days per request`
      })
    }

    // ✅ Check for overlapping leaves - only PENDING and APPROVED
    console.log('🔍 Checking for overlaps...')

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

    console.log(`🔍 Found ${existingLeaves.length} active leaves to check`)

    // Filter overlapping leaves
    const overlappingLeaves = existingLeaves.filter(existing => {
      const existingStart = new Date(existing.startDate)
      existingStart.setUTCHours(0, 0, 0, 0)
      
      const existingEnd = new Date(existing.endDate)
      existingEnd.setUTCHours(0, 0, 0, 0)

      const reqStartTime = startDate.getTime()
      const reqEndTime = endDate.getTime()
      const existStartTime = existingStart.getTime()
      const existEndTime = existingEnd.getTime()
      
      // Overlap if: start1 <= end2 AND end1 >= start2
      const overlaps = reqStartTime <= existEndTime && reqEndTime >= existStartTime

      if (overlaps) {
        console.log('⚠️ OVERLAP DETECTED:', {
          existingId: existing.id,
          existingType: existing.leaveType?.name,
          existingRange: `${existingStart.toISOString().split('T')[0]} to ${existingEnd.toISOString().split('T')[0]}`,
          requestedRange: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
        })
      }

      return overlaps
    })

    if (overlappingLeaves.length > 0) {
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

    console.log('✅ No overlaps found')

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

      // Get used leaves this year - only APPROVED and PENDING
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
        requestedDays: totalDays,
        sufficient: totalDays <= remaining
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
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
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