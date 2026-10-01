// CLOTHERP - Purchase Goods Receiving & Automatic Inventory Stock IN Engine
import { purchaseStore, PURCHASE_STORAGE_KEYS } from './purchaseStore.js';
import { stockMovementService } from './stockMovementService.js';

class PurchaseReceivingService {
    /**
     * Process Goods Receipt for a Purchase Order with Automatic Inventory Integration
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/purchases/${purchaseId}/receive`, { method: 'POST', body: JSON.stringify(receipts) });
     * return await res.json();
     */
    async receiveGoods({ purchaseId, receipts = [], notes = '', user = 'Admin' }) {
        await this._delay(200);
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const purchase = purchases.find(p => p.id === purchaseId);

        if (!purchase) {
            return { success: false, message: 'Purchase Order not found.' };
        }

        if (purchase.status === 'Cancelled') {
            return { success: false, message: 'Cannot receive goods for a cancelled purchase order.' };
        }

        if (receipts.length === 0) {
            return { success: false, message: 'No items selected for receipt.' };
        }

        // Validate all receiving quantities
        let hasValidItems = false;
        for (const rc of receipts) {
            const item = purchase.items.find(i => i.productVariantId === rc.productVariantId || i.id === rc.itemId);
            if (!item) continue;

            const remaining = item.quantity - (item.receivedQuantity || 0);
            const qtyToReceive = parseInt(rc.receiveQuantity) || 0;

            if (qtyToReceive < 0) {
                return { success: false, message: `Negative quantity is not allowed for ${item.productName}.` };
            }

            if (qtyToReceive > remaining) {
                return { 
                    success: false, 
                    message: `Received quantity (${qtyToReceive}) cannot exceed remaining quantity (${remaining}) for ${item.productName} (${item.variantName}).` 
                };
            }

            if (qtyToReceive > 0) hasValidItems = true;
        }

        if (!hasValidItems) {
            return { success: false, message: 'Please enter at least one quantity greater than 0 to receive.' };
        }

        const receivedLog = [];
        let totalNewlyReceived = 0;

        // Process each item & trigger automatic Inventory Stock IN
        for (const rc of receipts) {
            const item = purchase.items.find(i => i.productVariantId === rc.productVariantId || i.id === rc.itemId);
            if (!item) continue;

            const qtyToReceive = parseInt(rc.receiveQuantity) || 0;
            if (qtyToReceive <= 0) continue;

            // 1. Trigger Automatic Inventory Stock IN
            const stockInRes = await stockMovementService.recordStockIn({
                productVariantId: item.productVariantId,
                quantity: qtyToReceive,
                referenceId: purchase.purchaseNumber,
                reason: `Purchase Received from ${purchase.supplierName}`,
                notes: notes || `Goods intake for PO ${purchase.purchaseNumber}`,
                user: user
            });

            // 2. Update Purchase Item received tally
            item.receivedQuantity = (item.receivedQuantity || 0) + qtyToReceive;
            totalNewlyReceived += qtyToReceive;

            receivedLog.push({
                productVariantId: item.productVariantId,
                productName: item.productName,
                variantName: item.variantName,
                sku: item.sku,
                receivedQuantity: qtyToReceive,
                newStock: stockInRes.newStock
            });
        }

        // 3. Update Purchase Grand Received Total & Status
        const totalOrdered = purchase.items.reduce((acc, i) => acc + (i.quantity || 0), 0);
        const totalReceived = purchase.items.reduce((acc, i) => acc + (i.receivedQuantity || 0), 0);
        purchase.totalReceivedQuantity = totalReceived;

        if (totalReceived >= totalOrdered) {
            purchase.status = 'Received';
            purchase.shipmentStatus = 'Delivered';
        } else if (totalReceived > 0) {
            purchase.status = 'Partially Received';
            purchase.shipmentStatus = 'Partially Received';
        }

        // 4. Record Tracking Timeline
        purchase.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: purchase.status,
            title: totalReceived >= totalOrdered ? 'Goods Receipt Completed' : 'Partial Goods Receipt Recorded',
            notes: `Received ${totalNewlyReceived} units. Total received: ${totalReceived}/${totalOrdered} units.`
        });

        // 5. Record Activity Log
        purchase.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Received ${totalNewlyReceived} units into warehouse stock (PO: ${purchase.purchaseNumber})`
        });

        // 6. Save State
        purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);

        return {
            success: true,
            purchase,
            receivedItems: receivedLog,
            totalReceived,
            totalOrdered,
            newStatus: purchase.status
        };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const purchaseReceivingService = new PurchaseReceivingService();
