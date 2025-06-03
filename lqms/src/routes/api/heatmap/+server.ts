import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 34);
  const sqlStart = startDate.toISOString().split('T')[0]; // YYYY-MM-DD

  const sessions = await db.query(
    `SELECT DATE(date) as date, COUNT(*) as count
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY DATE(date)
     ORDER BY DATE(date) ASC`,
    [userId, sqlStart]
  );

  console.log('Rohdaten aus DB:', sessions);

  const sessionMap = new Map<string, number>();
  for (const row of sessions) {
    let rawDate: string;
    if (typeof row.date === 'string') {
      rawDate = row.date;
    } else if (row.date instanceof Date) {
      rawDate = row.date.toISOString();
    } else {
      rawDate = String(row.date);
    }
    const isoDate = rawDate.split('T')[0];
    console.log('Insert Map:', isoDate, Number(row.count));
    sessionMap.set(isoDate, Number(row.count));
  }

  const result = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate.getTime());
    d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    console.log('Lookup Map mit Key:', iso, 'Value:', sessionMap.get(iso));
    result.push({ date: iso, count: sessionMap.get(iso) || 0 });
  }

  return json(result);
};