import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt'; // Passe Pfad an, je nachdem wo du deine JWT-Funktionen hast

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('authToken');

  // Prüfen, ob die Seite geschützt ist
  if (event.url.pathname.startsWith('/dashboard')) {
    if (!token) {
      return Response.redirect(new URL('/', event.url), 303);
    }

    try {
      verifyJWT(token); // Gültigkeit und Ablaufzeit prüfen
    } catch (err) {
      // Token ist abgelaufen oder ungültig → zur Startseite weiterleiten
      return Response.redirect(new URL('/', event.url), 303);
    }
  }

  return resolve(event);
};