import { prisma } from '~/server/utils/db'

export default defineEventHandler(async () => {
  try {
    const orgCount = await prisma.organization.count()
    const userCount = await prisma.user.count()
    const deptCount = await prisma.department.count()

    return {
      success: true,
      message: 'Prisma 7 + PostgreSQL Connected!',
      data: {
        organizations: orgCount,
        users: userCount,
        departments: deptCount,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
})
