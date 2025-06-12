import { parse } from 'cookie';
import { db } from '$lib/server/database';
import { verifyJWT } from '$lib/server/jwt';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * GET handler for retrieving the user's streak.
 * 
 * @param {Object} context - The request context object.
 * @param {Request} context.request - The incoming HTTP request.
 * @returns {Promise<Response>} - Returns a JSON response containing the user's streak or an error message.
 */
export const GET: RequestHandler = async ({ request }) => {

  // Load the authToken from cookies
  const cookieHeader = request.headers.get('cookie');
  const cookies = parse(cookieHeader || '');
  const token = cookies.authToken;

  let payload;

  // Verify the JWT token
  try {
    payload = verifyJWT(token);
  } catch (err) {
    // Return error if token is invalid
    return new Response(JSON.stringify({ error: 'Ungültiger Cookie!' }), { status: 401 });
  }

  // Load the user ID from the token payload
  const userId = payload.id;

  // Query the database for the user's streak by user ID
  const [user] = await db.query(
    `SELECT streak FROM user WHERE id = ?`,
    [userId]
  );
  
  // Return error if user is not found
  if (!user.length) return json({ error: 'Benutzer wurde nicht gefunden!' }, { status: 404 });

  // Return the user's streak as JSON
  return json(user[0]);
};
