import { db } from '$lib/server/database';
import { POST } from '../../routes/api/login/+server'; // Pfad zur API-Datei
import bcrypt from 'bcrypt';
import { createJWT } from '$lib/server/jwt';

jest.mock('$lib/server/database'); // Mock der Datenbank
jest.mock('bcrypt'); // Mock von bcrypt
jest.mock('$lib/server/jwt'); // Mock von JWT

describe('Login API-Endpoint', () => {
  let request;
  let cookies;

  beforeEach(() => {
    request = {
      json: jest.fn(),
    };
    cookies = {
      get: jest.fn(),
      set: jest.fn(),
    };
  });

  /** Test für ungültige Eingaben (Verletzt das Schema) */
  it('Erwartet: 400 - Ungültige Eingaben', async () => {
    request.json.mockResolvedValue({ identifier: 't', password: 'test' });

    const response = await POST({ request, cookies });

    expect(response.status).toBe(400);
  });

  /** Test für ungültige Benutzerangabe */
  it('Erwartet: 401 - Ungültiger Benutzer', async () => {
    request.json.mockResolvedValue({ identifier: 'test', password: 'test123456' });
    db.query.mockResolvedValue([[]]);

    const response = await POST({ request, cookies });

    expect(response.status).toBe(401);
  });

  /** Test für ungültige Passwortangabe */
  it('Erwartet: 401 - Ungültiges Passwort', async () => {
    request.json.mockResolvedValue({ identifier: 'testuser', password: 'test123456' });
    db.query.mockResolvedValue([[{ id: 1, username: 'testuser', password: '$2y$15$AUACx7A.2ZlecQSI/unxu.1xeFbuzR4T1y8.03DHIU4QB9dj3p4u2'}]]);
    bcrypt.compare.mockResolvedValue(false);

    const response = await POST({ request, cookies });

    expect(response.status).toBe(401);
  });

  /** Test füe gültige Eingaben (Login) und Token */
  it('Erwartet: 200 - Login erfolgreich', async () => {
    request.json.mockResolvedValue({ identifier: 'testuser', password: 'test' });
    db.query.mockResolvedValue([[{ id: 0, username: 'testuser', password: '$2y$15$/Tn/kbvJOVCrPWZ6VAJJl.VZ5imAwjQXTFqxHy3eyGColW0r0oMKa' }]]);
    bcrypt.compare.mockResolvedValue(true); 
    createJWT.mockReturnValue('valid.jwt.token');

    const response = await POST({ request, cookies });

    expect(response.status).toBe(200);
    expect(cookies.set).toHaveBeenCalledWith('authToken', 'valid.jwt.token', expect.any(Object));
  });

  /** Test für möglichen Datenbankfehler */
  it('Erwartet: 500 - Serverfehler', async () => {
    request.json.mockResolvedValue({ identifier: 'testuser', password: 'test' });
    db.query.mockRejectedValue(new Error('Datenbankfehler'));

    const response = await POST({ request, cookies });

    expect(response.status).toBe(500);
  });
});