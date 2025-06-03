import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 34);

  const sqlStart = startDate.toISOString().split('T')[0];

  const sessions = await db.query(
    `SELECT DATE(date) as date, COUNT(*) as count
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY DATE(date)
     ORDER BY DATE(date) ASC`,
    [userId, sqlStart]
  );

  // Map mit YYYY-MM-DD → count
  const sessionMap = new Map<string, number>();
  for (const row of sessions) {
    const raw = typeof row.date === 'string' ? row.date : String(row.date);
    const isoDate = raw.split('T')[0];
    if (!isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.warn('Ungültiges Datum in DB-Row:', row);
      continue;
    }
    sessionMap.set(isoDate, Number(row.count));
  }

  const result: { date: string; count: number }[] = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    result.push({ date: iso, count: sessionMap.get(iso) || 0 });
  }

  return json(result);
};