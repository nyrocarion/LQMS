import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { z } from 'zod';
import { onMount } from "svelte";
import { verifyJWT } from '$lib/server/jwt';

const feedbackSchema = z.object({
  efficiency: z.coerce.number().int(),
  totalseconds: z.coerce.number().int(),
  motivation: z.coerce.number().int()
});

let streak = 0;

/** Vorladen der Daten aus API-Endpunkten */
onMount(async () => {
  const streakRes = await fetch("/api/streak", {credentials: "include"});
  const streakData = await streakRes.json();
  streak = streakData.streak;
});

function getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Monat beginnt bei 0, daher +1
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

    let date = getCurrentDate();
    streak = streak + 1;

    try {
      // JWT wird vom Cookie abgegriffen und decoded um ID zu extrahieren
      const jwt = cookies.get('authToken');
      const userId = verifyJWT(jwt)?.id ?? null;
      console.log(userId)

      if(userId == null)
        return { error: 'Du bist nicht angemeldet!'};

      // DB-Eintrag
      await db.query(
        'INSERT INTO session (time, efficiency, motivated, completedby) VALUES (?, ?, ?, ?)',
        [totalseconds, efficiency, motivation, userId]
      );

      const result = await db.query('SELECT * FROM `session` WHERE (`date` = ?,`completedby` = ?) LIMIT 1', [date, userId]) ?? 500303;
      console.log(result)

      if(result == null)
      {
        console.log("Hat funktioniert")
        const update = await db.query('UPDATE user SET (`streak` = ?) WHERE (`id` = ?)', [streak, userId]);
        console.log(update)
      }

      return { success: 'Feedback gespeichert!' };
    } catch (err) {
      return fail(500, { error: 'Fehler beim Speichern' });
    }
  }
};