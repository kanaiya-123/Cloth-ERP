// CLOTHERP - Centralized Sales Inventory Stock OUT & Cancellation Reversal Engine
import { inventoryStore, INVENTORY_STORAGE_KEYS } from './inventoryStore.js';
import { stockMovementService } from './stockMovementService.js';

class SalesInventoryIntegrationService {
    /**
     * Validate Live Available Stock for All Items in a Sale
     */
    validateStockAvailability(items = []) {
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);

        for (const item of items) {
            const varId = item.productVariantId;
            const invRecord = inventory.find(i => i.productVariantId === varId);
            const available = invRecord ? (invRecord.currentStock || 0) : 0;
            const requested = parseInt(item.quantity) || 0;

            if (requested <= 0) {
                return {
                    valid: false,
                    message: `Quantity for ${item.productName} (${item.variantName || 'Variant'}) must be greater than zero.`
                };
            }

            if (requested > available) {
                return {
                    valid: false,
                    message: `Insufficient stock for ${item.productName} (${item.variantName || 'Variant'}). Only ${available} units are currently available in the warehouse (requested: ${requested}).`
                };
            }
        }

        return { valid: true };
    }

    /**
     * Centralized Stock Deduction Event on Sale Confirmation
     * Strictly prevents duplicate deductions and negative inventory.
     */
    async deductStockForSale(sale, user = 'Admin') {
        if (!sale) return { success: false, message: 'Invalid sale record.' };

        // Duplicate Stock Deduction Guard
        if (sale.inventoryDeducted) {
            return { success: true, message: 'Inventory has already been deducted for this sale.' };
        }

        // 1. Validate live stock availability for all items
        const validation = this.validateStockAvailability(sale.items);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // 2. Perform Stock OUT for each variant and record movement
        const deductedRecords = [];
        for (const item of sale.items) {
            const res = await stockMovementService.recordStockOut({
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                referenceId: sale.saleNumber,
                reason: `Sales order fulfillment (${sale.saleNumber})`,
                notes: `Sold to ${sale.customerName}`,
                user: user
            });

            if (!res.success) {
                return { success: false, message: `Failed to deduct stock for ${item.productName}: ${res.message}` };
            }

            deductedRecords.push({
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                newStock: res.newStock
            });
        }

        sale.inventoryDeducted = true;

        return {
            success: true,
            deductedRecords,
            message: `Successfully deducted ${sale.totalQuantity} units from inventory.`
        };
    }

    /**
     * Reverse Stock Deduction on Sale Cancellation
     * Creates traceable SALE_CANCELLED_RETURN stock intake movements.
     */
    async reverseStockForSale(sale, user = 'Admin', reason = 'Order cancelled') {
        if (!sale) return { success: false, message: 'Invalid sale record.' };

        // If inventory was never deducted, no reversal is needed
        if (!sale.inventoryDeducted) {
            return { success: true, message: 'No inventory deduction to reverse.' };
        }

        const restoredRecords = [];
        for (const item of sale.items) {
            const res = await stockMovementService.recordStockIn({
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                referenceId: sale.saleNumber,
                reason: `Sale Cancellation Return (${sale.saleNumber}): ${reason}`,
                notes: `Restored inventory from cancelled sale order ${sale.saleNumber}`,
                user: user
            });

            if (!res.success) {
                return { success: false, message: `Failed to restore stock for ${item.productName}: ${res.message}` };
            }

            restoredRecords.push({
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                newStock: res.newStock
            });
        }

        sale.inventoryDeducted = false;

        return {
            success: true,
            restoredRecords,
            message: `Successfully restored ${sale.totalQuantity} units back to warehouse inventory.`
        };
    }
}

export const salesInventoryIntegrationService = new SalesInventoryIntegrationService();
