import { db } from '$lib/server/database';

jest.mock('$lib/server/database', () => ({
  db: { query: jest.fn() }
}));

jest.mock('$lib/server/jwt', () => ({
  verifyJWT: jest.fn(() => ({ id: 16 }))
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ found: true, text: 'Beispiel-Fact' }),
  })
) as jest.Mock;

import { load } from '../../routes/lqms/dashboard/+page.server';

const fakeCookies = { get: jest.fn(() => 'some.token') } as any;

/**
 * Test suite for loading tips from the database.
 */
describe('Tip von der DB laden', () => {
 
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests that the tip is returned from the database value.
   */
  it('Liefert DB‑Wert', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([
      [{ tipps: 'Unga Bunga' }], // Important part for this test: mocked DB response
      []                         // Remaining fields of the DB response (potentially relevant later)
    ]);

    ;(db.query as jest.Mock).mockResolvedValueOnce([[{ name: '', email: '' }]]);
    ;(db.query as jest.Mock).mockResolvedValueOnce([[]]);

    const { tip } = await load({ cookies: fakeCookies } as any);
    expect(tip).toBe('Unga Bunga');
  });

  /**
   * Tests that the fallback string is returned when the DB is empty.
   */
  it('Liefert Fallback‑String', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([[], []]);

    ;(db.query as jest.Mock).mockResolvedValueOnce([[{ name: '', email: '' }]]);
    ;(db.query as jest.Mock).mockResolvedValueOnce([[]]);

    const { tip } = await load({ cookies: fakeCookies } as any);
    expect(tip).toBe('Kein Tipp gefunden');
  });
});