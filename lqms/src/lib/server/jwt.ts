// $lib/server/jwt.ts
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

interface UserPayload {
  id: number;
  username: string;
  // Weitere Details?
}

export function createJWT(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }); // Das Token ist für 1 Stunde gültig
}

export function verifyJWT(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}