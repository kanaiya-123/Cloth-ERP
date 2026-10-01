// CLOTHERP - Route & Page Protection Utility
import { authService } from '../services/authService.js';
import { hasAnyRole } from '../config/permissions.js';

/**
 * Enforce that the visitor must be authenticated to view the current page.
 * If not authenticated, redirects to login.html with the original return url.
 * 
 * @param {object} options
 * @param {string[]} [options.allowedRoles] - Optional list of required roles
 * @param {string} [options.requiredPermission] - Optional specific permission
 * @returns {object|null} The authenticated user object if access granted
 */
export function requireAuth(options = {}) {
    const user = authService.getCurrentUser();

    if (!user) {
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = `./login.html?redirect=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
        return null;
    }

    // Role check if specified
    if (options.allowedRoles && options.allowedRoles.length > 0) {
        const hasRole = hasAnyRole(user.role, options.allowedRoles);
        if (!hasRole) {
            window.location.href = `./access-denied.html?requiredRole=${encodeURIComponent(options.allowedRoles.join(','))}`;
            return null;
        }
    }

    // Permission check if specified
    if (options.requiredPermission) {
        const hasPerm = authService.hasPermission(options.requiredPermission);
        if (!hasPerm) {
            window.location.href = `./access-denied.html?requiredPerm=${encodeURIComponent(options.requiredPermission)}`;
            return null;
        }
    }

    return user;
}

/**
 * Redirect already authenticated users away from guest pages (e.g. login.html)
 * 
 * @param {string} destination - Page to redirect to (default: ./dashboard.html)
 */
export function redirectIfAuthenticated(destination = './dashboard.html') {
    if (authService.isAuthenticated()) {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('redirect') || destination;
        window.location.href = returnUrl;
    }
}
