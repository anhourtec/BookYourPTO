import { prisma } from '~/server/utils/db'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export default defineEventHandler(async (event) => {
  try {
    // Get user from auth context (set by middleware)
    const auth = event.context.auth
    if (!auth || !auth.userId) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const body = await readBody(event)
    const data = changePasswordSchema.parse(body)

    // ============================================
    // FETCH USER FROM DATABASE
    // ============================================
    const user = await prisma.user.findUnique({
      where: {
        id: auth.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        organizationId: true,
      },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // ============================================
    // VERIFY CURRENT PASSWORD
    // ============================================
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Current password is incorrect',
      })
    }

    // ============================================
    // CHECK NEW PASSWORD IS DIFFERENT
    // ============================================
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password)
    if (isSamePassword) {
      throw createError({
        statusCode: 400,
        message: 'New password must be different from current password',
      })
    }

    // ============================================
    // HASH NEW PASSWORD
    // ============================================
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    // ============================================
    // UPDATE PASSWORD
    // ============================================
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    })

    console.log('Password changed for user:', user.email)

    // ============================================
    // DELETE ALL REFRESH TOKENS (Force logout on all devices)
    // ============================================
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    })

    console.log('All refresh tokens cleared for security')

    return {
      success: true,
      message: 'Password changed successfully. Please login with your new password.',
    }
  } catch (error: any) {
    console.error('Password change error:', error)

    if (error.statusCode) {
      throw error
    }

    if (error.issues) {
      throw createError({
        statusCode: 400,
        message: error.issues[0].message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to change password',
    })
  }
})