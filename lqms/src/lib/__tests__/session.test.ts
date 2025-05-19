import { db } from '../server/database.ts';
import { actions } from '../../../src/routes/lqms/lukas/+page.server.ts';

jest.mock('$lib/server/database');

describe('Session-Speicherung', () => {
  let request;
  let cookies;

  beforeEach(() => {
    // console.error stumm schalten
    jest.spyOn(console, 'error').mockImplementation(() => {});

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
