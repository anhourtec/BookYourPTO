// server/api/security/audit-logs/export.get.ts
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Only EXECUTIVE can export audit logs
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { role: true },
  })

  if (currentUser?.role !== 'EXECUTIVE') {
    throw createError({
      statusCode: 403,
      message: 'Only Executives can export audit logs',
    })
  }

  // Get query parameters for filtering
  const query = getQuery(event)
  const format = (query.format as string) || 'csv' // csv or json
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

  // Fetch all audit logs (up to 10,000 records for safety)
  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 10000,
  })

  if (format === 'json') {
    // Return as JSON
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`)
    return logs
  }

  // Generate CSV
  const csvRows: string[] = []

  // Header
  csvRows.push('Timestamp,User,Email,Role,Action,Entity Type,Entity ID,IP Address,User Agent,Changes')

  // Data rows
  for (const log of logs) {
    const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'
    const email = log.user?.email || 'N/A'
    const role = log.user?.role || 'N/A'
    const changes = log.changes ? JSON.stringify(log.changes).replace(/"/g, '""') : ''
    const userAgent = (log.userAgent || '').replace(/"/g, '""')

    csvRows.push([
      log.timestamp.toISOString(),
      `"${userName}"`,
      `"${email}"`,
      role,
      log.action,
      log.entityType,
      log.entityId,
      log.ipAddress || '',
      `"${userAgent}"`,
      `"${changes}"`,
    ].join(','))
  }

  const csvContent = csvRows.join('\n')

  // Set headers for CSV download
  setHeader(event, 'Content-Type', 'text/csv')
  setHeader(event, 'Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`)

  return csvContent
})
