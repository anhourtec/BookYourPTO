import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }

    // Get query parameters
    const query = getQuery(event)
    const userId = query.userId as string || auth.userId
    const year = query.year ? parseInt(query.year as string) : new Date().getFullYear()
    const status = query.status as string

    // Permission check: Can only view own leaves unless admin/manager
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true, departmentId: true }
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found'
      })
    }

    // Check if user can view this calendar
    if (userId !== auth.userId) {
      const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)
      
      if (!isAdmin) {
        // Check if they're a department head viewing their department member
        if (currentUser.role === 'DEPARTMENT_HEAD') {
          const targetUser = await prisma.user.findFirst({
            where: {
              id: userId,
              departmentId: currentUser.departmentId,
              organizationId: auth.organizationId
            }
          })
          
          if (!targetUser) {
            throw createError({
              statusCode: 403,
              message: 'Insufficient permissions to view this calendar'
            })
          }
        } else {
          throw createError({
            statusCode: 403,
            message: 'Insufficient permissions to view this calendar'
          })
        }
      }
    }

    // Build where clause
    const where: any = {
      userId,
      organizationId: auth.organizationId,
      startDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      }
    }

    if (status) {
      where.status = status
    }

    // Fetch leaves
    const leaves = await prisma.leave.findMany({
      where,
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
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return leaves
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching leaves:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch leaves'
    })
  }
})
