// server/api/security/signin-logs/export.get.ts
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Only EXECUTIVE can export sign-in logs
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { role: true },
  })

  if (currentUser?.role !== 'EXECUTIVE') {
    throw createError({
      statusCode: 403,
      message: 'Only Executives can export sign-in logs',
    })
  }

  // Get query parameters for filtering
  const query = getQuery(event)
  const format = (query.format as string) || 'csv'
  const startDate = query.startDate as string
  const endDate = query.endDate as string

  // Build where clause
  const where: any = {
    organizationId: auth.organizationId,
  }

  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) {
      where.timestamp.gte = new Date(startDate)
    }
    if (endDate) {
      where.timestamp.lte = new Date(endDate)
    }
  }

  // Fetch all sign-in logs (up to 10,000 records)
  const logs = await prisma.signInLog.findMany({
    where,
    orderBy: {
      timestamp: 'desc',
    },
    take: 10000,
  })

  if (format === 'json') {
    // Return as JSON
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Content-Disposition', `attachment; filename="signin-logs-${new Date().toISOString().split('T')[0]}.json"`)
    return logs
  }

  // Generate CSV
  const csvRows: string[] = []

  // Header
  csvRows.push('Timestamp,Email,User ID,Success,Failure Reason,IP Address,Device Type,Browser,OS,Country,City,User Agent')

  // Data rows
  for (const log of logs) {
    const failureReason = (log.failureReason || '').replace(/"/g, '""')
    const userAgent = (log.userAgent || '').replace(/"/g, '""')

    csvRows.push([
      log.timestamp.toISOString(),
      `"${log.email}"`,
      log.userId || '',
      log.success ? 'Yes' : 'No',
      `"${failureReason}"`,
      log.ipAddress,
      log.deviceType || '',
      log.browser || '',
      log.os || '',
      log.country || '',
      log.city || '',
      `"${userAgent}"`,
    ].join(','))
  }

  const csvContent = csvRows.join('\n')

  // Set headers for CSV download
  setHeader(event, 'Content-Type', 'text/csv')
  setHeader(event, 'Content-Disposition', `attachment; filename="signin-logs-${new Date().toISOString().split('T')[0]}.csv"`)

  return csvContent
})
