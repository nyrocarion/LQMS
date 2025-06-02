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
      [userId, daysAgo[0]]
    );

    // Logge die SQL-Abfrage-Ergebnisse zur Untersuchung
    console.log("Sessions:", sessions);

    const heatmapData = sessions.map(session => {
      if (session.sessionDate) {  // Prüfe, ob sessionDate vorhanden ist
        console.log("sessionDate:", session.sessionDate);  // Logge sessionDate

        // Falls das Datum im falschen Format vorliegt, versuche es manuell zu formatieren
        const dateObj = new Date(session.sessionDate);
        if (dateObj.getTime()) {
          return {
            date: dateObj[0],  // Nur das Datum (ohne Zeit)
            count: session.sessionCount,
          };
        }

        console.log(dateObj)
      }
      return null;  // Rückgabe null, wenn sessionDate undefined ist
    }).filter(Boolean);  // Filtere null-Werte heraus

    return json(heatmapData);

  } catch (error) {
    console.error('Fehler bei der SQL-Abfrage:', error);
    return json({ error: 'Fehler beim Laden der Heatmap-Daten' }, { status: 500 });
  }
};