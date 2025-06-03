// +server.ts
import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Startdatum = 35 Tage zurück
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 34);

  // SQL-kompatibles Startdatum
  const sqlStart = startDate.toISOString().split('T')[0];

  // Sessions abrufen
  const sessions = await db.query(
    `SELECT DATE(date) as date, COUNT(*) as count
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY DATE(date)
     ORDER BY DATE(date) ASC`,
    [userId, sqlStart]
  );

  // Datum -> Anzahl Sessions
  const sessionMap = new Map<string, number>();
  for (const row of sessions) {
    if (!(row.date instanceof Date)) {
      console.warn('Ungültiges Datum in DB-Row:', row);
      continue;
    }
    const iso = new Date(row.date).toISOString().split('T')[0];
    sessionMap.set(iso, Number(row.count));
  }

  // Ergebnisdaten generieren
  const result: { date: string; count: number }[] = [];
  for (let i = 0; i < 35; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const iso = date.toISOString().split('T')[0];
    const count = sessionMap.get(iso) || 0;
    result.push({ date: iso, count });
  }

  return json(result);
};