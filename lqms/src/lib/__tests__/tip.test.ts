import { load } from '../../routes/lqms/dashboard/+page.server';
import { db } from '$lib/server/database';

jest.mock('$lib/server/database', () => ({
  db: { query: jest.fn() }
}));

// Minimal‑Mock für cookies
const fakeCookies = {
  get: jest.fn(() => undefined) // hier kannst du später auch einen Token zurückgeben
} as any;

describe('Tip von der DB laden', () => {
  it('liefert DB‑Wert', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([{ tipps: 'Unga Bunga' }]);

    const { tip } = await load({ cookies: fakeCookies } as any);
    expect(tip).toBe('Unga Bunga');
  });

  it('liefert Fallback‑String', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([]);   // DB gibt nichts zurück

    const { tip } = await load({ cookies: fakeCookies } as any);
    expect(tip).toBe('Kein Tipp gefunden');
  });
});
