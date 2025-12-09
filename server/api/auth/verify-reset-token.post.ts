// ============================================
// FILE: server/api/auth/verify-reset-token.post.ts
// ============================================
import { prisma } from '~/server/utils/db'
import { z } from 'zod'

const verifyTokenSchema = z.object({
  token: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = verifyTokenSchema.parse(body)

    console.log('🔍 Verifying token:', data.token)

    // Get all active users with non-expired reset tokens
    const users = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpiry: {
          gt: new Date(),
        },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        passwordResetToken: true,
      },
    })

    console.log(`📋 Found ${users.length} users with active reset tokens`)

    // Check if token matches either:
    // 1. The 6-digit code (e.g., "525897")
    // 2. The full token from URL (e.g., "abc123def456...")
    // 3. The combined format (e.g., "525897:abc123def456...")
    const user = users.find(u => {
      if (!u.passwordResetToken) return false

      const storedToken = u.passwordResetToken

      // Check if stored token contains a colon (combined format)
      if (storedToken.includes(':')) {
        const [code, fullToken] = storedToken.split(':')
        // Match either the 6-digit code OR the full token
        const matches = data.token === code || data.token === fullToken
        if (matches) {
          console.log(`✅ Token matched for user: ${u.email}`)
        }
        return matches
      }

      // Direct match (backward compatibility)
      const matches = storedToken === data.token
      if (matches) {
        console.log(`✅ Token matched for user: ${u.email}`)
      }
      return matches
    })

    if (!user) {
      console.log('❌ No matching user found')
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired reset token',
      })
    }

    return {
      valid: true,
      user: {
        email: user.email,
        firstName: user.firstName,
      },
    }
  } catch (error: any) {
    console.error('❌ Token verification error:', error.message)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 400,
      message: 'Invalid token',
    })
  }
})