import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

interface UserPayload {
  id: number;
  username: string;
}

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