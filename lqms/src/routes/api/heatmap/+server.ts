import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();

  // Wieviele Tage zurück müssen wir gehen, damit heute z.B. an Index 2 landet (Dienstag)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 34); // 35 Tage total

  // Generiere 35 Tage von startDate bis heute
  const days: string[] = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Sessions aus der DB laden (ab Startdatum)
  const sqlStart = startDate.toISOString().split('T')[0];
  const sessions = await db.query(
    `SELECT DATE(date) AS sessionDate, COUNT(*) AS sessionCount
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY sessionDate
     ORDER BY sessionDate ASC`,
    [userId, sqlStart]
  );

  console.log('Daten aus der DB:', sessions);

  // Map mit normalisierten Datumsschlüsseln (YYYY-MM-DD)
  const sessionMap = new Map(
    sessions.map((s: any) => {
      try {
        const date = new Date(s.sessionDate);
        if (isNaN(date.getTime())) {
          console.error('Ungültiges Datum:', s.sessionDate);
          return [null, 0]; // Fallback
        }
        console.log('sessionDate type:', typeof s.sessionDate, s.sessionDate);
        const key = date.toISOString().split('T')[0];
        return [key, s.sessionCount];
      } catch (e) {
        console.error('Fehler beim Parsen des Datums:', s.sessionDate);
        return [null, 0];
      }
    }).filter(([key]) => key !== null)
  );

  console.log('Session Map:', Array.from(sessionMap.entries()));

  // Fülle Heatmapdaten
  const heatmapData = days.map(day => {
    const count = sessionMap.get(day) || 0;
    console.log(`Tag: ${day}, Session Count: ${count}`);
    const isFuture = new Date(day) > today;
    return {
      date: day,
      count,
      isFuture
    };
  });

  return json(heatmapData);
};