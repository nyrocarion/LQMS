import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createJWT } from '$lib/server/jwt';

/**
 * Schema to ensure required data for login.
 * The identifier can be either username or email.
 */
const loginSchema = z.object({
  identifier: z.string().min(2), // Can be username or email
  password: z.string().min(10),
});

/**
 * Handles POST requests for user login.
 * - Validates input data.
 * - Checks if user exists by username or email.
 * - Verifies password.
 * - Issues JWT and sets it as an HTTP-only cookie.
 * - Returns user info on success.
 * 
 * @param request - The incoming request object.
 * @param cookies - The cookies object for setting/deleting cookies.
 * @returns JSON response with status and user info or error message.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Parse request body as JSON
    const body = await request.json();

    // Validate input against schema
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return json({ message: 'Ungültige Anmeldedaten!', errors: validationResult.error.issues }, { status: 400 });
    }

    const { identifier, password } = validationResult.data;

    // Check if user exists by username
    const userResultByUsername = await db.query('SELECT * FROM user WHERE name = ?', [identifier]);
    const userByUsername = userResultByUsername[0][0];

    // Check if user exists by email
    const userResultByEmail = await db.query('SELECT * FROM user WHERE email = ?', [identifier]);
    const userByEmail = userResultByEmail[0][0];

    // User can be found by username or email
    const user = userByUsername || userByEmail;

    // If user not found, return error
    if (!user) {
      return json({ message: 'Ungültige Anmeldedaten!' }, { status: 401 });
    }

    // Compare provided password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return json({ message: 'Ungültige Anmeldedaten!' }, { status: 401 });
    }

    // Successful login: create JWT and set as cookie
    const payload: { id: number; username: string;} = {
      id: user.id,
      username: user.username,
    };

    const token = createJWT(payload);
  
    // Remove existing authToken cookie if present
    if(cookies.get('authToken')) {
      cookies.delete('authToken', { path: '/' });
    }

    cookies.set('authToken', token, {  
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 8, // JWT valid for 8 hours
    });

    return json({ message: 'Anmeldung erfolgreich', user: { id: user.id, username: user.username, email: user.email } }, { status: 200 });

    /** Mögliche Fehlerbehandlung bei "verlorener" Verbindung*/
  } catch (error) {
    // Handle server errors
    return json({ message: 'Serverfehler' }, { status: 500 });
  }
};