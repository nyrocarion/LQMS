import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';

export const handle: Handle = async ({ event, resolve }) => {
  const authToken = event.cookies.get('authToken');

  if (authToken) {
    const user = verifyJWT(authToken);

    if (user) {
      // Verfügbarkeit von Benutzerinfos. Für Routen und Layouts
      event.locals.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    }
  }

  const response = await resolve(event);
  return response;
};

/* export const protectedRoutes = ['/accounts', '/profile', '/manager'];

export const handleProtectedRoute: Handle = async ({ event, resolve }) => {
  const authToken = event.cookies.get('authToken');

  if (protectedRoutes.includes(event.url.pathname)) {
    if (!authToken || !verifyJWT(authToken)) {
      // Benutzer ist nicht authentifiziert!
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login',
        },
      });
    }
  }

  // Normal-Weg
  return resolve(event);
};

export const handle = sequence(handleProtectedRoute, handle); */

import { sequence } from '@sveltejs/kit/hooks';