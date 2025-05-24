import { parse } from 'cookie';
import { db } from '$lib/server/database';
import { verifyJWT } from '$lib/server/jwt';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {

  const cookieHeader = request.headers.get('cookie');
  const cookies = parse(cookieHeader || '');
  const token = cookies.authToken;

  if (!token) {
    return json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  let payload;

  try {
    payload = verifyJWT(token);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Ungültiger Token' }), { status: 401 });
  }

  const userId = payload.id;

  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const [user] = await db.query(
    `SELECT streak FROM user WHERE id = ?`,
    [userId]
  );

  if (!user.length) return json({ error: 'Benutzer nicht gefunden' }, { status: 404 });

  return json(user[0]);
};
