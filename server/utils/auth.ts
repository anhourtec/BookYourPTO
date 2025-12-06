import { verifyJWT, type JWTPayload } from './jwt'

export const verifyToken = (token: string): JWTPayload => {
  try {
    return verifyJWT(token)
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    })
  }
}

// Re-export for convenience
export { generateJWT as generateToken, type JWTPayload } from './jwt'