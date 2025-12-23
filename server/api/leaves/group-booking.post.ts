import { prisma } from '~/server/utils/db'
import { z } from 'zod'

const groupBookingSchema = z.object({
  departmentId: z.string(),
  leaveTypeId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  startHalf: z.enum(['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF']).default('FULL_DAY'),
  endHalf: z.enum(['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF']).default('FULL_DAY'),
  reason: z.string().optional(),
  notes: z.string().optional()
})

/**
 * Calculate business days excluding weekends and public holidays
 */
function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  startHalf: string,
  endHalf: string,
  publicHolidays: Date[]
): number {
  let days = 0
  
  const current = new Date(startDate)
  current.setUTCHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setUTCHours(0, 0, 0, 0)
  
  // Normalize holiday dates
  const holidayStrings = publicHolidays.map(h => {
    const d = new Date(h)
    d.setUTCHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
  })
  
  // Count business days
  while (current <= end) {
    const dayOfWeek = current.getUTCDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const currentDateStr = current.toISOString().split('T')[0]
    const isHoliday = holidayStrings.includes(currentDateStr)
    
    if (!isWeekend && !isHoliday) {
      days++
    }
    
    current.setUTCDate(current.getUTCDate() + 1)
  }
  
  // Adjust for half days
  let adjustments = 0
  if (startHalf === 'FIRST_HALF' || startHalf === 'SECOND_HALF') {
    adjustments += 0.5
  }
  if (endHalf === 'FIRST_HALF' || endHalf === 'SECOND_HALF') {
    adjustments += 0.5
  }
  
  const finalDays = days - adjustments
  
  if (finalDays <= 0) {
    return 0
  }
  
  return Math.max(finalDays, 0.5)
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
    console.log('📥 Group booking request:', body)
    
    const data = groupBookingSchema.parse(body)

    // Permission check: Only admins, HR, and department heads can create group bookings
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { 
        role: true,
        departmentId: true
      }
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found'
      })
    }

    const canCreateGroupBooking = ['ADMINISTRATOR', 'EXECUTIVE', 'HR', 'DEPARTMENT_HEAD', 'MANAGER'].includes(currentUser.role)
    
    if (!canCreateGroupBooking) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to create group bookings'
      })
    }

    // Verify department exists and belongs to organization
    const department = await prisma.department.findFirst({
      where: {
        id: data.departmentId,
        organizationId: auth.organizationId,
        isActive: true
      },
      include: {
        users: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!department) {
      throw createError({
        statusCode: 404,
        message: 'Department not found or inactive'
      })
    }

    if (!department.users || department.users.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No active users in this department'
      })
    }

    // Department heads can only create group bookings for their own department
    if (currentUser.role === 'DEPARTMENT_HEAD') {
      if (currentUser.departmentId !== data.departmentId) {
        throw createError({
          statusCode: 403,
          message: 'You can only create group bookings for your own department'
        })
      }
    }

    // Normalize dates to midnight UTC
    const startDate = new Date(data.startDate)
    startDate.setUTCHours(0, 0, 0, 0)
    
    const endDate = new Date(data.endDate)
    endDate.setUTCHours(0, 0, 0, 0)
    
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

    console.log('Calculated total days:', totalDays)

    if (totalDays === 0) {
      throw createError({
        statusCode: 400,
        message: 'Cannot book leave for weekends or public holidays only'
      })
    }

    // Determine approval requirements
    const requiresApproval = leaveType.requiresApproval
    const initialStatus = requiresApproval ? 'PENDING' : 'APPROVED'

    // Create leave requests for all users in department
    const createdLeaves = []
    const errors = []
    const skipped = []

    console.log(`Creating leave requests for ${department.users.length} users`)

    for (const user of department.users) {
      try {
        // Check for overlapping leaves
        const existingLeaves = await prisma.leave.findMany({
          where: {
            userId: user.id,
            organizationId: auth.organizationId,
            status: {
              in: ['PENDING', 'APPROVED']
            }
          }
        })

        // Filter overlapping leaves
        const hasOverlap = existingLeaves.some(existing => {
          const existingStart = new Date(existing.startDate)
          existingStart.setUTCHours(0, 0, 0, 0)
          
          const existingEnd = new Date(existing.endDate)
          existingEnd.setUTCHours(0, 0, 0, 0)

          const reqStartTime = startDate.getTime()
          const reqEndTime = endDate.getTime()
          const existStartTime = existingStart.getTime()
          const existEndTime = existingEnd.getTime()
          
          return reqStartTime <= existEndTime && reqEndTime >= existStartTime
        })

        if (hasOverlap) {
          skipped.push({
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            reason: 'Has overlapping leave'
          })
          console.log(`Skipping ${user.firstName} ${user.lastName}: overlapping leave`)
          continue
        }

        // Check leave balance for deductible leave types
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

          const usedLeaves = await prisma.leave.findMany({
            where: {
              userId: user.id,
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

          const totalUsed = usedLeaves
            .filter(l => l.leaveType && l.leaveType.annualAllowance && l.leaveType.annualAllowance > 0)
            .reduce((sum, l) => sum + (l.totalDays || 0), 0)

          const totalAllowance = organization?.defaultLeaveAllowance || 0
          const remaining = totalAllowance - totalUsed

          if (totalDays > remaining) {
            skipped.push({
              userId: user.id,
              name: `${user.firstName} ${user.lastName}`,
              reason: `Insufficient balance (${remaining} days remaining)`
            })
            console.log(`Skipping ${user.firstName} ${user.lastName}: insufficient balance`)
            continue
          }
        }

        // Create leave request
        const leave = await prisma.leave.create({
          data: {
            organizationId: auth.organizationId,
            userId: user.id,
            leaveTypeId: data.leaveTypeId,
            startDate,
            endDate,
            startHalf: data.startHalf,
            endHalf: data.endHalf,
            totalDays,
            reason: data.reason,
            notes: data.notes ? `${data.notes}\n\nCreated via group booking by ${currentUser.role}` : `Created via group booking by ${currentUser.role}`,
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
                email: true
              }
            }
          }
        })

        createdLeaves.push(leave)

        console.log(`Created leave for ${user.firstName} ${user.lastName}`)

      } catch (error: any) {
        console.error(`Error creating leave for ${user.firstName} ${user.lastName}:`, error.message)
        errors.push({
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          error: error.message
        })
      }
    }

    console.log('Group booking complete:', {
      total: department.users.length,
      created: createdLeaves.length,
      skipped: skipped.length,
      errors: errors.length
    })

    return {
      success: true,
      message: `Group booking created successfully`,
      summary: {
        totalUsers: department.users.length,
        created: createdLeaves.length,
        skipped: skipped.length,
        errors: errors.length
      },
      leaves: createdLeaves,
      skipped,
      errors
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    if (error.issues) {
      console.error('Validation error:', error.issues)
      throw createError({
        statusCode: 400,
        message: `Validation failed: ${error.issues[0].message}`
      })
    }
    
    console.error('Error creating group booking:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create group booking'
    })
  }
})