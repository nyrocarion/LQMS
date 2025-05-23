import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Zählt die Sessions pro Tag für den aktuellen Benutzer
  const sessions = await db.query(
    `SELECT DATE(date) AS sessionDate, COUNT(*) AS sessionCount
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY sessionDate
     ORDER BY sessionDate DESC`,
    [userId, thirtyDaysAgo.toISOString().split('T')[0]] // ISO-Format für den Vergleich
  );

  // Formatiere die Daten für die Heatmap (sessionDate, sessionCount)
  const heatmapData = sessions.map(session => ({
    date: session.sessionDate,
    count: session.sessionCount,
  }));

  return json(heatmapData);
};