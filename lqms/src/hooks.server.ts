import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('authToken');

  if (token) {
    try {
      const user = verifyJWT(token);
      event.locals.user = user;

      // Hole vollständige Benutzerinfo aus DB (inkl. emailv)
      const [rows] = await db.query('SELECT emailv FROM user WHERE id = ?', [user.id]);
      const userInfo = rows[0];

      // Falls E-Mail nicht verifiziert
      if (userInfo && userInfo.emailv === 0 && event.url.pathname !== '/' && !event.url.pathname.startsWith('/verify-email')) {
        throw redirect(303, '/?message=unverified');
      }

    } catch (err) {
      // Ungültiger Token → ignorieren
      event.locals.user = null;
    }
  }

  return resolve(event);
};
