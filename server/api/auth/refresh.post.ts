import { prisma } from '~/server/utils/db'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, generateTokenId } from '~/server/utils/jwt'
import { z } from 'zod'

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = refreshSchema.parse(body)

    // ============================================
    // VERIFY REFRESH TOKEN
    // ============================================
    let decoded
    try {
      decoded = verifyRefreshToken(data.refreshToken)
    } catch (error) {
      throw createError({
        statusCode: 401,
        message: 'Invalid or expired refresh token',
      })
    }

    // ============================================
    // CHECK IF TOKEN EXISTS IN DATABASE
    // ============================================
    const storedToken = await prisma.refreshToken.findUnique({
      where: { 
        id: decoded.tokenId,
      },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!storedToken) {
      throw createError({
        statusCode: 401,
        message: 'Refresh token not found',
      })
    }

    // Check if token has expired
    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      })
      
      throw createError({
        statusCode: 401,
        message: 'Refresh token expired',
      })
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      throw createError({
        statusCode: 401,
        message: 'User account is inactive',
      })
    }

    // ============================================
    // GENERATE NEW ACCESS TOKEN
    // ============================================
    const newAccessToken = generateAccessToken({
      userId: storedToken.user.id,
      organizationId: storedToken.user.organizationId,
      role: storedToken.user.role,
      email: storedToken.user.email,
    })

    // ============================================
    // OPTIONALLY: ROTATE REFRESH TOKEN (More Secure)
    // ============================================
    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    })

    // Generate new refresh token
    const newTokenId = generateTokenId()
    const newRefreshToken = generateRefreshToken(storedToken.user.id, newTokenId)

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        id: newTokenId,
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    return {
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  } catch (error: any) {
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
      message: 'Token refresh failed',
    })
  }
})