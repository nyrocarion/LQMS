import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);

  // Konvertiere das Datum zu einem ISO-String
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

    // Prüfe, ob die Antwort leer ist
    if (!sessions || sessions.length === 0) {
      console.log('Keine Sessions gefunden');
      return json([], { status: 200 });
    }

    // Ausgabe der Abfrageergebnisse zur Überprüfung
    console.log('Abfrageergebnisse:', sessions);

    // Verarbeite das Ergebnis und stelle sicher, dass es das richtige Format hat
    const heatmapData = sessions.map(session => ({
      // Konvertiere das sessionDate zu einem ISO-String (nur Datum)
      date: new Date(session.sessionDate).toISOString().split('T')[0],  
      count: session.sessionCount,
    }));

    // Überprüfe die verarbeiteten Daten
    console.log('Verarbeitete Heatmap-Daten:', heatmapData);

    return json(heatmapData);

  } catch (error) {
    console.error('Fehler bei der SQL-Abfrage:', error);
    return json({ error: 'Fehler beim Laden der Heatmap-Daten' }, { status: 500 });
  }
};