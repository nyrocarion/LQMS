import jwt from 'jsonwebtoken';

interface UserPayload {
  id: number;
  username: string;
}

/**
 * Store the environment variable as a constant.
 */
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Creates a JWT with 8 hours validity.
 * @param payload - The user payload to encode in the token.
 * @returns The signed JWT as a string.
 */
export function createJWT(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

/**
 * Verifies a JWT and returns the decoded user payload if valid.
 * @param token - The JWT to verify.
 * @returns The decoded UserPayload if valid, otherwise null.
 */
export function verifyJWT(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Creates an email verification token with 1 day validity.
 * @param payload - An object containing user id and email.
 * @returns The signed JWT as a string.
 */
export function createEmailVerificationToken(payload: { id: number, email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

/**
 * Verifies an email verification token and returns the decoded payload.
 * @param token - The JWT to verify.
 * @returns The decoded payload containing id and email.
 */
export function verifyEmailToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: number, email: string };
}