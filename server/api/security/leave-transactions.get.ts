// server/api/security/leave-transactions.get.ts
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Only EXECUTIVE can access leave transaction logs
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { role: true },
  })

  if (currentUser?.role !== 'EXECUTIVE') {
    throw createError({
      statusCode: 403,
      message: 'Only Executives can access leave transaction logs',
    })
  }

  // Get query parameters
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 50, 100)
  const skip = (page - 1) * limit

  // Filters
  const userId = query.userId as string
  const status = query.status as string
  const leaveTypeId = query.leaveTypeId as string
  const startDate = query.startDate as string
  const endDate = query.endDate as string

  // Build where clause
  const where: any = {
    organizationId: auth.organizationId,
  }

  if (userId) {
    where.userId = userId
  }

  if (status) {
    where.status = status
  }

  if (leaveTypeId) {
    where.leaveTypeId = leaveTypeId
  }

  if (startDate || endDate) {
    where.submittedAt = {}
    if (startDate) {
      where.submittedAt.gte = new Date(startDate)
    }
    if (endDate) {
      where.submittedAt.lte = new Date(endDate)
    }
  }

  // Fetch leave transactions
  const [transactions, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        leaveType: {
          select: {
            name: true,
            color: true,
          },
        },
        firstLevelApprover: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        secondLevelApprover: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.leave.count({ where }),
  ])

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
