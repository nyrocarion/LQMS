import { json, type RequestHandler } from '@sveltejs/kit';
import { createJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sendRegistrationMail } from '$lib/server/mailer';

/**
 * Number of salt rounds used for password hashing.
 */
const SALT_ROUNDS = 12;

/**
 * Zod schema to validate registration input data.
 * - username: 2-16 characters
 * - email: valid email format
 * - password: at least 10 characters, excludes certain unsafe characters
 */
const registerSchema = z.object({
  username: z.string().min(2).max(16),
  email: z.string().email(),
  password: z.string().regex(/^[^"'\\;`<>]{10,}$/, 'Das Passwort ist nicht sicher genug.'),
});

/**
 * Handles user registration.
 * 
 * @param {Object} param0 - The request context.
 * @param {Request} param0.request - The incoming HTTP request.
 * @param {Cookies} param0.cookies - The cookies object for setting/deleting cookies.
 * @returns {Response} JSON response indicating registration result.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Parse request body as JSON
    const body = await request.json();

    // Validate input data against schema
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return json({ message: 'Ungültige Eingabedaten', errors: validationResult.error.issues }, { status: 400 });
    }

    const { username, email, password } = validationResult.data;

    // 1. Check if username already exists
    const existingUserByUsername = await db.query('SELECT * FROM user WHERE name = ?', [username]);
    if (existingUserByUsername[0].length > 0) {
      return json({ message: 'Benutzername bereits vergeben' }, { status: 409 });
    }

    // 2. Check if email already exists
    const existingUserByEmail = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUserByEmail[0].length > 0) {
      return json({ message: 'E-Mail wurde bereits registriert' }, { status: 409 });
    }

    // 3. Hash password and insert user into database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      'INSERT INTO user (name, email, password, streak, cookies, emailv) VALUES (?, ?, ?, 0, 1, 0)',
      [username, email, hashedPassword]
    );
    const insertId = result[0].insertId; // ID of the new user

    // If registration was successful, create a JWT and set it as a cookie.
    if (insertId) {

      // JWT payload containing user id and username.
      const payload: { id: number; username: string } = {
        id: insertId,
        username
      };

      // Create JWT token
      const token = createJWT(payload);

      // Remove existing authToken cookie if present
      if (cookies.get('authToken')) {
        cookies.delete('authToken', { path: '/' });
      }

      // Set new authToken cookie
      cookies.set('authToken', token, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours validity
      });

      // Send registration confirmation email
      await sendRegistrationMail(email, username, insertId);

      if (result[0].affectedRows === 1) {
        return json({ message: 'Registrierung erfolgreich' }, { status: 201 });
      } else {
        return json({ message: 'Registrierung fehlgeschlagen' }, { status: 500 });
      }
    }
  } catch (error) {
    // Handle unexpected server errors
    return json({ message: 'Serverfehler' }, { status: 500 });
  }
};