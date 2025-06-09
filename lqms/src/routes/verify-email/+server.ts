import { json, type RequestHandler } from '@sveltejs/kit';
import { verifyEmailToken } from '$lib/server/jwt';
import { db } from '$lib/server/database';

export const GET: RequestHandler = async ({ url }) => {
  const token = url.searchParams.get('token');
  if (!token) {
    return json({ message: 'Kein Token angegeben' }, { status: 400 });
  }

  try {
    const { id, email } = verifyEmailToken(token);

    const result = await db.query(
      'UPDATE user SET emailv = 1 WHERE id = ?',
      [id, email]
    );

    if (result[0].affectedRows === 1) {
      return json({ message: 'E-Mail erfolgreich bestätigt' });
    } else {
      return json({ message: 'Benutzer nicht gefunden oder bereits bestätigt' }, { status: 404 });
    }
  } catch (err) {
    return json({ message: 'Token ungültig oder abgelaufen' }, { status: 401 });
  }
};
