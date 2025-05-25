import jwt from 'jsonwebtoken';

interface UserPayload {
  id: number;
  username: string;
}

/** Umgebungsvariable als Konstante speichern */
const JWT_SECRET = process.env.JWT_SECRET;

/** Veröffentlichen des Erstellens eines JWTs mit 8 h Gültigkeit */
export function createJWT(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

/** Veröffentlichen des Überprüfens eines JWTs */
export function verifyJWT(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}