import { parse } from 'cookie';
import { db } from '$lib/server/database';
import { verifyJWT } from '$lib/server/jwt';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {

  /** Laden des authTokens */
  const cookieHeader = request.headers.get('cookie');
  const cookies = parse(cookieHeader || '');
  const token = cookies.authToken;


  let payload;

  /** Verrifizieren des Tokens */
  try {
    payload = verifyJWT(token);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Ungültiger Token' }), { status: 401 });
  }

  /** Laden der User-ID */
  const userId = payload.id;

  /** Abruf der Streak einer User-ID */
  const [user] = await db.query(
    `SELECT streak FROM user WHERE id = ?`,
    [userId]
  );
  
  if (!user.length) return json({ error: 'Benutzer nicht gefunden' }, { status: 404 });

  return json(user[0]);
};
