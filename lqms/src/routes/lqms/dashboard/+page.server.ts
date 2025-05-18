import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';

// nur eine load Funktion erlaubt pro Datei :(
export const load: PageServerLoad = async ({ cookies }) => {
  console.log("Die Load Funktion wird aufgerufen!");
  // User Kram
  const token = cookies.get('authToken');
  const user = token && verifyJWT(token);

  // Redirect zur Startseite
  // if (!user) {
  //   throw redirect(302, '/');
  // }

  // Tip aus Datenbank holen
  const result = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
  // Gibt eine Ausgabe egal welcher Fall auftritt
  const tip = result[0]?.tipps ?? 'Kein Tipp gefunden';

  // Test Kram
  const unga = "WirdGeladenAusTs";
  

  // Zusammen zurückgeben (wird in dashboard geladen)
  // return user hier rausgemacht
  return {
    tip,
    unga
  };
};
