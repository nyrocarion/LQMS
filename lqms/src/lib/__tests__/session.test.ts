
import { db } from '../server/database';
import { actions } from '../../../src/routes/lqms/lukas/+page.server';

jest.mock('$lib/server/database');
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
  
  it('Erwartet: 500 - Datenbankfehler', async () => {
    db.query.mockRejectedValue(new Error('Datenbankfehler'));

    try {
      await actions.default({ request, cookies });
      throw new Error('Es wurde kein Fehler geworfen');
    } catch (err: any) {
      expect(err.status).toBe(500);
      expect(err.message).toBe('Fehler beim Speichern');
    }
  });

  it('Erwartet: Erfolg - Erfolgreiche Datenspeicherung', async () => {
  db.query.mockResolvedValue({});

  const response = await actions.default({ request, cookies });

  expect(response.success).toBe('Feedback gespeichert!');
  });
});
