import { parse } from 'cookie';
import { db } from '$lib/server/database';
import { verifyJWT } from '$lib/server/jwt';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * GET handler for fetching grouped course tasks for the authenticated user.
 * 
 * @param {Object} context - The request context object.
 * @param {Request} context.request - The incoming HTTP request.
 * @returns {Response} JSON response containing grouped course data or error.
 */
export const GET: RequestHandler = async ({ request  }) => {

  // Load the authToken from cookies
  const cookieHeader = request.headers.get('cookie');
  const cookies = parse(cookieHeader || '');
  const token = cookies.authToken;

  let payload;

  // Verify the JWT token
  try {
    payload = verifyJWT(token);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Token invalid' }), { status: 403 });
  }

  // Extract user ID from token payload
  const userId = payload.id;

  // Query courses for the user
  const [courses] = await db.query(
    `SELECT id, module, displayname, status, date, presentationstatus, scriptstatus, notesstatus, exercisestatus, exercisesheet
     FROM course
     WHERE userid = ?`,
    [userId]
  );
  
  // Group courses by module and date
  const grouped = {};

  for (const course of courses) {
    if (!grouped[course.module]) {
      grouped[course.module] = {};
    }

    // Format date as YYYY-MM-DD
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [day, month, year] = formatter.format(new Date(course.date)).split('.');
    const dateKey = `${year}-${month}-${day}`;

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

/**
 * PUT handler for updating a specific status field of a course.
 * 
 * @param {Object} context - The request context object.
 * @param {Request} context.request - The incoming HTTP request.
 * @returns {Response} JSON response indicating success or error.
 */
export const PUT: RequestHandler = async ({ request }) => {
  try {
    // Parse request body for update parameters
    const { id, field, newStatus } = await request.json();

    // Only allow specific fields to be updated
    const allowed = ['status','presentationstatus','scriptstatus','notesstatus','exercisestatus'];
    if (!allowed.includes(field)) {
      console.warn(`Ungültiges Feld-Update: ${field}`);
      return new Response('Ungültiges Feld', { status: 400 });
    }

    // Update the specified field in the database
    await db.query(
      `UPDATE course SET ${field} = ? WHERE id = ?`,
      [newStatus, id]
    );

    return json({ success: true });

  } catch (err) {
    console.error('Fehler im Put-Handler:', err);
    return new Response('Serverfehler:', { status: 500 });
  }
};