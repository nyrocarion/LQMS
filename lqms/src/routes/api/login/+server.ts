// src/routes/api/login/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createJWT } from '$lib/server/jwt'; // Importiere die JWT-Funktion

const loginSchema = z.object({
  identifier: z.string().min(2), // Kann Benutzername oder E-Mail sein
  password: z.string().min(8),
});

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return json({ message: 'Ungültige Anmeldedaten', errors: validationResult.error.issues }, { status: 400 });
    }

    const { identifier, password } = validationResult.data;

    // Versuche, den Benutzer anhand des Benutzernamens zu finden
    const userResultByUsername = await db.query('SELECT * FROM users WHERE username = ?', [identifier]);
    const userByUsername = userResultByUsername[0][0];

    // Versuche, den Benutzer anhand der E-Mail zu finden
    const userResultByEmail = await db.query('SELECT * FROM users WHERE email = ?', [identifier]);
    const userByEmail = userResultByEmail[0][0];

    const user = userByUsername || userByEmail;

    if (!user) {
      return json({ message: 'Ungültige Anmeldedaten' }, { status: 401 }); // 401 Unauthorized
    }

    // Vergleiche eingegebenes Passwort mit gehashten Passwort aus DB
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return json({ message: 'Ungültige Anmeldedaten' }, { status: 401 }); // 401 Unauthorized
    }

    // Erfolgreiche Anmeldung: JWT erstellen und als Cookie senden
    const payload: { id: number; username: string; email: string } = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    const token = createJWT(payload);

    // Sende das JWT als HTTP-Only Cookie (sicherer)
    cookies.set('authToken', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 Stunden
      secure: process.env.NODE_ENV === 'production', // Nur über HTTPS senden in Produktion
    });

    return json({ message: 'Anmeldung erfolgreich', user: { id: user.id, username: user.username, email: user.email } }, { status: 200 });

  } catch (error) {
    console.error('Fehler bei der Anmeldung:', error);
    return json({ message: 'Serverfehler' }, { status: 500 });
  }
};