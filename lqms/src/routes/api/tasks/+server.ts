import { parse } from 'cookie';
import { db } from '$lib/server/database';
import { verifyJWT } from '$lib/server/jwt';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request  }) => {

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
    return new Response(JSON.stringify({ error: 'Token ungültig' }), { status: 403 });
  }

  const userId = payload.id;

  const [courses] = await db.query(
    `SELECT id, module, displayname, presentationstatus, scriptstatus, notesstatus, exercisestatus, exercisesheet
     FROM course
     WHERE userid = ?`,
    [userId]
  );

  const tasks = [];

  for (const course of courses) {
    const { id, module, displayname, presentationstatus, scriptstatus, notesstatus, exercisestatus, exercisesheet } = course;

    // Für jedes Modul generiere ich eine Task je Status (0 = Waiting, 1 = Doing, 2 = Done)
    // Falls der Status nicht gesetzt ist, 0 = Waiting
    tasks.push({
      module,
      tasks: [
        {
          title: `${displayname}: Präsentation`,
          status: presentationstatus || 0
        },
        {
          title: `${displayname}: Skript lesen`,
          status: scriptstatus || 0
        },
        {
          title: `${displayname}: Notizen erstellen`,
          status: notesstatus || 0
        },
        {
          title: `${displayname}: Übungen machen`,
          status: exercisestatus || 0
        },
        ...(exercisesheet ? [
          {
            title: `${displayname}: Übungsblatt`,
            status: exercisesheet || 0
          }
        ] : [])
      ]
    });
  }

  return json(tasks);
};