// CLOTHERP - Centralized Authentication Service
import { ROLES, hasPermission as checkPermission } from '../config/permissions.js';

const SESSION_KEY = 'clotherp_auth_session';
const REMEMBER_KEY = 'clotherp_remembered_email';

/**
 * =========================================================================
 * DEVELOPMENT / DEMO CREDENTIALS REGISTRY
 * (In production, this is handled by ASP.NET Core Identity & EF Core)
 * =========================================================================
 */
const DEMO_USERS = [
    {
        id: 'usr_admin_001',
        name: 'Suresh Singhania',
        username: 'admin',
        email: 'admin@clotherp.local',
        password: 'Admin@123',
        role: ROLES.ADMIN,
        avatar: 'SS',
        branch: 'Central Headquarters'
    },
    {
        id: 'usr_mgr_002',
        name: 'Rajesh Mehta',
        username: 'manager',
        email: 'manager@clotherp.local',
        password: 'Manager@123',
        role: ROLES.MANAGER,
        avatar: 'RM',
        branch: 'Surat Flagship Hub'
    },
    {
        id: 'usr_sales_003',
        name: 'Priya Sharma',
        username: 'sales',
        email: 'sales@clotherp.local',
        password: 'Sales@123',
        role: ROLES.SALES_STAFF,
        avatar: 'PS',
        branch: 'Retail Counter #01'
    },
    {
        id: 'usr_purch_004',
        name: 'Amit Patel',
        username: 'purchase',
        email: 'purchase@clotherp.local',
        password: 'Purchase@123',
        role: ROLES.PURCHASE_STAFF,
        avatar: 'AP',
        branch: 'Warehouse Logistics Hub'
    }
];

class AuthService {
    constructor() {
        this.currentUser = this._loadSession();
    }

    /**
     * Load existing session from storage
     * @private
     */
    _loadSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Failed to load session:', e);
            return null;
        }
    }

    /**
     * Authenticate user with credentials
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch('/api/auth/login', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ identifier, password, rememberMe })
     * });
     * const data = await response.json();
     * 
     * @param {string} identifier (email or username)
     * @param {string} password 
     * @param {boolean} rememberMe 
     * @returns {Promise<{ success: boolean, user?: object, message?: string }>}
     */
    async login(identifier, password, rememberMe = false) {
        // Artificial network delay to simulate realistic ERP server authentication (400ms)
        await new Promise(resolve => setTimeout(resolve, 400));

        if (!identifier || !password) {
            return { success: false, message: 'Please enter both identifier and password.' };
        }

        const trimmedId = identifier.trim().toLowerCase();

        const match = DEMO_USERS.find(u => 
            (u.email.toLowerCase() === trimmedId || u.username.toLowerCase() === trimmedId) &&
            u.password === password
        );

        if (!match) {
            return { success: false, message: 'Invalid username/email or password.' };
        }

        // Minimal safe session object (excluding password)
        const sessionUser = {
            id: match.id,
            name: match.name,
            username: match.username,
            email: match.email,
            role: match.role,
            avatar: match.avatar,
            branch: match.branch,
            loginTime: new Date().toISOString()
        };

        this.currentUser = sessionUser;

        // Persist session
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

        if (rememberMe) {
            localStorage.setItem(REMEMBER_KEY, match.email);
        } else {
            localStorage.removeItem(REMEMBER_KEY);
        }

        return { success: true, user: sessionUser };
    }

    /**
     * Terminate user session
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * await fetch('/api/auth/logout', { method: 'POST' });
     */
    async logout() {
        this.currentUser = null;
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
    }

    /**
     * Check if current visitor has an active authenticated session
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Get the active session user
     * @returns {object|null}
     */
    getCurrentUser() {
        if (!this.currentUser) {
            this.currentUser = this._loadSession();
        }
        return this.currentUser;
    }

    /**
     * Check if user possesses a specific permission
     * @param {string} permission 
     * @returns {boolean}
     */
    hasPermission(permission) {
        if (!this.currentUser) return false;
        return checkPermission(this.currentUser.role, permission);
    }

    /**
     * Check if user has a specific role
     * @param {string} role 
     * @returns {boolean}
     */
    hasRole(role) {
        if (!this.currentUser) return false;
        return this.currentUser.role === role;
    }

    /**
     * Retrieve remembered email if available
     * @returns {string|null}
     */
    getRememberedEmail() {
        return localStorage.getItem(REMEMBER_KEY);
    }

    /**
     * Request Password Reset Link (Simulation)
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * await fetch('/api/auth/forgot-password', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ email })
     * });
     * 
     * @param {string} email 
     * @returns {Promise<{ success: boolean, message: string }>}
     */
    async requestPasswordReset(email) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            message: 'If an account exists for this email address, password reset instructions have been generated.'
        };
    }

    /**
     * Reset Password with Token (Simulation)
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * await fetch('/api/auth/reset-password', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ token, newPassword })
     * });
     * 
     * @param {string} newPassword 
     * @returns {Promise<{ success: boolean, message: string }>}
     */
    async resetPassword(newPassword) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            message: 'Password reset simulation completed successfully. You may now sign in with your new credentials.'
        };
    }

    /**
     * Get list of demo users for developer ease
     * @returns {Array}
     */
    getDemoUsers() {
        return DEMO_USERS.map(u => ({
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role
        }));
    }
}

export const authService = new AuthService();
