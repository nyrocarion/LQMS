import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';

/**
 * Handle hook for authentication and route protection.
 * - Checks for authToken (JWT) in cookies.
 * - Protects all routes except "/" and "/verify-email" (and API routes).
 * - Redirects unauthenticated or unverified users to the start page.
 */
export const handle: Handle = async ({ event, resolve }) => {
  
  // Get JWT token from cookies
  const token = event.cookies.get('authToken');
  const currentPath = event.url.pathname;

  // Check if the current route is an API route
  const isApiRoute = currentPath.startsWith('/api');
  // Protected routes: everything except "/" and "/verify-email"
  const isProtectedRoute = !isApiRoute && currentPath !== '/' && !currentPath.startsWith('/verify-email');

  if (token) {
    try {
      // Verify JWT token and attach user to event.locals
      const user = verifyJWT(token);
      event.locals.user = user;

      // Retrieve email verification status from database
      const [rows] = await db.query('SELECT emailv FROM user WHERE id = ?', [user.id]);
      const userInfo = rows[0];

      // If user not found or email not verified, redirect to start page if protected route
      if (!userInfo || userInfo.emailv === 0) {
        if (isProtectedRoute) {
          throw redirect(303, '/');
        }
      }

    } catch (err) {
      // Invalid token: delete cookie and redirect to start page if protected route
      event.cookies.delete('authToken', { path: '/' });
      if (isProtectedRoute) {
        throw redirect(303, '/');
      }
    }
  } else {
    // No token: redirect to start page if protected route
    if (isProtectedRoute) {
      throw redirect(303, '/');
    }
  }

  // Proceed with request
  return resolve(event);
};