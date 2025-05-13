import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get('authToken');
  const user = token && verifyJWT(token);

  //if (!user) {
  //  throw redirect(302, '/'); // zurück zur Startseite
  //}

  return {
    user
  };

  //Tab - Notizen

  //Tab - Checkup

  //Tab - Dashboard

  //Tab - VL-Plan

  //Tab Benutzerverwaltung (Admin only)

};

export const tip: getTipFromDB = async () => {
  const tip = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
  document.getElementById("tip").innerHTML = tip;
  return tip;
}
