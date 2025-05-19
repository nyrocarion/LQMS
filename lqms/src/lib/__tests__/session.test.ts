import { db } from '$lib/server/database';
import { actions } from '../../routes/deine-session/+page.server'; // Passe Pfad an

jest.mock('$lib/server/database');

describe('Session-Speicherung', () => {
  let request;
  let cookies;

  beforeEach(() => {
    request = {
      formData: jest.fn().mockResolvedValue(new Map([
        ['efficiency', '5'],
        ['totalseconds', '360'],
        ['motivation', '7']
      ]))
    };

    cookies = {
      get: jest.fn().mockReturnValue('dummy.token')
    };
  });

  it('gibt 500 zurück, wenn die Datenbank einen Fehler wirft', async () => {
    db.query.mockRejectedValue(new Error('Datenbankfehler'));

    const response = await actions.default({ request, cookies });

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Fehler beim Speichern');
  });
});

// import { db } from '$lib/server/database';
// import { POST } from '../../api/login/+server'; // Pfad zur API-Datei

// jest.mock('$lib/server/database'); // Mock der Datenbank

// describe('Session-Speicherung', () => {
//   let request;
//   let cookies;

// /** Test für möglichen Datenbankfehler */
//   it('Erwartet: 500 - Serverfehler', async () => {
//     request.json.mockResolvedValue({});
//     db.query.mockRejectedValue(new Error('Datenbankfehler'));

//     const response = await POST({ request, cookies });

//     expect(response.status).toBe(500);
//   });
// });

