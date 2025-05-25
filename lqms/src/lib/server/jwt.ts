import jwt from 'jsonwebtoken';

interface UserPayload {
  id: number;
  username: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

export function createJWT(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyJWT(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}