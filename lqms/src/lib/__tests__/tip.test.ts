import { load } from '../../routes/lqms/dashboard/+page.server';
import { db } from '$lib/server/database';

jest.mock('$lib/server/database', () => ({
  db: { query: jest.fn() }    
}));

describe('Tip von der DB laden', () => {
  it('liefert DB‑Wert', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([{ tipps: 'Unga Bunga' }]);

    const { tip } = await load({ cookies: fakeCookies } as any); 
    expect(tip).toBe('Unga Bunga');
  });

  it('liefert Fallback‑String', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([]);
    const { tip } = await load({ cookies: fakeCookies } as any);
    expect(tip).toBe('Kein Tipp gefunden');
  });
});
