import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysToLoad = 35;

  // Startdatum 35 Tage zurück
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (daysToLoad - 1)); // inkl. heute

  // SQL: Sessions seit Startdatum abrufen
  const sessions = await db.query(
    `SELECT DATE(date) AS date, COUNT(*) AS count
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY DATE(date)
     ORDER BY DATE(date) ASC`,
    [userId, startDate.toISOString().split('T')[0]]
  );

  // Debug: Zeige Ergebnisstruktur
  console.log("Sessions aus DB:", sessions);

  // Map mit YYYY-MM-DD → count
  const sessionMap = new Map<string, number>();
  for (const row of sessions as { date: Date | string; count: number }[]) {
    const d = new Date(row.date);
    if (!isNaN(d.getTime())) {
      const key = d.toISOString().split('T')[0];
      sessionMap.set(key, Number(row.count));
    } else {
      console.warn("Ungültiges Datum in DB-Row:", row);
    }
  }

    // Heatmap-Daten aufbauen
  const heatmapData: { date: string; count: number }[] = [];

  for (let i = 0; i < daysToLoad; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const iso = currentDate.toISOString().split('T')[0];
    const count = sessionMap.get(iso) || 0;
    const isFuture = currentDate > today;

    heatmapData.push({
      date: iso,
      count: isFuture ? -1 : count
    });
  }

  return json(heatmapData);
};