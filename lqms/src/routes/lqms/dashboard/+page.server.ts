import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyJWT } from '$lib/server/jwt';

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get('authToken');
  const user = token && verifyJWT(token);

  if (!user) {
    throw redirect(302, '/'); // zurück zur Startseite
  }

  return {
    user
  };

  //Tab - Notizen

  //Tab - Checkup

  //Tab - Dashboard

  //Tab - VL-Plan

  //Tab Benutzerverwaltung (Admin only)

};