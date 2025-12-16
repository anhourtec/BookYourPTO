// server/api/security/audit-logs.get.ts
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Only EXECUTIVE can access audit logs
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { role: true },
  })

  if (currentUser?.role !== 'EXECUTIVE') {
    throw createError({
      statusCode: 403,
      message: 'Only Executives can access audit logs',
    })
  }

  // Get query parameters
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 50, 100) // Max 100 per page
  const skip = (page - 1) * limit

  // Filters
  const userId = query.userId as string
  const action = query.action as string
  const entityType = query.entityType as string
  const startDate = query.startDate as string
  const endDate = query.endDate as string

  // Build where clause
  const where: any = {
    organizationId: auth.organizationId,
  }

  if (userId) {
    where.userId = userId
  }

  if (action) {
    where.action = action
  }

  if (entityType) {
    where.entityType = entityType
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

  // Fetch audit logs
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
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
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
