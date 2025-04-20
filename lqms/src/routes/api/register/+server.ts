import { json, type RequestHandler } from '@sveltejs/kit';
import { createJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const SALT_ROUNDS = 10;

//Validierung der Registrierungsdaten
const registerSchema = z.object({
  username: z.string().min(2).max(16),
  email: z.string().email(),
  password: z.string().min(10),
});

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return json({ message: 'Ungültige Eingabedaten', errors: validationResult.error.issues }, { status: 400 });
    }

    const { username, email, password } = validationResult.data;

    // 1. Prüfung für Benutzername
    const existingUserByUsername = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUserByUsername[0].length > 0) {
      return json({ message: 'Benutzername bereits vergeben' }, { status: 409 });
    }

    // 2. Prüfung für E-Mail
    const existingUserByEmail = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUserByEmail[0].length > 0) {
      return json({ message: 'E-Mail wurde bereits registriert' }, { status: 409 });
    }

    // 3. Benutzer in der DB speichern
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    const insertId = result[0].insertId; // ID des neuen Benutzers

    if (insertId) {
      // Registrierung erfolgreich! Erstelle JWT, Cookie
      const payload: { id: number; username: string; email: string } = {
        id: insertId,
        username,
        email,
      };
      const token = createJWT(payload);

      cookies.set('authToken', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60, // 1 Stunde
        secure: process.env.NODE_ENV === 'production',
      });

      if (result[0].affectedRows === 1) {
        return json({ message: 'Registrierung erfolgreich' }, { status: 201 });
      } else {
        return json({ message: 'Registrierung fehlgeschlagen' }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    return json({ message: 'Serverfehler' }, { status: 500 });
  }
};