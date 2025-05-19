import { db } from '../server/database.ts';
import { actions } from '../../../src/routes/lqms/lukas/+page.server.ts';

jest.mock('$lib/server/database');

describe('Session-Speicherung', () => {
  let request;
  let cookies;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

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

    try {
      await actions.default({ request, cookies });
      throw new Error('Es wurde kein Fehler geworfen');
    } catch (err: any) {
      expect(err.status).toBe(500);
      expect(err.message).toBe('Fehler beim Speichern');
    }
  });
});
