import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt';

/** Das Routen von Anfragen */
export const handle: Handle = async ({ event, resolve }) => {
  //TEEEEST
  console.log("🔥 HOOK aktiv für:", event.url.pathname);

  /** JWT als Prüfkonstante */
  const token = event.cookies.get('authToken');
  
  /** Alle Unterseiten der Landingpage werden geschützt -> OHNE Cookies kein Zugriff */
  if (token) {
  const payload = verifyJWT(token);
  if (payload) {
    event.locals.userId = payload.id;
  } else {
    event.cookies.delete('authToken', { path: '/' });
  }
}

if (event.url.pathname.startsWith('/lqms') && !event.locals.userId) {
  return Response.redirect(new URL('/', event.url), 303);
}

return resolve(event);
};