import jwt from 'jsonwebtoken';

interface UserPayload {
  id: number;
  username: string;
}

export function createJWT(payload: UserPayload): string {
  console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
}

export function verifyJWT(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}