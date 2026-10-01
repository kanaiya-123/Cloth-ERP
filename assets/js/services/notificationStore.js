// CLOTHERP - Centralized Persistent Notification Data Store
export const NOTIFICATION_STORAGE_KEYS = {
    NOTIFICATIONS: 'clotherp_notifications',
    PREFERENCES: 'clotherp_notification_preferences',
    ALERT_STATES: 'clotherp_alert_states'
};

const DEFAULT_PREFERENCES = {
    lowStock: true,
    outOfStock: true,
    paymentOverdue: true,
    paymentReceived: true,
    orderDelayed: true,
    shipmentDelayed: true,
    returnAlerts: true,
    refundAlerts: true,
    exchangeAlerts: true,
    systemAlerts: true,
    inAppSound: false
};

const SEED_NOTIFICATIONS = [
    {
        id: 'NOTIF-000001',
        type: 'LOW_STOCK',
        priority: 'HIGH',
        title: 'Low Stock Alert: Men Linen Shirt',
        message: "Men Linen Shirt (Sky Blue / L) has only 4 units remaining in warehouse (Reorder Level: 10).",
        referenceType: 'PRODUCT_VARIANT',
        referenceId: 'VAR-101-3',
        referenceNumber: 'SHIRT-LINEN-BLU-L',
        actionUrl: './inventory.html',
        targetRole: 'ALL',
        isRead: false,
        readAt: null,
        isDismissed: false,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        createdBy: 'System Monitor'
    },
    {
        id: 'NOTIF-000002',
        type: 'PAYMENT_OVERDUE',
        priority: 'HIGH',
        title: 'Payment Balance Overdue: Trendz Retail',
        message: 'Trendz Retail has an outstanding invoice balance of ₹29,880.00 on Order SAL-000002.',
        referenceType: 'SALE',
        referenceId: 'SAL-000002',
        referenceNumber: 'INV-2026-002',
        actionUrl: './customer-details.html?id=CUST-002',
        targetRole: 'ALL',
        isRead: false,
        readAt: null,
        isDismissed: false,
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        createdBy: 'System Monitor'
    },
    {
        id: 'NOTIF-000003',
        type: 'RETURN_REQUESTED',
        priority: 'NORMAL',
        title: 'Customer Sales Return Initiated',
        message: 'Sales Return RET-000001 for Royal Fashion Boutique has been logged and is awaiting quality inspection.',
        referenceType: 'RETURN',
        referenceId: 'RET-000001',
        referenceNumber: 'RET-000001',
        actionUrl: './return-details.html?id=RET-000001',
        targetRole: 'ALL',
        isRead: true,
        readAt: new Date(Date.now() - 120 * 60000).toISOString(),
        isDismissed: false,
        createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
        createdBy: 'Sales Desk'
    }
];

class NotificationStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS)) {
            localStorage.setItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
        }
        if (!localStorage.getItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES)) {
            localStorage.setItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES, JSON.stringify(DEFAULT_PREFERENCES));
        }
        if (!localStorage.getItem(NOTIFICATION_STORAGE_KEYS.ALERT_STATES)) {
            localStorage.setItem(NOTIFICATION_STORAGE_KEYS.ALERT_STATES, JSON.stringify({
                'LOW_STOCK:VAR-101-3': true,
                'PAYMENT_OVERDUE:SAL-000002': true
            }));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[NotificationStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[NotificationStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const notificationStore = new NotificationStore();
