import { json, type RequestHandler } from '@sveltejs/kit';
import { verifyEmailToken } from '$lib/server/jwt';
import { db } from '$lib/server/database';

/**
 * Handles GET requests for email verification.
 * 
 * @param {Object} context - The request context.
 * @param {URL} context.url - The URL object containing search parameters.
 * @returns {Response} JSON response indicating the result of the verification.
 */
export const GET: RequestHandler = async ({ url }) => {
  // Retrieve the token from the query parameters
  const token = url.searchParams.get('token');
  if (!token) {
    return json({ message: 'Kein Token angegeben' }, { status: 400 });
  }

  try {
    // Verify the email token and extract user information
    const { id, email } = verifyEmailToken(token);

    // Update the user's email verification status in the database
    const result = await db.query(
      'UPDATE user SET emailv = 1 WHERE id = ?',
      [id, email]
    );

    if (result[0].affectedRows === 1) {
      return json({ message: 'E-Mail erfolgreich bestätigt' });
    } else {
      return json({ message: 'Benutzer nicht gefunden oder bereits bestätigt' }, { status: 404 });
    }
  } catch (err) {
    return json({ message: 'Token ungültig oder abgelaufen' }, { status: 401 });
  }
};