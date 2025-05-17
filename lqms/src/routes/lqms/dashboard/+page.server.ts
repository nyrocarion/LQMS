import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';

// nur eine load Funktion erlaubt pro Datei :(
export const load: PageServerLoad = async ({ cookies }) => {
  // User Kram
  const token = cookies.get('authToken');
  const user = token && verifyJWT(token);

  // Redirect zur Startseite
  // if (!user) {
  //   throw redirect(302, '/');
  // }

  // Tip aus Datenbank holen
  const result = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
  const tip = result[0];

  // Test Kram
  const unga = "WirdGeladenAusTs";

  // Zusammen zurückgeben (wird in dashboard geladen)
  return {
    user,
    tip,
    unga
  };
};
