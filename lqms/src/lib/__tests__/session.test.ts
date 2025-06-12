import { db } from '$lib/server/database';
import { actions } from '../../../src/routes/lqms/dashboard/sessions/+page.server';

jest.mock('$lib/server/database');
jest.mock('$lib/server/jwt', () => ({
  verifyJWT: jest.fn(() => ({ id: 16 }))
}));

/**
 * Test suite for session data saving functionality.
 */
describe('Session Speicherung', () => {

  let request;
  let cookies;

  beforeEach(() => {

    // Mock console methods to suppress output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock request object with formData method returning test data
    request = {
      formData: jest.fn().mockResolvedValue(new Map([
        ['efficiency', '5'],
        ['totalseconds', '360'],
        ['motivation', '7']
      ]))
    };

    // Mock cookies object with get method returning a dummy token
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

  /**
   * Test: Should succeed and return success message if data is saved successfully.
   * 
   * Params:
   *   - request: mocked request object
   *   - cookies: mocked cookies object
   * 
   * Expects:
   *   - Response object with success message 'Feedback gespeichert!'
   */
  it('Erwartet: Erfolg - Erfolgreiche Datenspeicherung', async () => {
    db.query.mockResolvedValue({});

    const response = await actions.default({ request, cookies });

    expect(response.success).toBe('Feedback gespeichert!');
  });
});