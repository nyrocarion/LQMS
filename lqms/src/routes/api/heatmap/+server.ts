import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysAgo = new Date(today);
  daysAgo.setDate(today.getDate() - 34); // Damit heute mit reinfällt

  // SQL-Abfrage: Sessions der letzten 35 Tage
  const sessions = await db.query(
    `SELECT DATE(date) AS sessionDate, COUNT(*) AS sessionCount
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY sessionDate
     ORDER BY sessionDate ASC`,
    [userId, daysAgo.toISOString().split('T')[0]]
  );

  // Datenbankergebnisse als Map speichern: { '2025-05-25': 2, ... }
  const sessionMap = new Map<string, number>();
  for (const session of sessions) {
    const date = new Date(session.sessionDate).toISOString().split('T')[0];
    sessionMap.set(date, session.sessionCount);
  }

  // Alle 35 Tage generieren
  const days: string[] = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(daysAgo);
    d.setDate(daysAgo.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Ergebnis strukturieren für die Heatmap
  const heatmapData = days.map(date => ({
    date,
    count: sessionMap.get(date) || 0,
  }));

  return json(heatmapData);
};