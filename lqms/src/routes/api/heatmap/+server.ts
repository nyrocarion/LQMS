import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) {
    console.log('Nicht eingeloggt');
    return json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Setze Zeit auf Mitternacht
  const daysAgo = new Date(today);
  daysAgo.setDate(today.getDate() - 34); // Berechne 34 Tage zurück von heute
  console.log('Heute:', today.toISOString());
  console.log('Startdatum für die Abfrage (34 Tage zurück):', daysAgo.toISOString());

  // Generiere ein Array mit den letzten 35 Tagen (im ISO-Format ohne Uhrzeit)
  const days: string[] = [];
  for (let i = 0; i < 35; i++) {
    const day = new Date(daysAgo);
    day.setDate(daysAgo.getDate() + i);
    days.push(day.toISOString().split('T')[0]); // Format: "YYYY-MM-DD"
  }
  console.log('Generierte Tage:', days);

  // Abfrage der Sessions aus der DB
  const sessions = await db.query(
    `SELECT DATE(date) AS sessionDate, COUNT(*) AS sessionCount
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY sessionDate
     ORDER BY sessionDate ASC`,
    [userId, daysAgo.toISOString().split('T')[0]] // Hier ist die Abfrage korrekt mit Datum von 34 Tagen zurück
  );

  console.log('Daten aus der DB:', sessions);

  // Erstelle eine Map für schnelleren Zugriff auf die Sessions
  const sessionMap = new Map(
    sessions.map(session => [session.sessionDate, session.sessionCount])
  );
  console.log('Session Map:', Array.from(sessionMap.entries()));

  // Fülle die Heatmap-Daten für alle 35 Tage
  const heatmapData = days.map(day => {
    const count = sessionMap.get(day) || 0;
    console.log(`Tag: ${day}, Session Count: ${count}`);
    return {
      date: day,
      count: count,  // Wenn keine Session, setze count auf 0
    };
  });

  console.log('Heatmap-Daten:', heatmapData);

  return json(heatmapData);
};