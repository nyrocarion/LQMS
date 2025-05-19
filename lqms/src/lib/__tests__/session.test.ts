import { db } from '$lib/server/database';
import { actions } from '../../../src/routes/lqms/lukas/+page.server';

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

    await expect(actions.default({ request, cookies }))
      .rejects.toMatchObject({
        status: 500,
        message: 'Fehler beim Speichern'
      });
  });
});
