import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('authToken');

  // Prüfen, ob die Seite geschützt ist
  if (event.url.pathname.startsWith('/lqms')) {
    if (!token) {
      return Response.redirect(new URL('/', event.url), 303);
    }

    try {
      verifyJWT(token); // Gültigkeit und Ablaufzeit prüfen
    } catch (err) {
      event.cookies.delete('authToken', { path: '/' });
      return Response.redirect(new URL('/', event.url), 303);
    }
  }

  return resolve(event);
};