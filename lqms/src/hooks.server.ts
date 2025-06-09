import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('authToken');
  const currentPath = event.url.pathname;

  // geschützte Bereiche sind alles außer "/" und "/verify-email"
  const isProtectedRoute = currentPath !== '/' && !currentPath.startsWith('/verify-email');

  if (token) {
    try {
      const user = verifyJWT(token);
      event.locals.user = user;

      // Hole emailv aus der Datenbank
      const [rows] = await db.query('SELECT emailv FROM user WHERE id = ?', [user.id]);
      const userInfo = rows[0];

      if (!userInfo || userInfo.emailv === 0) {
        if (isProtectedRoute) {
          throw redirect(303, '/');
        }
      }

    } catch (err) {
      // Token ungültig → löschen und zur Startseite
      event.cookies.delete('authToken', { path: '/' });
      if (isProtectedRoute) {
        throw redirect(303, '/');
      }
    }
  } else {
    // Kein Token vorhanden → Redirect falls geschützt
    if (isProtectedRoute) {
      throw redirect(303, '/');
    }
  }

  return resolve(event);
};
