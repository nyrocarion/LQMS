import { db } from '$lib/server/database';

global.fetch = jest.fn((url, options) => {
  // Mock NumbersAPI (Fact)
  if (typeof url === 'string' && url.includes('numbersapi')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ found: true, text: 'Beispiel-Fact' }),
    });
  }
  // Mock Imgflip (Meme)
  if (typeof url === 'string' && url.includes('imgflip')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { url: 'https://meme.url' } }),
    });
  }
  // Mock DHBW Lectures API
  if (typeof url === 'string' && url.includes('dhbw.app')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            name: 'Testvorlesung',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            rooms: ['A123'],
          },
        ]),
    });
  }
  // Default fallback
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
}) as jest.Mock;

jest.mock('$lib/server/database', () => ({
  db: { query: jest.fn() },
}));

jest.mock('$lib/server/jwt', () => ({
  verifyJWT: jest.fn(() => ({ id: 16 })),
}));

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
    // Tipp
    (db.query as jest.Mock).mockResolvedValueOnce([
      [{ tipps: 'Unga Bunga' }],
    ]);
    // Profil
    (db.query as jest.Mock).mockResolvedValueOnce([
      [{ name: 'Testuser', email: 'test@example.com' }],
    ]);
    // Sessions
    (db.query as jest.Mock).mockResolvedValueOnce([
      [
        { session_date: new Date().toISOString(), total_duration: 120 },
      ],
    ]);

    const { tip: resultTip } = await load({ cookies: fakeCookies } as any);
    expect(resultTip).toBe('Unga Bunga');
  });

  /**
   * Tests that the fallback string is returned when the DB is empty.
   */
  it('Liefert Fallback‑String', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([[]]);
    (db.query as jest.Mock).mockResolvedValueOnce([
      [{ name: '', email: '' }],
    ]);
    (db.query as jest.Mock).mockResolvedValueOnce([[]]);

    const { tip } = await load({ cookies: fakeCookies } as any);
    expect(tip).toBe('Kein Tipp gefunden');
  });
});