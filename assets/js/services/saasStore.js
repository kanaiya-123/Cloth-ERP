// CLOTHERP - Centralized Persistent SaaS, Multi-Tenant & Platform Data Store
export const SAAS_STORAGE_KEYS = {
    TENANTS: 'clotherp_platform_tenants',
    PLANS: 'clotherp_platform_plans',
    MODULES: 'clotherp_platform_modules',
    ANNOUNCEMENTS: 'clotherp_platform_announcements',
    SETTINGS: 'clotherp_platform_settings',
    LOGS: 'clotherp_platform_logs'
};

const SEED_PLANS = [
    {
        id: 'plan_starter',
        name: 'Starter Plan',
        code: 'STARTER',
        priceMonthly: 4999,
        currency: 'INR',
        billingCycle: 'MONTHLY',
        trialDays: 14,
        maxUsers: 5,
        maxBranches: 2,
        maxWarehouses: 2,
        enabledModules: ['DASHBOARD', 'PRODUCTS', 'INVENTORY', 'PURCHASE', 'SALES', 'GST', 'SHIPMENTS'],
        status: 'ACTIVE',
        description: 'Ideal for single-depot garment wholesalers and emerging retail boutiques.'
    },
    {
        id: 'plan_pro',
        name: 'Professional Plan',
        code: 'PROFESSIONAL',
        priceMonthly: 12999,
        currency: 'INR',
        billingCycle: 'MONTHLY',
        trialDays: 14,
        maxUsers: 15,
        maxBranches: 5,
        maxWarehouses: 5,
        enabledModules: ['DASHBOARD', 'PRODUCTS', 'INVENTORY', 'PURCHASE', 'SALES', 'GST', 'SHIPMENTS', 'MANUFACTURING', 'JOB_WORK', 'CRM', 'REPORTS'],
        status: 'ACTIVE',
        description: 'Comprehensive garment manufacturing, cut-to-pack batches, and CRM sales automation.'
    },
    {
        id: 'plan_enterprise',
        name: 'Enterprise Plan',
        code: 'ENTERPRISE',
        priceMonthly: 29999,
        currency: 'INR',
        billingCycle: 'YEARLY',
        trialDays: 30,
        maxUsers: 100,
        maxBranches: 25,
        maxWarehouses: 25,
        enabledModules: ['DASHBOARD', 'PRODUCTS', 'INVENTORY', 'PURCHASE', 'SALES', 'GST', 'SHIPMENTS', 'MANUFACTURING', 'JOB_WORK', 'ACCOUNTING', 'CRM', 'REPORTS'],
        status: 'ACTIVE',
        description: 'Unlimited multi-branch hubs, full general ledger accounting, and priority multi-tenant API.'
    }
];

const SEED_TENANTS = [
    {
        id: 'TEN-00001',
        tenantCode: 'CLT-00001',
        companyName: 'CLOTHERP Garments Ltd',
        primaryContact: 'Sumit Sharma',
        email: 'admin@clotherp.local',
        phone: '+91 98765 43210',
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        planId: 'plan_enterprise',
        planName: 'Enterprise Plan',
        status: 'ACTIVE',
        subscriptionStatus: 'ACTIVE',
        renewalDate: '2027-08-01',
        activeUsersCount: 7,
        activeBranchesCount: 2,
        activeWarehousesCount: 2,
        createdAt: '2026-08-01T00:00:00Z'
    },
    {
        id: 'TEN-00002',
        tenantCode: 'CLT-00002',
        companyName: 'Surat Silk & Ethnic Mills',
        primaryContact: 'Rajesh Vora',
        email: 'rajesh@suratsilk.example.com',
        phone: '+91 98250 11990',
        city: 'Surat',
        state: 'Gujarat',
        country: 'India',
        planId: 'plan_pro',
        planName: 'Professional Plan',
        status: 'ACTIVE',
        subscriptionStatus: 'ACTIVE',
        renewalDate: '2026-12-31',
        activeUsersCount: 11,
        activeBranchesCount: 3,
        activeWarehousesCount: 3,
        createdAt: '2026-08-10T00:00:00Z'
    },
    {
        id: 'TEN-00003',
        tenantCode: 'CLT-00003',
        companyName: 'Mumbai Metro Apparel',
        primaryContact: 'Kavita Deshmukh',
        email: 'kavita@metroapparel.example.com',
        phone: '+91 98200 44321',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        planId: 'plan_starter',
        planName: 'Starter Plan',
        status: 'ACTIVE',
        subscriptionStatus: 'TRIAL',
        renewalDate: '2026-09-10',
        activeUsersCount: 3,
        activeBranchesCount: 1,
        activeWarehousesCount: 1,
        createdAt: '2026-08-27T00:00:00Z'
    },
    {
        id: 'TEN-00004',
        tenantCode: 'CLT-00004',
        companyName: 'Jaipur Block Prints Co',
        primaryContact: 'Vikram Shekhawat',
        email: 'vikram@jaipurprints.example.com',
        phone: '+91 94140 77654',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        planId: 'plan_starter',
        planName: 'Starter Plan',
        status: 'SUSPENDED',
        subscriptionStatus: 'PAST_DUE',
        renewalDate: '2026-08-15',
        activeUsersCount: 4,
        activeBranchesCount: 1,
        activeWarehousesCount: 1,
        createdAt: '2026-07-15T00:00:00Z'
    }
];

const SEED_MODULES = [
    { code: 'DASHBOARD', name: 'Executive Dashboard & Analytics', category: 'Core', dependencies: [], defaultEnabled: true },
    { code: 'PRODUCTS', name: 'Product Catalog & Variant Matrix', category: 'Catalog', dependencies: [], defaultEnabled: true },
    { code: 'INVENTORY', name: 'Warehouse Stock & Central Movements', category: 'Logistics', dependencies: ['PRODUCTS'], defaultEnabled: true },
    { code: 'PURCHASE', name: 'Purchase Orders & Supplier Receipts', category: 'Procurement', dependencies: ['INVENTORY'], defaultEnabled: true },
    { code: 'SALES', name: 'Sales Orders, Invoicing & Shipments', category: 'Commercial', dependencies: ['INVENTORY'], defaultEnabled: true },
    { code: 'GST', name: 'Centralized GST Engine & Tax Registers', category: 'Taxation', dependencies: ['SALES', 'PURCHASE'], defaultEnabled: true },
    { code: 'MANUFACTURING', name: 'Production Orders & Cut-to-Pack MRP', category: 'Production', dependencies: ['INVENTORY'], defaultEnabled: false },
    { code: 'JOB_WORK', name: 'Outsource Job Work & Worker Registry', category: 'Production', dependencies: ['MANUFACTURING'], defaultEnabled: false },
    { code: 'ACCOUNTING', name: 'General Ledger, COA & Financial Statements', category: 'Finance', dependencies: ['SALES', 'PURCHASE'], defaultEnabled: false },
    { code: 'CRM', name: 'Leads, Sales Pipeline & Communications', category: 'Sales Automation', dependencies: ['SALES'], defaultEnabled: false },
    { code: 'REPORTS', name: 'Comprehensive Business Intelligence Reports', category: 'Analytics', dependencies: ['SALES', 'PURCHASE'], defaultEnabled: true }
];

const SEED_ANNOUNCEMENTS = [
    {
        id: 'ann_01',
        title: 'Scheduled Cloud Maintenance Notice',
        message: 'CLOTHERP will undergo scheduled infrastructure upgrades on Sunday, 02:00 AM – 04:00 AM IST. All tenant operations will resume immediately after.',
        priority: 'IMPORTANT',
        targetAudience: 'ALL_TENANTS',
        status: 'ACTIVE',
        createdAt: '2026-08-28'
    },
    {
        id: 'ann_02',
        title: 'GST E-Way Bill API V2.4 Release',
        message: 'Updated E-Way Bill schema compliant with latest CBIC guidelines is now enabled for all Enterprise tenants.',
        priority: 'INFO',
        targetAudience: 'ENTERPRISE_ONLY',
        status: 'ACTIVE',
        createdAt: '2026-08-25'
    }
];

const SEED_SETTINGS = {
    platformName: 'CLOTHERP SaaS Enterprise',
    maintenanceMode: false,
    maintenanceMessage: 'System is currently undergoing routine maintenance. Please try again shortly.',
    defaultTimezone: 'Asia/Kolkata (IST)',
    defaultCurrency: 'INR (₹)',
    maxFailedLoginAttempts: 5,
    sessionTimeoutMinutes: 60,
    enforceStrongPasswords: true,
    supportEmail: 'support@clotherp.com'
};

const SEED_LOGS = [
    {
        id: 'LOG-00001',
        timestamp: '2026-08-29 12:15:00',
        category: 'SECURITY',
        severity: 'INFO',
        tenantId: 'TEN-00001',
        user: 'admin@clotherp.local',
        message: 'Super Admin login authenticated successfully from 192.168.1.100'
    },
    {
        id: 'LOG-00002',
        timestamp: '2026-08-29 11:30:22',
        category: 'TENANT',
        severity: 'WARN',
        tenantId: 'TEN-00004',
        user: 'System Cron',
        message: 'Tenant TEN-00004 past due threshold exceeded; tenant status set to SUSPENDED'
    },
    {
        id: 'LOG-00003',
        timestamp: '2026-08-29 10:00:15',
        category: 'SUBSCRIPTION',
        severity: 'INFO',
        tenantId: 'TEN-00003',
        user: 'kavita@metroapparel.example.com',
        message: '14-Day Free Starter Trial initialized for Mumbai Metro Apparel'
    }
];

class SaasStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(SAAS_STORAGE_KEYS.PLANS)) {
            localStorage.setItem(SAAS_STORAGE_KEYS.PLANS, JSON.stringify(SEED_PLANS));
        }
        if (!localStorage.getItem(SAAS_STORAGE_KEYS.TENANTS)) {
            localStorage.setItem(SAAS_STORAGE_KEYS.TENANTS, JSON.stringify(SEED_TENANTS));
        }
        if (!localStorage.getItem(SAAS_STORAGE_KEYS.MODULES)) {
            localStorage.setItem(SAAS_STORAGE_KEYS.MODULES, JSON.stringify(SEED_MODULES));
        }
        if (!localStorage.getItem(SAAS_STORAGE_KEYS.ANNOUNCEMENTS)) {
            localStorage.setItem(SAAS_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
        }
        if (!localStorage.getItem(SAAS_STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(SAAS_STORAGE_KEYS.SETTINGS, JSON.stringify(SEED_SETTINGS));
        }
        if (!localStorage.getItem(SAAS_STORAGE_KEYS.LOGS)) {
            localStorage.setItem(SAAS_STORAGE_KEYS.LOGS, JSON.stringify(SEED_LOGS));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[SaasStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[SaasStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const saasStore = new SaasStore();
