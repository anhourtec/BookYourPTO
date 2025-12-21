// server/api/users/index.get.ts
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Get auth from middleware (already verified)
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }
    
    // Fetch users with department, department head, AND direct manager information
    const users = await prisma.user.findMany({
      where: {
        organizationId: auth.organizationId,
      },
      include: {
        department: {
          include: {
            // Department head (the user who heads this department)
            headOfDept: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                jobTitle: true,
                role: true,
              }
            }
          }
        },
        // Direct manager (reportsTo relationship)
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            role: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    })

    return users
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching users:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch users',
    })
  }
})