import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const [user] = await db.query(
    `SELECT streak FROM user WHERE id = ?`,
    [userId]
  );

  if (!user.length) return json({ error: 'Benutzer nicht gefunden' }, { status: 404 });

  return json(user[0]);
};
