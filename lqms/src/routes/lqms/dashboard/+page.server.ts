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

// gets a tip from the db to use in the dashboard
export const load: PageServerLoad = async () => {
  const result = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
  const tip = result[0];
  
  return {
    tip
  };
};
