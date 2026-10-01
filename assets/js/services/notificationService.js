// CLOTHERP - Centralized Smart Notification & Alert Engine
import { notificationStore, NOTIFICATION_STORAGE_KEYS } from './notificationStore.js';
import { inventoryStore, INVENTORY_STORAGE_KEYS } from './inventoryStore.js';
import { salesStore, SALES_STORAGE_KEYS } from './salesStore.js';
import { returnStore, RETURN_STORAGE_KEYS } from './returnStore.js';
import { purchaseStore, PURCHASE_STORAGE_KEYS } from './purchaseStore.js';

class NotificationService {
    /**
     * Get All Active (Non-Dismissed) Notifications
     */
    async getNotifications({ page = 1, pageSize = 20, search = '', type = '', priority = '', readStatus = '', userRole = 'ADMIN' } = {}) {
        await this._delay(80);
        let items = notificationStore.get(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS).filter(n => !n.isDismissed);

        // Role filtering
        if (userRole && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
            items = items.filter(n => n.targetRole === 'ALL' || n.targetRole === userRole);
        }

        // Search Filter
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(n => 
                (n.title && n.title.toLowerCase().includes(q)) ||
                (n.message && n.message.toLowerCase().includes(q)) ||
                (n.referenceNumber && n.referenceNumber.toLowerCase().includes(q))
            );
        }

        // Type Filter
        if (type) items = items.filter(n => n.type === type);

        // Priority Filter
        if (priority) items = items.filter(n => n.priority === priority);

        // Read Status Filter
        if (readStatus === 'unread') items = items.filter(n => !n.isRead);
        else if (readStatus === 'read') items = items.filter(n => n.isRead);

        // Sort: Unread first, then newest first
        items.sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize).map(n => ({
            ...n,
            relativeTime: this.getRelativeTime(n.createdAt)
        }));

        const unreadCount = items.filter(n => !n.isRead).length;
        const criticalCount = items.filter(n => n.priority === 'CRITICAL' && !n.isRead).length;
        const highCount = items.filter(n => n.priority === 'HIGH' && !n.isRead).length;

        return {
            items: paginatedItems,
            summary: {
                totalCount: totalItems,
                unreadCount,
                criticalCount,
                highCount
            },
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    }

    /**
     * Get Unread Count for Topbar Bell Badge
     */
    async getUnreadCount(userRole = 'ADMIN') {
        const items = notificationStore.get(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS).filter(n => !n.isDismissed && !n.isRead);
        if (userRole && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
            return items.filter(n => n.targetRole === 'ALL' || n.targetRole === userRole).length;
        }
        return items.length;
    }

    /**
     * Mark Notification as Read
     */
    async markAsRead(id) {
        const items = notificationStore.get(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS);
        const item = items.find(n => n.id === id);
        if (item) {
            item.isRead = true;
            item.readAt = new Date().toISOString();
            notificationStore.set(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS, items);
            return { success: true };
        }
        return { success: false, message: 'Notification not found' };
    }

    /**
     * Mark Notification as Unread
     */
    async markAsUnread(id) {
        const items = notificationStore.get(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS);
        const item = items.find(n => n.id === id);
        if (item) {
            item.isRead = false;
            item.readAt = null;
            notificationStore.set(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS, items);
            return { success: true };
        }
        return { success: false, message: 'Notification not found' };
    }

    /**
     * Mark All Notifications as Read
     */
    async markAllAsRead() {
        const items = notificationStore.get(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS);
        const now = new Date().toISOString();
        items.forEach(n => {
            if (!n.isRead) {
                n.isRead = true;
                n.readAt = now;
            }
        });
        notificationStore.set(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS, items);
        return { success: true };
    }

    /**
     * Dismiss Notification (User-level removal)
     */
    async dismissNotification(id) {
        const items = notificationStore.get(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS);
        const item = items.find(n => n.id === id);
        if (item) {
            item.isDismissed = true;
            notificationStore.set(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS, items);
            return { success: true };
        }
        return { success: false, message: 'Notification not found' };
    }

    /**
     * Create In-App Notification
     */
    async createNotification(notifData) {
        const items = notificationStore.get(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS);
        const id = `NOTIF-${String(items.length + 1).padStart(6, '0')}`;

        const newNotif = {
            id,
            type: notifData.type || 'SYSTEM',
            priority: notifData.priority || 'NORMAL',
            title: notifData.title,
            message: notifData.message,
            referenceType: notifData.referenceType || 'GENERAL',
            referenceId: notifData.referenceId || '',
            referenceNumber: notifData.referenceNumber || '',
            actionUrl: notifData.actionUrl || '',
            targetRole: notifData.targetRole || 'ALL',
            isRead: false,
            readAt: null,
            isDismissed: false,
            createdAt: new Date().toISOString(),
            createdBy: notifData.createdBy || 'System'
        };

        items.unshift(newNotif);
        notificationStore.set(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS, items);
        return { success: true, notification: newNotif };
    }

    /**
     * Evaluate Smart Alert Rules across all active ERP data
     * Strictly prevents duplicate alerts using alert state keys
     */
    async evaluateSmartAlerts() {
        const alertStates = notificationStore.get(NOTIFICATION_STORAGE_KEYS.ALERT_STATES) || {};
        const prefs = this.getNotificationPreferences();
        let newAlertsCount = 0;

        // 1. Evaluate Inventory Low Stock & Out of Stock
        if (prefs.lowStock || prefs.outOfStock) {
            const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
            inventory.forEach(item => {
                const stock = item.currentStock || 0;
                const reorder = item.reorderLevel || 10;
                const stateKey = `STOCK:${item.productVariantId || item.sku}`;

                if (stock <= 0 && prefs.outOfStock && !alertStates[`${stateKey}:OUT`]) {
                    this.createNotification({
                        type: 'OUT_OF_STOCK',
                        priority: 'CRITICAL',
                        title: `Critical Out of Stock: ${item.productName}`,
                        message: `${item.productName} (${item.color} / ${item.size}) has reached 0 units in warehouse. Urgent replenishment needed.`,
                        referenceType: 'PRODUCT_VARIANT',
                        referenceId: item.productVariantId,
                        referenceNumber: item.sku,
                        actionUrl: './inventory.html',
                        targetRole: 'ALL',
                        createdBy: 'Inventory Rule Engine'
                    });
                    alertStates[`${stateKey}:OUT`] = true;
                    newAlertsCount++;
                } else if (stock > 0 && stock <= reorder && prefs.lowStock && !alertStates[`${stateKey}:LOW`]) {
                    this.createNotification({
                        type: 'LOW_STOCK',
                        priority: 'HIGH',
                        title: `Low Stock Warning: ${item.productName}`,
                        message: `${item.productName} (${item.color} / ${item.size}) is at ${stock} units (Threshold: ${reorder}).`,
                        referenceType: 'PRODUCT_VARIANT',
                        referenceId: item.productVariantId,
                        referenceNumber: item.sku,
                        actionUrl: './inventory.html',
                        targetRole: 'ALL',
                        createdBy: 'Inventory Rule Engine'
                    });
                    alertStates[`${stateKey}:LOW`] = true;
                    newAlertsCount++;
                }
            });
        }

        // 2. Evaluate Overdue Payments
        if (prefs.paymentOverdue) {
            const sales = salesStore.get(SALES_STORAGE_KEYS.SALES);
            sales.forEach(s => {
                if (s.status !== 'Cancelled' && (s.balanceAmount || 0) > 0) {
                    const stateKey = `PAYMENT_OVERDUE:${s.id}`;
                    if (!alertStates[stateKey]) {
                        this.createNotification({
                            type: 'PAYMENT_OVERDUE',
                            priority: 'HIGH',
                            title: `Overdue Invoice: ${s.customerName}`,
                            message: `Order ${s.saleNumber} has an outstanding unpaid balance of ₹${(s.balanceAmount || 0).toLocaleString('en-IN')}.`,
                            referenceType: 'SALE',
                            referenceId: s.id,
                            referenceNumber: s.invoiceNumber || s.saleNumber,
                            actionUrl: `./customer-details.html?id=${s.customerId}`,
                            targetRole: 'ALL',
                            createdBy: 'Accounts Rule Engine'
                        });
                        alertStates[stateKey] = true;
                        newAlertsCount++;
                    }
                }
            });
        }

        // 3. Evaluate Pending Returns & Refunds
        if (prefs.returnAlerts || prefs.refundAlerts) {
            const returns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);
            returns.forEach(r => {
                if (r.status === 'Requested' && prefs.returnAlerts) {
                    const stateKey = `RETURN_PENDING:${r.id}`;
                    if (!alertStates[stateKey]) {
                        this.createNotification({
                            type: 'RETURN_REQUESTED',
                            priority: 'NORMAL',
                            title: `Return Request Pending: ${r.returnNumber}`,
                            message: `Sales return ${r.returnNumber} from ${r.customerName} requires manager review and inspection.`,
                            referenceType: 'RETURN',
                            referenceId: r.id,
                            referenceNumber: r.returnNumber,
                            actionUrl: `./return-details.html?id=${r.id}`,
                            targetRole: 'ALL',
                            createdBy: 'Returns Rule Engine'
                        });
                        alertStates[stateKey] = true;
                        newAlertsCount++;
                    }
                }

                if ((r.refundBalance || 0) > 0 && prefs.refundAlerts) {
                    const stateKey = `REFUND_PENDING:${r.id}`;
                    if (!alertStates[stateKey]) {
                        this.createNotification({
                            type: 'REFUND_PENDING',
                            priority: 'HIGH',
                            title: `Refund Disbursal Due: ${r.returnNumber}`,
                            message: `Return ${r.returnNumber} has a pending customer refund balance of ₹${(r.refundBalance || 0).toLocaleString('en-IN')}.`,
                            referenceType: 'RETURN',
                            referenceId: r.id,
                            referenceNumber: r.returnNumber,
                            actionUrl: `./refund-return.html?id=${r.id}`,
                            targetRole: 'ALL',
                            createdBy: 'Accounts Rule Engine'
                        });
                        alertStates[stateKey] = true;
                        newAlertsCount++;
                    }
                }
            });
        }

        notificationStore.set(NOTIFICATION_STORAGE_KEYS.ALERT_STATES, alertStates);
        return { success: true, newAlertsCount };
    }

    /**
     * User Preferences
     */
    getNotificationPreferences() {
        return notificationStore.get(NOTIFICATION_STORAGE_KEYS.PREFERENCES);
    }

    saveNotificationPreferences(prefs) {
        return notificationStore.set(NOTIFICATION_STORAGE_KEYS.PREFERENCES, prefs);
    }

    getRelativeTime(isoStr) {
        if (!isoStr) return 'Recently';
        const diffMs = Date.now() - new Date(isoStr).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const notificationService = new NotificationService();
