import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { z } from 'zod';
import { onMount } from "svelte";
import { verifyJWT } from '$lib/server/jwt';

// Getting Session Data from Feedback Popup
const feedbackSchema = z.object({
  efficiency: z.coerce.number().int(),
  totalseconds: z.coerce.number().int(),
  motivation: z.coerce.number().int()
});

//Formats the current date in a "YYYY-MM-DD" so it matches the entries in the database
function getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    console.log(`${year}-${month}-${day}`)
    return `${year}-${month}-${day}`;
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = Object.fromEntries(await request.formData());

    const parsed = feedbackSchema.safeParse(data);
    if (!parsed.success) {
      return fail(400, { error: 'Ungültige Eingabedaten' });
    }

    const { efficiency, totalseconds, motivation } = parsed.data;

    let date_today = getCurrentDate();
    

    try {
      // JWT gets evaluated to get user data
      const jwt = cookies.get('authToken');
      const userId = verifyJWT(jwt)?.id ?? null;

      if(userId == null)
        return { error: 'Du bist nicht angemeldet!'};


      // Checks, if there has already been a session today
      const last = await db.query('SELECT * FROM `session` WHERE DATE(`date`) = ? AND `completedby` = ?', [date_today, userId]);

      // Saving of the Session data for the individual user
      await db.query(
        'INSERT INTO session (time, efficiency, motivated, completedby) VALUES (?, ?, ?, ?)',
        [totalseconds, efficiency, motivation, userId]
      );

      // If there has not been a Session before that one on that day, the streak gets increased by one
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