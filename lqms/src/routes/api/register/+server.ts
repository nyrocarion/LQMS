import { json, type RequestHandler } from '@sveltejs/kit';
import { createJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';

/** Das ist die Anzahl der verwendeten Salt-Runden für die Verschlüsselung des Passworts! */ 
const SALT_ROUNDS = 15;

/** Ein Schema zur Sicherstellung der benötigten Daten bei der Registrierung */
const registerSchema = z.object({
  username: z.string().min(2).max(16),
  email: z.string().email(),
  password: z.string().min(10),
});

/** Hier erfolgt die eigentliche Registrierung: */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    /** Check für die Einhaltung des Schemas */
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return json({ message: 'Ungültige Eingabedaten', errors: validationResult.error.issues }, { status: 400 });
    }

    const { username, email, password } = validationResult.data;

    /** 1.) Prüfung für Benutzername */
    const existingUserByUsername = await db.query('SELECT * FROM user WHERE name = ?', [username]);
    if (existingUserByUsername[0].length > 0) {
      return json({ message: 'Benutzername bereits vergeben' }, { status: 409 });
    }

    /** 2.) Prüfung für E-Mail */
    const existingUserByEmail = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUserByEmail[0].length > 0) {
      return json({ message: 'E-Mail wurde bereits registriert' }, { status: 409 });
    }

    /** 3.) Benutzerdaten in der DB speichern */
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query('INSERT INTO user (name, email, password, streak, cookies) VALUES (?, ?, ?, 0, 1)', [username, email, hashedPassword]);
    const insertId = result[0].insertId; // ID des neuen Benutzers

    /** War die Registrierung erfolgreich, so wird ein JWT erstellt */
    if (insertId) {
      const payload: { id: number; username: string } = {
        id: insertId,
        username
      };

      const token = createJWT(payload);

      cookies.set('authToken', token, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 8, // 8 Stunden Gültigkeiten für einen JWT
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