import { prisma } from '~/server/utils/db'
import ExcelJS from 'exceljs'
import { eachDayOfInterval, format, startOfMonth, endOfMonth } from 'date-fns'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth

    if (!auth) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Get current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser || !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only administrators and executives can generate timesheet reports',
      })
    }

    // Get query parameters
    const query = getQuery(event)
    const userId = query.userId as string | undefined
    const startDateStr = query.startDate as string | undefined
    const endDateStr = query.endDate as string | undefined

    // Default to current month if no dates provided
    const startDate = startDateStr ? new Date(startDateStr) : startOfMonth(new Date())
    const endDate = endDateStr ? new Date(endDateStr) : endOfMonth(new Date())

    // Fetch users
    const users = await prisma.user.findMany({
      where: {
        organizationId: auth.organizationId,
        isActive: true,
        ...(userId && { id: userId }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        department: { select: { name: true } },
        workSchedule: true,
        hoursPerWeek: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    })

    if (users.length === 0) {
      throw createError({ statusCode: 404, message: 'No users found' })
    }

    // Fetch leaves for date range (both PENDING and APPROVED, like the calendar)
    const leaves = await prisma.leave.findMany({
      where: {
        organizationId: auth.organizationId,
        status: {
          in: ['PENDING', 'APPROVED']
        },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(userId && { userId }),
      },
      include: {
        leaveType: { select: { name: true, paidLeave: true } },
      },
    })

    console.log(`📊 Timesheet: Found ${leaves.length} leaves for period ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`, {
      userId,
      leaves: leaves.map(l => ({
        id: l.id,
        userId: l.userId,
        type: l.leaveType.name,
        status: l.status,
        startDate: format(new Date(l.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(l.endDate), 'yyyy-MM-dd'),
      }))
    })

    // Fetch public holidays
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        organizationId: auth.organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'BookYourPTO'
    workbook.created = new Date()

    // Generate timesheet for each user
    for (const user of users) {
      const sheet = workbook.addWorksheet(
        `${user.firstName} ${user.lastName}`.substring(0, 31) // Excel sheet name limit
      )

      // Header
      sheet.mergeCells('A1:H1')
      const titleCell = sheet.getCell('A1')
      titleCell.value = `Timesheet: ${user.firstName} ${user.lastName}`
      titleCell.font = { size: 16, bold: true }
      titleCell.alignment = { horizontal: 'center' }

      // Info
      sheet.getCell('A2').value = 'Employee:'
      sheet.getCell('B2').value = `${user.firstName} ${user.lastName}${user.employeeId ? ` (ID: ${user.employeeId})` : ''}`
      sheet.getCell('A3').value = 'Department:'
      sheet.getCell('B3').value = user.department?.name || 'N/A'
      sheet.getCell('A4').value = 'Period:'
      sheet.getCell('B4').value = `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`

      // Column headers
      const headerRow = sheet.getRow(6)
      const headers = ['Date', 'Day', 'Scheduled', 'Leave', 'Holiday', 'Worked', 'Notes']
      headerRow.values = headers
      headerRow.font = { bold: true }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' },
      }
      headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true }

      // Set column widths
      sheet.columns = [
        { width: 12 }, // Date
        { width: 10 }, // Day
        { width: 10 }, // Scheduled
        { width: 10 }, // Leave
        { width: 10 }, // Holiday
        { width: 10 }, // Worked
        { width: 30 }, // Notes
      ]

      // Parse work schedule
      const schedule = user.workSchedule as any || {}
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

      // Generate daily breakdown
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      let rowNum = 7
      let totalScheduled = 0
      let totalLeave = 0
      let totalHoliday = 0
      let totalWorked = 0

      for (const day of days) {
        const dayName = dayNames[day.getDay()]
        const daySchedule = schedule[dayName] || { isWorkday: false, hours: 0 }
        const scheduledHours = daySchedule.isWorkday ? (daySchedule.hours || 0) : 0

        // Check if holiday (using UTC date comparison like the calendar)
        const isHoliday = holidays.some(h => {
          const holidayDate = new Date(h.date)
          // Compare UTC date parts
          return (
            day.getFullYear() === holidayDate.getUTCFullYear() &&
            day.getMonth() === holidayDate.getUTCMonth() &&
            day.getDate() === holidayDate.getUTCDate()
          )
        })
        const holidayHours = isHoliday ? scheduledHours : 0

        // Check if on leave (using UTC date comparison like the calendar)
        const dayLeaves = leaves.filter(l => {
          if (l.userId !== user.id) return false

          const leaveStart = new Date(l.startDate)
          const leaveEnd = new Date(l.endDate)

          // Use UTC date parts for comparison (same logic as calendar's isBetween)
          const targetUTC = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate())
          const startUTC = Date.UTC(leaveStart.getUTCFullYear(), leaveStart.getUTCMonth(), leaveStart.getUTCDate())
          const endUTC = Date.UTC(leaveEnd.getUTCFullYear(), leaveEnd.getUTCMonth(), leaveEnd.getUTCDate())

          return targetUTC >= startUTC && targetUTC <= endUTC
        })
        const leaveHours = dayLeaves.reduce((sum, leave) => {
          // Simplified: assume full day leave
          return sum + scheduledHours
        }, 0)

        // Debug log for days with leaves
        if (dayLeaves.length > 0) {
          console.log(`  Day ${format(day, 'yyyy-MM-dd')} for ${user.firstName} ${user.lastName}: ${dayLeaves.length} leave(s) found`, {
            leaves: dayLeaves.map(l => ({ type: l.leaveType.name, status: l.status })),
            scheduledHours,
            leaveHours
          })
        }

        const workedHours = Math.max(0, scheduledHours - leaveHours - holidayHours)

        const row = sheet.getRow(rowNum)
        row.values = [
          format(day, 'MMM dd'),
          format(day, 'EEE'),
          scheduledHours,
          leaveHours,
          holidayHours,
          workedHours,
          dayLeaves.map(l => `${l.leaveType.name} (${l.status === 'PENDING' ? 'Pending' : 'Approved'})`).join(', ') || (isHoliday ? 'Public Holiday' : ''),
        ]

        // Color coding
        if (isHoliday) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
        } else if (leaveHours > 0) {
          // Different colors for pending vs approved leaves
          const hasPendingLeave = dayLeaves.some(l => l.status === 'PENDING')
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hasPendingLeave ? 'FFFDE68A' : 'FFFECACA' } }
        } else if (!daySchedule.isWorkday) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
        }

        totalScheduled += scheduledHours
        totalLeave += leaveHours
        totalHoliday += holidayHours
        totalWorked += workedHours

        rowNum++
      }

      // Summary row
      rowNum++
      const summaryRow = sheet.getRow(rowNum)
      summaryRow.values = ['TOTAL', '', totalScheduled, totalLeave, totalHoliday, totalWorked, '']
      summaryRow.font = { bold: true }
      summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' },
      }
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Set headers
    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    setHeader(event, 'Content-Disposition', `attachment; filename="Timesheet_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}.xlsx"`)

    return buffer
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('❌ Error generating timesheet report:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate timesheet report',
    })
  }
})
