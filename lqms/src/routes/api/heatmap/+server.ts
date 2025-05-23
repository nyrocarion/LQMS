import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const sessions = await db.query(
    `SELECT date, efficiency, motivated FROM session WHERE completedby = ? ORDER BY date DESC`,
    [userId]
  );

  // Formatiere die Daten für die Heatmap
  const heatmapData = sessions.map(session => ({
    date: session.date,
    efficiency: session.efficiency,
    motivated: session.motivated,
  }));

  return json(heatmapData);
};