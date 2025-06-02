import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt';

/** Das Routen von Anfragen */
export const handle: Handle = async ({ event, resolve }) => {
  //TEEEEST
  console.log("🔥 HOOK aktiv für:", event.url.pathname);

  /** JWT als Prüfkonstante */
  const token = event.cookies.get('authToken');
  
  /** Alle Unterseiten der Landingpage werden geschützt -> OHNE Cookies kein Zugriff */
  if (event.url.pathname.startsWith('/lqms')) {
    if (!token) {
      /** Redirect zur Landingpage */
      return Response.redirect(new URL('/', event.url), 303);
    }

    const payload = verifyJWT(token);
    if (!payload) {
      event.cookies.delete('authToken', { path: '/' });
      return Response.redirect(new URL('/', event.url), 303);
    }

    event.locals.userId = payload.id;
  }
  //TEEEEST
  console.log("✅ userId in hooks gesetzt:", event.locals.userId);
  return resolve(event);
};