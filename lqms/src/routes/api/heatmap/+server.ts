import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysAgo = new Date(today);
  daysAgo.setDate(today.getDate() - 34);

  try {
    const sessions = await db.query(
      `SELECT date AS sessionDate, COUNT(*) AS sessionCount
      FROM session
      WHERE completedby = ? AND date >= ?
      GROUP BY sessionDate
      ORDER BY sessionDate ASC`,
      [userId, daysAgo.toISOString().split('T')[0]]
    );

    console.log("Sessions:", sessions);

    // Konvertiere sessionDate in das Format 'YYYY-MM-DD'
    const heatmapData = sessions.map(session => ({
      date: session.sessionDate.toISOString().split('T')[0], // Nur Datum (ohne Zeit)
      count: session.sessionCount,
    }));

    return json(heatmapData);
  } catch (error) {
    console.error('Fehler bei der SQL-Abfrage:', error);
    return json({ error: 'Fehler beim Laden der Heatmap-Daten' }, { status: 500 });
  }
};