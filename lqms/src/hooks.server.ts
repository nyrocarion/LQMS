import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('authToken');

  if (event.url.pathname.startsWith('/dashboard')) {
    if (!token) {
      return new Response('Nicht autorisiert', { status: 401 });
    }

    try {
      const user = verifyJWT(token); // Deine Methode zur Verifizierung
      event.locals.user = user;
    } catch {
      return new Response('Token ungültig', { status: 401 });
    }
  }

  return resolve(event);
};