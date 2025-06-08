import { parse } from 'cookie';
import { db } from '$lib/server/database';
import { verifyJWT } from '$lib/server/jwt';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request  }) => {

  /** Laden des authTokens */
  const cookieHeader = request.headers.get('cookie');
  const cookies = parse(cookieHeader || '');
  const token = cookies.authToken;

  let payload;

  /** Verrifizieren des Tokens */
  try {
    payload = verifyJWT(token);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Token ungültig' }), { status: 403 });
  }

  /** Laden der User-ID */
  const userId = payload.id;

  /** Modellierung eines Kurses */
  const [courses] = await db.query(
  `SELECT id, module, displayname, status, date, presentationstatus, scriptstatus, notesstatus, exercisestatus, exercisesheet
   FROM course
   WHERE userid = ?`,
  [userId]
  );
  
  const grouped = {};

  for (const course of courses) {
    if (!grouped[course.module]) {
      grouped[course.module] = {};
    }

    // Extrahiere Datumsteil (z.B. "2025-06-08")
    const dateKey = new Date(course.date).toISOString().split("T")[0];

    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [day, month, year] = formatter.format(new Date(course.date)).split('.');
    dateKey = `${year}-${month}-${day}`;

    if (!grouped[course.module][dateKey]) {
      grouped[course.module][dateKey] = [];
    }

    grouped[course.module][dateKey].push({
      id: course.id,
      displayname: course.displayname,
      status: course.status,
      presentationstatus: course.presentationstatus,
      scriptstatus: course.scriptstatus,
      notesstatus: course.notesstatus,
      exercisestatus: course.exercisesheet ? course.exercisestatus : null,
      exercisesheet: course.exercisesheet
    });
  }

return json(grouped);
};

export const PUT: RequestHandler = async ({ request }) => {
  const { id, field, value } = await request.json();
  const allowed = ['status','presentationstatus','scriptstatus','notesstatus','exercisestatus'];
  if (!allowed.includes(field)) return new Response('Invalid field', { status: 400 });

  await db.query(
    `UPDATE course SET ${field} = ? WHERE id = ?`,
    [value, id]
  );
  return new json({success: true});
};