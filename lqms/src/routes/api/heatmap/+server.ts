import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysAgo = new Date(today);
  daysAgo.setDate(today.getDate() - 34);

  // Generiere ein Array mit den letzten 35 Tagen
  const days: string[] = [];
  for (let i = 0; i < 35; i++) {
    const day = new Date(daysAgo);
    day.setDate(daysAgo.getDate() + i);
    days.push(day.toISOString().split('T')[0]); // Format: "YYYY-MM-DD"
    console.log(day.toISOString().split('T')[0])
  }

  // Abfrage der Sessions aus der DB
  const sessions = await db.query(
    `SELECT DATE(date) AS sessionDate, COUNT(*) AS sessionCount
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY sessionDate
     ORDER BY sessionDate ASC`,
    [userId, daysAgo.toISOString().split('T')[0]]
  );

  // Erstelle eine Map für schnelleren Zugriff auf die Sessions
  const sessionMap = new Map(
    sessions.map(session => [session.sessionDate, session.sessionCount])
  );

  // Fülle die Heatmap-Daten für alle 35 Tage
  const heatmapData = days.map(day => {
    return {
      date: day,
      count: sessionMap.get(day) || 0,  // Wenn keine Session, setze count auf 0
    };
  });

  return json(heatmapData);
};