import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  try {
    // Führe die SQL-Abfrage aus
    const sessions = await db.query(
      `SELECT DATE(date) AS sessionDate, COUNT(*) AS sessionCount
       FROM session
       WHERE completedby = ? AND date >= ?
       GROUP BY sessionDate
       ORDER BY sessionDate ASC`,
      [userId, thirtyDaysAgoStr]
    );

    if (!sessions || sessions.length === 0) {
      console.log('Keine Sessions gefunden');
      return json([], { status: 200 });
    }

    console.log('Abfrageergebnisse:', sessions);

    // Verarbeite das Ergebnis und stelle sicher, dass es das richtige Format hat
    const heatmapData = sessions.map(session => {
      // Prüfe, ob die sessionDate ein gültiges Datum ist
      const validDate = new Date(session.sessionDate);
      if (isNaN(validDate.getTime())) {
        console.error(`Ungültiges Datum: ${session.sessionDate}`);
        return null; // Ungültige Daten überspringen
      }

      return {
        date: validDate.toISOString().split('T')[0],  // Nur das Datum ohne Zeit
        count: session.sessionCount,
      };
    }).filter(data => data !== null); // Filtere ungültige Daten raus

    console.log('Verarbeitete Heatmap-Daten:', heatmapData);

    return json(heatmapData);

  } catch (error) {
    console.error('Fehler bei der SQL-Abfrage:', error);
    return json({ error: 'Fehler beim Laden der Heatmap-Daten' }, { status: 500 });
  }
};
