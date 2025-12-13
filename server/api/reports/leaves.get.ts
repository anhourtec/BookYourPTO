import { prisma } from '~/server/utils/db'
import ExcelJS from 'exceljs'
import { z } from 'zod'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  departmentId: z.string().optional(),
  userId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN']).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true }
    })

    if (!user || !['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'].includes(user.role)) {
      throw createError({ 
        statusCode: 403, 
        message: 'Only administrators and managers can generate reports' 
      })
    }

    // Parse query parameters
    const query = await getQuery(event)
    const filters = querySchema.parse(query)

    // Build date filters
    const dateFilters: any = {}
    if (filters.startDate) {
      const start = new Date(filters.startDate)
      start.setUTCHours(0, 0, 0, 0)
      dateFilters.gte = start
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate)
      end.setUTCHours(23, 59, 59, 999)
      dateFilters.lte = end
    }

    // Fetch leave data
    const leaves = await prisma.leave.findMany({
      where: {
        organizationId: auth.organizationId,
        ...(Object.keys(dateFilters).length > 0 && { startDate: dateFilters }),
        ...(filters.departmentId && { user: { departmentId: filters.departmentId } }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.leaveTypeId && { leaveTypeId: filters.leaveTypeId }),
        ...(filters.status && { status: filters.status }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              }
            }
          }
        },
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          }
        },
        firstLevelApprover: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        secondLevelApprover: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: [
        { startDate: 'desc' },
        { user: { lastName: 'asc' } }
      ]
    })

    console.log(`📊 Generating report for ${leaves.length} leave records`)

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    
    // Set workbook properties
    workbook.creator = 'BookYourPTO'
    workbook.created = new Date()
    workbook.modified = new Date()

    // ====================================
    // DETAILED LEAVE REPORT SHEET
    // ====================================
    const detailSheet = workbook.addWorksheet('Leave Details', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    // Define columns
    detailSheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Leave Type', key: 'leaveType', width: 20 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Total Days', key: 'totalDays', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Submitted Date', key: 'submittedAt', width: 18 },
      { header: 'Approved By', key: 'approvedBy', width: 25 },
      { header: 'Reason', key: 'reason', width: 40 },
    ]

    // Style header row
    const headerRow = detailSheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow.height = 25

    // Add data rows
    leaves.forEach((leave) => {
      const row = detailSheet.addRow({
        employeeId: leave.user.employeeId || 'N/A',
        employeeName: `${leave.user.firstName} ${leave.user.lastName}`,
        email: leave.user.email,
        department: leave.user.department?.name || 'Unassigned',
        leaveType: leave.leaveType?.name || 'Unknown',
        startDate: leave.startDate,
        endDate: leave.endDate,
        totalDays: leave.totalDays,
        status: leave.status,
        submittedAt: leave.submittedAt,
        approvedBy: leave.firstLevelApprover 
          ? `${leave.firstLevelApprover.firstName} ${leave.firstLevelApprover.lastName}`
          : 'Pending',
        reason: leave.reason || '',
      })

      // Format date cells
      row.getCell('startDate').numFmt = 'yyyy-mm-dd'
      row.getCell('endDate').numFmt = 'yyyy-mm-dd'
      row.getCell('submittedAt').numFmt = 'yyyy-mm-dd hh:mm'

      // Color code status
      const statusCell = row.getCell('status')
      switch (leave.status) {
        case 'APPROVED':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF92D050' }
          }
          break
        case 'PENDING':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC000' }
          }
          break
        case 'REJECTED':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF6B6B' }
          }
          break
        case 'CANCELLED':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
          }
          break
      }

      // Add borders
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    // ====================================
    // SUMMARY BY EMPLOYEE SHEET
    // ====================================
    const summarySheet = workbook.addWorksheet('Summary by Employee', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    // Group leaves by user
    const userSummary = leaves.reduce((acc, leave) => {
      const userId = leave.user.id
      if (!acc[userId]) {
        acc[userId] = {
          employeeId: leave.user.employeeId || 'N/A',
          employeeName: `${leave.user.firstName} ${leave.user.lastName}`,
          department: leave.user.department?.name || 'Unassigned',
          leaveTypes: {},
          totalDays: 0,
          approvedDays: 0,
          pendingDays: 0,
        }
      }

      const leaveTypeName = leave.leaveType?.name || 'Unknown'
      if (!acc[userId].leaveTypes[leaveTypeName]) {
        acc[userId].leaveTypes[leaveTypeName] = 0
      }
      acc[userId].leaveTypes[leaveTypeName] += leave.totalDays || 0
      acc[userId].totalDays += leave.totalDays || 0

      if (leave.status === 'APPROVED') {
        acc[userId].approvedDays += leave.totalDays || 0
      } else if (leave.status === 'PENDING') {
        acc[userId].pendingDays += leave.totalDays || 0
      }

      return acc
    }, {} as Record<string, any>)

    // Get all unique leave types for columns
    const allLeaveTypes = [...new Set(leaves.map(l => l.leaveType?.name || 'Unknown'))]

    // Define dynamic columns
    summarySheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      ...allLeaveTypes.map(lt => ({ header: lt, key: lt, width: 15 })),
      { header: 'Total Days', key: 'totalDays', width: 12 },
      { header: 'Approved Days', key: 'approvedDays', width: 15 },
      { header: 'Pending Days', key: 'pendingDays', width: 15 },
    ]

    // Style header
    const summaryHeader = summarySheet.getRow(1)
    summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    summaryHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    }
    summaryHeader.alignment = { vertical: 'middle', horizontal: 'center' }
    summaryHeader.height = 25

    // Add summary data
    Object.values(userSummary).forEach((summary: any) => {
      const rowData: any = {
        employeeId: summary.employeeId,
        employeeName: summary.employeeName,
        department: summary.department,
        totalDays: summary.totalDays,
        approvedDays: summary.approvedDays,
        pendingDays: summary.pendingDays,
      }

      // Add leave type counts
      allLeaveTypes.forEach(lt => {
        rowData[lt] = summary.leaveTypes[lt] || 0
      })

      const row = summarySheet.addRow(rowData)

      // Add borders
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    // ====================================
    // SUMMARY BY LEAVE TYPE SHEET
    // ====================================
    const leaveTypeSummary = workbook.addWorksheet('Summary by Leave Type', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    leaveTypeSummary.columns = [
      { header: 'Leave Type', key: 'leaveType', width: 25 },
      { header: 'Total Requests', key: 'totalRequests', width: 15 },
      { header: 'Total Days', key: 'totalDays', width: 15 },
      { header: 'Approved Requests', key: 'approvedRequests', width: 18 },
      { header: 'Approved Days', key: 'approvedDays', width: 15 },
      { header: 'Pending Requests', key: 'pendingRequests', width: 18 },
      { header: 'Pending Days', key: 'pendingDays', width: 15 },
    ]

    // Style header
    const ltHeader = leaveTypeSummary.getRow(1)
    ltHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    ltHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFED7D31' }
    }
    ltHeader.alignment = { vertical: 'middle', horizontal: 'center' }
    ltHeader.height = 25

    // Group by leave type
    const leaveTypeStats = leaves.reduce((acc, leave) => {
      const ltName = leave.leaveType?.name || 'Unknown'
      if (!acc[ltName]) {
        acc[ltName] = {
          totalRequests: 0,
          totalDays: 0,
          approvedRequests: 0,
          approvedDays: 0,
          pendingRequests: 0,
          pendingDays: 0,
        }
      }

      acc[ltName].totalRequests++
      acc[ltName].totalDays += leave.totalDays || 0

      if (leave.status === 'APPROVED') {
        acc[ltName].approvedRequests++
        acc[ltName].approvedDays += leave.totalDays || 0
      } else if (leave.status === 'PENDING') {
        acc[ltName].pendingRequests++
        acc[ltName].pendingDays += leave.totalDays || 0
      }

      return acc
    }, {} as Record<string, any>)

    Object.entries(leaveTypeStats).forEach(([leaveType, stats]: [string, any]) => {
      const row = leaveTypeSummary.addRow({
        leaveType,
        ...stats,
      })

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    // Generate filename
    const startDateStr = filters.startDate || 'all'
    const endDateStr = filters.endDate || 'time'
    const filename = `Leave_Report_${startDateStr}_to_${endDateStr}_${Date.now()}.xlsx`

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Set response headers for download
    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
    setHeader(event, 'Content-Length', buffer.byteLength)

    console.log(`✅ Generated Excel report: ${filename}`)

    return buffer
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('❌ Error generating leave report:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate leave report'
    })
  }
})
