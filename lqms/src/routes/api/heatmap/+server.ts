import { db } from '$lib/server/database';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * GET handler for the heatmap API endpoint.
 * 
 * Retrieves the number of completed sessions per day for the authenticated user
 * over the last 35 days (including today). Returns an array of objects with
 * 'date' (ISO string) and 'count' (number of sessions) for each day.
 * 
 * @param {object} locals - The local context containing the authenticated user.
 * @returns {Response} JSON response with an array of session counts per day.
 */
export const GET: RequestHandler = async ({ locals }) => {
  
  // Get the user ID from the local context
  const userId = locals.user?.id;
  // If no user is authenticated, return 401 Unauthorized with an empty array
  if (!userId) return json([], { status: 401 });

  // Calculate the start date (35 days ago, including today)
  const today = new Date();
  const startDate = new Date();
  // Set the start date to 34 days before today (inclusive window of 35 days)
  startDate.setDate(today.getDate() - 34);
  // Format the start date as YYYY-MM-DD for SQL query
  const sqlStart = startDate.toISOString().split("T")[0];

  // Query the database for session counts per day for the user since the start date
  const [sessions] = await db.query(
    `SELECT DATE(date) as date, COUNT(*) as count
     FROM session
     WHERE completedby = ? AND date >= ?
     GROUP BY DATE(date)
     ORDER BY DATE(date) ASC`,
    [userId, sqlStart]
  );

  // Map the session counts to their respective ISO date strings
  const sessionMap = new Map<string, number>();
  for (const row of sessions as { date: Date; count: number }[]) {
    // Convert the date to ISO string (YYYY-MM-DD)
    const iso = (row.date as Date).toISOString().split("T")[0];
    sessionMap.set(iso, row.count);
  }

  // Build the result array for each day in the 35-day window, filling missing days with count 0
  const result = [];
  for (let i = 0; i < 35; i++) {
    // Calculate the date for the current index
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    // Push the date and session count (default 0 if not found)
    result.push({ date: iso, count: sessionMap.get(iso) ?? 0 });
  }

  // Return the result as JSON
  return json(result);
};