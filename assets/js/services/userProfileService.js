// CLOTHERP - User Profile, Account Settings & Session Log Service
import { authService } from './authService.js';

const PROFILE_KEY = 'clotherp_user_profiles_db';
const SETTINGS_KEY = 'clotherp_account_settings_db';
const SESSIONS_KEY = 'clotherp_session_logs_db';

class UserProfileService {
    constructor() {
        this._initDemoData();
    }

    _initDemoData() {
        // Initialize default user profiles if not present
        if (!localStorage.getItem(PROFILE_KEY)) {
            const defaultProfiles = {
                'usr_sales_003': {
                    id: 'usr_sales_003',
                    name: 'Priya Sharma',
                    username: 'sales',
                    email: 'sales@clotherp.local',
                    phone: '+91 98765 43210',
                    role: 'SalesStaff',
                    department: 'Retail Counter Sales & Billing',
                    branch: 'Retail Counter #01',
                    employeeId: 'EMP-2024-089',
                    joinedDate: '2024-03-15',
                    address: 'Shop 14, Textile Market, Ring Road, Surat, Gujarat - 395002',
                    emergencyContact: 'Ramesh Sharma (+91 98220 11223)',
                    bio: 'Senior retail sales executive specializing in ethnic sarees, designer lehengas, and fabric billing operations.',
                    avatar: 'PS'
                },
                'usr_admin_001': {
                    id: 'usr_admin_001',
                    name: 'Suresh Singhania',
                    username: 'admin',
                    email: 'admin@clotherp.local',
                    phone: '+91 98110 99887',
                    role: 'Admin',
                    department: 'Executive Administration',
                    branch: 'Central Headquarters',
                    employeeId: 'EMP-2021-001',
                    joinedDate: '2021-01-10',
                    address: 'ClothERP Towers, S.G. Highway, Ahmedabad, Gujarat - 380054',
                    emergencyContact: 'Vinod Singhania (+91 98990 00112)',
                    bio: 'Principal ERP Administrator and Founder of ClothERP Apparel Operations.',
                    avatar: 'SS'
                },
                'usr_mgr_002': {
                    id: 'usr_mgr_002',
                    name: 'Rajesh Mehta',
                    username: 'manager',
                    email: 'manager@clotherp.local',
                    phone: '+91 97230 45678',
                    role: 'Manager',
                    department: 'Store & Inventory Management',
                    branch: 'Surat Flagship Hub',
                    employeeId: 'EMP-2022-014',
                    joinedDate: '2022-06-01',
                    address: '42, Adajan Gam, Surat, Gujarat - 395009',
                    emergencyContact: 'Geeta Mehta (+91 97230 45679)',
                    bio: 'Operations manager overseeing multi-counter billing, warehouse replenishment, and supplier logistics.',
                    avatar: 'RM'
                },
                'usr_purch_004': {
                    id: 'usr_purch_004',
                    name: 'Amit Patel',
                    username: 'purchase',
                    email: 'purchase@clotherp.local',
                    phone: '+91 99040 12345',
                    role: 'PurchaseStaff',
                    department: 'Procurement & Warehouse Logistics',
                    branch: 'Warehouse Logistics Hub',
                    employeeId: 'EMP-2023-042',
                    joinedDate: '2023-08-20',
                    address: 'Plot 78, GIDC Industrial Estate, Sachin, Surat - 394230',
                    emergencyContact: 'Dinesh Patel (+91 99040 12346)',
                    bio: 'Procurement specialist handling purchase orders, mills vendor negotiations, and fabric lot GRN inspections.',
                    avatar: 'AP'
                }
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfiles));
        }

        // Initialize default account settings
        if (!localStorage.getItem(SETTINGS_KEY)) {
            const defaultSettings = {
                twoFactorAuth: false,
                emailNotifications: true,
                smsAlerts: false,
                autoLockMinutes: 15,
                currencyFormat: 'INR (₹)',
                dateFormat: 'DD/MM/YYYY',
                theme: 'dark',
                compactTable: false,
                soundAlerts: true
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
        }

        // Initialize default session logs
        if (!localStorage.getItem(SESSIONS_KEY)) {
            const now = new Date();
            const defaultLogs = [
                {
                    id: 'sess_' + Date.now() + '_1',
                    userId: 'usr_sales_003',
                    userName: 'Priya Sharma',
                    ipAddress: '192.168.1.104 (Local POS)',
                    device: 'Desktop Chrome 124 (Windows 11)',
                    location: 'Surat, Gujarat, India',
                    loginTime: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
                    lastActive: new Date().toISOString(),
                    status: 'Active',
                    isCurrent: true
                },
                {
                    id: 'sess_' + Date.now() + '_2',
                    userId: 'usr_sales_003',
                    userName: 'Priya Sharma',
                    ipAddress: '192.168.1.104',
                    device: 'Tablet Chrome (Android 14)',
                    location: 'Surat Retail Counter #01',
                    loginTime: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
                    lastActive: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
                    status: 'Logged Out',
                    isCurrent: false
                },
                {
                    id: 'sess_' + Date.now() + '_3',
                    userId: 'usr_sales_003',
                    userName: 'Priya Sharma',
                    ipAddress: '49.36.120.45 (Broadband)',
                    device: 'Desktop Edge 123 (Windows 11)',
                    location: 'Surat, Gujarat, India',
                    loginTime: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
                    lastActive: new Date(now.getTime() - 1000 * 60 * 60 * 42).toISOString(),
                    status: 'Session Expired',
                    isCurrent: false
                },
                {
                    id: 'sess_' + Date.now() + '_4',
                    userId: 'usr_admin_001',
                    userName: 'Suresh Singhania',
                    ipAddress: '192.168.1.1',
                    device: 'MacBook Safari 17 (macOS Sonoma)',
                    location: 'Ahmedabad HQ',
                    loginTime: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
                    lastActive: new Date().toISOString(),
                    status: 'Active',
                    isCurrent: false
                }
            ];
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(defaultLogs));
        }
    }

    /**
     * Get profile for active user
     */
    getProfile(userId = null) {
        const currentUser = authService.getCurrentUser();
        const targetId = userId || (currentUser ? currentUser.id : 'usr_sales_003');
        const profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        
        if (profiles[targetId]) {
            return profiles[targetId];
        }

        // Fallback profile if user was created dynamically
        return {
            id: targetId,
            name: currentUser ? currentUser.name : 'ERP Operator',
            username: currentUser ? currentUser.username : 'user',
            email: currentUser ? currentUser.email : 'staff@clotherp.local',
            phone: '+91 98000 00000',
            role: currentUser ? currentUser.role : 'SalesStaff',
            department: 'Store Counter Operations',
            branch: currentUser ? currentUser.branch : 'Central Counter',
            employeeId: 'EMP-2024-001',
            joinedDate: '2024-01-01',
            address: 'ClothERP Retail Facility',
            emergencyContact: '—',
            bio: 'Active ClothERP operator.',
            avatar: currentUser ? (currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()) : 'OP'
        };
    }

    /**
     * Update user profile
     */
    updateProfile(updatedData) {
        const currentUser = authService.getCurrentUser();
        const targetId = updatedData.id || (currentUser ? currentUser.id : 'usr_sales_003');
        const profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');

        const existing = profiles[targetId] || this.getProfile(targetId);
        const merged = {
            ...existing,
            ...updatedData,
            updatedAt: new Date().toISOString()
        };

        // Recalculate avatar initials if name changed
        if (merged.name) {
            const parts = merged.name.trim().split(/\s+/);
            merged.avatar = parts.length > 1 
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : merged.name.slice(0, 2).toUpperCase();
        }

        profiles[targetId] = merged;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));

        // Also update session in authService if updating current user
        if (currentUser && currentUser.id === targetId) {
            currentUser.name = merged.name;
            currentUser.email = merged.email;
            currentUser.avatar = merged.avatar;
            currentUser.branch = merged.branch;
            
            // Persist session back
            const sessionRaw = JSON.stringify(currentUser);
            localStorage.setItem('clotherp_auth_session', sessionRaw);
            sessionStorage.setItem('clotherp_auth_session', sessionRaw);
        }

        // Record audit activity
        this.addSessionLogActivity('Profile Information Updated');

        return { success: true, profile: merged };
    }

    /**
     * Get account settings
     */
    getSettings() {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }

    /**
     * Update account settings
     */
    updateSettings(newSettings) {
        const current = this.getSettings();
        const merged = { ...current, ...newSettings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        this.addSessionLogActivity('Security / Account Settings Modified');
        return { success: true, settings: merged };
    }

    /**
     * Change Password
     */
    changePassword(currentPass, newPass, confirmPass) {
        if (!currentPass || !newPass || !confirmPass) {
            return { success: false, message: 'All password fields are required.' };
        }
        if (newPass !== confirmPass) {
            return { success: false, message: 'New password and confirmation do not match.' };
        }
        if (newPass.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters long.' };
        }

        // Verify current password against demo accounts or custom
        const user = authService.getCurrentUser();
        const validPasswords = ['Admin@123', 'Manager@123', 'Sales@123', 'Purchase@123', '123456'];
        
        // Also check if custom password was saved
        const customPass = localStorage.getItem(`clotherp_pass_${user ? user.id : 'default'}`);
        if (customPass) {
            if (customPass !== currentPass) {
                return { success: false, message: 'Current password is incorrect.' };
            }
        } else if (!validPasswords.includes(currentPass)) {
            return { success: false, message: 'Current password is incorrect.' };
        }

        // Save new password
        localStorage.setItem(`clotherp_pass_${user ? user.id : 'default'}`, newPass);
        this.addSessionLogActivity('Password Changed Successfully');

        return { success: true, message: 'Password has been updated successfully.' };
    }

    /**
     * Get Session Logs for current user
     */
    getSessionLogs() {
        const currentUser = authService.getCurrentUser();
        const userId = currentUser ? currentUser.id : null;
        const allLogs = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
        
        if (userId) {
            return allLogs.filter(l => l.userId === userId || l.userId === 'usr_sales_003');
        }
        return allLogs;
    }

    /**
     * Record a new session activity entry
     */
    addSessionLogActivity(action) {
        const user = authService.getCurrentUser();
        const logs = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
        
        const newEntry = {
            id: 'sess_' + Date.now(),
            userId: user ? user.id : 'usr_sales_003',
            userName: user ? user.name : 'Priya Sharma',
            ipAddress: '127.0.0.1 (Local Host)',
            device: navigator.userAgent.includes('Windows') ? 'Desktop Chrome (Windows 11)' : 'Desktop Browser',
            location: 'Surat, Gujarat, India',
            loginTime: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            status: action || 'Active Session',
            isCurrent: false
        };

        logs.unshift(newEntry);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(logs.slice(0, 30)));
    }

    /**
     * Terminate all other sessions
     */
    terminateOtherSessions() {
        const logs = this.getSessionLogs();
        const updated = logs.map(l => {
            if (!l.isCurrent) {
                return { ...l, status: 'Terminated Remotely', isCurrent: false };
            }
            return l;
        });
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
        return { success: true, message: 'All other active sessions have been terminated.' };
    }
}

export const userProfileService = new UserProfileService();
