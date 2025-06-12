import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { z } from 'zod';
import { verifyJWT } from '$lib/server/jwt';

/**
 * Zod schema for validating feedback data from the feedback popup.
 * Fields:
 * - efficiency: integer (coerced from input)
 * - totalseconds: integer (coerced from input)
 * - motivation: integer (coerced from input)
 */
const feedbackSchema = z.object({
  efficiency: z.coerce.number().int(),
  totalseconds: z.coerce.number().int(),
  motivation: z.coerce.number().int()
});

/**
 * Formats the current date as "YYYY-MM-DD" to match the database format.
 * @returns {string} The formatted date string.
 */
function getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    console.log(`${year}-${month}-${day}`)
    return `${year}-${month}-${day}`;
}

/**
 * SvelteKit form actions for the session feedback page.
 * Handles saving feedback data to the database and updating user streaks.
 */
export const actions: Actions = {
  /**
   * Default action for handling feedback form submission.
   * @param {object} param0 - The request context containing request and cookies.
   * @returns {Promise<object>} The result of the operation (success or error).
   */
  default: async ({ request, cookies }) => {
    const data = Object.fromEntries(await request.formData());

    const parsed = feedbackSchema.safeParse(data);
    if (!parsed.success) {
      return fail(400, { error: 'Ungültige Eingabedaten' });
    }

    const { efficiency, totalseconds, motivation } = parsed.data;

    let date_today = getCurrentDate();
    
    try {
      // Evaluate JWT to get user data
      const jwt = cookies.get('authToken');
      const userId = verifyJWT(jwt)?.id ?? null;

      if(userId == null)
        return { error: 'Du bist nicht angemeldet!'};

      // Check if there has already been a session today for this user
      const last = await db.query('SELECT * FROM `session` WHERE DATE(`date`) = ? AND `completedby` = ?', [date_today, userId]);

      // Save the session data for the individual user
      await db.query(
        'INSERT INTO session (time, efficiency, motivated, completedby) VALUES (?, ?, ?, ?)',
        [totalseconds, efficiency, motivation, userId]
      );

      // If there has not been a session before today, increase the user's streak by one
      if(!last[0] || last[0].length === 0)
      {
        const update = await db.query('UPDATE user SET streak = streak+1 WHERE id = ?', [userId]);
      }

      return { success: 'Feedback gespeichert!' };
    } catch (err) {
      return fail(500, { error: 'Fehler beim Speichern' });
    }
  }
};