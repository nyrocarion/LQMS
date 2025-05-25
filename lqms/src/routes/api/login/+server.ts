import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createJWT } from '$lib/server/jwt';

/** Ein Schema zur Sicherstellung der benötigten Daten beim Login */
const loginSchema = z.object({
  identifier: z.string().min(2), // Kann Benutzername oder E-Mail sein
  password: z.string().min(10),
});

/** Hier erfolgt der eigentliche Login: */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    /** Check für die Einhaltung des Schemas */
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return json({ message: 'Ungültige Anmeldedaten', errors: validationResult.error.issues }, { status: 400 });
    }

    const { identifier, password } = validationResult.data;

    /** Prüfung für bereits vorhandenen Benutzername -> Existiert Benutzer bereits? */
    const userResultByUsername = await db.query('SELECT * FROM user WHERE name = ?', [identifier]);
    const userByUsername = userResultByUsername[0][0];

    /** Prüfung für bereits vorhandene Email -> Existiert Benutzer bereits? */
    const userResultByEmail = await db.query('SELECT * FROM user WHERE email = ?', [identifier]);
    const userByEmail = userResultByEmail[0][0];

    /** Der Benutzer ist entweder der Name oder die Email. */
    const user = userByUsername || userByEmail;

    /** Wenn die Anmeldung fehlschlägt, weil der Benutzer weder durch Email noch seinen Namen gefunden wurde. */
    if (!user) {
      return json({ message: 'Ungültige Anmeldedaten' }, { status: 401 });
    }

    /** Wenn der Passwortvergleich fehlschlägt. */
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return json({ message: 'Ungültige Anmeldedaten' }, { status: 401 });
    }

    /** Erfolgreiche Anmeldung: JWT erstellen und als Cookie senden. */ 
    const payload: { id: number; username: string;} = {
      id: user.id,
      username: user.username,
    };

    const token = createJWT(payload);
  
    /** Egal, ob Cookie gesetzt oder nicht Re-Set */
    if(cookies.get('authToken')) {
      cookies.delete('authToken', { path: '/' });
    }

    cookies.set('authToken', token, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 Stunden Gültigkeiten für einen JWT
    });

    return json({ message: 'Anmeldung erfolgreich', user: { id: user.id, username: user.username, email: user.email } }, { status: 200 });

    /** Mögliche Fehlerbehandlung bei "verlorener" Verbindung*/
  } catch (error) {
    return json({ message: 'Serverfehler' }, { status: 500 });
  }
};