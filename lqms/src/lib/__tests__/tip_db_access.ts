import { load } from './page.server'; // Importiere deine Load-Funktion
import { db } from '$lib/server/database'; // Der Datenbankzugriff, den wir mocken möchten

// Mocken der db.query Methode
jest.mock('$lib/server/database'); // Mock die DB-Abfrage

describe('Server load function - tip', () => {
  it('should return the tip from the database', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce([
      [{ tipps: 'Unga Bunga' }] 
    ]);

    const result = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
    expect(result[0][0].tipps).toBe('Unga Bunga');
  });

  it('should return the default value when no tip is found', async () => {
    // Mock für eine leere DB-Abfrage
    (db.query as jest.Mock).mockResolvedValueOnce([]);
    const result = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
    expect(result[0][0].tipps).toBe('Kein Tipp gefunden');
  });
});
