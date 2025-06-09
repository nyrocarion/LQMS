import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.user?.id;
  if (!userId) return json([], { status: 401 });

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 34);
  const sqlStart = startDate.toISOString().split("T")[0];

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
    const iso = (row.date as Date).toISOString().split("T")[0];
    sessionMap.set(iso, row.count);
  }

  const result = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    result.push({ date: iso, count: sessionMap.get(iso) ?? 0 });
  }

  return json(result);
};