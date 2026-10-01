// CLOTHERP - Stock Movement Ledger Service
import { inventoryStore, INVENTORY_STORAGE_KEYS } from './inventoryStore.js';

class StockMovementService {
    /**
     * Get Paginated & Filtered Stock Movements
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/stock-movements?${params}`);
     * return await res.json();
     */
    async getMovements({
        page = 1,
        pageSize = 10,
        search = '',
        movementType = '',
        variantId = '',
        user = '',
        dateFrom = '',
        dateTo = ''
    } = {}) {
        await this._delay(120);
        let movements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);

        // Search Filter (SKU, Product Name, Reference ID, Reason, Notes)
        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            movements = movements.filter(m => 
                (m.sku && m.sku.toLowerCase().includes(query)) ||
                (m.productName && m.productName.toLowerCase().includes(query)) ||
                (m.referenceId && m.referenceId.toLowerCase().includes(query)) ||
                (m.reason && m.reason.toLowerCase().includes(query)) ||
                (m.notes && m.notes.toLowerCase().includes(query))
            );
        }

        // Movement Type Filter
        if (movementType) {
            movements = movements.filter(m => m.movementType === movementType);
        }

        // Variant Filter
        if (variantId) {
            movements = movements.filter(m => m.productVariantId === variantId);
        }

        // User Filter
        if (user) {
            movements = movements.filter(m => m.createdBy === user);
        }

        // Sort Newest First
        movements.sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));

        const totalItems = movements.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = movements.slice(start, start + pageSize);

        return {
            items: paginated,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    }

    /**
     * Get Single Movement by ID
     */
    async getMovementById(id) {
        await this._delay(80);
        const movements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);
        return movements.find(m => m.id === id) || null;
    }

    /**
     * Get all movements for a specific product variant
     */
    async getMovementsForVariant(variantId) {
        await this._delay(100);
        const movements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);
        return movements
            .filter(m => m.productVariantId === variantId)
            .sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));
    }

    /**
     * Record Opening Stock
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/stock-movements/opening', { method: 'POST', body: JSON.stringify(data) });
     */
    async recordOpeningStock({ productVariantId, quantity, date, referenceId, notes, user = 'Admin' }) {
        await this._delay(200);
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const movements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);

        const target = inventory.find(i => i.productVariantId === productVariantId);
        if (!target) return { success: false, message: 'Variant inventory record not found.' };

        // Check if movements already exist for this variant
        const existingMoves = movements.filter(m => m.productVariantId === productVariantId && m.movementType !== 'OPENING');
        if (existingMoves.length > 0) {
            return { 
                success: false, 
                message: 'Opening stock cannot be modified because subsequent transactions exist. Please use Stock Adjustment instead.' 
            };
        }

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 0) {
            return { success: false, message: 'Quantity must be zero or a positive whole number.' };
        }

        const previousStock = target.currentStock;
        target.currentStock = qty;
        target.lastUpdated = `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const movementRecord = {
            id: `MOV-${Date.now().toString().slice(-6)}`,
            productVariantId: target.productVariantId,
            sku: target.sku,
            productName: target.productName,
            variantName: `${target.color} / ${target.size}`,
            movementType: 'OPENING',
            quantity: qty,
            previousStock: previousStock,
            newStock: qty,
            referenceType: 'Opening Stock',
            referenceId: referenceId || `OPEN-${Math.floor(1000 + Math.random() * 9000)}`,
            reason: 'Opening stock setup',
            notes: notes || 'Initial warehouse balance setup',
            createdDate: `${date || new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            createdBy: user
        };

        movements.unshift(movementRecord);
        inventoryStore.set(INVENTORY_STORAGE_KEYS.INVENTORY, inventory);
        inventoryStore.set(INVENTORY_STORAGE_KEYS.MOVEMENTS, movements);

        return { success: true, movement: movementRecord, newStock: qty };
    }

    /**
     * Record Stock IN
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/stock-movements/in', { method: 'POST', body: JSON.stringify(data) });
     */
    async recordStockIn({ productVariantId, quantity, date, referenceId, reason, notes, user = 'Admin' }) {
        await this._delay(200);
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const movements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);

        const target = inventory.find(i => i.productVariantId === productVariantId);
        if (!target) return { success: false, message: 'Variant inventory record not found.' };

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            return { success: false, message: 'Stock IN quantity must be greater than zero.' };
        }

        const previousStock = target.currentStock;
        const newStock = previousStock + qty;
        target.currentStock = newStock;
        target.lastUpdated = `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const movementRecord = {
            id: `MOV-${Date.now().toString().slice(-6)}`,
            productVariantId: target.productVariantId,
            sku: target.sku,
            productName: target.productName,
            variantName: `${target.color} / ${target.size}`,
            movementType: 'STOCK_IN',
            quantity: qty,
            previousStock: previousStock,
            newStock: newStock,
            referenceType: 'Stock In',
            referenceId: referenceId || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
            reason: reason || 'Manual Stock Received',
            notes: notes || '',
            createdDate: `${date || new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            createdBy: user
        };

        movements.unshift(movementRecord);
        inventoryStore.set(INVENTORY_STORAGE_KEYS.INVENTORY, inventory);
        inventoryStore.set(INVENTORY_STORAGE_KEYS.MOVEMENTS, movements);

        return { success: true, movement: movementRecord, newStock: newStock };
    }

    /**
     * Record Stock OUT (with Strict Negative Stock Prevention)
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/stock-movements/out', { method: 'POST', body: JSON.stringify(data) });
     */
    async recordStockOut({ productVariantId, quantity, date, referenceId, reason, notes, user = 'Admin' }) {
        await this._delay(200);
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const movements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);

        const target = inventory.find(i => i.productVariantId === productVariantId);
        if (!target) return { success: false, message: 'Variant inventory record not found.' };

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            return { success: false, message: 'Stock OUT quantity must be greater than zero.' };
        }

        // STRICT NEGATIVE STOCK VALIDATION
        if (qty > target.currentStock) {
            return { 
                success: false, 
                message: `Insufficient stock available. Requested ${qty} units, but only ${target.currentStock} units currently available.` 
            };
        }

        const previousStock = target.currentStock;
        const newStock = previousStock - qty;
        target.currentStock = newStock;
        target.lastUpdated = `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const movementRecord = {
            id: `MOV-${Date.now().toString().slice(-6)}`,
            productVariantId: target.productVariantId,
            sku: target.sku,
            productName: target.productName,
            variantName: `${target.color} / ${target.size}`,
            movementType: 'STOCK_OUT',
            quantity: qty,
            previousStock: previousStock,
            newStock: newStock,
            referenceType: 'Stock Out',
            referenceId: referenceId || `SO-${Math.floor(1000 + Math.random() * 9000)}`,
            reason: reason || 'Damaged',
            notes: notes || '',
            createdDate: `${date || new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            createdBy: user
        };

        movements.unshift(movementRecord);
        inventoryStore.set(INVENTORY_STORAGE_KEYS.INVENTORY, inventory);
        inventoryStore.set(INVENTORY_STORAGE_KEYS.MOVEMENTS, movements);

        return { success: true, movement: movementRecord, newStock: newStock };
    }

    /**
     * Record Stock Adjustment (Increase or Decrease)
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/stock-movements/adjustment', { method: 'POST', body: JSON.stringify(data) });
     */
    async adjustStock({ productVariantId, adjustmentType, quantity, reason, notes, user = 'Admin' }) {
        await this._delay(200);
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const movements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);

        const target = inventory.find(i => i.productVariantId === productVariantId);
        if (!target) return { success: false, message: 'Variant inventory record not found.' };

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            return { success: false, message: 'Adjustment quantity must be greater than zero.' };
        }

        if (!reason || !reason.trim()) {
            return { success: false, message: 'Adjustment reason is required for audit traceability.' };
        }

        const isIncrease = adjustmentType === 'Increase' || adjustmentType === 'ADJUSTMENT_IN';
        const previousStock = target.currentStock;

        // Negative stock check on decrease
        if (!isIncrease && qty > previousStock) {
            return { 
                success: false, 
                message: `Cannot decrease stock by ${qty} units. Maximum available reduction is ${previousStock} units.` 
            };
        }

        const newStock = isIncrease ? previousStock + qty : previousStock - qty;
        target.currentStock = newStock;
        target.lastUpdated = `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const movementRecord = {
            id: `MOV-${Date.now().toString().slice(-6)}`,
            productVariantId: target.productVariantId,
            sku: target.sku,
            productName: target.productName,
            variantName: `${target.color} / ${target.size}`,
            movementType: isIncrease ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
            quantity: qty,
            previousStock: previousStock,
            newStock: newStock,
            referenceType: 'Stock Adjustment',
            referenceId: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
            reason: reason.trim(),
            notes: notes || '',
            createdDate: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            createdBy: user
        };

        movements.unshift(movementRecord);
        inventoryStore.set(INVENTORY_STORAGE_KEYS.INVENTORY, inventory);
        inventoryStore.set(INVENTORY_STORAGE_KEYS.MOVEMENTS, movements);

        return { success: true, movement: movementRecord, newStock: newStock };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const stockMovementService = new StockMovementService();
