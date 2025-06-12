import { db } from '$lib/server/database';
import { POST } from '../../routes/api/login/+server';
import bcrypt from 'bcrypt';
import { createJWT } from '$lib/server/jwt';

// Mock the database module
jest.mock('$lib/server/database');
// Mock bcrypt
jest.mock('bcrypt');
// Mock JWT creation
jest.mock('$lib/server/jwt');

/**
 * Test suite for the Login API endpoint.
 */
describe('Login API-Endpoint', () => {
  let request;
  let cookies;

  beforeEach(() => {
    // Silence console output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    request = {
      json: jest.fn(),
    };
    cookies = {
      get: jest.fn(),
      set: jest.fn(),
    };
  });

  /**
   * Test: Expects 400 - Invalid input (violates schema)
   * @returns {Promise<void>}
   */
  it('Erwartet: 400 - Ungültige Eingaben', async () => {
    request.json.mockResolvedValue({ identifier: 't', password: 'test' });

    const response = await POST({ request, cookies });

    expect(response.status).toBe(400);
  });

  /**
   * Test: Expects 401 - Invalid user
   * @returns {Promise<void>}
   */
  it('Erwartet: 401 - Ungültiger Benutzer', async () => {
    request.json.mockResolvedValue({ identifier: 'test', password: 'test123456' });
    db.query.mockResolvedValue([[]]);

    const response = await POST({ request, cookies });

    expect(response.status).toBe(401);
  });

  /**
   * Test: Expects 401 - Invalid password
   * @returns {Promise<void>}
   */
  it('Erwartet: 401 - Ungültiges Password', async () => {
    request.json.mockResolvedValue({ identifier: 'testuser', password: 'test123456' });
    db.query.mockResolvedValue([[{ id: 1, username: 'testuser', password: '$2y$12$AUACx7A.2ZlecQSI/unxu.1xeFbuzR4T1y8.03DHIU4QB9dj3p4u2'}]]);
    bcrypt.compare.mockResolvedValue(false);

    const response = await POST({ request, cookies });

    expect(response.status).toBe(401);
  });

  /**
   * Test: Expects 200 - Successful login and token creation
   * @returns {Promise<void>}
   */
  it('Erwartet: 200 - Login erfolgreich', async () => {
    request.json.mockResolvedValue({ identifier: 'testuser', password: '12345678910' });
    db.query.mockResolvedValue([[{ id: 0, username: 'testuser', password: '$2y$12$Eq9Xpcc4tIqwoZ3KwCLYBOsQ4po8HDPtzaFuwAKzf994sKUoi3swy' }]]);
    bcrypt.compare.mockResolvedValue(true); 
    createJWT.mockReturnValue('valid.jwt.token');

    const response = await POST({ request, cookies });

    expect(response.status).toBe(200);
    expect(cookies.set).toHaveBeenCalledWith('authToken', 'valid.jwt.token', expect.any(Object));
  });

  /**
   * Test: Expects 500 - Possible database error
   * @returns {Promise<void>}
   */
  it('Erwartet: 500 - Serverfehler', async () => {
    request.json.mockResolvedValue({ identifier: 'testuser', password: '12345678910' });
    db.query.mockRejectedValue(new Error('Datenbankfehler'));

    const response = await POST({ request, cookies });

    expect(response.status).toBe(500);
  });
});