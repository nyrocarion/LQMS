import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { POST } from '../../api/login/+server'; // Pfad zur API-Datei
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

  it('Erwartet: 400 - Ungültige Eingaben', async () => {
    request.json.mockResolvedValue({ identifier: 'u', password: 'short' }); // Ungültige Eingaben

    const response = await POST({ request, cookies });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Ungültige Anmeldedaten');
  });

  it('Erwartet: 401 - Ungültiger Benutzer', async () => {
    request.json.mockResolvedValue({ identifier: 'nonexistent', password: 'validpassword123' });
    db.query.mockResolvedValue([[]]); // Keine Benutzer gefunden

    const response = await POST({ request, cookies });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Ungültige Anmeldedaten');
  });

  it('should return 401 for incorrect password', async () => {
    request.json.mockResolvedValue({ identifier: 'existingUser', password: 'wrongpassword' });
    db.query.mockResolvedValue([[{ id: 1, username: 'existingUser', password: 'hashedPassword' }]]);
    bcrypt.compare.mockResolvedValue(false); // Passwort stimmt nicht überein

    const response = await POST({ request, cookies });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Ungültige Anmeldedaten');
  });

  it('should return 200 and set authToken for valid login', async () => {
    request.json.mockResolvedValue({ identifier: 'existingUser', password: 'correctpassword' });
    db.query.mockResolvedValue([[{ id: 1, username: 'existingUser', password: 'hashedPassword' }]]);
    bcrypt.compare.mockResolvedValue(true); // Passwort stimmt überein
    createJWT.mockReturnValue('valid.jwt.token'); // Mock des JWT

    const response = await POST({ request, cookies });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Anmeldung erfolgreich');
    expect(cookies.set).toHaveBeenCalledWith('authToken', 'valid.jwt.token', expect.any(Object)); // Überprüfen, ob das Cookie gesetzt wurde
  });

  it('should return 500 on server error', async () => {
    request.json.mockResolvedValue({ identifier: 'existingUser', password: 'correctpassword' });
    db.query.mockRejectedValue(new Error('Database error')); // Simuliere einen Datenbankfehler

    const response = await POST({ request, cookies });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Serverfehler');
  });
});
