// server/api/security/signin-logs.get.ts
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Only EXECUTIVE can access sign-in logs
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { role: true },
  })

  if (currentUser?.role !== 'EXECUTIVE') {
    throw createError({
      statusCode: 403,
      message: 'Only Executives can access sign-in logs',
    })
  }

  // Get query parameters
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 50, 100)
  const skip = (page - 1) * limit

  // Filters
  const userId = query.userId as string
  const email = query.email as string
  const success = query.success as string
  const ipAddress = query.ipAddress as string
  const startDate = query.startDate as string
  const endDate = query.endDate as string

  // Build where clause
  const where: any = {
    organizationId: auth.organizationId,
  }

  if (userId) {
    where.userId = userId
  }

  if (email) {
    where.email = {
      contains: email,
      mode: 'insensitive',
    }
  }

  if (success !== undefined && success !== '') {
    where.success = success === 'true'
  }

  if (ipAddress) {
    where.ipAddress = {
      contains: ipAddress,
    }
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

  // Fetch sign-in logs
  const [logs, total] = await Promise.all([
    prisma.signInLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.signInLog.count({ where }),
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
