// CLOTHERP - Centralized Role & Permission Configuration

/**
 * System Roles
 */
export const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    SALES_STAFF: 'SalesStaff',
    PURCHASE_STAFF: 'PurchaseStaff'
};

/**
 * System Permissions
 */
export const PERMISSIONS = {
    // Dashboard
    DASHBOARD_VIEW: 'dashboard.view',
    
    // Products & Variants (Phase 4)
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_EDIT: 'products.edit',
    PRODUCTS_DELETE: 'products.delete',
    
    // Masters (Categories, Brands, Colors, Sizes)
    MASTERS_VIEW: 'masters.view',
    MASTERS_MANAGE: 'masters.manage',
    
    // Inventory & Stock Control (Phase 5)
    INVENTORY_VIEW: 'inventory.view',
    INVENTORY_MANAGE: 'inventory.manage',
    INVENTORY_ADJUST: 'inventory.adjust',
    INVENTORY_MOVEMENTS_VIEW: 'inventory.movements.view',
    INVENTORY_LOWSTOCK_VIEW: 'inventory.lowstock.view',
    
    // Suppliers & CRM (Phase 6)
    SUPPLIERS_VIEW: 'suppliers.view',
    SUPPLIERS_MANAGE: 'suppliers.manage',
    
    // Purchases & Inbound Orders (Phase 6)
    PURCHASES_VIEW: 'purchases.view',
    PURCHASES_CREATE: 'purchases.create',
    PURCHASES_EDIT: 'purchases.edit',
    PURCHASES_CONFIRM: 'purchases.confirm',
    PURCHASES_RECEIVE: 'purchases.receive',
    PURCHASES_CANCEL: 'purchases.cancel',
    
    // Purchase Shipments & LR Tracking (Phase 6)
    PURCHASE_SHIPMENTS_VIEW: 'purchase_shipments.view',
    PURCHASE_SHIPMENTS_MANAGE: 'purchase_shipments.manage',
    
    // Sales & POS Invoicing (Future)
    SALES_VIEW: 'sales.view',
    SALES_MANAGE: 'sales.manage',
    INVOICES_CREATE: 'invoices.create',
    INVOICES_VIEW: 'invoices.view',
    
    // Customers & Wholesale Partners (Phase 7)
    CUSTOMERS_VIEW: 'customers.view',
    CUSTOMERS_MANAGE: 'customers.manage',
    
    // Sales & Order Management (Phase 7)
    SALES_VIEW: 'sales.view',
    SALES_CREATE: 'sales.create',
    SALES_EDIT: 'sales.edit',
    SALES_CONFIRM: 'sales.confirm',
    SALES_CANCEL: 'sales.cancel',
    SALES_INVOICE_VIEW: 'sales.invoice.view',
    SALES_PAYMENT_MANAGE: 'sales.payment.manage',
    SALES_TRACKING_VIEW: 'sales.tracking.view',
    SALES_TRACKING_MANAGE: 'sales.tracking.manage',
    
    // Sales Returns & Refunds (Phase 8)
    RETURNS_VIEW: 'returns.view',
    RETURNS_CREATE: 'returns.create',
    RETURNS_EDIT: 'returns.edit',
    RETURNS_APPROVE: 'returns.approve',
    RETURNS_RECEIVE: 'returns.receive',
    RETURNS_REFUND: 'returns.refund',
    RETURNS_CANCEL: 'returns.cancel',
    
    // Product Exchanges (Phase 8)
    EXCHANGES_VIEW: 'exchanges.view',
    EXCHANGES_CREATE: 'exchanges.create',
    EXCHANGES_COMPLETE: 'exchanges.complete',
    
    // Purchase Returns (Phase 8)
    PURCHASE_RETURNS_VIEW: 'purchase_returns.view',
    PURCHASE_RETURNS_CREATE: 'purchase_returns.create',
    PURCHASE_RETURNS_APPROVE: 'purchase_returns.approve',
    PURCHASE_RETURNS_DISPATCH: 'purchase_returns.dispatch',
    
    // Credit & Debit Notes (Phase 8)
    CREDIT_NOTES_VIEW: 'credit_notes.view',
    CREDIT_NOTES_CREATE: 'credit_notes.create',
    DEBIT_NOTES_VIEW: 'debit_notes.view',
    DEBIT_NOTES_CREATE: 'debit_notes.create',
    
    // Financials & Reporting (Phase 9)
    REPORTS_VIEW: 'reports.view',
    REPORTS_SALES_VIEW: 'reports.sales.view',
    REPORTS_PURCHASE_VIEW: 'reports.purchase.view',
    REPORTS_INVENTORY_VIEW: 'reports.inventory.view',
    REPORTS_FINANCIAL_VIEW: 'reports.financial.view',
    REPORTS_GST_VIEW: 'reports.gst.view',
    REPORTS_CUSTOMER_VIEW: 'reports.customer.view',
    REPORTS_SUPPLIER_VIEW: 'reports.supplier.view',
    REPORTS_RETURNS_VIEW: 'reports.returns.view',
    REPORTS_EXPORT: 'reports.export',
    DASHBOARD_ANALYTICS_VIEW: 'dashboard.analytics.view',
    FINANCIALS_VIEW: 'financials.view',
    
    // Notifications & Smart Alerts (Phase 10)
    NOTIFICATIONS_VIEW: 'notifications.view',
    NOTIFICATIONS_MANAGE: 'notifications.manage',
    NOTIFICATIONS_SETTINGS: 'notifications.settings',
    
    // Multi-Branch, Warehouse & Stock Transfers (Phase 12)
    BRANCHES_VIEW: 'branches.view',
    BRANCHES_MANAGE: 'branches.manage',
    WAREHOUSES_VIEW: 'warehouses.view',
    WAREHOUSES_MANAGE: 'warehouses.manage',
    STOCK_TRANSFERS_VIEW: 'stock_transfer.view',
    STOCK_TRANSFERS_CREATE: 'stock_transfer.create',
    STOCK_TRANSFERS_APPROVE: 'stock_transfer.approve',
    STOCK_TRANSFERS_DISPATCH: 'stock_transfer.dispatch',
    STOCK_TRANSFERS_RECEIVE: 'stock_transfer.receive',
    STOCK_TRANSFERS_CANCEL: 'stock_transfer.cancel',
    
    // Manufacturing & Job Work (Phase 13)
    MANUFACTURING_VIEW: 'manufacturing.view',
    BOM_VIEW: 'manufacturing.bom.view',
    BOM_MANAGE: 'manufacturing.bom.manage',
    PRODUCTION_VIEW: 'manufacturing.production.view',
    PRODUCTION_CREATE: 'manufacturing.production.create',
    PRODUCTION_APPROVE: 'manufacturing.production.approve',
    PRODUCTION_MANAGE: 'manufacturing.production.manage',
    JOBWORK_VIEW: 'jobwork.view',
    JOBWORK_MANAGE: 'jobwork.manage',
    QUALITY_MANAGE: 'manufacturing.quality.manage',
    
    // Accounting & Financial Management (Phase 14)
    ACCOUNTING_VIEW: 'accounting.view',
    ACCOUNTS_VIEW: 'accounting.accounts.view',
    ACCOUNTS_MANAGE: 'accounting.accounts.manage',
    JOURNAL_VIEW: 'accounting.journal.view',
    JOURNAL_MANAGE: 'accounting.journal.manage',
    RECEIVABLES_VIEW: 'accounting.receivables.view',
    PAYABLES_VIEW: 'accounting.payables.view',
    EXPENSES_VIEW: 'accounting.expenses.view',
    EXPENSES_MANAGE: 'accounting.expenses.manage',
    CASHBANK_VIEW: 'accounting.cashbank.view',
    CASHBANK_MANAGE: 'accounting.cashbank.manage',
    FINANCIAL_REPORTS_VIEW: 'accounting.reports.view',
    
    // CRM & Sales Automation (Phase 15)
    CRM_VIEW: 'crm.view',
    LEADS_VIEW: 'crm.leads.view',
    LEADS_CREATE: 'crm.leads.create',
    LEADS_MANAGE: 'crm.leads.manage',
    OPPORTUNITIES_VIEW: 'crm.opportunities.view',
    OPPORTUNITIES_MANAGE: 'crm.opportunities.manage',
    FOLLOWUPS_VIEW: 'crm.followups.view',
    FOLLOWUPS_MANAGE: 'crm.followups.manage',
    COMMUNICATIONS_VIEW: 'crm.communications.view',
    COMMUNICATIONS_SEND: 'crm.communications.send',
    TEMPLATES_MANAGE: 'crm.templates.manage',
    TICKETS_VIEW: 'crm.tickets.view',
    TICKETS_MANAGE: 'crm.tickets.manage',
    FEEDBACK_VIEW: 'crm.feedback.view',
    CRM_REPORTS_VIEW: 'crm.reports.view',
    
    // SaaS & Platform Super Admin (Phase 16)
    PLATFORM_DASHBOARD_VIEW: 'platform.dashboard.view',
    PLATFORM_TENANTS_VIEW: 'platform.tenants.view',
    PLATFORM_TENANTS_CREATE: 'platform.tenants.create',
    PLATFORM_TENANTS_MANAGE: 'platform.tenants.manage',
    PLATFORM_TENANTS_SUSPEND: 'platform.tenants.suspend',
    PLATFORM_PLANS_VIEW: 'platform.plans.view',
    PLATFORM_PLANS_MANAGE: 'platform.plans.manage',
    PLATFORM_MODULES_VIEW: 'platform.modules.view',
    PLATFORM_MODULES_MANAGE: 'platform.modules.manage',
    PLATFORM_SUBSCRIPTIONS_VIEW: 'platform.subscriptions.view',
    PLATFORM_SUBSCRIPTIONS_MANAGE: 'platform.subscriptions.manage',
    PLATFORM_ANNOUNCEMENTS_VIEW: 'platform.announcements.view',
    PLATFORM_ANNOUNCEMENTS_MANAGE: 'platform.announcements.manage',
    PLATFORM_SETTINGS_VIEW: 'platform.settings.view',
    PLATFORM_SETTINGS_MANAGE: 'platform.settings.manage',
    PLATFORM_LOGS_VIEW: 'platform.logs.view',
    PLATFORM_SECURITY_VIEW: 'platform.security.view',
    PLATFORM_SECURITY_MANAGE: 'platform.security.manage',
    PLATFORM_BACKUPS_VIEW: 'platform.backups.view',
    PLATFORM_BACKUPS_MANAGE: 'platform.backups.manage',
    
    // Tenant-Level Subscription
    SUBSCRIPTION_VIEW: 'subscription.view',
    SUBSCRIPTION_MANAGE: 'subscription.manage',
    
    // Administration
    USERS_MANAGE: 'users.manage',
    SETTINGS_MANAGE: 'settings.manage'
};

/**
 * Role to Permissions Mapping
 */
export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
        '*' // Full Access across all modules and platform controls
    ],
    
    [ROLES.MANAGER]: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.SUBSCRIPTION_VIEW,
        PERMISSIONS.SUBSCRIPTION_MANAGE,
        PERMISSIONS.NOTIFICATIONS_VIEW,
        PERMISSIONS.NOTIFICATIONS_MANAGE,
        PERMISSIONS.NOTIFICATIONS_SETTINGS,
        PERMISSIONS.BRANCHES_VIEW,
        PERMISSIONS.BRANCHES_MANAGE,
        PERMISSIONS.WAREHOUSES_VIEW,
        PERMISSIONS.WAREHOUSES_MANAGE,
        PERMISSIONS.STOCK_TRANSFERS_VIEW,
        PERMISSIONS.STOCK_TRANSFERS_CREATE,
        PERMISSIONS.STOCK_TRANSFERS_APPROVE,
        PERMISSIONS.STOCK_TRANSFERS_DISPATCH,
        PERMISSIONS.STOCK_TRANSFERS_RECEIVE,
        PERMISSIONS.STOCK_TRANSFERS_CANCEL,
        PERMISSIONS.MANUFACTURING_VIEW,
        PERMISSIONS.BOM_VIEW,
        PERMISSIONS.BOM_MANAGE,
        PERMISSIONS.PRODUCTION_VIEW,
        PERMISSIONS.PRODUCTION_CREATE,
        PERMISSIONS.PRODUCTION_APPROVE,
        PERMISSIONS.PRODUCTION_MANAGE,
        PERMISSIONS.JOBWORK_VIEW,
        PERMISSIONS.JOBWORK_MANAGE,
        PERMISSIONS.QUALITY_MANAGE,
        PERMISSIONS.ACCOUNTING_VIEW,
        PERMISSIONS.ACCOUNTS_VIEW,
        PERMISSIONS.ACCOUNTS_MANAGE,
        PERMISSIONS.JOURNAL_VIEW,
        PERMISSIONS.JOURNAL_MANAGE,
        PERMISSIONS.RECEIVABLES_VIEW,
        PERMISSIONS.PAYABLES_VIEW,
        PERMISSIONS.EXPENSES_VIEW,
        PERMISSIONS.EXPENSES_MANAGE,
        PERMISSIONS.CASHBANK_VIEW,
        PERMISSIONS.CASHBANK_MANAGE,
        PERMISSIONS.FINANCIAL_REPORTS_VIEW,
        PERMISSIONS.CRM_VIEW,
        PERMISSIONS.LEADS_VIEW,
        PERMISSIONS.LEADS_CREATE,
        PERMISSIONS.LEADS_MANAGE,
        PERMISSIONS.OPPORTUNITIES_VIEW,
        PERMISSIONS.OPPORTUNITIES_MANAGE,
        PERMISSIONS.FOLLOWUPS_VIEW,
        PERMISSIONS.FOLLOWUPS_MANAGE,
        PERMISSIONS.COMMUNICATIONS_VIEW,
        PERMISSIONS.COMMUNICATIONS_SEND,
        PERMISSIONS.TEMPLATES_MANAGE,
        PERMISSIONS.TICKETS_VIEW,
        PERMISSIONS.TICKETS_MANAGE,
        PERMISSIONS.FEEDBACK_VIEW,
        PERMISSIONS.CRM_REPORTS_VIEW,
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.PRODUCTS_CREATE,
        PERMISSIONS.PRODUCTION_APPROVE,
        PERMISSIONS.PRODUCTION_MANAGE,
        PERMISSIONS.JOBWORK_VIEW,
        PERMISSIONS.JOBWORK_MANAGE,
        PERMISSIONS.QUALITY_MANAGE,
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.PRODUCTS_CREATE,
        PERMISSIONS.PRODUCTS_EDIT,
        PERMISSIONS.MASTERS_VIEW,
        PERMISSIONS.MASTERS_MANAGE,
        PERMISSIONS.INVENTORY_VIEW,
        PERMISSIONS.INVENTORY_MANAGE,
        PERMISSIONS.INVENTORY_ADJUST,
        PERMISSIONS.INVENTORY_MOVEMENTS_VIEW,
        PERMISSIONS.INVENTORY_LOWSTOCK_VIEW,
        PERMISSIONS.SUPPLIERS_VIEW,
        PERMISSIONS.SUPPLIERS_MANAGE,
        PERMISSIONS.PURCHASES_VIEW,
        PERMISSIONS.PURCHASES_CREATE,
        PERMISSIONS.PURCHASES_EDIT,
        PERMISSIONS.PURCHASES_CONFIRM,
        PERMISSIONS.PURCHASES_RECEIVE,
        PERMISSIONS.PURCHASES_CANCEL,
        PERMISSIONS.PURCHASE_SHIPMENTS_VIEW,
        PERMISSIONS.PURCHASE_SHIPMENTS_MANAGE,
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.CUSTOMERS_MANAGE,
        PERMISSIONS.SALES_VIEW,
        PERMISSIONS.SALES_CREATE,
        PERMISSIONS.SALES_EDIT,
        PERMISSIONS.SALES_CONFIRM,
        PERMISSIONS.SALES_CANCEL,
        PERMISSIONS.SALES_INVOICE_VIEW,
        PERMISSIONS.SALES_PAYMENT_MANAGE,
        PERMISSIONS.SALES_TRACKING_VIEW,
        PERMISSIONS.SALES_TRACKING_MANAGE,
        PERMISSIONS.RETURNS_VIEW,
        PERMISSIONS.RETURNS_CREATE,
        PERMISSIONS.RETURNS_EDIT,
        PERMISSIONS.RETURNS_APPROVE,
        PERMISSIONS.RETURNS_RECEIVE,
        PERMISSIONS.RETURNS_REFUND,
        PERMISSIONS.RETURNS_CANCEL,
        PERMISSIONS.EXCHANGES_VIEW,
        PERMISSIONS.EXCHANGES_CREATE,
        PERMISSIONS.EXCHANGES_COMPLETE,
        PERMISSIONS.PURCHASE_RETURNS_VIEW,
        PERMISSIONS.PURCHASE_RETURNS_CREATE,
        PERMISSIONS.PURCHASE_RETURNS_APPROVE,
        PERMISSIONS.PURCHASE_RETURNS_DISPATCH,
        PERMISSIONS.CREDIT_NOTES_VIEW,
        PERMISSIONS.CREDIT_NOTES_CREATE,
        PERMISSIONS.DEBIT_NOTES_VIEW,
        PERMISSIONS.DEBIT_NOTES_CREATE,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.REPORTS_SALES_VIEW,
        PERMISSIONS.REPORTS_PURCHASE_VIEW,
        PERMISSIONS.REPORTS_INVENTORY_VIEW,
        PERMISSIONS.REPORTS_FINANCIAL_VIEW,
        PERMISSIONS.REPORTS_GST_VIEW,
        PERMISSIONS.REPORTS_CUSTOMER_VIEW,
        PERMISSIONS.REPORTS_SUPPLIER_VIEW,
        PERMISSIONS.REPORTS_RETURNS_VIEW,
        PERMISSIONS.REPORTS_EXPORT,
        PERMISSIONS.DASHBOARD_ANALYTICS_VIEW
    ],
    
    [ROLES.SALES_STAFF]: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.NOTIFICATIONS_VIEW,
        PERMISSIONS.CRM_VIEW,
        PERMISSIONS.LEADS_VIEW,
        PERMISSIONS.LEADS_CREATE,
        PERMISSIONS.LEADS_MANAGE,
        PERMISSIONS.OPPORTUNITIES_VIEW,
        PERMISSIONS.OPPORTUNITIES_MANAGE,
        PERMISSIONS.FOLLOWUPS_VIEW,
        PERMISSIONS.FOLLOWUPS_MANAGE,
        PERMISSIONS.COMMUNICATIONS_VIEW,
        PERMISSIONS.COMMUNICATIONS_SEND,
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.MASTERS_VIEW,
        PERMISSIONS.INVENTORY_VIEW,
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.CUSTOMERS_MANAGE,
        PERMISSIONS.SALES_VIEW,
        PERMISSIONS.SALES_CREATE,
        PERMISSIONS.SALES_EDIT,
        PERMISSIONS.SALES_CONFIRM,
        PERMISSIONS.SALES_CANCEL,
        PERMISSIONS.SALES_INVOICE_VIEW,
        PERMISSIONS.SALES_PAYMENT_MANAGE,
        PERMISSIONS.SALES_TRACKING_VIEW,
        PERMISSIONS.SALES_TRACKING_MANAGE,
        PERMISSIONS.RETURNS_VIEW,
        PERMISSIONS.RETURNS_CREATE,
        PERMISSIONS.RETURNS_RECEIVE,
        PERMISSIONS.RETURNS_REFUND,
        PERMISSIONS.EXCHANGES_VIEW,
        PERMISSIONS.EXCHANGES_CREATE,
        PERMISSIONS.EXCHANGES_COMPLETE,
        PERMISSIONS.CREDIT_NOTES_VIEW
    ],
    
    [ROLES.PURCHASE_STAFF]: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.NOTIFICATIONS_VIEW,
        PERMISSIONS.MANUFACTURING_VIEW,
        PERMISSIONS.PRODUCTION_VIEW,
        PERMISSIONS.JOBWORK_VIEW,
        PERMISSIONS.STOCK_TRANSFERS_VIEW,
        PERMISSIONS.STOCK_TRANSFERS_CREATE,
        PERMISSIONS.STOCK_TRANSFERS_RECEIVE,
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.MASTERS_VIEW,
        PERMISSIONS.INVENTORY_VIEW,
        PERMISSIONS.INVENTORY_MOVEMENTS_VIEW,
        PERMISSIONS.INVENTORY_LOWSTOCK_VIEW,
        PERMISSIONS.SUPPLIERS_VIEW,
        PERMISSIONS.SUPPLIERS_MANAGE,
        PERMISSIONS.PURCHASES_VIEW,
        PERMISSIONS.PURCHASES_CREATE,
        PERMISSIONS.PURCHASES_EDIT,
        PERMISSIONS.PURCHASES_CONFIRM,
        PERMISSIONS.PURCHASES_RECEIVE,
        PERMISSIONS.PURCHASES_CANCEL,
        PERMISSIONS.PURCHASE_SHIPMENTS_VIEW,
        PERMISSIONS.PURCHASE_SHIPMENTS_MANAGE,
        PERMISSIONS.PURCHASE_RETURNS_VIEW,
        PERMISSIONS.PURCHASE_RETURNS_CREATE,
        PERMISSIONS.PURCHASE_RETURNS_APPROVE,
        PERMISSIONS.PURCHASE_RETURNS_DISPATCH,
        PERMISSIONS.DEBIT_NOTES_VIEW,
        PERMISSIONS.DEBIT_NOTES_CREATE,
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.SALES_VIEW,
        PERMISSIONS.SALES_INVOICE_VIEW,
        PERMISSIONS.SALES_TRACKING_VIEW
    ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role 
 * @param {string} permission 
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
}

/**
 * Check if a user's role matches any of the allowed roles
 * @param {string} userRole 
 * @param {string[]} allowedRoles 
 * @returns {boolean}
 */
export function hasAnyRole(userRole, allowedRoles = []) {
    if (!userRole) return false;
    if (userRole === ROLES.ADMIN) return true;
    return allowedRoles.includes(userRole);
}

/**
 * Get readable display details for a given role
 * @param {string} role 
 * @returns {{ name: string, badgeClass: string, description: string }}
 */
export function getRoleDetails(role) {
    switch (role) {
        case ROLES.ADMIN:
            return {
                name: 'Administrator',
                badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                description: 'Full enterprise control across all modules & settings.'
            };
        case ROLES.MANAGER:
            return {
                name: 'Store Manager',
                badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                description: 'Operations oversight across Inventory, Purchases, POS, and Orders.'
            };
        case ROLES.SALES_STAFF:
            return {
                name: 'Sales Staff',
                badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                description: 'Retail & B2B POS billing, stock lookup & customers.'
            };
        case ROLES.PURCHASE_STAFF:
            return {
                name: 'Purchase & Logistics',
                badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                description: 'Supplier orders, stock intake & transporter LR tracking.'
            };
        default:
            return {
                name: role || 'Unknown Role',
                badgeClass: 'bg-slate-700 text-slate-300 border-slate-600',
                description: 'Custom access level.'
            };
    }
}
