import { json } from '@sveltejs/kit';

/**
 * Handles POST requests to log out the user.
 * Deletes the authToken cookie to invalidate the user's session.
 *
 * @param {Object} context - The request context containing cookies.
 * @returns {Response} JSON response indicating success.
 */
export function POST({ cookies }) {
  // Delete the authentication token cookie to log out the user
  cookies.delete('authToken', { path: '/' });
  console.log("Sollte Funktioniert haben")
  return json({ success: true });
}