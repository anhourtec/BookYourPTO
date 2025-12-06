import { prisma } from '~/server/utils/db'
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)

    // Validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required',
      })
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    }

    // ============================================
    // NEW: Generate refresh token and store in database
    // ============================================
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token: generateRefreshToken(user.id, ''), // We'll update this after creation
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days (or 2 minutes for testing)
      },
    })

    // Update the refresh token with its own ID in the JWT payload
    const refreshTokenJWT = generateRefreshToken(user.id, refreshToken.id)
    await prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { token: refreshTokenJWT },
    })

    // ============================================
    // Generate access token (short-lived)
    // ============================================
    const accessToken = generateAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email,
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Return both tokens + user info
    return {
      accessToken,
      refreshToken: refreshTokenJWT,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization,
        avatar: user.avatar,
      },
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Login failed',
    })
  }
})