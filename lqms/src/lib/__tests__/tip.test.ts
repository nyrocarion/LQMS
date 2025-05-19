import { load } from '../../routes/lqms/dashboard/+page.server'; 
import { db } from '$lib/server/database';

// Mocken der db.query Methode
jest.mock('$lib/server/database'); 

// TODO: Value an der id = 1 ändern
describe('Tip von der DB Laden', () => {
  it('Sollte den Test Wert zurückgeben', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([
      [{ tipps: 'Unga Bunga' }] 
    ]);

    const result = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
    expect(result[0][0].tipps).toBe('Unga Bunga');
  });

  it('Sollte den Standard Wert zurückgeben', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([]);
    const result = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
    expect(result[0][0].tipps).toBe('Kein Tipp gefunden');
  });
});
