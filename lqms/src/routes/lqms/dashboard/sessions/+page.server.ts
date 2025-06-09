import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { z } from 'zod';
import { verifyJWT } from '$lib/server/jwt';

const feedbackSchema = z.object({
  efficiency: z.coerce.number().int(),
  totalseconds: z.coerce.number().int(),
  motivation: z.coerce.number().int()
  
});

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = Object.fromEntries(await request.formData());

    const parsed = feedbackSchema.safeParse(data);
    if (!parsed.success) {
      return fail(400, { error: 'Ungültige Eingabedaten' });
    }

    const { efficiency, totalseconds, motivation } = parsed.data;

    try {
      // JWT wird vom Cookie abgegriffen und decoded um ID zu extrahieren
      const jwt = cookies.get('authToken');
      const userId = verifyJWT(jwt)?.id ?? null;

      if(userId == null)
        return { error: 'Du bist nicht angemeldet!'};

      // DB-Eintrag
      await db.query(
        'INSERT INTO session (time, efficiency, motivated, completedby) VALUES (?, ?, ?, ?)',
        [totalseconds, efficiency, motivation, userId]
      );

      return { success: 'Feedback gespeichert!' };
    } catch (err) {
      return fail(500, { error: 'Fehler beim Speichern' });
    }
  }
};