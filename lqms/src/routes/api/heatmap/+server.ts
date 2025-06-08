import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  console.log(startDate)
  console.log(today)
  startDate.setDate(today.getDate() - 34); // 35 Tage inkl. heute

  const sqlStart = startDate.toISOString().split('T')[0];

  // Hole nur rows aus dem Query
  const [sessions] = await db.query(
    `SELECT DATE(date) as date, COUNT(*) as count
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY DATE(date)
     ORDER BY DATE(date) ASC`,
    [userId, sqlStart]
  );

  const sessionMap = new Map<string, number>();
  for (const row of sessions as { date: Date; count: number }[]) {
    const iso = row.date.toISOString().split('T')[0];
    sessionMap.set(iso, row.count);
  }

  const result: { date: string; count: number }[] = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const count = sessionMap.get(iso) || 0;
    result.push({ date: iso, count });
  }

  console.log(result)
  return json(result);
};