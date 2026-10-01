// CLOTHERP - Centralized SaaS, Multi-Tenant, Subscription & Platform Control Service
import { saasStore, SAAS_STORAGE_KEYS } from './saasStore.js';

class SaasService {
    // ==================== TENANTS MANAGEMENT ====================
    async getTenants({ search = '', status = '', planId = '' } = {}) {
        await this._delay(50);
        let items = saasStore.get(SAAS_STORAGE_KEYS.TENANTS);

        if (status) items = items.filter(t => t.status === status);
        if (planId) items = items.filter(t => t.planId === planId);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(t => 
                (t.companyName && t.companyName.toLowerCase().includes(q)) ||
                (t.tenantCode && t.tenantCode.toLowerCase().includes(q)) ||
                (t.primaryContact && t.primaryContact.toLowerCase().includes(q)) ||
                (t.email && t.email.toLowerCase().includes(q))
            );
        }

        const all = saasStore.get(SAAS_STORAGE_KEYS.TENANTS);
        return {
            items,
            summary: {
                totalTenants: all.length,
                activeCount: all.filter(t => t.status === 'ACTIVE' && t.subscriptionStatus === 'ACTIVE').length,
                trialCount: all.filter(t => t.subscriptionStatus === 'TRIAL').length,
                suspendedCount: all.filter(t => t.status === 'SUSPENDED').length
            }
        };
    }

    async getTenantById(id) {
        const tenants = saasStore.get(SAAS_STORAGE_KEYS.TENANTS);
        return tenants.find(t => t.id === id || t.tenantCode === id) || null;
    }

    async createTenant(data, userName = 'Super Admin') {
        const items = saasStore.get(SAAS_STORAGE_KEYS.TENANTS);
        const plans = saasStore.get(SAAS_STORAGE_KEYS.PLANS);
        const plan = plans.find(p => p.id === data.planId) || plans[0];

        const id = `TEN-${String(items.length + 1).padStart(5, '0')}`;
        const tenantCode = `CLT-${String(items.length + 1).padStart(5, '0')}`;

        const renewalDate = new Date();
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);

        const newTenant = {
            id,
            tenantCode,
            companyName: data.companyName.trim(),
            primaryContact: data.primaryContact.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            city: data.city || 'Ahmedabad',
            state: data.state || 'Gujarat',
            country: 'India',
            planId: plan.id,
            planName: plan.name,
            status: 'ACTIVE',
            subscriptionStatus: data.isTrial ? 'TRIAL' : 'ACTIVE',
            renewalDate: renewalDate.toISOString().split('T')[0],
            activeUsersCount: 1,
            activeBranchesCount: 1,
            activeWarehousesCount: 1,
            createdAt: new Date().toISOString()
        };

        items.unshift(newTenant);
        saasStore.set(SAAS_STORAGE_KEYS.TENANTS, items);

        await this.logPlatformEvent({
            category: 'TENANT',
            severity: 'INFO',
            tenantId: newTenant.id,
            user: userName,
            message: `New tenant created: ${newTenant.companyName} (${newTenant.tenantCode}) under ${newTenant.planName}`
        });

        return { success: true, tenant: newTenant };
    }

    async toggleTenantStatus(id, newStatus, userName = 'Super Admin') {
        const tenants = saasStore.get(SAAS_STORAGE_KEYS.TENANTS);
        const tenant = tenants.find(t => t.id === id);
        if (!tenant) return { success: false, message: 'Tenant not found' };

        tenant.status = newStatus;
        saasStore.set(SAAS_STORAGE_KEYS.TENANTS, tenants);

        await this.logPlatformEvent({
            category: 'TENANT',
            severity: newStatus === 'SUSPENDED' ? 'WARN' : 'INFO',
            tenantId: tenant.id,
            user: userName,
            message: `Tenant ${tenant.tenantCode} status updated to ${newStatus}`
        });

        return { success: true, tenant };
    }

    // ==================== SUBSCRIPTION PLANS ====================
    async getPlans() {
        await this._delay(40);
        return saasStore.get(SAAS_STORAGE_KEYS.PLANS);
    }

    async createPlan(data, userName = 'Super Admin') {
        const plans = saasStore.get(SAAS_STORAGE_KEYS.PLANS);
        const id = `plan_${data.code.toLowerCase()}`;

        const newPlan = {
            id,
            name: data.name.trim(),
            code: data.code.trim().toUpperCase(),
            priceMonthly: parseFloat(data.priceMonthly) || 0,
            currency: 'INR',
            billingCycle: data.billingCycle || 'MONTHLY',
            trialDays: parseInt(data.trialDays) || 14,
            maxUsers: parseInt(data.maxUsers) || 10,
            maxBranches: parseInt(data.maxBranches) || 2,
            maxWarehouses: parseInt(data.maxWarehouses) || 2,
            enabledModules: data.enabledModules || ['DASHBOARD', 'PRODUCTS', 'INVENTORY'],
            status: 'ACTIVE',
            description: data.description || ''
        };

        plans.push(newPlan);
        saasStore.set(SAAS_STORAGE_KEYS.PLANS, plans);
        return { success: true, plan: newPlan };
    }

    // ==================== MODULES MASTER ====================
    async getModules() {
        await this._delay(40);
        return saasStore.get(SAAS_STORAGE_KEYS.MODULES);
    }

    // ==================== ANNOUNCEMENTS ====================
    async getAnnouncements() {
        return saasStore.get(SAAS_STORAGE_KEYS.ANNOUNCEMENTS);
    }

    async createAnnouncement(data, userName = 'Super Admin') {
        const items = saasStore.get(SAAS_STORAGE_KEYS.ANNOUNCEMENTS);
        const id = `ann_${items.length + 1}`;

        const newAnn = {
            id,
            title: data.title.trim(),
            message: data.message.trim(),
            priority: data.priority || 'INFO',
            targetAudience: data.targetAudience || 'ALL_TENANTS',
            status: 'ACTIVE',
            createdAt: new Date().toISOString().split('T')[0]
        };

        items.unshift(newAnn);
        saasStore.set(SAAS_STORAGE_KEYS.ANNOUNCEMENTS, items);
        return { success: true, announcement: newAnn };
    }

    // ==================== GLOBAL SETTINGS & LOGS ====================
    async getSettings() {
        return saasStore.get(SAAS_STORAGE_KEYS.SETTINGS);
    }

    async updateSettings(data) {
        saasStore.set(SAAS_STORAGE_KEYS.SETTINGS, data);
        return { success: true, settings: data };
    }

    async getLogs() {
        return saasStore.get(SAAS_STORAGE_KEYS.LOGS);
    }

    async logPlatformEvent({ category, severity, tenantId, user, message }) {
        const logs = saasStore.get(SAAS_STORAGE_KEYS.LOGS);
        const id = `LOG-${String(logs.length + 1).padStart(5, '0')}`;

        const newLog = {
            id,
            timestamp: new Date().toLocaleString(),
            category: category || 'APPLICATION',
            severity: severity || 'INFO',
            tenantId: tenantId || 'GLOBAL',
            user: user || 'System',
            message: message.trim()
        };

        logs.unshift(newLog);
        saasStore.set(SAAS_STORAGE_KEYS.LOGS, logs);
    }

    // ==================== TENANT-LEVEL CURRENT SUBSCRIPTION ====================
    async getCurrentTenantSubscription(tenantId = 'TEN-00001') {
        const tenant = await this.getTenantById(tenantId);
        const plans = await this.getPlans();
        const plan = plans.find(p => p.id === (tenant ? tenant.planId : 'plan_enterprise')) || plans[0];

        return {
            tenant,
            plan,
            usage: {
                users: { current: tenant ? tenant.activeUsersCount : 7, max: plan.maxUsers },
                branches: { current: tenant ? tenant.activeBranchesCount : 2, max: plan.maxBranches },
                warehouses: { current: tenant ? tenant.activeWarehousesCount : 2, max: plan.maxWarehouses }
            }
        };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const saasService = new SaasService();
