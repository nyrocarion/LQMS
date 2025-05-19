import { db } from '$lib/server/database';
import { POST } from '../../api/login/+server'; // Pfad zur API-Datei

jest.mock('$lib/server/database'); // Mock der Datenbank

describe('Session-Speicherung', () => {
  let request;
  let cookies;

/** Test für möglichen Datenbankfehler */
  it('Erwartet: 500 - Serverfehler', async () => {
    request.json.mockResolvedValue({});
    db.query.mockRejectedValue(new Error('Datenbankfehler'));

    const response = await POST({ request, cookies });

    expect(response.status).toBe(500);
  });
});

