import { load } from '../../routes/lqms/dashboard/+page.server';
import { db } from '$lib/server/database';

jest.mock('$lib/server/database', () => ({
  db: { query: jest.fn() }
}));

const fakeCookies = { get: jest.fn(() => undefined) } as any;

describe('Tip von der DB laden', () => {
  it('liefert DB‑Wert', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([
      [{ tipps: 'Unga Bunga' }], // rows
      []                         // fields
    ]);

    const { tip } = await load({ cookies: fakeCookies } as any);
    expect(tip).toBe('Unga Bunga');
  });

  it('liefert Fallback‑String', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([[], []]); // keine rows

    const { tip } = await load({ cookies: fakeCookies } as any);
    expect(tip).toBe('Kein Tipp gefunden');
  });
});
